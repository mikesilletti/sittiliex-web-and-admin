"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  strength = 60,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  strength?: number;
  priority?: boolean;
  sizes?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={shouldReduceMotion ? undefined : { y }}
        className="absolute inset-0 -top-[10%] -bottom-[10%]"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "100vw"}
          className={cn("object-cover", imgClassName)}
        />
      </motion.div>
    </div>
  );
}
