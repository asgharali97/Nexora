import Image from 'next/image';

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-neutral-950 font-sans text-white">
        <div className="flex flex-col justify-center px-8 py-12">
          <h1 className="text-center text-5xl leading-14 font-bold tracking-wide text-neutral-200">
            Nexora your one stop slouation for <br /> tracking you products stats
          </h1>
          <div className="my-8 flex justify-center gap-4">
            <button className="rounded-lg border border-neutral-600px-4 py-2 px-4 cursor-pointer">
              Start Now
            </button>
            <button className="rounded-lg border px-4 py-2 text-white cursor-pointer">get Demo</button>
          </div>
        </div>
      </div>
    </>
  );
}
