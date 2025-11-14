// src/components/TokensList.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type Token = { type: string; lexeme: string; line: number; column: number }

type TokensListProps = {
    analyzed: boolean
    tokens: Token[]
    countsByType: Array<[string, number]>
}


const tokenTypeLabels: Record<string, string> = {
    keyword: "Palabra reservada",
    identifier: "Identificador",
    number: "Número",
    string: "Cadena",
    operator: "Operador",
    delimiter: "Delimitador",
    comment: "Comentario",
}


export function TokensList({ analyzed, tokens, countsByType }: TokensListProps) {
    const tokenKey = (t: Token, idx: number) =>
        `${t.type}-${t.lexeme}-${t.line}-${t.column}-${idx}`

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="">Lexemas y Componentes</CardTitle>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-64 w-full">

                    <div className="min-w-[500px] pr-1">
                        {tokens.map((t, idx) => (
                            <div
                                key={tokenKey(t, idx)}
                                className="grid grid-cols-5 items-center gap-2 rounded-md px-2 py-1 hover:bg-neutral-100"
                            >
        <span className="col-span-2 truncate font-mono ">
          {t.lexeme}
        </span>
                                <span className="col-span-1 ">
          {tokenTypeLabels[t.type] ?? t.type}
        </span>
                                <span className="col-span-1 ">L{t.line}</span>
                                <span className="col-span-1 ">C{t.column}</span>
                            </div>
                        ))}
                    </div>
                </ScrollArea>


                {analyzed && countsByType.length > 0 && (
                    <>
                        <Separator className="my-3 " />
                        <div className="flex flex-wrap gap-2">
                            {countsByType.map(([t, c]) => (
                                <Badge
                                    key={t}
                                    variant="secondary"
                                    className=""
                                >
                                    {t}: {c}
                                </Badge>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
