import AnimatedButton from '@/src/components/AnimatedButton';

export default function Home() {
  return (
    <>
      <div className="min-h-screen px-8 font-sans">
        <div className="mt-12 flex flex-col items-center justify-center gap-6 py-12">
          <h1 className="text-center text-5xl leading-14 font-bold tracking-wide text-neutral-900">
            What's Next for your product
          </h1>
          <p className="w-sm text-center text-lg text-neutral-600">
            Your one stop sloution for anylytics, Nexora helps you take Next clear steps without
            hassle
          </p>
          <div className="flex justify-center gap-4">
            <AnimatedButton title="Start now free" />
          </div>
        </div>
        <div className="h-22"></div>
      </div>
    </>
  );
}
