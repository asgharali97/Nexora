'use client';
import { signIn } from 'next-auth/react';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import Image from 'next/image';
import google from '@/public/google.svg';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userInput, userSchema } from '@/src/lib/validations/user.schema';
const Page = () => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<userInput>({
    resolver: zodResolver(userSchema)
  });

  async function handleSignup(data: userInput) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password
      })
    });
    const result = await res.json();
    if (!res.ok) {
      toast(`${result.error}`);
      return;
    }

    if (res.status === 500) {
      toast('Something went wrong!');
      return;
    }

    if (res.ok) {
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: '/'
      });
      toast('Account created successfully!');
    }
    reset();
  }
  const handleGoogle = () => {
    signIn('google', {
      callbackUrl: '/'
    });
    toast('Account created successfuly');
  };

  return (
    <>
      <div className="h-screen min-h-screen w-full px-8 py-12">
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-full w-xl flex-col items-center p-2">
            <h1 className="text-primary mb-12 text-4xl font-bold">Nexora</h1>
            <div className="mt-8 mb-4 flex h-full w-md flex-col items-center">
              <h2 className="text-primary my-2 text-3xl font-medium">
                Singup to create your account
              </h2>
              <form
                onSubmit={handleSubmit(handleSignup)}
                className="mb-4 flex h-full w-full flex-col"
              >
                <button
                  onClick={handleGoogle}
                  className="shadow-s my-3 flex w-full cursor-pointer items-center rounded-lg border border-neutral-200 px-4 py-3"
                >
                  <Image src={google} width={100} height={100} alt="google" className="h-6 w-6" />
                  <span className="text-md w-full">Continue with Google</span>
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card text-muted-foreground px-2">Or continue with</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-lg">
                        Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="jhon doe"
                        {...register('name')}
                        className="ring-primary focus:ring-primary rounded-full px-4 py-5"
                      />
                      {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-lg">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        {...register('email')}
                        className="ring-primary focus:ring-primary rounded-full px-4 py-5"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-400">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-lg">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="password"
                        {...register('password')}
                        className="ring-primary focus:ring-primary rounded-full px-4 py-5"
                      />
                      {errors.password && (
                        <p className="text-sm text-red-400">{errors.password.message}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="focus-visible:ring-ring hover:bg-primary/90 group bg-primary text-primary-foreground ring-primary before:from-primary-foreground/20 after:from-primary-foreground/10 after:bg-gradient-linear-b relative isolate inline-flex h-9 w-full items-center justify-center overflow-hidden rounded-full px-3 py-2 text-left text-sm font-medium whitespace-nowrap shadow ring-1 transition duration-300 ease-[cubic-bezier(0.4,0.36,0,1)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-md before:bg-linear-to-b before:opacity-80 before:transition-opacity before:duration-300 before:ease-[cubic-bezier(0.4,0.36,0,1)] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-md after:to-transparent after:mix-blend-overlay focus:outline-none focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Account'}
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
