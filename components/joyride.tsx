import { TooltipRenderProps } from "react-joyride";

type ImageWalkthroughStep = TooltipRenderProps["step"] & {
  imageSrc?: string;
  imageAlt?: string;
};

const CustomJoyrideTooltip = ({
  backProps,
  index,
  isLastStep,
  primaryProps,
  step,
  tooltipProps,
}: TooltipRenderProps) => {
  const walkthroughStep = step as ImageWalkthroughStep;

  return (
    <div
      {...tooltipProps}
      className="w-[92vw] max-w-[440px] overflow-hidden rounded-[22px] border border-white/70 bg-white text-left shadow-[0_24px_80px_rgba(15,15,15,0.22)]"
    >
      {walkthroughStep.imageSrc ? (
        <div className="relative h-[172px] w-full overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={walkthroughStep.imageSrc}
            alt={walkthroughStep.imageAlt ?? ""}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.54))]"
          />
        </div>
      ) : null}
      <div className="p-4 sm:p-5">
        <h3 className="text-[22px] font-bold leading-tight text-black">
          {step.title}
        </h3>
        <div className="mt-2 text-[14.5px] font-medium leading-6 text-black/62">
          {step.content}
        </div>
        <div className="mt-5 flex w-full flex-row justify-end gap-2">
          {index > 0 ? (
            <button
              {...backProps}
              className="rounded-xl bg-transparent px-4 py-2 text-sm font-semibold text-primary/80 transition-all enabled:hover:text-primary"
            >
              <span>Back</span>
            </button>
          ) : null}
          <button
            {...primaryProps}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-secondary transition-all enabled:hover:bg-primary/80"
          >
            <span>{isLastStep ? "Done" : "Next"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomJoyrideTooltip;
