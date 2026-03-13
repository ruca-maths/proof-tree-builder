import { Formula, Term, Var, Func, Pred, Not, Implies, Forall, Meta, Or, And, Iff, Exists } from './expression';

// ===== Token Types =====
type TokenType =
  | 'LPAREN' | 'RPAREN' | 'COMMA'
  | 'ARROW' | 'NOT' | 'FORALL' | 'EXISTS'
  | 'AND' | 'OR' | 'IFF'
  | 'EQ' | 'IN'
  | 'IDENT'
  | 'EOF';

interface Token { type: TokenType; value: string; pos: number; }

// ===== Tokenizer =====
function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    if (/\s/.test(input[i])) { i++; continue; }
    const c = input[i];
    const rest = input.slice(i);
    // Multi-char tokens
    if (rest.startsWith('->') || rest.startsWith('→') || rest.startsWith('\\to') || rest.startsWith('\\rightarrow')) {
      const isLong = rest.startsWith('\\rightarrow');
      const isNamed = rest.startsWith('\\to');
      tokens.push({ type: 'ARROW', value: '→', pos: i });
      if (isLong) i += 11; else if (isNamed) i += 3; else i += rest.startsWith('->') ? 2 : 1;
      continue;
    }
    if (rest.startsWith('<->') || rest.startsWith('↔') || rest.startsWith('\\leftrightarrow')) {
      const isNamed = rest.startsWith('\\leftrightarrow');
      tokens.push({ type: 'IFF', value: '↔', pos: i });
      if (isNamed) i += 15; else i += rest.startsWith('<->') ? 3 : 1;
      continue;
    }
    if (rest.startsWith('/\\') || rest.startsWith('∧') || rest.startsWith('&&') || rest.startsWith('\\land') || rest.startsWith('\\wedge')) {
      const isLand = rest.startsWith('\\land');
      const isWedge = rest.startsWith('\\wedge');
      tokens.push({ type: 'AND', value: '∧', pos: i });
      if (isLand) i += 5; else if (isWedge) i += 6; else i += rest.startsWith('/\\') || rest.startsWith('&&') ? 2 : 1;
      continue;
    }
    if (rest.startsWith('\\/') || rest.startsWith('∨') || rest.startsWith('||') || rest.startsWith('\\lor') || rest.startsWith('\\vee')) {
      const isLor = rest.startsWith('\\lor');
      const isVee = rest.startsWith('\\vee');
      tokens.push({ type: 'OR', value: '∨', pos: i });
      if (isLor) i += 4; else if (isVee) i += 4; else i += rest.startsWith('\\/') || rest.startsWith('||') ? 2 : 1;
      continue;
    }
    if (rest.startsWith('\\neg') || rest.startsWith('\\lnot')) {
      const isNeg = rest.startsWith('\\neg');
      tokens.push({ type: 'NOT', value: '¬', pos: i });
      i += isNeg ? 4 : 5;
      continue;
    }
    if (rest.startsWith('\\forall')) {
      tokens.push({ type: 'FORALL', value: '∀', pos: i });
      i += 7;
      continue;
    }
    if (rest.startsWith('\\exists')) {
      tokens.push({ type: 'EXISTS', value: '∃', pos: i });
      i += 7;
      continue;
    }
    if (rest.startsWith('\\in')) {
      tokens.push({ type: 'IN', value: '∈', pos: i });
      i += 3;
      continue;
    }
    // Single-char
    if (c === '(' ) { tokens.push({ type: 'LPAREN', value: c, pos: i }); i++; continue; }
    if (c === ')' ) { tokens.push({ type: 'RPAREN', value: c, pos: i }); i++; continue; }
    if (c === ',' ) { tokens.push({ type: 'COMMA',  value: c, pos: i }); i++; continue; }
    if (c === '=' ) { tokens.push({ type: 'EQ',     value: c, pos: i }); i++; continue; }
    if (c === '∈' ) { tokens.push({ type: 'IN',     value: c, pos: i }); i++; continue; }
    if (c === '~' || c === '!' || c === '¬') { tokens.push({ type: 'NOT', value: '¬', pos: i }); i++; continue; }
    if (c === '∀') { tokens.push({ type: 'FORALL', value: '∀', pos: i }); i++; continue; }
    if (c === '∃') { tokens.push({ type: 'EXISTS', value: '∃', pos: i }); i++; continue; }
    // Identifiers
    if (/[a-zA-Zα-ωΑ-Ω_]/.test(c)) {
      let start = i;
      while (i < input.length && /[a-zA-Zα-ωΑ-Ω0-9_']/.test(input[i])) i++;
      const word = input.slice(start, i);
      if (word === 'forall') { tokens.push({ type: 'FORALL', value: '∀', pos: start }); continue; }
      if (word === 'exists') { tokens.push({ type: 'EXISTS', value: '∃', pos: start }); continue; }
      if (word === 'in')     { tokens.push({ type: 'IN',     value: '∈', pos: start }); continue; }
      tokens.push({ type: 'IDENT', value: word, pos: start });
      continue;
    }
    throw new Error(`Unexpected character '${c}' at position ${i}`);
  }
  tokens.push({ type: 'EOF', value: '', pos: i });
  return tokens;
}

