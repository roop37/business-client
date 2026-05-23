"use client";

import { forwardRef, type HTMLAttributes } from "react";

/**
 * Owner card — white surface, 1px hairline, 16px radius, 24px padding
 * by default. Override padding via the `padding` prop or by passing
 * `className`.
 */
export type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: number | string;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding, className = "", style, children, ...rest }, ref) => {
    const padStyle =
      padding !== undefined
        ? { padding: typeof padding === "number" ? `${padding}px` : padding }
        : undefined;
    return (
      <div
        ref={ref}
        className={`rounded-owner-lg border border-owner-border bg-owner-bg ${
          padding === undefined ? "p-6" : ""
        } ${className}`}
        style={{ ...padStyle, ...style }}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "OwnerCard";

export default Card;
