import CourseForm from "@/app/(frontend)/components/CourseForm";
import { getSessionUser } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

async function page() {
  const user = await getSessionUser();

  if (user?.role !== "INSTRUCTOR" ) {
    redirect("/all-courses");
  }

  return (
    <div>
      <CourseForm mode="create" />
    </div>
  );
}

export default page;
