import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { courseSchema } from "../db/models/courseSchema";
import { NextResponse } from "next/server";
import { instructorsSchema } from "../db/models/instructorsSchema";
import { cookies } from "next/headers";
import { authorizeCourseOwnerOrAdmin, getSessionUser } from "@/app/lib/auth";
import { userSchema } from "../db/models/userSchema";


// export async function GET(req: Request) {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//         return NextResponse.json({ error: "Course id required" }, { status: 400 });
//     }


//     const course = await db.query.courseSchema.findFirst({
//         where: eq(courseSchema.id, id)
//     })

//     if (!course) {
//         return NextResponse.json({ error: "Invalid Course Details" }, { status: 404 });
//     }

//     const instructor = await db.query.instructorsSchema.findFirst({
//         where: eq(instructorsSchema.id, course.instructorId)
//     })

//     return NextResponse.json({ course, instructor }, { status: 200 });
// }


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const instructorId = searchParams.get("instructorId");

    if (id) {
        const course = await db.query.courseSchema.findFirst({
            where: eq(courseSchema.id, id)
        });
        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        return NextResponse.json(course);
    }


    if (instructorId) {

        const courses = await db.query.courseSchema.findMany({
            where: eq(courseSchema.instructorId, instructorId)
        });

        return NextResponse.json(courses);
    }

    const courses = await db.query.courseSchema.findMany();

    return NextResponse.json(courses);
}


export async function POST(req: Request) {
    const { title, instructorId, thumbnail } = await req.json();

    if (!title || !instructorId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [course] = await db
        .insert(courseSchema)
        .values({
            title,
            instructorId,
            thumbnail
        })
        .returning();

    return NextResponse.json(course, { status: 201 });
}


//  /api/course?id=...
export async function PUT(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Course id required" }, { status: 400 });
    }

    const { title } = await req.json();

    try {

        await authorizeCourseOwnerOrAdmin(id);

        const [course] = await db
            .update(courseSchema)
            .set({ title })
            .where(eq(courseSchema.id, id))
            .returning();

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        return NextResponse.json(course);
    } catch (err : any) {
        if (err.message === "NOT_FOUND")
            return NextResponse.json({ error: "Course not found" }, { status: 404 });

        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

}


export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
  
    if (!id) {
      return NextResponse.json({ error: "Course id required" }, { status: 400 });
    }
  
    try {
      await authorizeCourseOwnerOrAdmin(id);
  
      await db.delete(courseSchema).where(eq(courseSchema.id, id));
  
      return NextResponse.json({ success: true });
  
    } catch (err: any) {
      if (err.message === "NOT_FOUND")
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
  
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }