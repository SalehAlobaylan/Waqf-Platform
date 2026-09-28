import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoAsset {
    src: string;
    width: number;
    height: number;
}

type LogoVariant = "horizontal" | "stacked" | "mark";
type LogoTone = "light" | "dark";

/**
 * Brand lockups. `light` is the default artwork for pale surfaces; `dark` is the
 * reversed (pale wordmark) cut, for deep-green surfaces such as the hero, the
 * footer, and the auth brand panel. Only `light` is guaranteed for every
 * variant — there is no reversed stacked cut.
 *
 * Intrinsic dimensions are baked in so the browser reserves the right box before
 * the image loads. Size a logo with a height and let the width follow.
 */
const assets: Record<LogoVariant, { light: LogoAsset; dark?: LogoAsset }> = {
    horizontal: {
        light: {
            src: "/brand/waqf-horizontal-light.png",
            width: 289,
            height: 96,
        },
        dark: {
            src: "/brand/waqf-horizontal-dark.png",
            width: 285,
            height: 96,
        },
    },
    stacked: {
        light: {
            src: "/brand/waqf-stacked-light.png",
            width: 196,
            height: 240,
        },
    },
    mark: {
        light: {
            src: "/brand/waqf-mark-light.png",
            width: 193,
            height: 192,
        },
        dark: {
            src: "/brand/waqf-mark-dark.png",
            width: 194,
            height: 192,
        },
    },
};

interface LogoProps {
    variant?: LogoVariant;
    tone?: LogoTone;
    /** Defaults to the wordmark shown in the artwork. */
    alt?: string;
    /** Set on above-the-fold logos so they are not lazy-loaded. */
    priority?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export function Logo({
    variant = "horizontal",
    tone = "light",
    alt = "Waqf",
    priority = false,
    className,
    style,
}: LogoProps) {
    const asset = assets[variant][tone] ?? assets[variant].light;

    return (
        <Image
            src={asset.src}
            alt={alt}
            width={asset.width}
            height={asset.height}
            priority={priority}
            className={cn("h-auto w-auto", className)}
            style={style}
        />
    );
}
