'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

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
      <div className="min-h-screen w-full px-8 py-12">
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
          <button type="submit" className="px-4">
            Signin
          </button>
          <button onClick={handleGoogle}>Sign in with Google</button>
        </form>
      </div>
    </>
  );
};

export default Page;
