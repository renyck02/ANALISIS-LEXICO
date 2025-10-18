import { AuroraText } from "@/components/ui/aurora-text";

type HeaderProps = {
    title?: string;
    className?: string;
};

export function Header({ title = "Analisis - lexico", className }: HeaderProps) {
    return (
        <AuroraText className={className ?? "m-auto mt-1.5 mb-1.5 text-3xl font-bold justify-center"}>
            {title}
        </AuroraText>
    );
}
