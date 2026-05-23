import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useGlobalStore from "@/store/global";
import { cn } from "@/utils/cn";
import { MdCopyAll } from "react-icons/md";

interface DataTableTextCellProps {
  value?: string | null;
  className?: string;
  isPrice?: boolean;
  onClick?: () => void; // Add optional onClick prop
  isClickable?: boolean; // Optional flag to style as clickable
}

const DataTableTextCell = ({
  value,
  className,
  isPrice = false,
  onClick,
  isClickable = false, // Default to false
}: DataTableTextCellProps) => {
  const { setToastData } = useGlobalStore();

  // Check if value is a link
  const isLink =
    value && typeof value === "string" && value.includes("https://");
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling

    // If it's a link, open in new tab
    if (isLink && value) {
      window.open(value, "_blank", "noopener,noreferrer");
      return;
    }

    // Otherwise, call the onClick handler if provided
    if (onClick) {
      onClick();
    }
  };

  if (!value) {
    return (
      <p
        className={cn(
          "group flex items-center text-black text-sm font-medium whitespace-nowrap",
          className,
          {
            "cursor-pointer": isClickable,
          }
        )}
      >
        <span>N/A</span>
      </p>
    );
  }
  if (value.length > 30) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p
              className={cn(
                "group flex items-center text-sm font-medium whitespace-nowrap",
                isLink
                  ? "text-primary hover:underline cursor-pointer"
                  : "text-black",
                className,
                {
                  "cursor-pointer": isClickable && !isLink,
                }
              )}
              onClick={handleClick}
            >
              <span>{value.slice(0, 30) + " ..."}</span>
              <MdCopyAll
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(value || "");
                  setToastData({
                    message: "Successfully copied to the clipboard",
                    type: "success",
                  });
                }}
                size={15}
                className="inline-block opacity-0 group-hover:opacity-100 hover:text-primary ml-2 cursor-pointer"
              />
            </p>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white max-w-xs break-words">
            {value}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <p
      className={cn(
        "group flex items-center text-sm font-medium whitespace-nowrap",
        isLink ? "text-primary cursor-pointer" : "text-black",
        className,
        {
          "cursor-pointer": isClickable && !isLink,
        }
      )}
      onClick={handleClick}
    >
      {isPrice ? <span>$ {value}</span> : <span>{value}</span>}
      <MdCopyAll
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(value || "");
          setToastData({
            message: "Successfully copied to the clipboard",
            type: "success",
          });
        }}
        size={15}
        className="inline-block opacity-0 group-hover:opacity-100 hover:text-primary ml-2 cursor-pointer"
      />
    </p>
  );
};

export default DataTableTextCell;
