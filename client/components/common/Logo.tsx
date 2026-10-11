import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoVariant = 'default' | 'white' | 'mark';

/**
 * Maven Jobs brand logo.
 * - `default` full-colour horizontal lockup — use on light backgrounds.
 * - `white`   wordmark with white "MAVEN" — use on the brand blue panels.
 * - `mark`    the isolated "M" symbol — use where space is tight (collapsed nav, favicons).
 *
 * Control the rendered size by passing a single Tailwind dimension in `className`
 * (e.g. `h-8` for the horizontal lockups, `w-72` for the square wordmark); the
 * other dimension stays `auto` so the aspect ratio is preserved.
 */
const SOURCES: Record<LogoVariant, { src: string; width: number; height: number }> = {
  default: { src: '/maven-logo.png', width: 1249, height: 288 },
  white: { src: '/maven-logo-white.png', width: 1080, height: 1080 },
  mark: { src: '/icon.png', width: 256, height: 256 },
};

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
  alt?: string;
}

export function Logo({ variant = 'default', className, priority = false, alt = 'Maven Jobs' }: LogoProps) {
  const { src, width, height } = SOURCES[variant];
  return (
    <Image
      src={src}
      width={width}
      height={height}
      priority={priority}
      alt={alt}
      className={cn('h-auto w-auto object-contain', className)}
    />
  );
}

export default Logo;
