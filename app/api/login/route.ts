import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


import { eq } from "drizzle-orm";
import { userSchema } from "../db/models/userSchema";
import { db } from "../db/drizzle";
import { instructorsSchema } from "../db/models/instructorsSchema";
import { studentSchema } from "../db/models/studentSchema";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await db.query.userSchema.findFirst({
    where: eq(userSchema.email, email)
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  let userRoleType;

  if (user.role == 'INSTRUCTOR') {
    userRoleType = await db.query.instructorsSchema.findFirst({
      where: eq(instructorsSchema.userId, user.id)
    });
  } else if (user.role =='STUDENT') {
    userRoleType = await db.query.userSchema.findFirst({
      where: eq(studentSchema.userId, user.id)
    });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, roleTypeId: userRoleType?.id  },
    process.env.NEXT_JWT_SECRET!,
    { expiresIn: "7d" }
  );

  const res = NextResponse.json({ success: true });

  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res;
}
