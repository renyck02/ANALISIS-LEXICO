import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
type EditorProps = {
    code: string;
    onChange: (v: string) => void;
    onAnalyze: () => void;
    rightStatus?: React.ReactNode;
};

export function Editor({ code, onChange, onAnalyze, rightStatus }: EditorProps) {
    return (
        <Card className="h-full">

            <CardContent>
                <CardTitle className="mb-2">Editor de Codigo</CardTitle>
                <Textarea
                    className="h-64 font-mono"
                    placeholder="Escribe tu código aquí..."
                    value={code}
                    onChange={(e) => onChange(e.target.value)}
                ></Textarea>
                <div className="flex flex-col md:flex-row gap-1 items-center justify-between">

                    <InteractiveHoverButton
                        onClick={onAnalyze}
                        className="mt-2 mb-2"
                    >Checar el codigo</InteractiveHoverButton>
                    <CardDescription className="text-neutral-950">
                        {rightStatus}
                    </CardDescription>
                </div>
            </CardContent>
        </Card>

    );
}
