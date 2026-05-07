"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface FlagProps {
  url: string | null | undefined;
  code: string;
  width: number;
  height: number;
  alt?: string;
  className?: string;
  priority?: boolean;
}

const HIGH_RES_WIDTH = 320;

function upgradeFlagSrc(url: string): string {
  if (!/^https?:\/\/flagcdn\.com\//.test(url)) return url;
  return url.replace(/\/(w|h)\d+\//, `/w${HIGH_RES_WIDTH}/`);
}

export function Flag({
  url,
  code,
  width,
  height,
  alt,
  className,
  priority,
}: FlagProps) {
  const label = alt ?? code;

  if (!url) {
    return (
      <span
        role="img"
        aria-label={label}
        style={{ width, height }}
        className={cn(
          "inline-flex items-center justify-center rounded-sm bg-zinc-300 text-[10px] font-semibold uppercase text-zinc-700 shrink-0",
          className
        )}
      >
        {code}
      </span>
    );
  }

  return (
    <Image
      src={upgradeFlagSrc(url)}
      alt={label}
      width={width}
      height={height}
      quality={95}
      priority={priority}
      sizes={`${width}px`}
      className={cn("object-cover rounded-sm shrink-0 h-8 w-8", className)}
    />
  );
}
