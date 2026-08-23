import Image from 'next/image';
import { cn } from '@/lib/utils';

export function BrandLogo({
  width = 84,
  height = 32,
  className,
  priority = false,
  /** Keep the bright lime — navy sidebars and photo overlays. */
  onDark = false,
}: {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onDark?: boolean;
}) {
  return (
    <Image
      src="/logos/logo-stacked-lime.png"
      alt="Exterior Pro"
      width={width}
      height={height}
      priority={priority}
      className={cn(!onDark && 'logo-on-cream', className)}
    />
  );
}
