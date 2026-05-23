import React from "react";
import { FaSpinner } from "react-icons/fa";
import { ButtonType } from "./interface";

interface ReusableButtonProps {
  type?: "button" | "submit" | "reset";
  variant: ButtonType;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

const buttonStyles = {
  [ButtonType.Confirm]: "btn btn-confirmation",
  [ButtonType.Icon]:
    "flex items-center justify-center h-10 px-3 py-2 m-1 text-white text-sm transition-colors duration-300 transform bg-primary rounded-full hover:bg-white hover:text-primary focus:outline-none focus:bg-blue-400 md:w-auto w-10",
  [ButtonType.Outlined]: "btn btn-outlined !py-1.5 md:!py-2.5 px-3 md:px-4",
  [ButtonType.Add]: "btn btn-outlined !py-2.5 md:!py-2.5 px-3 md:px-4",
  [ButtonType.Secondary]: "btn btn-secondary !py-1.5 md:!py-2.5 px-3 md:px-4",
  [ButtonType.Primary]: "btn btn-primary !py-1.5 md:!py-2.5 px-3 md:px-4",

  // [ButtonType.Primary]: "btn btn-primary !py-2.5",
  [ButtonType.Text]:
    "text-primary text-sm transition-colors duration-300 transform hover:text-primary/80 focus:outline-none hover:underline",
  [ButtonType.Warning]: "btn btn-warning ",
  [ButtonType.WarningOutlined]: "btn btn-outlined-warning ",
};

const CButton: React.FC<ReusableButtonProps> = ({
  variant,
  onClick,
  disabled,
  loading,
  className,
  children,
  type,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${buttonStyles[variant]} ${className} ${
        loading ? "flex items-center justify-center" : ""
      } ${loading || disabled ? "opacity-50 cursor-not-allowed" : ""} ${
        disabled ? "pointer-events-none" : ""
      }`}
    >
      {loading ? (
        <FaSpinner
          className={`animate-spin h-5 w-5 ${
            [ButtonType.Outlined, ButtonType.Secondary].includes(variant)
              ? "text-primary"
              : "text-white"
          } ${disabled ? "text-gray-400" : ""}`}
        />
      ) : (
        <span className={disabled ? "text-gray-400" : ""}>{children}</span> // Adjust children color when disabled
      )}
    </button>
  );
};

export default CButton;
