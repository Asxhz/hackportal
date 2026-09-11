import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Starfield } from "@/components/sky";
import logo13 from "@/images/ch/logo13.svg";
import earth from "@/images/ch/earth.webp";
import oskiPlane from "@/images/ch/oski-plane.webp";
import cloud11 from "@/images/ch/cloud-11.webp";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Starfield shooting={false} />
        <div className="pointer-events-none absolute -bottom-[62%] left-1/2 w-[140%] -translate-x-1/2">
          <Image src={earth} alt="" priority sizes="60vw" className="anim-spin-slow w-full" />
        </div>
        <Image src={oskiPlane} alt="Oski the bear flying a red biplane" priority sizes="220px" className="anim-plane absolute right-[8%] top-[12%] w-[220px]" />
        <Image src={cloud11} alt="" aria-hidden sizes="380px" className="anim-drift pointer-events-none absolute -right-16 top-[40%] w-[380px] opacity-70" />
        <Link href="/" className="relative text-sm font-semibold text-sky-lavender hover:text-white">← Hackathons @ Berkeley</Link>
        <div className="relative mb-24 max-w-md space-y-5">
          <Image src={logo13} alt="Cal Hacks 13.0" className="w-[300px] drop-shadow-[0_12px_40px_rgba(2,32,94,0.6)]" />
          <p className="text-[15px] leading-relaxed text-sky-ice sky-text-shadow">
            October 23–25, 2026 · Palace of Fine Arts, San Francisco. One account covers your application, its status, and your decision.
          </p>
        </div>
        <p className="relative text-xs text-sky-lavender/70">Artwork from calhacks.io · Hackathons @ Berkeley</p>
      </aside>
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <Logo className="mb-10 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
