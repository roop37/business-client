import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface PaginationButtonProps {
  type: "next" | "prev";
  disabled: boolean;
  clickHandler: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const PaginationButton = ({
  type,
  disabled,
  clickHandler,
}: PaginationButtonProps) => {
  return (
    <button
      className={`flex justify-center items-center ${
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:text-primary"
      }`}
      disabled={disabled}
      onClick={clickHandler}
    >
      {type === "prev" && <MdChevronLeft size={16} className="mr-1" />}
      <span className="hidden md:block">
        {type === "next" ? "Next" : "Prev"}
      </span>
      {type === "next" && <MdChevronRight size={16} className="ml-1" />}
    </button>
  );
};

export default PaginationButton;
