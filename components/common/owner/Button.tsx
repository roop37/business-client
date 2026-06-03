"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type OwnerButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type OwnerButtonSize = "default" | "sm";

const VARIANT_CLASS: Record<OwnerButtonVariant, string> = {
  primary: "owner-btn--primary",
  secondary: "owner-btn--secondary",
  ghost: "owner-btn--ghost",
  danger: "owner-btn--danger",
};

const SIZE_CLASS: Record<OwnerButtonSize, string> = {
  default: "",
  sm: "owner-btn--sm",
};

/**
 * Owner button. Use as the standard button across new screens.
 *
 *   <OwnerButton variant="primary" onClick={…}>Add event</OwnerButton>
 *   <OwnerButton variant="secondary" leadingIcon={<Filter size={14} />}>Filter</OwnerButton>
 */
export type OwnerButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: OwnerButtonVariant;
  size?: OwnerButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export const OwnerButton = forwardRef<HTMLButtonElement, OwnerButtonProps>(
  (
    {
      variant = "primary",
      size = "default",
      leadingIcon,
      trailingIcon,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`owner-btn ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
        {...rest}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
      </button>
    );
  }
);
OwnerButton.displayName = "OwnerButton";

export default OwnerButton;
