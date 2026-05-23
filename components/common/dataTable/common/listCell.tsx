import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";
import { BsChevronExpand } from "react-icons/bs";

interface ListType {
  id?: string | null;
  name?: string | null;
}

// Modified to accept either ListType array or number
const DataTableListCell = ({
  value,
  onTapExpand,
  className,
  isSingleText = false,
}: {
  value: ListType[] | number;
  onTapExpand: () => void;
  className?: string;
  isSingleText?: boolean;
}) => {
  // Function to handle display text based on value type
  const getDisplayText = () => {
    if (typeof value === "number") {
      return value.toString();
    }

    if (isSingleText) {
      return value.length.toString();
    }

    const concatenatedNames = value.map((listItem) => listItem.name).join(", ");
    return concatenatedNames.length > 25
      ? concatenatedNames.slice(0, 25) + " ..."
      : concatenatedNames;
  };

  // Function to determine if tooltip should be shown
  const shouldShowTooltip = () => {
    if (typeof value === "number") {
      return false;
    }
    return !isSingleText;
  };

  // Function to get tooltip content
  const getTooltipContent = () => {
    if (typeof value === "number") {
      return null;
    }
    return value.map((listItem) => listItem.name).join(", ");
  };

  return (
    <div className={cn("flex items-center", className)}>
      {value ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p
                className={cn(
                  "group flex items-center text-black text-sm font-medium whitespace-nowrap",
                  className
                )}
              >
                <span>{getDisplayText()}</span>
                <BsChevronExpand
                  onClick={onTapExpand}
                  size={18}
                  className="ml-2 cursor-pointer opacity-0 group-hover:opacity-100 hover:text-primary"
                />
              </p>
            </TooltipTrigger>
            {shouldShowTooltip() && (
              <TooltipContent className="bg-black text-white max-w-xs">
                <p>{getTooltipContent()}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span>N/A</span>
      )}
    </div>
  );
};

export default DataTableListCell;
