import Link from "next/link";
import { FC } from "react";
import { FaArrowRight } from "react-icons/fa";

interface ArrowCardProps {
  title: string;
  caption: string;
  href?: string;
  onClick?: () => void;
  newWindow?: boolean;
}

const ArrowCard: FC<ArrowCardProps> = ({
  title,
  caption,
  href,
  onClick,
  newWindow,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const CardContent = (
    <div className="block p-4 transition-all transform bg-white shadow rounded-xl cursor-pointer">
      <div className="flex justify-between items-center">
        <div className="flex flex-col w-full">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">{caption}</p>
        </div>
        <FaArrowRight className="w-5 h-5 text-primary" />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} target={newWindow ? "_blank" : "_self"}>
        {CardContent}
      </Link>
    );
  }

  return <div onClick={handleClick}>{CardContent}</div>;
};

export default ArrowCard;
