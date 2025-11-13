// src/components/ErrorsPanel.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Info, CheckCircle2, AlertCircle } from "lucide-react"

type LexError = { line: number; column: number; message: string }

type ErrorsPanelProps = {
    analyzed: boolean
    errors: LexError[]
}

export function ErrorsPanel({ analyzed, errors }: ErrorsPanelProps) {
    return (
        <Card className="h-full ">
            <CardHeader>
                <CardTitle className="">Errores Léxicos</CardTitle>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-72 pr-2">
                    {!analyzed && (
                        <Alert className=" ">
                            <Info className="h-4 w-4" />
                            <AlertTitle className="">Sin análisis</AlertTitle>
                            <AlertDescription className="">
                                Aún no hay análisis.
                            </AlertDescription>
                        </Alert>
                    )}

                    {analyzed && errors.length === 0 && (
                        <Alert className="">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle className="">Resultado</AlertTitle>
                            <AlertDescription className="">
                                Sin errores léxicos.
                            </AlertDescription>
                        </Alert>
                    )}

                    {errors.map((e, idx) => (
                        <Alert
                            key={`${e.line}-${e.column}-${idx}`}
                            className=""
                        >
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="">
                                Línea {e.line}, Col {e.column}
                            </AlertTitle>
                            <AlertDescription className="">
                                {e.message}
                            </AlertDescription>
                        </Alert>
                    ))}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
