import jwt from "jsonwebtoken";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { courseSchema } from "../api/db/models/courseSchema";
import { db } from "../api/db/drizzle";
import { instructorsSchema } from "../api/db/models/instructorsSchema";
import { studentSchema } from "../api/db/models/studentSchema";
 

export type SessionUser = {
  userId: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
};

export function getSessionUser(cookie?: string): SessionUser | null {
  if (!cookie) return null;

  try {
    return jwt.verify(cookie, process.env.JWT_SECRET!) as SessionUser;
  } catch {
    return null;
  }
}



export async function authorizeCourseOwnerOrAdmin(courseId: string) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  const user = getSessionUser(session);

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const course = await db.query.courseSchema.findFirst({
    where: eq(courseSchema.id, courseId)
  });

  if (!course) {
    throw new Error("NOT_FOUND");
  }

  const instructor = await db.query.instructorsSchema.findFirst({
    where: eq(instructorsSchema.id, course.instructorId)
  });

  if (user.role !== "ADMIN" && instructor?.userId !== user.userId) {
    throw new Error("FORBIDDEN");
  }

  return { user, course };
}




export async function isStudentOrAdmin() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
  
    const user = getSessionUser(session);
  
    if (!user) throw new Error("UNAUTHORIZED");
  
    if (user.role === "ADMIN") return { user };
  
    if (user.role !== "STUDENT") throw new Error("FORBIDDEN");
  
    const student = await db.query.studentSchema.findFirst({
      where: eq(studentSchema.userId, user.userId)
    });
  
    if (!student) throw new Error("FORBIDDEN");
  
    return { user, student };
  }
