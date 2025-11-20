import { useMemo, useState } from "react"
import { lex, type LexerResult, type Token, type SymbolInfo } from "./lexer"
import { parse, type ParserResult } from "./parser"

import { Header } from "@/components/app/Header"
import { ErrorsPanel } from "@/components/app/ErrorsPanel"
import { SyntaxErrorsPanel } from "@/components/app/SyntaxErrorsPanel"
import { SemanticErrorsTable } from "@/components/app/SemanticErrorsTable"
import { Editor } from "@/components/app/Editor"
import { StatChips } from "@/components/app/StatChips"
import { SymbolsTable } from "@/components/app/SymbolsTable"
import { TokensList } from "@/components/app/TokenList"

export default function App() {
    const [code, setCode] = useState<string>(
        `// Escribe tu código aquí
int x = 10;
bool activo = true;
int y = 2;
if (x >= 10) {
  int y = 5;
  x = x + y;
}`
    )

    const [lexResult, setLexResult] = useState<LexerResult | null>(null)
    const [parserResult, setParserResult] = useState<ParserResult | null>(null)

    const hasAnalyzed = !!lexResult
    const tokens = lexResult?.tokens ?? []
    const lexErrors = lexResult?.errors ?? []

    const syntaxErrors = parserResult?.errors ?? []
    const semanticErrors = parserResult?.semanticErrors ?? []


    const enrichedSymbols: SymbolInfo[] = useMemo(() => {
        if (!lexResult) return []


        const baseMap = new Map<string, SymbolInfo>()
        for (const s of lexResult.symbols) {
            baseMap.set(s.name, s)
        }

        const rows: SymbolInfo[] = []


        if (parserResult) { // si no hubo errores lexicos
            for (const decl of parserResult.declarations) {
                const base = baseMap.get(decl.name)

                rows.push({
                    name: decl.name,
                    count: base?.count ?? 1,
                    firstLine: base?.firstLine ?? decl.line,
                    firstColumn: base?.firstColumn ?? decl.column,
                    type: decl.type,
                    scope: decl.scope,
                    initialValue: decl.initialValue,
                })
            }
        }

        const declaredNames = new Set(rows.map((r) => r.name))
        for (const s of lexResult.symbols) {
            if (!declaredNames.has(s.name)) {
                rows.push(s)
            }
        }

        return rows
    }, [lexResult, parserResult])


    const tokenCountByType = useMemo(() => {
        const m = new Map<string, number>()
        for (const t of tokens) m.set(t.type, (m.get(t.type) || 0) + 1)
        return Array.from(m.entries())
    }, [tokens])

    const totalErrors = lexErrors.length + syntaxErrors.length + semanticErrors.length

    const handleAnalyze = () => {
        const lr = lex(code)
        setLexResult(lr)

        if (lr.errors.length === 0) {
            const pr = parse(lr.tokens as Token[])
            setParserResult(pr)
        } else {
            setParserResult(null)
        }
    }

    return (
        <div className="min-h-dvh">
            <div className="sticky top-0 z-10 backdrop-blur">
                <div className="mx-auto w-full max-w-7xl px-4 lg:px-6 py-3 flex justify-center items-center">
                    <Header title="Análisis Léxico y Sintáctico " />
                </div>
            </div>

            <main className="mx-auto w-full max-w-7xl px-4 lg:px-6 py-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Editor */}
                    <div className="col-span-12 lg:col-span-8">
                        <Editor
                            code={code}
                            onChange={setCode}
                            onAnalyze={handleAnalyze}
                            rightStatus={
                                hasAnalyzed ? (
                                    <StatChips
                                        tokens={tokens.length}
                                        errors={totalErrors}
                                        symbols={enrichedSymbols.length}
                                    />
                                ) : null
                            }
                        />
                    </div>

                    {/* Errores léxicos */}
                    <div className="col-span-12 lg:col-span-4">
                        <ErrorsPanel analyzed={hasAnalyzed} errors={lexErrors} />
                    </div>

                    {/* Tokens */}
                    <div className="col-span-12 lg:col-span-4">
                        <TokensList
                            analyzed={hasAnalyzed}
                            tokens={tokens as Token[]}
                            countsByType={tokenCountByType}
                        />
                    </div>

                    {/* Tabla de símbolos */}
                    <div className="col-span-12 lg:col-span-8">
                        <SymbolsTable analyzed={hasAnalyzed} symbols={enrichedSymbols} />
                    </div>

                    {/* Errores sintácticos */}
                    <div className="col-span-12 lg:col-span-6">
                        <SyntaxErrorsPanel
                            analyzed={hasAnalyzed && lexErrors.length === 0}
                            errors={syntaxErrors}
                        />
                    </div>
                    {/* Errores semánticos */}
                    <div className="col-span-12 lg:col-span-6">
                        <SemanticErrorsTable
                            analyzed={hasAnalyzed && lexErrors.length === 0}
                            errors={semanticErrors}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}
