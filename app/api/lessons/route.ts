import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { lessons } from "../db/models/lessonSchema";
import { authorizeCourseOwnerOrAdmin } from "@/app/lib/auth";
import { withErrorHandling } from "@/app/lib/errorhandling";



export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
        return NextResponse.json({ error: "courseId required" }, { status: 400 });
    }

    const data = await db.query.lessons.findMany({
        where: eq(lessons.courseId, courseId),
        orderBy: lessons.order
    });

    return NextResponse.json(data);
}


export const POST = withErrorHandling(async (req: Request) => {

    const { title, videoUrl, courseId, description } = await req.json();

    if (!title || !videoUrl || !courseId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }


    await authorizeCourseOwnerOrAdmin(courseId);


    const lastLesson = await db.query.lessons.findFirst({
        where: eq(lessons.courseId, courseId),
        orderBy: desc(lessons.order)
    });

    const nextOrder = lastLesson ? lastLesson.order + 1 : 1;

    const [lesson] = await db
        .insert(lessons)
        .values({
            title,
            videoUrl,
            description,
            courseId,
            order: nextOrder
        })
        .returning();

    return NextResponse.json(lesson, { status: 201 });
})


export const PUT = withErrorHandling(async (req: Request) => {
    try {
        const { id, title, videoUrl, description } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Lesson id required" }, { status: 400 });
        }

        const lesson = await db.query.lessons.findFirst({
            where: eq(lessons.id, id)
        });

        if (!lesson) {
            return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
        }

        await authorizeCourseOwnerOrAdmin(lesson.courseId);

        const [updated] = await db
            .update(lessons)
            .set({
                title,
                videoUrl,
                description
            })
            .where(eq(lessons.id, id))
            .returning();

        return NextResponse.json(updated);

    } catch (err: any) {
        if (err.message === "NOT_FOUND") {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        if (err.message === "FORBIDDEN" || err.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.error("Update lesson error:", err);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
})


export const DELETE = withErrorHandling(async (req: Request) => {

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Lesson id required" }, { status: 400 });
    }

    const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, id)
    });

    if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await authorizeCourseOwnerOrAdmin(lesson.courseId);

    await db.delete(lessons).where(eq(lessons.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
})

