import { cn } from "@/utils/cn";

const DataTableNumberCell = ({
  value,
  className,
  isPrice = false,
  isPercentage = false,
}: {
  value?: number | null;
  className?: string;
  isPrice?: boolean;
  isPercentage?: boolean;
}) => {
  if (value === null || value === undefined) {
    return (
      <p
        className={cn(
          "text-black text-sm font-medium whitespace-nowrap",
          className
        )}
      >
        <span>N/A</span>
      </p>
    );
  }

  // Format large numbers with comma separators
  const formattedValue = value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  return (
    <p
      className={cn(
        "text-black text-sm font-medium whitespace-nowrap",
        className
      )}
    >
      {isPercentage
        ? `${formattedValue}%`
        : isPrice
        ? `$ ${formattedValue}`
        : formattedValue}
    </p>
  );
};

export default DataTableNumberCell;
