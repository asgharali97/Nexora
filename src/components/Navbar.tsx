'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { Skeleton } from '@/src/components/ui/skeleton';
import {toast} from 'sonner'

const Navbar = () => {
  const { status } = useSession();

  const handleLogOut = () => {
    signOut();
    toast('Logout succesfuly');
  };
  return (
    <>
      <div className="bg-secondary-light w-full border-b border-neutral-200 px-8 py-2">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-4xl font-bold text-neutral-800">Nexora</h1>
          </Link>
          <ul className="flex items-center justify-center gap-5">
            <Link href="/">
              <li className="text-md font-medium text-neutral-600">How works</li>
            </Link>
            {status === 'loading' && <Skeleton className="h-8 w-22 rounded-full" />}
            {status === 'authenticated' && (
              <button
                className="text-md bg-primary cursor-pointer rounded-4xl px-4 py-1 font-medium text-white"
                onClick={handleLogOut}
              >
                logout
              </button>
            )}
            {status === 'unauthenticated' && (
              <div className="flex gap-4">
                <Link href="/signup">
                  <li className="text-md bg-primary rounded-4xl px-4 py-1 font-medium text-white">
                    Signup
                  </li>
                </Link>
                <Link href="/signin">
                  <li className="text-md text-primary border-muted shadow-s rounded-4xl border px-4 py-1 font-medium">
                    Singin
                  </li>
                </Link>
              </div>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
