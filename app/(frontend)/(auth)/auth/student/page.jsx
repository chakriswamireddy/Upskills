import React from 'react'
import { AuthForm } from '../../../components/auth/AuthForm'


function page() {
  return (
    <div className="flex  w-screen items-center justify-center">
         <AuthForm mode="login" role="STUDENT"  />
       </div>
  )
}

export default page