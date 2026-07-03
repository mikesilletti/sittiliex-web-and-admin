import Image from 'next/image';

const VARIANTS = {
  lockup: { src: '/brand/lockup-dark.svg', ratio: 1349.19 / 223.17, alt: 'SillettiX' },
  wordmark: { src: '/brand/wordmark-white.svg', ratio: 885.0 / 80.15, alt: 'Silletti' },
  'wordmark-accent': { src: '/brand/wordmark-accent.svg', ratio: 1077.24 / 148.1, alt: 'SillettiX' },
  icon: { src: '/brand/icon-blue.svg', ratio: 1, alt: 'SillettiX' },
  'icon-white': { src: '/brand/icon-white.svg', ratio: 1, alt: 'SillettiX' },
} as const;

export type LogoVariant = keyof typeof VARIANTS;

interface LogoProps {
  variant?: LogoVariant;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function Logo({ variant = 'lockup', height = 32, className, priority }: LogoProps) {
  const { src, ratio, alt } = VARIANTS[variant];
  const width = Math.round(height * ratio);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
