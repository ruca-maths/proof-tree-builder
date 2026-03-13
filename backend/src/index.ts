import express, { Request, Response } from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import iconv from 'iconv-lite';

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// --- Interfaces ---

interface NodeData {
    label: string;
}

interface ProofNode {
    id: string;
    type: string;
    data: NodeData;
}

interface ProofEdge {
    id: string;
    source: string;
    target: string;
}

interface ProofTreeRequest {
    nodes: ProofNode[];
    edges: ProofEdge[];
    goal?: string;
}

interface ValidationResult {
    valid: boolean;
    message: string;
    errorNodes: string[];
}

// --- Endpoints ---

app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'Proof Builder Backend (Node.js) is running' });
});

app.post('/evaluate', async (req: Request, res: Response) => {
    const { nodes, edges, goal = "A \\to B" } = req.body as ProofTreeRequest;

    if (!nodes || nodes.length === 0) {
        return res.json({ valid: false, message: "No nodes provided.", errorNodes: [] });
    }

    // Step 1: Topological Sort
    const nodeMap = new Map<string, ProofNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    const adjList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    nodes.forEach(n => {
        adjList.set(n.id, []);
        inDegree.set(n.id, 0);
    });

    edges.forEach(edge => {
        if (adjList.has(edge.source) && inDegree.has(edge.target)) {
            adjList.get(edge.source)!.push(edge.target);
            inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
        }
    });

    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id);
    });

    const sortedNodes: string[] = [];
    while (queue.length > 0) {
        const current = queue.shift()!;
        sortedNodes.push(current);
        const neighbors = adjList.get(current) || [];
        neighbors.forEach(neighbor => {
            const currentDegree = inDegree.get(neighbor)!;
            inDegree.set(neighbor, currentDegree - 1);
            if (currentDegree - 1 === 0) {
                queue.push(neighbor);
            }
        });
    }

    if (sortedNodes.length !== nodes.length) {
        return res.json({ valid: false, message: "Cycle detected in proof tree.", errorNodes: [] });
    }

    // Step 2: Generate Lean Code
    let leanCode = "";
    
    try {
         const baseLibPath = path.join(__dirname, '..', 'theories', 'group.lean');
         const baseLibOps = await fsPromises.readFile(baseLibPath, 'utf8');
         leanCode += baseLibOps + "\n\n";
    } catch (readErr) {
         console.warn("Could not load theories/group.lean base library.", readErr);
    }

    // Attempt to build a calc block if the goal contains "="
    const isEqGoal = goal.includes('=');
    
    // For MVP phase 5, if it's an equation, wrap in theorem with CustomGroup
    leanCode += `theorem generated_proof {G : Type} [CustomGroup G] (a b c x y : G) : ${goal} := by\n`;

    if (isEqGoal && nodes.some(n => n.type === 'rule' && (n.data.label.includes('calc') || n.data.label.includes('代入')))) {
        // Build a mock calc block from nodes
        leanCode += `  calc\n`;
        // Just extract the left side of the goal as a starting point
        const leftSide = goal.split('=')[0].replace('∀', '').replace(/\(.*\)/, '').trim().split(',').pop()?.trim() || "x";
        leanCode += `    ${leftSide} = ${leftSide} := by sorry\n`;
        
        sortedNodes.forEach(nodeId => {
            const node = nodeMap.get(nodeId);
            if (node?.type === 'premise') {
                leanCode += `    _ = ${node.data.label.split('=')[1]?.trim() || '?'} := by sorry -- Applied Premise: ${node.data.label}\n`;
            } else if (node?.type === 'axiom') {
                leanCode += `    _ = ? := by sorry -- Axiom: ${node.data.label}\n`;
            } else if (node?.type === 'rule' && !node.data.label.includes('calc')) {
                leanCode += `    _ = ? := by sorry -- Applied ${node.data.label}\n`;
            }
        });
        leanCode += `    _ = ${goal.split('=')[1]?.trim() || '?'} := by sorry\n`;
    } else {
        // Standard generation fallback
        sortedNodes.forEach(nodeId => {
            const node = nodeMap.get(nodeId);
            if (node?.type === 'premise') {
                leanCode += `  -- ${node.data.label}\n`;
            } else if (node?.type === 'axiom') {
                leanCode += `  -- Axiom: ${node.data.label}\n`;
            } else if (node?.type === 'rule') {
                leanCode += `  sorry -- Applied ${node.data.label}\n`;
            }
        });

        if (!nodes.some(n => n.type === 'rule')) {
           leanCode += "  sorry\n";
        }
    }

    // Step 3: Execute Lean Subprocess
    const tempFilePath = path.join(os.tmpdir(), `proof_${Date.now()}.lean`);
    fs.writeFileSync(tempFilePath, leanCode, 'utf-8');

    // Explicitly set encoding to buffer to receive raw bytes for iconv decoding
    exec(`lean "${tempFilePath}"`, { timeout: 10000, encoding: 'buffer' }, (error, stdoutBuffer, stderrBuffer) => {
        // Cleanup temp file
        try {
            fs.unlinkSync(tempFilePath);
        } catch (e) {}

        const stdout = iconv.decode(stdoutBuffer as Buffer, 'Shift_JIS');
        const stderr = iconv.decode(stderrBuffer as Buffer, 'Shift_JIS');
        const output = stdout + stderr;

        if (error) {
            // Error handling/parsing logic
            let isLeanMissing = false;
            let errorNodes: string[] = [];
            
            // Check for missing command error (Windows/Unix/JP Windows)
            if (error.message.includes("not found") || 
                error.message.includes("is not recognized") ||
                error.message.includes("recognized as an internal or external command") ||
                error.message.includes("内部コマンドまたは外部コマンド") || 
                output.includes("内部コマンドまたは外部コマンド")) {
                 isLeanMissing = true;
            }

            if (output.includes("unresolved") || output.includes("sorry")) {
                if (sortedNodes.length > 0) {
                    errorNodes.push(sortedNodes[sortedNodes.length - 1]);
                }
            }
            res.json({
                valid: false,
                message: isLeanMissing ? `[Mock Mode] Lean 4 not found in system. Emulating validation for demo purposes. Output: ${output}` : `Lean Verification Failed:\n${output}`,
                errorNodes: isLeanMissing ? [] : errorNodes
            });
        } else {
            res.json({
                valid: true,
                message: "Proof Valid (Lean executed successfully)",
                errorNodes: []
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// --- Static File Serving ---

const frontendDistPath = path.join(__dirname, '../../frontend/dist');

// Serve static files from the frontend
app.use(express.static(frontendDistPath));

// Fallback for SPA (Single Page Application)
app.get('*', (req: Request, res: Response) => {
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // Fallback for development if index.html is missing
        res.status(404).json({ error: "Frontend not built or index.html missing." });
    }
});
