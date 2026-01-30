import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../db/drizzle";
import { courseSchema } from "../db/models/courseSchema";
import { NextResponse } from "next/server";
import { instructorsSchema } from "../db/models/instructorsSchema";
import { cookies } from "next/headers";
import { authorizeCourseOwnerOrAdmin, getSessionUser } from "@/app/lib/auth";
import { userSchema } from "../db/models/userSchema";
import { lessons } from "../db/models/lessonSchema";
import { enrollments } from "../db/models/enrollments";
import { withErrorHandling } from "@/app/lib/errorhandling";
import { studentSchema } from "../db/models/studentSchema";

export const LIMIT = 10

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  const instructorId = searchParams.get("instructorId");

  const page = Number(searchParams.get("page") ?? 1);
  const offset = (page - 1) * LIMIT;

  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const level = searchParams.get("level");
  const sort = searchParams.get("sort");
  const enrolledOnly = searchParams.get("enrolled") === "true";
  const instructorBased = searchParams.get("instructorBased") === "true";



  // Single course
  if (id) {
    const result = await db
      .select({
        id: courseSchema.id,
        thumbnail: courseSchema.thumbnail,
        level: courseSchema.level,

        title: courseSchema.title,
        description: courseSchema.description,
        duration: courseSchema.duration,
        prequisites: courseSchema.prequisites,
        outcomes: courseSchema.outcomes,
        price: courseSchema.price,
        enrollmentsCount: sql<number>`count(${enrollments.id})`,

        instructorId: instructorsSchema.id,
        instructorName: userSchema.name,
        lessonsCount: sql<number>`count(${lessons.id})`,

      })
      .from(courseSchema)
      .leftJoin(instructorsSchema, eq(courseSchema.instructorId, instructorsSchema.id))
      .leftJoin(userSchema, eq(instructorsSchema.userId, userSchema.id))
      .leftJoin(lessons, eq(lessons.courseId, courseSchema.id))
      .leftJoin(enrollments, eq(enrollments.courseId, courseSchema.id))

      .where(eq(courseSchema.id, id))
      .groupBy(
        courseSchema.id,
        instructorsSchema.id,
        userSchema.name
      );

    if (!result.length) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  }




  // All courses


  const filters = [];

  if (search) {
    filters.push(
      or(
        ilike(courseSchema.title, `%${search}%`),
        ilike(userSchema.name, `%${search}%`)
      )
    );
  }

  if (instructorId) {
    filters.push(eq(courseSchema.instructorId, instructorId));
  }

  if (category) {
    filters.push(eq(courseSchema.category, category));
  }

  if (level) {
    filters.push(eq(courseSchema.level, level));
  }



  const sessionUser = await getSessionUser();
  const userId = sessionUser?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Missing usr" }, { status: 403 });

  }

  const student = await db.query.studentSchema.findFirst({
    where: eq(studentSchema.userId, userId)
  })

  const instructor = await db.query.instructorsSchema.findFirst({
    where: eq(instructorsSchema.userId, userId)
  })


  if (student && enrolledOnly) {
    filters.push(eq(enrollments.studentId, student.id));
  }

  if (instructor && instructorBased) {
    filters.push(eq(courseSchema.instructorId, instructor.id));
  }




  const orderBy =
    sort === "popular"
      ? desc(sql`count(${enrollments.id})`)
      : desc(courseSchema.createdAt);


  const where = filters.length ? and(...filters) : undefined;


  const courses = await db
    .select({
      id: courseSchema.id,
      title: courseSchema.title,
      thumbnail: courseSchema.thumbnail,
      instructorId: courseSchema.instructorId,


      description: courseSchema.description,
      instructorName: userSchema.name,
      lessonsCount: sql<number>`count(${lessons.id})`,
      duration: courseSchema.duration,
      prequisites: courseSchema.prequisites,
      outcomes: courseSchema.outcomes,
      price: courseSchema.price,
      level: courseSchema.level,
      category: courseSchema.category,
      enrollmentsCount: sql<number>`count(${enrollments.id})`,
      ...(student && {
        amIEnrolled: sql<boolean>`
      EXISTS (
        SELECT 1 FROM enrollments e
        WHERE e.course_id = ${courseSchema.id}
        AND e.student_id = ${student?.id}
      )
    `.as("amIEnrolled")
      }),
    })
    .from(courseSchema)
    .leftJoin(instructorsSchema, eq(courseSchema.instructorId, instructorsSchema.id))
    .leftJoin(userSchema, eq(instructorsSchema.userId, userSchema.id))
    .leftJoin(lessons, eq(lessons.courseId, courseSchema.id))
    .leftJoin(enrollments, eq(enrollments.courseId, courseSchema.id))
    .where(where)
    .groupBy(courseSchema.id, userSchema.name)
    .orderBy(orderBy)
    .limit(LIMIT)
    .offset(offset)


  const [{ count }] = await db
    .select({ count: sql<number>`count(distinct ${courseSchema.id})` })
    .from(courseSchema)
    .leftJoin(instructorsSchema, eq(courseSchema.instructorId, instructorsSchema.id))
    .leftJoin(userSchema, eq(instructorsSchema.userId, userSchema.id))
    .where(where);

  return NextResponse.json(courses, {
    headers: {
      "X-Total": count.toString(),
      "Access-Control-Expose-Headers": "X-Total",
    },
  });
}



export const POST = withErrorHandling(async (req: Request) => {
  const { title, thumbnail, description, duration, price, outcomes, prequisites, category, level } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sessionUser = await getSessionUser();
  // .log("sessionUser", sessionUser);

  const userId = sessionUser?.userId;
  // .log("userId", userId);

  if (!userId) {
    return NextResponse.json({ error: "UnAuthorized Access" }, { status: 403 });
  }

  const instructor = await db.query.instructorsSchema.findFirst({
    where: eq(instructorsSchema.userId, userId)
  })

  if (!instructor) {
    return NextResponse.json({ error: "UnAuthorized Instrcutor Access" }, { status: 403 });
  }

  const [course] = await db
    .insert(courseSchema)
    .values({
      title,
      instructorId: instructor?.id,
      thumbnail,
      description, duration, price, outcomes, prequisites, category, level
    })
    .returning();



  return NextResponse.json(course, { status: 201 });
})


//  /api/course?id=...
export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");



  if (!id) {
    return NextResponse.json({ error: "Course id required" }, { status: 400 });
  }

  const { title, thumbnail, description, duration, price, outcomes, prequisites, category, level } = await req.json();

  try {

    await authorizeCourseOwnerOrAdmin(id);

    const [course] = await db
      .update(courseSchema)
      .set({ title, thumbnail, description, duration, price, outcomes, prequisites, category, level })
      .where(eq(courseSchema.id, id))
      .returning();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (err: any) {
    if (err.message === "NOT_FOUND")
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    return NextResponse.json({ error: "Unauthorized", message:err }, { status: 401 });
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