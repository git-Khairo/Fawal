import Image from "next/image";
import { cn } from "@/lib/cn";
import { MaterialFill } from "@/components/material/material-fill";

/**
 * Renders the real photograph when one exists, and a brushed material plate
 * when it does not. Deliberately not stock photography: a random landscape on a
 * steel catalogue reads worse than an honest blank plate.
 */
export function ProductImage({
  src,
  alt,
  label,
  className,
  imageClassName,
  sizes,
  priority = false,
  pendingLabel,
  meshScale = 54,
}: {
  src: string | null;
  alt: string;
  label: string;
  className?: string;
  imageClassName?: string;
  sizes: string;
  priority?: boolean;
  pendingLabel: string;
  meshScale?: number;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-inset", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      </div>
    );
  }

  // Nothing is drawn in the frame, but the accessible name still says what it
  // stands for and that the photograph is pending.
  return (
    <MaterialFill scale={meshScale} className={className} label={`${label}. ${pendingLabel}`} />
  );
}
