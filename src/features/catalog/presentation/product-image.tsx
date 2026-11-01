"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductImage({ src, alt, sizes }: { src: string | null; alt: string; sizes: string }) {
  const [failed, setFailed] = useState(!src);
  if (failed || !src) return <span className="tg-image-fallback">Image unavailable</span>;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
