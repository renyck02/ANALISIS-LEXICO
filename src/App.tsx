import { useMemo, useState } from "react";
import { lex, type LexerResult, type Token } from "./lexer";

function App() {
  const [code, setCode] = useState<string>(
    `// Escribe tu código aquí\nint x = 10;\nif (x >= 10) {\n  x += 1;\n}`
  );
  const [result, setResult] = useState<LexerResult | null>(null);

  const hasAnalyzed = !!result;

  const tokens = result?.tokens ?? [];
  const errors = result?.errors ?? [];
  const symbols = result?.symbols ?? [];

  const tokenKey = (t: Token, idx: number) =>
    `${t.type}-${t.lexeme}-${t.line}-${t.column}-${idx}`;

  const handleAnalyze = () => {
    const r = lex(code);
    setResult(r);
  };

  const tokenCountByType = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tokens) m.set(t.type, (m.get(t.type) || 0) + 1);
    return Array.from(m.entries());
  }, [tokens]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 p-6 gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 gap-6">
        <div className="bg-gray-700 rounded-lg p-5 shadow-lg lg:col-span-2 flex flex-col">
          <h1 className="text-lg font-semibold text-white mb-3">
            Editor de Código
          </h1>
          <textarea
            className="flex-1 p-3 bg-slate-900 text-white rounded-lg text-sm font-mono"
            placeholder="Escribe tu código aquí..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="flex gap-3 mt-3">
            <button
              className="bg-blue-700 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-600"
              onClick={handleAnalyze}
            >
              Analizar Código
            </button>
            {hasAnalyzed && (
              <div className="text-slate-200 text-sm self-center">
                {tokens.length} tokens • {errors.length} errores •{" "}
                {symbols.length} símbolos
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-5 shadow-lg flex flex-col overflow-hidden">
          <h1 className="text-lg font-semibold text-white mb-3">
            Errores Léxicos
          </h1>
          <div className="text-sm text-slate-300 flex-1 space-y-2 overflow-auto pr-1">
            {!hasAnalyzed && (
              <div className="text-slate-400">Aún no hay análisis.</div>
            )}
            {hasAnalyzed && errors.length === 0 && (
              <div className="text-green-300">Sin errores léxicos.</div>
            )}
            {errors.map((e, idx) => (
              <div
                key={`${e.line}-${e.column}-${idx}`}
                className="bg-red-900/40 border border-red-600 rounded-md p-2"
              >
                <div className="font-semibold text-red-300">
                  Línea {e.line}, Col {e.column}
                </div>
                <div>{e.message}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-5 shadow-lg flex flex-col overflow-hidden">
          <h1 className="text-lg font-semibold text-white mb-3">
            Lexemas y Componentes
          </h1>
          <div className="text-sm text-slate-300 flex-1 space-y-1 overflow-auto pr-1">
            {!hasAnalyzed && (
              <div className="text-slate-400">Aún no hay análisis.</div>
            )}
            {tokens.map((t, idx) => (
              <div
                key={tokenKey(t, idx)}
                className="grid grid-cols-5 gap-2 items-center bg-slate-800/60 rounded-md px-2 py-1"
              >
                <span className="col-span-2 truncate font-mono text-slate-100">
                  {t.lexeme}
                </span>
                <span className="col-span-1 text-indigo-300">{t.type}</span>
                <span className="col-span-1 text-slate-400">L{t.line}</span>
                <span className="col-span-1 text-slate-400">C{t.column}</span>
              </div>
            ))}
          </div>
          {hasAnalyzed && (
            <div className="mt-3 text-xs text-slate-300 flex flex-wrap gap-2">
              {tokenCountByType.map(([t, c]) => (
                <span key={t} className="bg-slate-800 rounded px-2 py-1">
                  {t}: {c}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-700 rounded-lg p-5 shadow-lg flex flex-col overflow-hidden lg:col-span-2">
          <h1 className="text-lg font-semibold text-white mb-3">
            Tabla de Símbolos
          </h1>
          <div className="text-sm text-slate-300 flex-1 overflow-auto">
            {!hasAnalyzed && (
              <div className="text-slate-400">Aún no hay análisis.</div>
            )}
            {hasAnalyzed && symbols.length === 0 && (
              <div className="text-slate-400">
                No se encontraron identificadores.
              </div>
            )}
            {symbols.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-800 text-slate-200">
                    <tr>
                      <th className="px-3 py-2">Nombre</th>
                      <th className="px-3 py-2">Apariciones</th>
                      <th className="px-3 py-2">Primera vez (L,C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {symbols.map((s) => (
                      <tr key={s.name} className="odd:bg-slate-800/40">
                        <td className="px-3 py-2 font-mono text-slate-100">
                          {s.name}
                        </td>
                        <td className="px-3 py-2">{s.count}</td>
                        <td className="px-3 py-2">
                          L{s.firstLine}, C{s.firstColumn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
