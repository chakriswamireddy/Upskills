import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { withErrorHandling } from "@/app/lib/errorhandling";
import { cookies } from "next/headers";
import { getSessionUser } from "@/app/lib/auth";
import { db } from "../db/drizzle";
import { userSchema } from "../db/models/userSchema";
import { studentSchema } from "../db/models/studentSchema";
import { enrollments } from "../db/models/enrollments";
import { instructorsSchema } from "../db/models/instructorsSchema";
import { courseSchema } from "../db/models/courseSchema";
 


export const GET = withErrorHandling(async function GET(req: Request) {
 
  const cookieUser = await getSessionUser();


  if (!cookieUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });


  const user = await db.query.userSchema.findFirst({
    where: eq(userSchema.id, cookieUser?.userId),
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

 
  if (cookieUser.role === "STUDENT") {
    const student = await db.query.studentSchema.findFirst({
      where: eq(studentSchema.userId, user.id),
    });

    if (!student)
      return NextResponse.json({ error: "Student profile missing" }, { status: 400 });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(enrollments)
      .where(eq(enrollments.studentId, student.id));

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: cookieUser.role,

      studentId: student.id,
      enrollmentsCount: count,
      createdAt: user.createdAt,
    });
  }

  // ================= INSTRUCTOR =================
  if (cookieUser.role === "INSTRUCTOR") {
    const instructor = await db.query.instructorsSchema.findFirst({
      where: eq(instructorsSchema.userId, user.id),
    });

    if (!instructor)
      return NextResponse.json({ error: "Instructor profile missing" }, { status: 400 });

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courseSchema)
      .where(eq(courseSchema.instructorId, instructor.id));

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: cookieUser.role,

      instructorId: instructor.id,
      coursesCount: count,
      createdAt: user.createdAt,
    });
  }


  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: cookieUser.role,
    createdAt: user.createdAt,
  });

});


 
export const PUT = withErrorHandling(async function PUT(req: Request) {
  const cookieUser = await getSessionUser();

  if (!cookieUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const { name, bio } = body;

  const user = await db.query.userSchema.findFirst({
    where: eq(userSchema.id, cookieUser.userId),
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // ---------------- Base user update ----------------
  if (name) {
    await db
      .update(userSchema)
      .set({ name })
      .where(eq(userSchema.id, user.id));
  }

  // ================= STUDENT =================
  if (cookieUser.role === "STUDENT") {
    const student = await db.query.studentSchema.findFirst({
      where: eq(studentSchema.userId, user.id),
    });

    if (!student)
      return NextResponse.json({ error: "Student profile missing" }, { status: 400 });

    if (bio) {
      await db
        .update(studentSchema)
        .set({ bio })
        .where(eq(studentSchema.id, student.id));
    }

    return NextResponse.json({ success: true });
  }

  if (cookieUser.role === "INSTRUCTOR") {
    const instructor = await db.query.instructorsSchema.findFirst({
      where: eq(instructorsSchema.userId, user.id),
    });

    if (!instructor)
      return NextResponse.json({ error: "Instructor profile missing" }, { status: 400 });

    if (bio) {
      await db
        .update(instructorsSchema)
        .set({ bio })
        .where(eq(instructorsSchema.id, instructor.id));
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
});



 
// export const DELETE = withErrorHandling(async function DELETE(req: Request) {
//   const cookieStore = await cookies();
//   const session = cookieStore.get("session")?.value;
//   const user = getSessionUser();

//   if (!user) throw new Error("UNAUTHORIZED");

//   const { searchParams } = new URL(req.url);
//   const targetUserId = searchParams.get("userId");

//   if (targetUserId && user.role !== "ADMIN") {
//     throw new Error("FORBIDDEN");
//   }

//   const userId = targetUserId ?? user.userId;

//   await db.delete(userSchema).where(eq(userSchema.id, userId));

//   return NextResponse.json({ success: true });
// });
