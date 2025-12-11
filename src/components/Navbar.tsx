import Link from 'next/link';
import { user } from '@/src/lib/user'

const Navbar = () => {
  return (
    <>
      <div className="w-full border-b border-neutral-200 bg-[var(--light)] px-8 py-2">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-4xl font-bold text-neutral-800">Nexora</h1>
          </Link>
          <ul className="flex items-center justify-center gap-5">
            <Link href="/">
              <li className='text-md font-medium text-neutral-600'>How works</li>
            </Link>
            <Link href="/">
              <li className='text-md font-medium py-1 px-4 rounded-4xl text-white bg-[var(--primary)]'>logout</li>
            </Link>
            {
              !user && ( <div className="">
            <Link href="/signup">
              <li className='text-md font-medium py-1 px-4 rounded-4xl text-white bg-[var(--primary)]'>Signup</li>
              <div>
              </div>
            </Link>
            <Link href="/signin">
              <li className='text-md font-medium py-1 px-4 rounded-4xl text-[var(--primary)] border border-[var(--primary)]'>Singin</li>
            </Link>
            </div>
             )
            }
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
