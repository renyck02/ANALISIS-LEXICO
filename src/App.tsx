function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 p-6 gap-4">
      {/*<h1 className="flex justify-center text-2xl font-bold text-white mb-4">
        Análisis Léxico
      </h1>*/}
      {/*Al chile nose como poner las fokin tablas w, ahi hice lo que pude*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 gap-6">
        <div className="bg-gray-700 rounded-lg p-5 shadow-lg lg:col-span-2 flex flex-col">
          <h1 className="text-lg font-semibold text-white mb-3">
            Editor de Código (Zona de Entrada)
          </h1>
          <textarea
            className="flex-1 p-3 bg-slate-900 text-white rounded-lg  text-sm"
            placeholder="Escribe tu código aquí..."
          ></textarea>
        </div>
        <div className="bg-gray-700 rounded-lg p-5 shadow-lg flex flex-col overflow-y-auto">
          <h1 className="text-lg font-semibold text-white mb-3">
            Errores Léxicos
          </h1>
          <div className="text-sm text-slate-300 flex-1 space-y-2"></div>
        </div>
        <div className="bg-gray-700 rounded-lg p-5 shadow-lg flex flex-col overflow-y-auto">
          <h1 className="text-lg font-semibold text-white mb-3">
            Lexemas y Componentes
          </h1>
          <div className="text-sm text-slate-300 flex-1 space-y-1"></div>
        </div>
        <div className="bg-gray-700 rounded-lg p-5 shadow-lg flex flex-col overflow-y-auto lg:col-span-2">
          <h1 className="text-lg font-semibold text-white mb-3">
            Tabla de Símbolos
          </h1>
          <div className="text-sm text-slate-300 flex-1 overflow-auto"></div>
        </div>
      </div>
      <button className="bg-blue-700 text-white px-6 py-3 rounded-lg   font-medium">
        Analizar Código
      </button>
    </div>
  );
}

export default App;
