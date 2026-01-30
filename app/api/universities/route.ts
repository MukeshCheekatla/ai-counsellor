import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const country = searchParams.get("country");
        const category = searchParams.get("category");

        const where: any = {};
        if (country) where.country = country;
        if (category) where.category = category;

        const universities = await db.university.findMany({
            where,
            orderBy: [
                { category: "asc" },
                { ranking: "asc" }
            ]
        });

        return NextResponse.json(universities);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
