import Image from "next/image";
import Link from "next/link";
import { Github, Globe, Linkedin, Share2, Calendar, UserPlus, MessageSquare, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfileHeaderProps {
    user: {
        name: string;
        image?: string | null;
        role: string;
        bio?: string | null;
        timezone?: string | null;
        githubUsername?: string | null;
        discord?: string | null;
        whatsapp?: string | null;
        createdAt: Date;
        isAvailable?: boolean;
    };
    isOwnProfile?: boolean;
    locale?: string;
}

export function ProfileHeader({ user, isOwnProfile, locale = "en" }: ProfileHeaderProps) {
    const t = useTranslations("profile.header");
    const tCommon = useTranslations("common");
    return (
        <div className="bg-white rounded-2xl border border-waqf-border overflow-hidden shadow-sm">
            {/* Gradient Banner */}
            <div className="h-28 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 relative">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            </div>

            {/* Avatar & Content */}
            <div className="flex flex-col items-center -mt-14 px-6 pb-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-lg mb-3">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name}
                            width={88}
                            height={88}
                            className="rounded-full object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Name */}
                <h1 className="text-xl font-bold text-secondary-900 mb-1">{user.name}</h1>
                <p className="text-sm text-secondary-500 capitalize mb-3">{user.role.toLowerCase()}</p>

                {/* Available Badge */}
                {user.isAvailable && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
                        </span>
                        {t("availableForWork")}
                    </div>
                )}

                {/* Bio */}
                {user.bio && (
                    <p className="text-sm text-secondary-600 text-center leading-relaxed mb-4 max-w-xs">
                        {user.bio}
                    </p>
                )}

                {/* Join Date */}
                <div className="flex items-center gap-1.5 text-xs text-secondary-400 mb-5">
                    <Calendar className="w-3.5 h-3.5" />
                    {locale === "ar" ? "انضم في " : "Joined "}
                    {new Date(user.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                        month: "short",
                        year: "numeric",
                    })}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-2 w-full">
                    {isOwnProfile ? (
                        <Link
                            href="/settings/profile"
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-secondary-700 border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors text-center"
                        >
                            {t("editProfile")}
                        </Link>
                    ) : (
                        <>
                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20">
                                <UserPlus className="w-4 h-4" />
                                {locale === "ar" ? "دعوة لمشروع" : "Invite to Project"}
                            </button>
                            <button
                                aria-label={t("shareProfile")}
                                className="px-3 py-2.5 text-sm border border-secondary-200 rounded-xl hover:bg-secondary-50 transition-colors text-secondary-600"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-secondary-100 w-full justify-center">
                    {user.githubUsername && (
                        <a
                            href={`https://github.com/${user.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={tCommon("view")}
                            className="w-9 h-9 rounded-lg bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center text-secondary-600 transition-colors"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                    )}
                    {user.discord && (
                        <a
                            href={`https://discord.com/users/${user.discord}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Discord"
                            className="w-9 h-9 rounded-lg bg-[#5865F2]/10 hover:bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2] transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                        </a>
                    )}
                    {user.whatsapp && (
                        <a
                            href={user.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="WhatsApp"
                            className="w-9 h-9 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center text-[#25D366] transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                        </a>
                    )}
                    <button
                        aria-label={t("shareOnLinkedin")}
                        className="w-9 h-9 rounded-lg bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center text-secondary-600 transition-colors"
                    >
                        <Linkedin className="w-4 h-4" />
                    </button>
                    <button
                        aria-label={t("viewWebsite")}
                        className="w-9 h-9 rounded-lg bg-secondary-100 hover:bg-secondary-200 flex items-center justify-center text-secondary-600 transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
