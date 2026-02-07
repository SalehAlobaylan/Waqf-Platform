import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <HomeContent />;
}

function HomeContent() {
    const t = useTranslations();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto">
                {/* Logo / App Name */}
                <h1 className="text-6xl font-bold text-primary-600 mb-4">
                    {t("common.appName")}
                </h1>

                {/* Tagline */}
                <p className="text-xl text-secondary-600 mb-8">
                    {t("common.tagline")}
                </p>

                {/* Main Headline */}
                <h2 className="text-3xl font-semibold text-secondary-800 mb-4">
                    {t("hero.title")}
                </h2>

                <p className="text-lg text-secondary-500 mb-12">{t("hero.subtitle")}</p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/25">
                        {t("hero.ctaContribute")}
                    </button>
                    <button className="px-8 py-3 bg-white text-primary-600 rounded-xl font-medium border-2 border-primary-600 hover:bg-primary-50 transition-colors">
                        {t("hero.ctaCreate")}
                    </button>
                </div>
            </div>

            {/* Footer Message */}
            <footer className="absolute bottom-8 text-secondary-400">
                {t("footer.madeWith")}
            </footer>
        </main>
    );
}
