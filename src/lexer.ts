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
  line: number;
  column: number;
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
  type: string;
  value: string;
}

export interface LexerResult {
  tokens: Token[];
  errors: LexError[];
  symbols: SymbolInfo[];
}

const KEYWORDS = new Set([
  //
  "if",
  "else",
  "while",
  "for",
  "return",
  "break",
  "continue",
  //
  "int",
  "float",
  "bool",
  "string",
  "void",
  //
  "true",
  "false",
  //
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

    if (/[\t\r\n\s]/.test(ch)) {
      advance();
      continue;
    }

    const startLine = line;
    const startColumn = column;

    if (ch === "/") {
      const next = peek();
      if (next === "/") {
        while (currentChar() !== null && currentChar() !== "\n") advance();
        continue;
      } else if (next === "*") {
        advance(2);
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

    if (ch === '"') {
      advance();
      let value = "";
      let escaped = false;
      let strLine = startLine;
      let strCol = startColumn;
      while (i < length) {
        const c = currentChar();
        if (c === null) break;
        if (!escaped && c === '"') {
          advance();
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
          if (!/["\\nrt0]/.test(esc)) {
          }
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
            type: "identificador",
            value: text,
          });
        }
      }
      continue;
    }

    const two = ch + (peek() ?? "");
    if (MULTI_OPERATORS.has(two)) {
      addToken("operator", two, startLine, startColumn);
      advance(2);
      continue;
    }

    if (SINGLE_OPERATORS.has(ch)) {
      addToken("operator", ch, startLine, startColumn);
      advance();
      continue;
    }

    if (DELIMITERS.has(ch)) {
      addToken("delimiter", ch, startLine, startColumn);
      advance();
      continue;
    }

    addError(`Símbolo no reconocido: '${ch}'`, startLine, startColumn);
    advance();
  }

  // Análisis semántico básico para inferir tipos y valores
  analyzeDeclarations(tokens, symbolMap);

  const symbols = Array.from(symbolMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  return { tokens, errors, symbols };
}

// Analiza los tokens para detectar declaraciones de variables y sus valores
function analyzeDeclarations(
  tokens: Token[],
  symbolMap: Map<string, SymbolInfo>
) {
  const TYPE_KEYWORDS = new Set(["int", "float", "bool", "string"]);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Buscar patrón: tipo identificador = valor;
    // Ejemplo: int x = 5;
    if (token.type === "keyword" && TYPE_KEYWORDS.has(token.lexeme)) {
      const varType = token.lexeme;

      // El siguiente token debería ser un identificador
      if (i + 1 < tokens.length && tokens[i + 1].type === "identifier") {
        const varName = tokens[i + 1].lexeme;
        const symbol = symbolMap.get(varName);

        if (symbol) {
          symbol.type = varType;

          // Buscar si hay una asignación
          if (
            i + 2 < tokens.length &&
            tokens[i + 2].type === "operator" &&
            tokens[i + 2].lexeme === "="
          ) {
            // El siguiente token debería ser el valor
            if (i + 3 < tokens.length) {
              const valueToken = tokens[i + 3];

              if (valueToken.type === "number") {
                symbol.value = valueToken.lexeme;
              } else if (valueToken.type === "string") {
                symbol.value = valueToken.lexeme;
              } else if (
                valueToken.type === "keyword" &&
                (valueToken.lexeme === "true" || valueToken.lexeme === "false")
              ) {
                symbol.value = valueToken.lexeme;
              } else if (valueToken.type === "identifier") {
                // Si se asigna otra variable, mostrar el nombre
                symbol.value = valueToken.lexeme;
              } else {
                symbol.value = "sin inicializar";
              }
            }
          } else {
            symbol.value = "sin inicializar";
          }
        }

        i++; // Saltar el identificador
      }
    }
    // También detectar asignaciones posteriores: identificador = valor;
    else if (
      token.type === "identifier" &&
      i + 1 < tokens.length &&
      tokens[i + 1].type === "operator" &&
      tokens[i + 1].lexeme === "="
    ) {
      const varName = token.lexeme;
      const symbol = symbolMap.get(varName);

      if (symbol && i + 2 < tokens.length) {
        const valueToken = tokens[i + 2];

        // Solo actualizar el valor si aún no tiene tipo definido o si queremos el último valor
        if (valueToken.type === "number") {
          symbol.value = valueToken.lexeme;
          // Inferir tipo si no está definido
          if (symbol.type === "identificador") {
            symbol.type = valueToken.lexeme.includes(".") ? "float" : "int";
          }
        } else if (valueToken.type === "string") {
          symbol.value = valueToken.lexeme;
          if (symbol.type === "identificador") {
            symbol.type = "string";
          }
        } else if (
          valueToken.type === "keyword" &&
          (valueToken.lexeme === "true" || valueToken.lexeme === "false")
        ) {
          symbol.value = valueToken.lexeme;
          if (symbol.type === "identificador") {
            symbol.type = "bool";
          }
        }
      }
    }
  }
}

export type { LexerResult as AnalisysResult };
