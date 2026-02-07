import Image from "next/image";
import { Clock, Github, Calendar, CheckCircle } from "lucide-react";

interface ProfileHeaderProps {
    user: {
        name: string;
        avatar?: string | null;
        role: string;
        bio?: string | null;
        timezone?: string | null;
        githubUsername?: string | null;
        createdAt: Date;
        isAvailable?: boolean;
    };
    isOwnProfile?: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />

            {/* Content */}
            <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="absolute -top-12 left-6">
                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                        {user.avatar ? (
                            <Image
                                src={user.avatar}
                                alt={user.name}
                                width={88}
                                height={88}
                                className="rounded-xl object-cover"
                            />
                        ) : (
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4 gap-3">
                    {isOwnProfile ? (
                        <a
                            href="/settings/profile"
                            className="px-4 py-2 text-sm font-medium text-secondary-700 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                        >
                            Edit Profile
                        </a>
                    ) : (
                        <button className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                            Message
                        </button>
                    )}
                </div>

                {/* Info */}
                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-secondary-900">{user.name}</h1>
                        {user.isAvailable && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Available for Waqf
                            </span>
                        )}
                    </div>

                    <p className="text-secondary-600 capitalize">{user.role.toLowerCase()}</p>

                    {user.bio && (
                        <p className="mt-4 text-secondary-700 leading-relaxed">{user.bio}</p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-secondary-500">
                        {user.timezone && (
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {user.timezone}
                            </span>
                        )}
                        {user.githubUsername && (
                            <a
                                href={`https://github.com/${user.githubUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-secondary-700 hover:text-secondary-900"
                            >
                                <Github className="w-4 h-4" />
                                {user.githubUsername}
                            </a>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
