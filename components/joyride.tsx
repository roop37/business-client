import { TooltipRenderProps } from "react-joyride";

const CustomJoyrideTooltip = ({
  backProps,
  continuous,
  index,
  isLastStep,
  primaryProps,
  skipProps,
  step,
  tooltipProps,
  size,
  closeProps,
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="rounded-2xl bg-white w-[90vw] max-w-md p-4 flex flex-col justify-between items-start"
    >
      <h3 className="text-2xl fon font-bold text-left text-black pb-2">
        {step.title}
      </h3>
      <p className="text-base font-medium text-black text-opacity-60">
        {step.content}
      </p>
      <div className="flex flex-row justify-end gap-2 w-full mt-4">
        {index > 0 ? (
          <button
            {...backProps}
            className="px-4 py-2 bg-transparent text-primary/80 rounded-xl enabled:hover:text-primary transition-all text-sm"
          >
            <span>Back</span>
          </button>
        ) : null}
        <button
          {...primaryProps}
          className="px-4 py-2 bg-primary text-secondary rounded-xl enabled:hover:bg-primary/80 transition-all text-sm"
        >
          <span>{isLastStep ? "Done" : "Next"}</span>
        </button>
      </div>
    </div>
  );
};

export default CustomJoyrideTooltip;
