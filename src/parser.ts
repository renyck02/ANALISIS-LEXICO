// src/parser.ts
import type { Token } from "./lexer"

export interface SyntaxError {
    message: string
    line: number
    column: number
}

export interface DeclarationInfo {
    name: string
    type: string
    scope: string
    initialValue?: string
    line: number
    column: number
}

export interface SemanticError {
    kind: "Redeclaration"
    name: string
    scope: string
    message: string
    line: number      // línea donde se detecta el error
    column: number    // columna donde se detecta el error
    previousLine?: number
    previousColumn?: number
}

export interface ParserResult {
    errors: SyntaxError[]
    declarations: DeclarationInfo[]
    semanticErrors: SemanticError[]
}

// Helpers para clasificar tokens
const isKeyword = (t: Token | undefined, kw: string) =>
    !!t && t.type === "keyword" && t.lexeme === kw

const isTypeKeyword = (t: Token | undefined) =>
    !!t &&
    t.type === "keyword" &&
    ["int", "float", "bool", "string"].includes(t.lexeme)

const isDelimiter = (t: Token | undefined, d: string) =>
    !!t && t.type === "delimiter" && t.lexeme === d

const isOperator = (t: Token | undefined, op?: string) =>
    !!t && t.type === "operator" && (op ? t.lexeme === op : true)

const isIdentifier = (t: Token | undefined) => !!t && t.type === "identifier"

const isLiteral = (t: Token | undefined) =>
    !!t &&
    (t.type === "number" ||
        t.type === "string" ||
        (t.type === "keyword" && (t.lexeme === "true" || t.lexeme === "false")))

/**
 * Gramática aproximada:
 *
 * Program   -> Statement*
 * Statement -> VarDecl | IfStmt | Block | ExprStmt
 * VarDecl   -> Type identifier ('=' Expr)? ';'
 * IfStmt    -> 'if' '(' Expr ')' Block ('else' (Block | Statement))?
 * Block     -> '{' Statement* '}'
 * ExprStmt  -> Expr ';'
 * Expr      -> Primary (operator Primary)*
 * Primary   -> identifier | literal | '(' Expr ')'
 */




