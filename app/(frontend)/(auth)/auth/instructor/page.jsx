import React from 'react'
// import { AuthForm } from '../../components/auth/AuthForm'
import { AuthForm } from '../../../components/auth/AuthForm'


function page() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center">
         <AuthForm mode="login" role="INSTRUCTOR"  />
       </div>
  )
}

export default page