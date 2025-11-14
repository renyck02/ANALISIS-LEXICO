// Simple lexical analyzer for a small C-like language
// - Recognizes: keywords, identifiers, numbers, strings, operators, delimiters, comments
// - Tracks line/column positions
// - Reports lexical errors
// - Builds a basic symbol table of identifiers found

export type TokenType =
    | "keyword"
    | "identifier"
    | "number"
    | "string"
    | "operator"
    | "delimiter"
    | "comment";

export interface Token {
  type: TokenType;
  lexeme: string;
  line: number; // 1-based
  column: number; // 1-based, column of first character
}

export interface LexError {
  message: string;
  line: number;
  column: number;
}

export interface SymbolInfo {
  name: string;
  count: number;
  firstLine: number;
  firstColumn: number;
  // Campos semánticos que se completan en el análisis sintáctico:
  type?: string;         // int, float, bool, string, etc.
  scope?: string;        // ámbito (global, bloque X, etc.)
  initialValue?: string; // valor inicial si se puede inferir (ej. "10", "true")
}

export interface LexerResult {
  tokens: Token[];
  errors: LexError[];
  symbols: SymbolInfo[]; // unique identifiers
}

const KEYWORDS = new Set([
  // control flow
  "if",
  "else",
  "while",
  "for",
  "return",
  "break",
  "continue",
  // types
  "int",
  "float",
  "bool",
  "string",
  "void",
  // boolean literals
  "true",
  "false",
  // functions
  "function",
]);

const MULTI_OPERATORS = new Set([
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
]);

const SINGLE_OPERATORS = new Set([
  "+",
  "-",
  "*",
  "/",
  "%",
  "=",
  "<",
  ">",
  "!",
  "&",
  "|",
  "^",
  "~",
  "?",
  ":",
]);

const DELIMITERS = new Set(["(", ")", "{", "}", "[", "]", ",", ";", "."]);

export function lex(input: string): LexerResult {
  const tokens: Token[] = [];
  const errors: LexError[] = [];
  const symbolMap = new Map<string, SymbolInfo>();

  let i = 0;
  let line = 1;
  let column = 1;

  const length = input.length;

  function currentChar(): string | null {
    return i < length ? input[i] : null;
  }

  function peek(offset = 1): string | null {
    const idx = i + offset;
    return idx < length ? input[idx] : null;
  }

  function advance(steps = 1) {
    while (steps-- > 0 && i < length) {
      const ch = input[i++];
      if (ch === "\n") {
        line += 1;
        column = 1;
      } else {
        column += 1;
      }
    }
  }

  function addToken(
      type: TokenType,
      lexeme: string,
      startLine: number,
      startColumn: number
  ) {
    tokens.push({ type, lexeme, line: startLine, column: startColumn });
  }

  function addError(message: string, startLine: number, startColumn: number) {
    errors.push({ message, line: startLine, column: startColumn });
  }

  function isAlpha(ch: string | null) {
    return !!ch && /[A-Za-z_]/.test(ch);
  }

  function isAlphaNumeric(ch: string | null) {
    return !!ch && /[A-Za-z0-9_]/.test(ch);
  }

  function isDigit(ch: string | null) {
    return !!ch && /[0-9]/.test(ch);
  }

  while (i < length) {
    let ch = currentChar();
    if (ch === null) break;

    // Skip whitespace
    if (/[\t\r\n\s]/.test(ch)) {
      advance();
      continue;
    }

    const startLine = line;
    const startColumn = column;

    // Comments or division operator
    if (ch === "/") {
      const next = peek();
      if (next === "/") {
        // Line comment
        while (currentChar() !== null && currentChar() !== "\n") advance();
        continue;
      } else if (next === "*") {
        // Block comment
        advance(2); // consume /*
        let terminated = false;
        while (i < length) {
          if (currentChar() === "*" && peek() === "/") {
            advance(2);
            terminated = true;
            break;
          }
          advance();
        }
        if (!terminated) {
          addError("Comentario de bloque sin terminar", startLine, startColumn);
        }
        continue;
      }
      const two = ch + (next ?? "");
      if (MULTI_OPERATORS.has(two)) {
        addToken("operator", two, startLine, startColumn);
        advance(2);
      } else {
        addToken("operator", ch, startLine, startColumn);
        advance();
      }
      continue;
    }

    // Strings: "..."
    if (ch === '"') {
      advance(); // consume opening quote
      let value = "";
      let escaped = false;
      let strLine = startLine;
      let strCol = startColumn;
      while (i < length) {
        const c = currentChar();
        if (c === null) break;
        if (!escaped && c === '"') {
          advance(); // consume closing quote
          addToken("string", '"' + value + '"', strLine, strCol);
          escaped = false;
          value = "";
          break;
        }
        if (!escaped && c === "\\") {
          escaped = true;
          advance();
          continue;
        }
        if (escaped) {
          const esc = c;
          value += "\\" + esc;
          escaped = false;
          advance();
        } else {
          value += c;
          advance();
        }
        if (!escaped && c === "\n") {
          addError("Cadena sin terminar", startLine, startColumn);
          break;
        }
      }
      if (escaped || (currentChar() === null && value !== "")) {
        addError("Cadena sin terminar", startLine, startColumn);
      }
      continue;
    }

    // Numbers
    if (isDigit(ch)) {
      let text = "";
      while (isDigit(currentChar())) {
        text += currentChar();
        advance();
      }
      if (currentChar() === "." && isDigit(peek())) {
        text += ".";
        advance();
        while (isDigit(currentChar())) {
          text += currentChar();
          advance();
        }
      }
      if (isAlpha(currentChar())) {
        let junk = "";
        while (isAlphaNumeric(currentChar())) {
          junk += currentChar();
          advance();
        }
        addError(`Número inválido: '${text + junk}'`, startLine, startColumn);
        addToken("number", text, startLine, startColumn);
      } else {
        addToken("number", text, startLine, startColumn);
      }
      continue;
    }

    // Identifiers/Keywords
    if (isAlpha(ch)) {
      let text = "";
      while (isAlphaNumeric(currentChar())) {
        text += currentChar();
        advance();
      }
      if (KEYWORDS.has(text)) {
        addToken("keyword", text, startLine, startColumn);
      } else {
        addToken("identifier", text, startLine, startColumn);
        const existing = symbolMap.get(text);
        if (existing) {
          existing.count += 1;
        } else {
          symbolMap.set(text, {
            name: text,
            count: 1,
            firstLine: startLine,
            firstColumn: startColumn,
          });
        }
      }
      continue;
    }

    // Multi-char operators
    const two = ch + (peek() ?? "");
    if (MULTI_OPERATORS.has(two)) {
      addToken("operator", two, startLine, startColumn);
      advance(2);
      continue;
    }

    // Single-char operators
    if (SINGLE_OPERATORS.has(ch)) {
      addToken("operator", ch, startLine, startColumn);
      advance();
      continue;
    }

    // Delimiters
    if (DELIMITERS.has(ch)) {
      addToken("delimiter", ch, startLine, startColumn);
      advance();
      continue;
    }

    // Unknown character
    addError(`Símbolo no reconocido: '${ch}'`, startLine, startColumn);
    advance();
  }

  const symbols = Array.from(symbolMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
  );
  return { tokens, errors, symbols };
}

export type { LexerResult as AnalisysResult };
