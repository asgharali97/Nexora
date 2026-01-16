import Signup from '@/src/components/Signup';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create new Nexora account.",
};

const Page = () => {
 
  return (
    <>
      <div className="h-screen min-h-screen w-full px-8 py-12">
        <Signup/>
      </div>
    </>
  );
};

export default Page;


