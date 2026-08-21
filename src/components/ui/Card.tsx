import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    interactive?: boolean;
}

export function Card({
    interactive = false,
    className,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "rounded-lg border border-waqf-border bg-white",
                interactive &&
                    "transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-[0_12px_32px_-16px_rgba(8,37,32,0.25)]",
                className
            )}
            {...props}
        />
    );
}

interface SectionHeadingProps
    extends React.HTMLAttributes<HTMLHeadingElement> {
    as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
    as: Tag = "h2",
    className,
    ...props
}: SectionHeadingProps) {
    return (
        <Tag
            className={cn(
                "font-bold tracking-tight text-secondary-900 text-3xl",
                className
            )}
            {...props}
        />
    );
}

export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            aria-hidden
            className={cn("animate-pulse rounded-md bg-secondary-100", className)}
            {...props}
        />
    );
}
