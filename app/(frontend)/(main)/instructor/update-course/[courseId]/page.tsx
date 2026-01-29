
import CourseForm from '@/app/(frontend)/components/CourseForm';
import { serverFetch } from '@/app/lib/fetch/serverFetch';
import React, { use } from 'react'

type Params = Promise<{ courseId: string }> 

async function page( props: {params: Params}) {

    const params = await props.params;

    
    const course = await serverFetch(`/api/courses?id=${params.courseId}`)
    .then((r) => r.json());
    
    // // .log("course id :",course);

  return (
    <div>
        <CourseForm mode='update' course={course}  />

    </div>
  )
}

export default page