export function parse(tokens: Token[]): ParserResult {
    let current = 0
    let lastToken: Token | null = null

    const errors: SyntaxError[] = []
    const declarations: DeclarationInfo[] = []
    const semanticErrors: SemanticError[] = []

    const scopeStack: string[] = ["global"]
    const currentScope = () => scopeStack[scopeStack.length - 1]

    const isAtEnd = () => current >= tokens.length // para saber si se leyo todo los tokens
    const peek = () => (isAtEnd() ? undefined : tokens[current])

    const advance = () => {
        if (isAtEnd()) {
            return lastToken ?? tokens[tokens.length - 1]
        }
        const tok = tokens[current++]
        lastToken = tok
        return tok
    }

    const addSyntaxError = (token: Token | undefined, message: string) => {
        const t = token ?? lastToken ?? tokens[tokens.length - 1]
        errors.push({
            message,
            line: t.line,
            column: t.column,
        })
    }

    const addSemanticRedeclaration = (
        name: string,
        scope: string,
        token: Token,
        previous?: DeclarationInfo
    ) => {
        semanticErrors.push({
            kind: "Redeclaration",
            name,
            scope,
            message: `La variable '${name}' ya está declarada en el ámbito '${scope}'.`,
            line: token.line,
            column: token.column,
            previousLine: previous?.line,
            previousColumn: previous?.column,
        })
    }

    const consumeDelimiter = (d: string, message: string) => {
        const t = peek()
        if (isDelimiter(t, d)) {
            advance()
            return t
        }
        addSyntaxError(t, message)
        if (!isAtEnd()) advance()
        return null
    }

    const consumeKeyword = (kw: string, message: string) => {
        const t = peek()
        if (isKeyword(t, kw)) {
            advance()
            return t
        }
        addSyntaxError(t, message)
        if (!isAtEnd()) advance()
        return null
    }

    const consumeIdentifier = (message: string) => {
        const t = peek()
        if (isIdentifier(t)) {
            advance()
            return t
        }
        addSyntaxError(t, message)
        if (!isAtEnd()) advance()
        return null
    }

    const parseProgram = () => {
        while (!isAtEnd()) {
            parseStatement()
        }
    }

    const parseStatement = () => {
        const t = peek()
        if (!t) return

        if (isTypeKeyword(t)) {
            parseVarDecl()
            return
        }

        if (isKeyword(t, "if")) {
            parseIfStmt()
            return
        }

        if (isDelimiter(t, "{")) {
            parseBlock()
            return
        }

        parseExprStmt()
    }

    const parseVarDecl = () => {
        // Tipo
        const typeToken = peek()
        if (!isTypeKeyword(typeToken)) {
            addSyntaxError(typeToken, "Se esperaba un tipo (int, float, bool, string)")
            if (!isAtEnd()) advance()
            return
        }
        advance()
        const typeLexeme = typeToken!.lexeme

        // Identificador
        const identToken = consumeIdentifier(
            "Se esperaba un identificador después del tipo"
        )

        // asignacion opcion en caso de errores
        let initialValue: string | undefined
        const afterIdent = peek()
        if (isOperator(afterIdent, "=")) {
            advance() // '='

            const exprStart = current
            parseExpr()
            const exprEnd = current
            const slice = tokens.slice(exprStart, exprEnd)
            if (slice.length > 0) {
                initialValue = slice.map((t) => t.lexeme).join(" ")
            }
        }

        // ';'
        consumeDelimiter(";", "Se esperaba ';' al final de la declaración de variable")

        // Registrar declaracion y checar redeclaracion en el mismo scope
        if (identToken) {
            const scope = currentScope()
            const previous = declarations.find(
                (d) => d.name === identToken.lexeme && d.scope === scope
            )

            if (previous) {
                //  Error semantico: redeclaración en el mismo scope
                addSemanticRedeclaration(identToken.lexeme, scope, identToken, previous)
                // No agregamos nueva declaracion; la primera queda como valida
            } else {
                declarations.push({
                    name: identToken.lexeme,
                    type: typeLexeme,
                    scope,
                    initialValue,
                    line: identToken.line,
                    column: identToken.column,
                })
            }
        }
    }

    const parseIfStmt = () => {
        consumeKeyword("if", "Se esperaba la palabra clave 'if'")
        consumeDelimiter("(", "Se esperaba '(' después de 'if'")
        parseExpr()
        consumeDelimiter(")", "Se esperaba ')' después de la condición de 'if'")
        parseBlock()

        const t = peek()
        if (isKeyword(t, "else")) {
            advance()
            if (isDelimiter(peek(), "{")) {
                parseBlock()
            } else {
                parseStatement()
            }
        }
    }

    const parseBlock = () => {
        const open = consumeDelimiter("{", "Se esperaba '{' para iniciar el bloque")
        const newScope =
            open != null ? `block - linea:${open.line} column:${open.column}` : "block"
        scopeStack.push(newScope)

        while (!isAtEnd() && !isDelimiter(peek(), "}")) {
            parseStatement()
        }

        // Aqui se capturan errores de '}' faltante usando addSyntaxError con lastToken
        consumeDelimiter("}", "Se esperaba '}' para cerrar el bloque")
        scopeStack.pop()
    }

    const parseExprStmt = () => {
        parseExpr()
        consumeDelimiter(";", "Se esperaba ';' al final de la expresión")
    }

    const parsePrimary = () => {
        const t = peek()
        if (!t) return

        if (isIdentifier(t) || isLiteral(t)) {
            advance()
            return
        }

        if (isDelimiter(t, "(")) {
            advance()
            parseExpr()
            consumeDelimiter(")", "Se esperaba ')' después de la expresión")
            return
        }

        addSyntaxError(t, `Expresión no válida cerca de '${t.lexeme}'`)
        advance()
    }

    const parseExpr = () => {
        parsePrimary()
        while (true) {
            const t = peek()
            if (!t || !isOperator(t)) break
            advance()
            parsePrimary()
        }
    }

    parseProgram()

    return { errors, declarations, semanticErrors }
}
