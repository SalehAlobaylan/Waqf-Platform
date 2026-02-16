import { NextResponse } from "next/server";
import { mockProjects } from "@/lib/mock-data";

export async function GET() {
    try {
        // Return mock data instead of database query
        return NextResponse.json({
            projects: mockProjects,
            pagination: {
                page: 1,
                limit: 20,
                total: mockProjects.length,
                totalPages: 1,
            },
        });
    } catch (error) {
        console.error("Error in explore API:", error);
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        );
    }
}
