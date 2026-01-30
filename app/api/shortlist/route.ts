import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime
export const runtime = "nodejs";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const shortlisted = await db.shortlistedUniversity.findMany({
            where: { userId: session.user.id }
        });

        return NextResponse.json(shortlisted);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { universityId } = await req.json();

        const shortlisted = await db.shortlistedUniversity.create({
            data: {
                userId: session.user.id,
                universityId
            }
        });

        return NextResponse.json(shortlisted);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
