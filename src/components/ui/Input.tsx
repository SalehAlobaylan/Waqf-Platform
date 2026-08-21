import { cn } from "@/lib/utils";

const fieldClasses =
    "w-full rounded-md border border-waqf-border bg-white px-3 text-sm text-secondary-900 placeholder:text-secondary-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
    return (
        <input
            className={cn(
                fieldClasses,
                "h-10",
                invalid && "border-red-300 focus:border-red-400 focus:ring-red-500/20",
                className
            )}
            {...props}
        />
    );
}

interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    invalid?: boolean;
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
    return (
        <textarea
            className={cn(
                fieldClasses,
                "py-2 leading-relaxed",
                invalid && "border-red-300 focus:border-red-400 focus:ring-red-500/20",
                className
            )}
            {...props}
        />
    );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
    return (
        <select
            className={cn(fieldClasses, "h-10 pe-8", className)}
            {...props}
        />
    );
}
