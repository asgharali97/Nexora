import Signin from '@/src/components/Signin';
import React from 'react';
import type { Metadata } from "next";

export const metadata:Metadata = {
  title: "Sign In",
  description: "Sign in to your Nexora account.",
};  

const page = () => {
  return (
    <>
      <div className="h-screen min-h-screen w-full px-8 py-12">
        <div className="w-full h-full flex justify-center items-center">
        <Signin />
        </div>
      </div>
    </>
  );
};

export default page;  