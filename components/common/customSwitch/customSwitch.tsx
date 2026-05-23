import React from "react";

const CustomSwitch = ({
  checked,
  onChange,
  label,
  className,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
  disabled?: boolean;
}) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange();
    }
  };

  return (
    <div
      className={`${className} switch ${
        checked ? "switch-primary checked" : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={!disabled ? onChange : () => {}}
      onKeyDown={!disabled ? handleKeyDown : () => {}}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      title={label}
      aria-label={label}
    >
      <div className="switch-handle"></div>
    </div>
  );
};

export default CustomSwitch;
