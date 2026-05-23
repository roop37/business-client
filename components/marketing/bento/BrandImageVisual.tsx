"use client";

type BrandImageVisualProps = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  position?: string;
  minHeight?: number;
  /** Background tone for the framing box (used when the image needs contrast). */
  dark?: boolean;
  /** Darken screenshot artwork when it is used behind overlaid card copy. */
  dim?: boolean;
  /** Optional inner padding (defaults to 0). */
  pad?: number;
};

/**
 * Thin wrapper around a designer-supplied brand image in
 * `/public/marketing/brand`. Pure passthrough — no inset shadows,
 * no scrims, no padding by default. The image renders exactly as the
 * designer shipped it.
 */
export const BrandImageVisual = ({
  src,
  alt,
  fit = "cover",
  position = "center",
  minHeight = 240,
  dark = false,
  dim = false,
  pad = 0,
}: BrandImageVisualProps) => {
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${dark ? "bg-[#050504]" : "bg-transparent"}`}
      style={{ minHeight }}
    >
      <div className="absolute inset-0" style={{ padding: pad }}>
        <img
          src={src}
          alt={alt}
          className={`block h-full w-full select-none ${
            fit === "cover" ? "object-cover" : "object-contain"
          } ${dim ? "brightness-[0.56] contrast-110 saturate-[0.92]" : ""}`}
          style={{ objectPosition: position }}
          draggable={false}
        />
      </div>
    </div>
  );
};
