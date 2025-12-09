'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import Image from 'next/image';
import google from '@/public/google.svg';

const Page = () => {
  const [loading, setLoading] = useState(false);
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
    });

    setLoading(false);

    if (res.ok) {
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: true,
        callbackUrl: '/'
      });
    }
    setFormData({
      name: '',
      email: '',
      password: ''
    });
  }
  const handleGoogle = () => {
    signIn('google', {
      callbackUrl: '/'
    });
  };

  return (
    <>
      <div className="h-screen min-h-screen w-full px-8 py-12">
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-full w-xl flex-col items-center p-2">
            <h1 className="mb-12 text-4xl font-bold text-[var(--primary)]">Nexora</h1>
            <div className="mt-8 mb-4 flex h-full w-md flex-col items-center">
              <h2 className="my-2 text-3xl font-medium text-[var(--primary)]">
                Singup to create your account
              </h2>
              <form onSubmit={handleSubmit} className="mb-4 flex h-full w-full flex-col">
                <button
                  onClick={handleGoogle}
                  className="my-3 flex w-full cursor-pointer items-center rounded-lg border border-neutral-200 px-4 py-3 shadow-s"
                >
                  <Image src={google} width={100} height={100} alt="google" className="h-6 w-6" />
                  <span className="text-md w-full">Continue with Google</span>
                </button>
                <div className="my-4 border-[0.1px] border-neutral-200"></div>
                <div className="mt-2">
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-lg">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="name"
                        placeholder="jhon doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="ring-primary focus:ring-primary rounded-full px-4 py-5"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-lg">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
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
                        type="password"
                        name="password"
                        placeholder="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="ring-primary focus:ring-primary rounded-full px-4 py-5"
                      />
                    </div>
                    <button
                      type="submit"
                      className="text-md text-popover bg-primary sx-4 shadow-m cursor-pointer rounded-full py-2"
                    >
                      Signin
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
