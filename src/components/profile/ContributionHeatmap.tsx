"use client";

interface ContributionHeatmapProps {
    locale?: string;
}

export function ContributionHeatmap({ locale = "en" }: ContributionHeatmapProps) {
    // Generate mock contribution data for the last year (52 weeks × 7 days)
    const weeks = 52;
    const generateData = () => {
        const data: number[][] = [];
        for (let w = 0; w < weeks; w++) {
            const week: number[] = [];
            for (let d = 0; d < 7; d++) {
                // Random contribution level: 0-4
                const rand = Math.random();
                if (rand < 0.4) week.push(0);
                else if (rand < 0.6) week.push(1);
                else if (rand < 0.8) week.push(2);
                else if (rand < 0.92) week.push(3);
                else week.push(4);
            }
            data.push(week);
        }
        return data;
    };

    const heatmapData = generateData();
    const totalContributions = heatmapData.flat().reduce((sum, v) => sum + v, 0);

    const getColor = (level: number): string => {
        switch (level) {
            case 0: return "bg-secondary-100";
            case 1: return "bg-primary-200";
            case 2: return "bg-primary-400";
            case 3: return "bg-primary-600";
            case 4: return "bg-primary-800";
            default: return "bg-secondary-100";
        }
    };

    const months = locale === "ar"
        ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="bg-white rounded-2xl border border-waqf-border p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondary-900">
                    {locale === "ar" ? "نشاط المساهمة" : "Contribution Activity"}
                </h3>
                <span className="text-xs text-secondary-500">
                    {totalContributions} {locale === "ar" ? "مساهمة في السنة الماضية" : "contributions in the last year"}
                </span>
            </div>

            {/* Month labels */}
            <div className="flex mb-1 text-[10px] text-secondary-400 pl-8">
                {months.map((m, i) => (
                    <span key={i} className="flex-1 text-center">{m}</span>
                ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-[2px] overflow-hidden">
                {/* Day labels */}
                <div className="flex flex-col gap-[2px] pr-1 text-[10px] text-secondary-400 justify-between">
                    <span className="h-[10px]"></span>
                    <span className="h-[10px] leading-[10px]">{locale === "ar" ? "اثن" : "Mon"}</span>
                    <span className="h-[10px]"></span>
                    <span className="h-[10px] leading-[10px]">{locale === "ar" ? "أرب" : "Wed"}</span>
                    <span className="h-[10px]"></span>
                    <span className="h-[10px] leading-[10px]">{locale === "ar" ? "جمع" : "Fri"}</span>
                    <span className="h-[10px]"></span>
                </div>

                {/* Grid */}
                {heatmapData.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[2px]">
                        {week.map((level, di) => (
                            <div
                                key={`${wi}-${di}`}
                                className={`w-[10px] h-[10px] rounded-[2px] ${getColor(level)}`}
                                title={`${level} contributions`}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-[10px] text-secondary-400">
                <span>{locale === "ar" ? "أقل" : "Less"}</span>
                {[0, 1, 2, 3, 4].map((level) => (
                    <div key={level} className={`w-[10px] h-[10px] rounded-[2px] ${getColor(level)}`} />
                ))}
                <span>{locale === "ar" ? "أكثر" : "More"}</span>
            </div>
        </div>
    );
}
