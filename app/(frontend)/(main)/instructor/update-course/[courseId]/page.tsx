
import CourseForm from '@/app/(frontend)/components/CourseForm';
import { getSessionUser } from '@/app/lib/auth';
import { serverFetch } from '@/app/lib/fetch/serverFetch';
import { redirect } from 'next/navigation';
import React, { use } from 'react'

type Params = Promise<{ courseId: string }> 

async function page( props: {params: Params}) {

    const params = await props.params;

    
    const course = await serverFetch(`/api/courses?id=${params.courseId}`)
    .then((r) => r.json());

    console.log(course)

    const user = await getSessionUser();

    if ( user?.role !== "INSTRUCTOR" || course.instructorId !== user?.roleTypeId) {
      redirect('/all-courses');
    }
    
    // // .log("course id :",course);

  return (
    <div>
        <CourseForm mode='update' course={course}  />

    </div>
  )
}

export default page