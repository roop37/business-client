import { PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import React from "react";
import empty from "../../../assets/svg/empty.svg";
interface EmptyStateViewProps {
  title: string;
  buttonTitle?: string;
  buttonOnClick?: () => void;
}

const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title,
  buttonTitle,
  buttonOnClick,
}) => {
  return (
    <div className="bg-white text-black rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] space-y-4 border border-gray-300 shadow-sm">
      <Image src={empty} alt="Empty" width={200} height={200} />
      <div className="text-sm font-light  text-blackBg whitespace-pre-wrap text-center">
        {title}
      </div>
      {buttonTitle && buttonOnClick && (
        <button
          onClick={buttonOnClick}
          className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex justify-between items-center space-x-2 text-sm"
        >
          <PlusCircleIcon size={15} />
          <span>{buttonTitle}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyStateView;
