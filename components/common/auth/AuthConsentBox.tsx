import { ChangeEvent, ReactNode } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

type AuthConsentBoxProps = {
  label: string;
  checked: boolean;
  children: ReactNode;
  registration?: UseFormRegisterReturn;
  onCheckedChange: (checked: boolean) => void;
};

const AuthConsentBox = ({
  label,
  checked,
  children,
  registration,
  onCheckedChange,
}: AuthConsentBoxProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(event.target.checked);
    registration?.onChange(event);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--owner-fg-1)]">
        {label}
      </label>
      <label className="flex items-start gap-3 rounded-xl border border-[var(--owner-border)] bg-[var(--owner-bg)] p-3">
        <input
          {...registration}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-[var(--owner-border-strong)] text-[var(--owner-blue-500)] focus:ring-[var(--owner-blue-500)]"
          checked={checked}
          onChange={handleChange}
        />
        <span className="text-xs leading-5 text-[var(--owner-fg-2)]">
          {children}
        </span>
      </label>
    </div>
  );
};

export default AuthConsentBox;
