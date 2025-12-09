'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import google from '@/public/google.svg';
import Image from 'next/image';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
const Signin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      callbackUrl: '/'
    });
  };
  const handleGoogle = () => {
    signIn('google', {
      callbackUrl: '/'
    });
  };
  return (
    <>
      <div className="flex h-full w-xl flex-col items-center p-2">
        <h1 className="mb-12 text-4xl font-bold text-[var(--primary)]">Nexora</h1>
        <div className="mt-8 mb-4 flex h-full w-md flex-col items-center">
          <h2 className="my-2 text-3xl font-medium text-[var(--primary)]">
            Signin to your account
          </h2>
          <form onSubmit={handleSubmit} className="flex h-full w-full flex-col">
            <button
              type="button"
              onClick={handleGoogle}
              className="my-3 flex w-full cursor-pointer items-center rounded-lg shadow-s px-1 py-1"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
                <Image src={google} width={100} height={100} alt="google" className="h-6 w-6" />
              </div>
              <span className="text-md w-full text-center">
                Continure with Google
              </span>
            </button>
            <div className="my-4 border-[0.1px] border-neutral-200"></div>
            <div className="mt-2">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-lg">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="ring-primary focus:ring-primary rounded-full px-4 py-5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-lg">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="ring-primary focus:ring-primary rounded-full px-4 py-5"
                  />
                </div>
                <button
                  type="submit"
                  className="text-md text-popover bg-primary sx-4 rounded-full py-2 shadow-m cursor-pointer"
                >
                  Signin
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signin;
