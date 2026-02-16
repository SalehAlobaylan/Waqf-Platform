import { NextResponse } from "next/server";
import { mockAdminStats } from "@/lib/mock-data";

export async function GET() {
    try {
        return NextResponse.json(mockAdminStats);
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}
