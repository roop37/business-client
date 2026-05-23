import useHostsStore from "@/store/host";
import { cn } from "@/utils/cn";
import { convertToRestoTimezone } from "@/utils/formattedTime";

const DataTableDateTimeCell = ({
  value,
  className,
}: {
  value: Date;
  className?: string;
}) => {
  const { timezone } = useHostsStore();
  if (value == null) {
    return (
      <p className="text-black text-sm font-medium whitespace-nowrap">N/A</p>
    );
  }
  const formatted = convertToRestoTimezone(timezone, value);
  return (
    <p
      className={cn(
        "text-black text-sm font-medium whitespace-nowrap",
        className
      )}
    >
      {formatted || "N/A"}
    </p>
  );
};

export default DataTableDateTimeCell;
