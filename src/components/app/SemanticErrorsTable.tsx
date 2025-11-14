// src/components/app/SemanticErrorsTable.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import type { SemanticError } from "@/parser"

type SemanticErrorsTableProps = {
    analyzed: boolean
    errors: SemanticError[]
}

export function SemanticErrorsTable({ analyzed, errors }: SemanticErrorsTableProps) {
    const showEmptyState = analyzed && errors.length === 0

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Errores Semánticos</CardTitle>
            </CardHeader>

            <CardContent>
                {!analyzed && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Sin análisis</AlertTitle>
                        <AlertDescription>
                            Aún no hay análisis semántico (se genera junto con el sintáctico).
                        </AlertDescription>
                    </Alert>
                )}

                {showEmptyState && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Resultado</AlertTitle>
                        <AlertDescription>
                            No se detectaron errores semánticos.
                        </AlertDescription>
                    </Alert>
                )}

                {analyzed && errors.length > 0 && (
                    <ScrollArea className="h-64 rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Ámbito</TableHead>
                                    <TableHead>Mensaje</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead>Declaración previa</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {errors.map((e, idx) => (
                                    <TableRow key={`${e.name}-${idx}`}>
                                        <TableCell>
                                            {e.kind === "Redeclaration" ? "Redeclaración" : e.kind}
                                        </TableCell>
                                        <TableCell className="font-mono">{e.name}</TableCell>
                                        <TableCell>{e.scope}</TableCell>
                                        <TableCell>{e.message}</TableCell>
                                        <TableCell>
                                            L{e.line}, C{e.column}
                                        </TableCell>
                                        <TableCell>
                                            {e.previousLine != null
                                                ? `L${e.previousLine}, C${e.previousColumn}`
                                                : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
