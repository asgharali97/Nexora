'use client';
import React from 'react';
import { signIn } from 'next-auth/react';

const Signin = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
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
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button type='submit' className='px-4'>Signin</button>
        <button onClick={handleGoogle}>Sign in with Google</button>
      </form>
    </>
  );
};

export default Signin;
