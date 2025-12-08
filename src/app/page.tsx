import Image from 'next/image';

export default function Home() {
  return (
    <>
      <div className="min-h-screen font-sans px-8">
        <div className="flex flex-col justify-center px-8 py-12">
          <h1 className="text-center text-5xl leading-14 font-bold tracking-wide">
            Nexora your one stop slouation for <br /> tracking you products stats
          </h1>
          <div className="my-8 flex justify-center gap-4">
            <button className="rounded-full bg-[var(--primary)] text-[var(--light)]  py-2 px-4 cursor-pointer">
              Start Now
            </button>
            <button className ="rounded-full  px-4 py-2 cursor-pointer shadow-[inset_0.5px_0px_2px_1px_rgba(0,0,0,0.1),inset_0.5px_0px_2px_1px_rgba(0,0,0,0.1)]">get Demo</button>
          </div>
        </div>
        <div className="w-full h-116 border border-neutral-300 flex justify-center items-center bg-[var(--secondery-light)]">
            <div className="py-2 px-4 bg-neutral-200 text-neutral-500 rounded-xl border border-[var(--light)]">
              Demo
            </div>
        </div>
        <div className="h-22">

        </div>
      </div>
    </>
  );
}
