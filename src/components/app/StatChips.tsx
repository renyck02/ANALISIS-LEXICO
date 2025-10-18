type StatChipsProps = {
    tokens: number;
    errors: number;
    symbols: number;
};

export function StatChips({ tokens, errors, symbols }: StatChipsProps) {
    return (
        <div className=" text-sm self-center">
            {tokens} tokens • {errors} errores • {symbols} símbolos
        </div>
    );
}
