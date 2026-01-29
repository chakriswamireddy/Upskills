import CoursesDB from "@/app/(frontend)/components/CoursesDB";
import { getSessionUser } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

async function page() {
  const user = await getSessionUser();

  if (user?.role !=='INSTRUCTOR') {
    redirect('/auth/instructor');
  }

  return (
    <div>
      {user && <CoursesDB storeKey={"courses"} loginRole={user?.role} />}
    </div>
  );
}

export default page;
