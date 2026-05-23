import { LucideIcon } from "lucide-react";
import {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { UseFormRegisterReturn } from "react-hook-form";

export const authFieldClasses =
  "h-12 w-full rounded-xl border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] text-[15px] text-[var(--owner-fg-1)] outline-none transition placeholder:text-[var(--owner-fg-4)] focus:border-[var(--owner-blue-500)] focus:shadow-[0_0_0_3px_var(--owner-blue-050)]";

export const authLabelClasses =
  "mb-2 block text-sm font-medium text-[var(--owner-fg-1)]";

export const authErrorClasses = "mt-1.5 text-xs text-[#b4533a]";

type AuthTextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> & {
  label: string;
  error?: string;
  icon?: LucideIcon;
  leftAddon?: ReactNode;
  registration?: UseFormRegisterReturn;
  onInputChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const AuthTextField = ({
  label,
  error,
  icon: Icon,
  leftAddon,
  registration,
  className = "",
  onInputChange,
  ...props
}: AuthTextFieldProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onInputChange?.(event);
    registration?.onChange(event);
  };

  return (
    <div>
      <label htmlFor={props.id} className={authLabelClasses}>
        {label}
      </label>
      <div className="flex gap-3">
        {leftAddon}
        <div className="relative flex-1">
          {Icon ? (
            <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--owner-fg-4)]" />
          ) : null}
          <input
            {...registration}
            {...props}
            onChange={handleChange}
            className={`${authFieldClasses} ${Icon ? "pl-11 pr-4" : "px-4"} ${className}`}
          />
        </div>
      </div>
      {error ? <p className={authErrorClasses}>{error}</p> : null}
    </div>
  );
};

type AuthTextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> & {
  label: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  onInputChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

export const AuthTextArea = ({
  label,
  error,
  registration,
  className = "",
  onInputChange,
  ...props
}: AuthTextAreaProps) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange?.(event);
    registration?.onChange(event);
  };

  return (
    <div>
      <label htmlFor={props.id} className={authLabelClasses}>
        {label}
      </label>
      <textarea
        {...registration}
        {...props}
        onChange={handleChange}
        className={`min-h-[88px] w-full rounded-xl border border-[var(--owner-border-strong)] bg-[var(--owner-bg)] px-4 py-3 text-[15px] text-[var(--owner-fg-1)] outline-none transition placeholder:text-[var(--owner-fg-4)] focus:border-[var(--owner-blue-500)] focus:shadow-[0_0_0_3px_var(--owner-blue-050)] ${className}`}
      />
      {error ? <p className={authErrorClasses}>{error}</p> : null}
    </div>
  );
};
