import { ArrowRight } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

type AuthPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  showArrow?: boolean;
};

const AuthPrimaryButton = ({
  children,
  className = "",
  showArrow = true,
  ...props
}: AuthPrimaryButtonProps) => {
  return (
    <button
      {...props}
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[var(--owner-blue-500)] text-[15px] font-semibold text-[var(--owner-bg)] shadow-[0_16px_35px_rgba(15,136,66,0.22)] transition hover:bg-[var(--owner-blue-400)] disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
    >
      {children}
      {showArrow ? <ArrowRight size={17} /> : null}
    </button>
  );
};

export default AuthPrimaryButton;
