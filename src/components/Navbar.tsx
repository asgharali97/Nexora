"use client"
import Link from 'next/link';

const Navbar = () => {
  return (
    <>
      <div className="w-full border-b border-neutral-600 px-8 py-2">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-4xl font-bold">Nexora</h1>
          </Link>
          <ul className="flex items-center justify-center gap-5">
            <li>Dashboard</li>
            <li>Signup</li>
            <li>Singin</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
