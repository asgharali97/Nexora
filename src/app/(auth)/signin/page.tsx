import Signin from '@/src/components/Signin';
import React from 'react';

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
