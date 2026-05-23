"use client";

import { RefObject, useEffect, useState } from "react";

export const BLOG_FIXED_TOP_PX = 96;

type FixedAfterReachTopState = {
  stuck: boolean;
  stopped: boolean;
  stopTop: number;
  width: number;
};

export const useFixedAfterReachTop = <T extends HTMLElement>(
  ref: RefObject<T>,
  stopRef?: RefObject<HTMLElement>
): FixedAfterReachTopState => {
  const [state, setState] = useState<FixedAfterReachTopState>({
    stuck: false,
    stopped: false,
    stopTop: 0,
    width: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const el = ref.current;
      const stopEl = stopRef?.current;
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      if (!el || !isDesktop) {
        setState((current) =>
          current.stuck ||
          current.stopped ||
          current.stopTop !== 0 ||
          current.width !== 0
            ? { stuck: false, stopped: false, stopTop: 0, width: 0 }
            : current
        );
        return;
      }

      const rect = el.getBoundingClientRect();
      const pageTop = rect.top + window.scrollY;
      const visibleChild = Array.from(el.children).find((child) => {
        if (!(child instanceof HTMLElement)) return false;
        return (
          child.offsetHeight > 0 &&
          window.getComputedStyle(child).display !== "none"
        );
      }) as HTMLElement | undefined;
      const content =
        visibleChild ?? (el.firstElementChild as HTMLElement | null);
      const contentHeight = content?.offsetHeight ?? rect.height;
      const boundaryPageTop = stopEl
        ? stopEl.getBoundingClientRect().top + window.scrollY
        : null;
      const stopY =
        boundaryPageTop === null
          ? Number.POSITIVE_INFINITY
          : boundaryPageTop - BLOG_FIXED_TOP_PX - contentHeight - 24;
      const stopped = window.scrollY >= stopY;
      const next = {
        stuck: !stopped && window.scrollY >= pageTop - BLOG_FIXED_TOP_PX,
        stopped,
        stopTop:
          boundaryPageTop === null
            ? 0
            : Math.max(0, boundaryPageTop - contentHeight - 24 - pageTop),
        width: rect.width,
      };

      setState((current) =>
        current.stuck === next.stuck &&
        current.stopped === next.stopped &&
        Math.abs(current.stopTop - next.stopTop) < 0.5 &&
        Math.abs(current.width - next.width) < 0.5
          ? current
          : next
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref, stopRef]);

  return state;
};
