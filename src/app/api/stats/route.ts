import { NextResponse } from "next/server";
import { mockStats } from "@/lib/mock-data";

export async function GET() {
    try {
        return NextResponse.json(mockStats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}
