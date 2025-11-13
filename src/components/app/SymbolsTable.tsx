// src/components/SymbolsTable.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

type SymbolRow = {
  name: string;
  count: number;
  firstLine: number;
  firstColumn: number;
  type: string;
  value: string;
};

type SymbolsTableProps = {
  analyzed: boolean;
  symbols: SymbolRow[];
};

export function SymbolsTable({ analyzed, symbols }: SymbolsTableProps) {
  const showEmptyState = analyzed && symbols.length === 0;

  return (
    <Card className=" lg:col-span-2 h-full">
      <CardHeader>
        <CardTitle className="">Tabla de Símbolos</CardTitle>
      </CardHeader>

      <CardContent>
        {!analyzed && (
          <Alert className="">
            <Info className="h-4 w-4" />
            <AlertTitle className="">Sin análisis</AlertTitle>
            <AlertDescription className="">
              Aún no hay análisis.
            </AlertDescription>
          </Alert>
        )}

        {showEmptyState && (
          <Alert className="">
            <Info className="h-4 w-4" />
            <AlertTitle className="">Resultado</AlertTitle>
            <AlertDescription className="">
              No se encontraron identificadores.
            </AlertDescription>
          </Alert>
        )}

        {analyzed && symbols.length > 0 && (
          <ScrollArea className="h-64 rounded-md border ">
            <Table>
              <TableHeader className="">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="">Identificador</TableHead>
                  <TableHead className="">Apariciones</TableHead>
                  <TableHead className="">Primera vez (L,C)</TableHead>
                  <TableHead className="">Tipo</TableHead>
                  <TableHead className="">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {symbols.map((s) => (
                  <TableRow key={s.name} className="">
                    <TableCell className="font-mono ">{s.name}</TableCell>
                    <TableCell className="">{s.count}</TableCell>
                    <TableCell className="">
                      L{s.firstLine}, C{s.firstColumn}
                    </TableCell>
                    <TableCell className="">{s.type}</TableCell>
                    <TableCell className="">{s.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
