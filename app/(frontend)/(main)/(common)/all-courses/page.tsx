import CoursesDB from "@/app/(frontend)/components/CoursesDB";
import { getSessionUser } from "@/app/lib/auth";
import React from "react";

async function page() {
  const user = await getSessionUser();

  return (
    <div>
      {" "}
      {user && <CoursesDB storeKey={"courses"} loginRole={user?.role} />}
    </div>
  );
}

export default page;
