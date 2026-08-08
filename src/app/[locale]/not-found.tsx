import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export default async function NotFound() {
    const locale = await getLocale();
    const t = await getTranslations({ locale, namespace: "notFound" });

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="text-8xl font-black text-primary-600/20 mb-6 select-none">404</div>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
                {t("title")}
            </h1>
            <p className="text-secondary-600 max-w-md mb-10">{t("description")}</p>
            <div className="flex flex-wrap gap-4 justify-center">
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center justify-center rounded-xl h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-600/25 transition-all hover:translate-y-[-1px]"
                >
                    {t("backHome")}
                </Link>
                <Link
                    href={`/${locale}/explore`}
                    className="inline-flex items-center justify-center rounded-xl h-12 px-6 bg-white border border-secondary-200 text-secondary-900 font-bold hover:bg-secondary-50 transition-colors"
                >
                    {t("exploreProjects")}
                </Link>
            </div>
        </div>
    );
}
