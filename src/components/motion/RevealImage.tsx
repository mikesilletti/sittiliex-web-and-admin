"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

export function RevealImage({
  src,
  alt,
  className,
  imgClassName,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        // Starts mostly (not fully) visible: if whileInView never fires for any
        // reason, the image still reads clearly instead of staying invisible.
        initial={shouldReduceMotion ? undefined : { clipPath: "inset(0 0 18% 0)", opacity: 0.7 }}
        whileInView={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-0"
      >
        <motion.div
          initial={shouldReduceMotion ? undefined : { scale: 1.15 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full w-full"
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
      </motion.div>
    </div>
  );
}
