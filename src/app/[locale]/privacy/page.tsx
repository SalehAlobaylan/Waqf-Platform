import { getTranslations } from "next-intl/server";

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("privacy") };
}

export default async function PrivacyPage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "legal.privacy" });

    const sections = t.raw("sections") as Array<{ title: string; body: string }>;

    return (
        <div className="min-h-screen bg-waqf-bg py-12">
            <div className="container max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-lg border border-waqf-border p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-secondary-900 mb-2">{t("title")}</h1>
                    <p className="text-sm text-secondary-400 mb-8">{t("updated")}</p>
                    <p className="text-secondary-700 leading-relaxed mb-8">{t("intro")}</p>
                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <section key={index}>
                                <h2 className="text-lg font-bold text-secondary-900 mb-2">
                                    {section.title}
                                </h2>
                                <p className="text-secondary-600 leading-relaxed">{section.body}</p>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
