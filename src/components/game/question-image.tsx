"use client";

import Image from "next/image";
import { useState } from "react";

type QuestionImageProps = { src: string; alt: string; width: number; height: number };

export function QuestionImage({ src, alt, width, height }: QuestionImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <p role="status" className="image-fallback">La imagen no está disponible; puedes responder con el texto.</p>;
  return <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 768px) 100vw, 448px" className="question-image" onError={() => setFailed(true)} />;
}
