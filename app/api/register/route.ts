import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/drizzle";
import { userSchema } from "../db/models/userSchema";
import { studentSchema } from "../db/models/studentSchema";
 

export async function POST(req: Request) {
  const { email, password, name ,role} = await req.json();

  const hashed = await bcrypt.hash(password, 10);

  const token = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(userSchema)
      .values({
        email,
        name,
        role: role || "STUDENT",
        password: hashed
      })
      .returning();

    await tx.insert(studentSchema).values({
      userId: user.id
    });

    return jwt.sign(
      { userId: user.id, role: user.role },
      process.env.NEXT_JWT_SECRET!,
      { expiresIn: "7d" }
    );
  });

  const res = NextResponse.json({ success: true });

  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res;
}
