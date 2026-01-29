import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "../db/drizzle";
import { courseSchema } from "../db/models/courseSchema";
import { instructorsSchema } from "../db/models/instructorsSchema";
import { studentSchema } from "../db/models/studentSchema";
import { userSchema } from "../db/models/userSchema";
import { getSessionUser } from "@/app/lib/auth";
import { sql } from "drizzle-orm";
import { enrollments } from "../db/models/enrollments";


// ================= GET =================
// My enrollments with course + instructor
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Resolve studentId
  const student = await db.query.studentSchema.findFirst({
    where: eq(studentSchema.userId, user.userId),
  });

  if (!student)
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });

  const data = await db
    .select({
      enrollmentId: enrollments.id,

      courseId: courseSchema.id,
      title: courseSchema.title,
      description: courseSchema.description,
      price: courseSchema.price,

      instructorName: userSchema.name,

      enrolledAt: enrollments.createdAt,
    })
    .from(enrollments)
    .leftJoin(courseSchema, eq(enrollments.courseId, courseSchema.id))
    .leftJoin(instructorsSchema, eq(courseSchema.instructorId, instructorsSchema.id))
    .leftJoin(userSchema, eq(instructorsSchema.userId, userSchema.id))
    .where(eq(enrollments.studentId, student.id));

  return NextResponse.json(data);
}

// ================= POST =================
// Enroll in course
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await req.json();

  if (!courseId)
    return NextResponse.json({ error: "courseId required" }, { status: 400 });

  // Resolve student
  const student = await db.query.studentSchema.findFirst({
    where: eq(studentSchema.userId, user.userId),
  });

  if (!student)
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });

  const exists = await db.query.enrollments.findFirst({
    where: sql`${enrollments.courseId} = ${courseId} AND ${enrollments.studentId} = ${student.id}`,
  });

  if (exists)
    return NextResponse.json({ error: "Already enrolled" }, { status: 409 });

  const [enrollment] = await db
    .insert(enrollments)
    .values({
      courseId,
      studentId: student.id,
    })
    .returning();

  return NextResponse.json(enrollment, { status: 201 });
}

// ================= DELETE =================
// Unenroll
export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId)
    return NextResponse.json({ error: "courseId required" }, { status: 400 });

  // Resolve student
  const student = await db.query.studentSchema.findFirst({
    where: eq(studentSchema.userId, user.userId),
  });

  if (!student)
    return NextResponse.json({ error: "Student profile missing" }, { status: 400 });

  await db
    .delete(enrollments)
    .where(
      sql`${enrollments.courseId} = ${courseId} AND ${enrollments.studentId} = ${student.id}`
    );

  return NextResponse.json({ success: true });
}
