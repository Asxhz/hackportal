import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Glow } from "@/components/glow";
import p435 from "@/images/ch/photo-435.webp";
import p423 from "@/images/ch/photo-423.webp";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Glow />
        <Link href="/" className="relative text-sm font-semibold text-sky-lavender hover:text-white">← Cal Hacks 13.0</Link>
        <div className="relative">
          <div className="relative mx-auto mb-10 h-[300px] w-[420px]">
            <figure className="polaroid anim-float absolute left-0 top-0 w-[240px] rotate-[-6deg]" style={{ "--r": "-6deg" } as React.CSSProperties}>
              <Image src={p435} alt="Three hackers smiling at Cal Hacks 12.0" sizes="240px" className="aspect-[4/3] w-full rounded-[8px] object-cover" />
              <figcaption className="mt-2 text-center text-[12px] text-ink-3">team, found</figcaption>
            </figure>
            <figure className="polaroid anim-float absolute right-0 top-10 w-[200px] rotate-[5deg]" style={{ "--r": "5deg", animationDelay: "-4s" } as React.CSSProperties}>
              <Image src={p423} alt="Attendees posing with the Oski mascot" sizes="200px" className="aspect-[4/4.2] w-full rounded-[8px] object-cover" />
              <figcaption className="mt-2 text-center text-[12px] text-ink-3">with Oski</figcaption>
            </figure>
          </div>
          <p className="display max-w-md text-[40px] leading-[1.05]">Thirty-six hours. <span className="text-sky-blue">Two thousand builders.</span></p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-sky-ice/80">
            October 23 to 25, 2026. Palace of Fine Arts, San Francisco. One account covers your application, its status, and your decision.
          </p>
        </div>
        <p className="relative text-xs text-sky-ice/50">Photos: Hackathons @ Berkeley, Cal Hacks 12.0</p>
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
