import { useMemo, useState } from "react";
import { lex, type LexerResult, type Token } from "./lexer";
import { Header } from "@/components/app/Header";
import { ErrorsPanel } from "@/components/app/ErrorsPanel";
import { Editor } from "@/components/app/Editor";
import { StatChips } from "@/components/app/StatChips";
import { SymbolsTable } from "@/components/app/SymbolsTable";
import { TokensList } from "@/components/app/TokenList";

export default function App() {
    const [code, setCode] = useState<string>(
        `// Escribe tu código aquí\nint x = 10;\nif (x >= 10) {\n  x += 1;\n}`
    );
    const [result, setResult] = useState<LexerResult | null>(null);

    const hasAnalyzed = !!result;
    const tokens = result?.tokens ?? [];
    const errors = result?.errors ?? [];
    const symbols = result?.symbols ?? [];

    const tokenCountByType = useMemo(() => {
        const m = new Map<string, number>();
        for (const t of tokens) m.set(t.type, (m.get(t.type) || 0) + 1);
        return Array.from(m.entries());
    }, [tokens]);

    const handleAnalyze = () => setResult(lex(code));

    return (
        <div className="min-h-dvh ">

            <div className="sticky top-0 z-10 backdrop-blur">
                <div className="mx-auto w-full max-w-7xl px-4 lg:px-6 py-3 flex justify-center items-center">
                    <Header />
                </div>
            </div>


            <main className="mx-auto w-full max-w-7xl px-4 lg:px-6 py-6">

                <div className="grid grid-cols-12 gap-6">

                    <div className="col-span-12 lg:col-span-8">
                        <Editor
                            code={code}
                            onChange={setCode}
                            onAnalyze={handleAnalyze}
                            rightStatus={
                                hasAnalyzed ? (
                                    <StatChips
                                        tokens={tokens.length}
                                        errors={errors.length}
                                        symbols={symbols.length}
                                    />
                                ) : null
                            }
                        />
                    </div>


                    <div className="col-span-12 lg:col-span-4">
                        <ErrorsPanel analyzed={hasAnalyzed} errors={errors} />
                    </div>


                    <div className="col-span-12 lg:col-span-4">
                        <TokensList
                            analyzed={hasAnalyzed}
                            tokens={tokens as Token[]}
                            countsByType={tokenCountByType}
                        />
                    </div>


                    <div className="col-span-12 lg:col-span-8">
                        <SymbolsTable analyzed={hasAnalyzed} symbols={symbols} />
                    </div>
                </div>
            </main>
        </div>
    );
}
