import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Mail, ShieldAlert, Clock } from "lucide-react";

interface Props {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });
    return { title: t("contact") };
}

export default async function ContactPage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "legal.contact" });

    return (
        <div className="min-h-screen bg-secondary-50 py-12">
            <div className="container max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-8 md:p-12">
                    <h1 className="text-3xl font-bold text-secondary-900 mb-4">{t("title")}</h1>
                    <p className="text-secondary-700 leading-relaxed mb-10">{t("intro")}</p>

                    <div className="space-y-6">
                        <a
                            href={`mailto:${t("emailValue")}`}
                            className="flex items-start gap-4 p-5 rounded-xl border border-secondary-100 hover:border-primary-500/50 transition-colors group"
                        >
                            <div className="w-11 h-11 rounded-xl bg-primary-600/10 text-primary-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-secondary-900 mb-1">{t("emailLabel")}</p>
                                <p className="text-primary-600 font-medium" dir="ltr">{t("emailValue")}</p>
                            </div>
                        </a>

                        <div className="flex items-start gap-4 p-5 rounded-xl border border-secondary-100">
                            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-secondary-900 mb-1">{t("reportLabel")}</p>
                                <p className="text-secondary-600 text-sm leading-relaxed">
                                    {t("reportBody")}{" "}
                                    <Link href={`/${locale}/explore`} className="text-primary-600 font-medium hover:underline">
                                        {locale === "ar" ? "استكشف المشاريع" : "Explore projects"}
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-5 rounded-xl border border-secondary-100">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <p className="text-secondary-600 text-sm leading-relaxed pt-3">
                                {t("responseNote")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
