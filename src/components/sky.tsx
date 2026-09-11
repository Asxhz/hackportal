import Image from "next/image";
import starsBg from "@/images/ch/stars-bg.webp";
import shootingStar from "@/images/ch/shooting-star.webp";

/** Navy starfield with twinkling dots and a periodic shooting star. Purely decorative. */
export function Starfield({ shooting = true }: { shooting?: boolean }) {
  const dots = [
    [6, 12, 3], [14, 30, 2], [22, 8, 2], [31, 22, 3], [38, 6, 2], [47, 16, 2], [55, 4, 3], [62, 24, 2], [70, 10, 2], [78, 28, 3], [86, 7, 2], [93, 18, 2],
    [10, 48, 2], [26, 56, 2], [44, 44, 2], [58, 52, 3], [74, 46, 2], [90, 54, 2], [4, 70, 2], [34, 72, 2], [66, 68, 2], [96, 74, 3],
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-sky-navy">
      <Image src={starsBg} alt="" fill sizes="100vw" className="object-cover opacity-70" />
      {dots.map(([x, y, s], i) => (
        <span
          key={i}
          className="anim-twinkle absolute rounded-full bg-gold"
          style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${(i % 7) * 0.45}s`, opacity: 0.6 }}
        />
      ))}
      {shooting ? (
        <Image src={shootingStar} alt="" width={140} height={157} className="anim-shoot absolute right-[8%] top-[6%] w-[110px] sm:w-[140px]" />
      ) : null}
    </div>
  );
}
