import Image from "next/image";
import { Logo } from "@/components/logo";
import campanile from "@/images/campanile.jpg";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image src={campanile} alt="Sather Tower at UC Berkeley seen through trees" fill priority placeholder="blur" sizes="55vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/30" />
        <Logo className="relative text-white [&_.eyebrow]:text-white/60" />
        <div className="relative max-w-md space-y-4">
          <p className="eyebrow text-gold">Cal Hacks 13.0</p>
          <p className="display text-[40px] leading-[1.05]">Palace of Fine Arts, San Francisco.</p>
          <p className="text-[15px] leading-relaxed text-white/75">
            One account covers your application, its status, and any decision. Organizers use the same portal to review.
          </p>
        </div>
        <p className="relative text-xs text-white/50">Photo: Janet Ganbold, Unsplash</p>
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