// ===== Parser =====
class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) { this.tokens = tokens; }

  private peek(): Token { return this.tokens[this.pos]; }
  private advance(): Token { return this.tokens[this.pos++]; }
  private expect(type: TokenType): Token {
    const t = this.advance();
    if (t.type !== type) throw new Error(`Expected ${type} but got ${t.type} ('${t.value}') at pos ${t.pos}`);
    return t;
  }

  parseFormula(): Formula { return this.parseIff(); }

  private parseIff(): Formula {
    let left = this.parseImplies();
    while (this.peek().type === 'IFF') {
      this.advance();
      const right = this.parseImplies();
      left = Iff(left, right);
    }
    return left;
  }

  private parseImplies(): Formula {
    const left = this.parseOr();
    if (this.peek().type === 'ARROW') {
      this.advance();
      const right = this.parseImplies(); // right-associative
      return Implies(left, right);
    }
    return left;
  }

  private parseOr(): Formula {
    let left = this.parseAnd();
    while (this.peek().type === 'OR') {
      this.advance();
      const right = this.parseAnd();
      left = Or(left, right);
    }
    return left;
  }

  private parseAnd(): Formula {
    let left = this.parseUnary();
    while (this.peek().type === 'AND') {
      this.advance();
      const right = this.parseUnary();
      left = And(left, right);
    }
    return left;
  }

  private parseUnary(): Formula {
    if (this.peek().type === 'NOT') {
      this.advance();
      return Not(this.parseUnary());
    }
    if (this.peek().type === 'FORALL') {
      this.advance();
      const v = this.expect('IDENT').value;
      const body = this.parseUnary();
      return Forall(v, body);
    }
    if (this.peek().type === 'EXISTS') {
      this.advance();
      const v = this.expect('IDENT').value;
      const body = this.parseUnary();
      return Exists(v, body);
    }
    return this.parseAtomic();
  }

  private parseAtomic(): Formula {
    if (this.peek().type === 'LPAREN') {
      this.advance();
      const f = this.parseFormula();
      this.expect('RPAREN');
      return f;
    }
    if (this.peek().type === 'IDENT') {
      const name = this.peek().value;
      const isUpper = /^[A-ZΑ-Ωα-ω]/.test(name);
      if (isUpper || /^[α-ω]/.test(name)) {
        // Could be a predicate (uppercase) or propositional variable / meta-variable
        this.advance();
        if (this.peek().type === 'LPAREN') {
          this.advance();
          const args = this.parseTermList();
          this.expect('RPAREN');
          return Pred(name, args);
        }
        // Propositional variable (0-ary predicate)
        return Pred(name, []);
      } else {
        // Lowercase: must be a term, expect = or ∈
        const left = this.parseTerm();
        if (this.peek().type === 'EQ') {
          this.advance();
          const right = this.parseTerm();
          return Pred('=', [left, right]);
        }
        if (this.peek().type === 'IN') {
          this.advance();
          const right = this.parseTerm();
          return Pred('∈', [left, right]);
        }
        // If it's a single lowercase identifier and nothing follows, treat as predicate
        return Pred(name, []);
      }
    }
    throw new Error(`Unexpected token '${this.peek().value}' at position ${this.peek().pos}`);
  }

  parseTerm(): Term {
    const name = this.expect('IDENT').value;
    if (this.peek().type === 'LPAREN') {
      this.advance();
      const args = this.parseTermList();
      this.expect('RPAREN');
      return Func(name, args);
    }
    return Var(name);
  }

  private parseTermList(): Term[] {
    if (this.peek().type === 'RPAREN') return [];
    const terms: Term[] = [this.parseTerm()];
    while (this.peek().type === 'COMMA') {
      this.advance();
      terms.push(this.parseTerm());
    }
    return terms;
  }
}

// ===== Public API =====
export function parseFormula(input: string): Formula {
  const tokens = tokenize(input);
  const parser = new Parser(tokens);
  const result = parser.parseFormula();
  if (parser['peek']().type !== 'EOF') {
    throw new Error(`Unexpected token after formula: '${parser['peek']().value}'`);
  }
  return result;
}

export function parseTerm(input: string): Term {
  const tokens = tokenize(input);
  const parser = new Parser(tokens);
  const result = parser.parseTerm();
  return result;
}
