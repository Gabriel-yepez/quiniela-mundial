"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface FlagProps {
  url: string | null | undefined;
  code: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}

const FLAG_WIDTH = 48;
const FLAG_HEIGHT = 36;

function getFlagSrc(url: string): string {
  const match = url.match(
    /^https?:\/\/flagcdn\.com\/(?:[wh]\d+\/)?([a-z-]+)\.(?:png|svg)$/i
  );
  if (match) return `https://flagcdn.com/${match[1].toLowerCase()}.svg`;
  return url;
}

export function Flag({ url, code, alt, className, priority }: FlagProps) {
  const label = alt ?? code;

  if (!url) {
    return (
      <span
        role="img"
        aria-label={label}
        style={{ width: FLAG_WIDTH, height: FLAG_HEIGHT }}
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
      src={getFlagSrc(url)}
      alt={label}
      width={FLAG_WIDTH}
      height={FLAG_HEIGHT}
      quality={100}
      priority={priority}
      sizes={`${FLAG_WIDTH}px`}
      className={cn("object-cover rounded-sm shrink-0 h-8 w-10 object-cover", className)}
    />
  );
}
