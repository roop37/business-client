import { cn } from "@/lib/utils";

type ToggleSettingRowProps = {
  title: string;
  subtitle?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

const ToggleSettingRow = ({
  title,
  subtitle,
  checked,
  onCheckedChange,
  disabled,
  className,
}: ToggleSettingRowProps) => (
  <label
    className={cn(
      "flex min-h-[64px] cursor-pointer items-center justify-between gap-4 rounded-lg border border-[var(--owner-border)] bg-white px-4 py-3 text-left transition hover:border-[#c89d75]",
      disabled && "cursor-not-allowed opacity-60",
      className
    )}
  >
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-[var(--owner-fg-1)]">
        {title}
      </span>
      {subtitle ? (
        <span className="mt-1 block text-xs leading-5 text-[var(--owner-fg-3)]">
          {subtitle}
        </span>
      ) : null}
    </span>
    <span
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border border-[#c9b49e] bg-[var(--owner-bg-subtle)] transition",
        checked && "border-[var(--owner-blue-500)] bg-[var(--owner-blue-500)]"
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition",
          checked && "translate-x-5"
        )}
      />
    </span>
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onCheckedChange(event.target.checked)}
      className="sr-only"
    />
  </label>
);

export default ToggleSettingRow;
