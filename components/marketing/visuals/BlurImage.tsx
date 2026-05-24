import Image, { type ImageProps } from "next/image";
import { getBlur } from "./blur-manifest";

/**
 * next/image wrapper that auto-applies the build-time blurhash LQIP
 * for local images. Falls back to no placeholder if the manifest
 * doesn't have an entry (e.g. dynamic remote URLs).
 *
 * Use `priority` for above-the-fold images, `sizes` for responsive
 * widths. All other next/image props pass through.
 */
type BlurImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  /** Override the auto-detected blur placeholder data URL. */
  blurDataURL?: string;
};

export const BlurImage = ({ src, width, height, blurDataURL, fill, ...rest }: BlurImageProps) => {
  const srcStr = typeof src === "string" ? src : undefined;
  const entry = srcStr ? getBlur(srcStr) : null;
  const resolved = blurDataURL ?? entry?.dataURL;

  // next/image: `fill` is mutually exclusive with width/height. When
  // the caller passes `fill`, we MUST omit dimensions even if the
  // manifest knows them.
  const dimensions = fill
    ? {}
    : { width: width ?? entry?.width, height: height ?? entry?.height };

  if (!resolved) {
    return <Image src={src} fill={fill} {...dimensions} {...rest} />;
  }
  return (
    <Image
      src={src}
      fill={fill}
      {...dimensions}
      placeholder="blur"
      blurDataURL={resolved}
      {...rest}
    />
  );
};
