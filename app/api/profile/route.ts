import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { withErrorHandling } from "@/app/lib/errorhandling";
import { cookies } from "next/headers";
import { getSessionUser } from "@/app/lib/auth";
import { db } from "../db/drizzle";
import { userSchema } from "../db/models/userSchema";
 


export const GET = withErrorHandling(async function GET(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const user = getSessionUser(session);

  if (!user) throw new Error("UNAUTHORIZED");

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId");

  const userId =
    user.role === "ADMIN" && targetUserId
      ? targetUserId
      : user.userId;

  const profile = await db.query.userSchema.findFirst({
    where: eq(userSchema.id, userId)
  });

  if (!profile) throw new Error("NOT_FOUND");

  return NextResponse.json(profile);
});


 
export const PUT = withErrorHandling(async function PUT(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const user = getSessionUser(session);

  if (!user) throw new Error("UNAUTHORIZED");

  const { name } = await req.json();

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId");

  const userId =
    user.role === "ADMIN" && targetUserId
      ? targetUserId
      : user.userId;

  const [updated] = await db
    .update(userSchema)
    .set({ name })
    .where(eq(userSchema.id, userId))
    .returning();

  if (!updated) throw new Error("NOT_FOUND");

  return NextResponse.json(updated);
});


 
export const DELETE = withErrorHandling(async function DELETE(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const user = getSessionUser(session);

  if (!user) throw new Error("UNAUTHORIZED");

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId");

  if (targetUserId && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  const userId = targetUserId ?? user.userId;

  await db.delete(userSchema).where(eq(userSchema.id, userId));

  return NextResponse.json({ success: true });
});
