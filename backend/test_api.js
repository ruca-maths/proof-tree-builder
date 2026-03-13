const testData = {
    nodes: [
      { id: "node_1", type: "premise", data: { label: "Premise P" } },
      { id: "node_2", type: "premise", data: { label: "Premise P \\to Q" } },
      { id: "node_3", type: "rule", data: { label: "Modus Ponens" } }
    ],
    edges: [
      { id: "e1", source: "node_1", target: "node_3" },
      { id: "e2", source: "node_2", target: "node_3" }
    ],
    goal: "Q"
};

fetch('http://localhost:8000/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
