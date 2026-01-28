import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { withErrorHandling } from "@/app/lib/errorhandling";
import { isStudentOrAdmin } from "@/app/lib/auth";
import { db } from "../db/drizzle";
import { enrollments } from "../db/models/enrollments";
 
export const GET = withErrorHandling(async function GET(req: Request) {
  const { user, student } = await isStudentOrAdmin();

  if (user.role === "ADMIN") {
    const data = await db.query.enrollments.findMany();
    return NextResponse.json(data);
  }

  const data = await db.query.enrollments.findMany({
    where: eq(enrollments.studentId, student!.id)
  });

  return NextResponse.json(data);
});

 
export const POST = withErrorHandling(async function POST(req: Request) {
  const { courseId } = await req.json();

  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  const { user, student } = await isStudentOrAdmin();

  const studentId = user.role === "ADMIN"
    ? null
    : student!.id;

  if (!studentId && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  const targetStudentId = studentId ?? student!.id;

  const [enroll] = await db.insert(enrollments).values({
    studentId: targetStudentId,
    courseId
  }).returning();

  return NextResponse.json(enroll, { status: 201 });
});


 
export const DELETE = withErrorHandling(async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  const { user, student } = await isStudentOrAdmin();

  const studentId = user.role === "ADMIN"
    ? null
    : student!.id;

  await db.delete(enrollments).where(
    and(
      eq(enrollments.courseId, courseId),
      eq(enrollments.studentId, studentId!)
    )
  );

  return NextResponse.json({ success: true });
});
