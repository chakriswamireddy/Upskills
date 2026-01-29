import Image from "next/image";
import { getSessionUser } from "./lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {

  const user = await getSessionUser();

  if (user?.userId) {
    redirect('/all-courses');
  } else {
    redirect('/auth/student');
  }
  return (
<></>
  );
}
