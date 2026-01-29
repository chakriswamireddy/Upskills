import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/drizzle";
import { userSchema } from "../db/models/userSchema";
import { studentSchema } from "../db/models/studentSchema";
import { instructorsSchema } from "../db/models/instructorsSchema";
import type { RoleType } from "@/lib/types";
import { eq } from "drizzle-orm";


export const roleToSchema: Partial<Record<RoleType, any>> = {
  STUDENT: studentSchema,
  INSTRUCTOR: instructorsSchema,
};


export async function POST(req: Request) {
  const body = await req.json();
  const role = body.role as RoleType;

  const { email, password, name } = body;
  // .log(body, "  bodyyy ")


  const hashed = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(userSchema)
    .values({
      email,
      name,
      role: role || "STUDENT",
      password: hashed,
    })
    .returning();

  try {
    const targetSchema = roleToSchema[role];

    if (targetSchema) {
      await db.insert(targetSchema).values({
        userId: user.id,
      });
    }
  } catch (err) {
    await db.delete(userSchema).where(eq(userSchema.id, user.id));
    throw err;
  }

  const res = NextResponse.json({ success: true });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.NEXT_JWT_SECRET!,
    { expiresIn: "7d" }
  );

  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res;
}
