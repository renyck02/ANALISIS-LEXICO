// src/components/app/SyntaxErrorsPanel.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Info, CheckCircle2, AlertCircle } from "lucide-react"
import type { SyntaxError } from "@/parser"

type SyntaxErrorsPanelProps = {
    analyzed: boolean
    errors: SyntaxError[]
}

export function SyntaxErrorsPanel({ analyzed, errors }: SyntaxErrorsPanelProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Errores Sintácticos</CardTitle>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-72 pr-2">
                    {!analyzed && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Sin análisis</AlertTitle>
                            <AlertDescription>
                                Aún no hay análisis sintáctico.
                            </AlertDescription>
                        </Alert>
                    )}

                    {analyzed && errors.length === 0 && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Resultado</AlertTitle>
                            <AlertDescription>
                                Sin errores sintácticos.
                            </AlertDescription>
                        </Alert>
                    )}

                    {errors.map((e, idx) => (
                        <Alert key={`${e.line}-${e.column}-${idx}`}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>
                                Línea {e.line}, Col {e.column}
                            </AlertTitle>
                            <AlertDescription>{e.message}</AlertDescription>
                        </Alert>
                    ))}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
