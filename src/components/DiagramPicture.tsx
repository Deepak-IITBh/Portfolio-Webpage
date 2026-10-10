import type { DiagramImage } from '../data/projects';

/** A responsive <picture>: AVIF, then WebP, with a PNG fallback; lazily loaded and sized to avoid layout shift. */
export function DiagramPicture({ image, sizes, className }: { image: DiagramImage; sizes: string; className?: string }) {
  return (
    <picture>
      <source type="image/avif" srcSet={image.avif} sizes={sizes} />
      <source type="image/webp" srcSet={image.webp} sizes={sizes} />
      <img src={image.fallback} width={image.width} height={image.height} alt={image.alt} className={className} loading="lazy" decoding="async" />
    </picture>
  );
}
