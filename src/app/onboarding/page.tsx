import React from 'react'
import OrgForm from '@/src/components/OrgForm'
import type { Metadata } from "next";


export const metadata:Metadata = {
  title: "Onboarding",
  robots: {
    index: false,
    follow: false,
  },
};

const page = () => {
  return (
    <>
      <div className="h-screen min-h-screen w-full">
        <div className="w-full h-full flex justify-center items-center">
         <OrgForm />
        </div>
      </div>
    </>
  )
}

export default page
