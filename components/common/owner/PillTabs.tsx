"use client";

import type { Dispatch, SetStateAction } from "react";

export type PillTab<T extends string = string> = {
  value: T;
  label: string;
};

/**
 * `onChange` accepts either a plain callback `(next: T) => void` OR
 * React's `Dispatch<SetStateAction<T>>` so callers can pass `setState`
 * directly without an explicit generic annotation. Both shapes accept
 * `T` as the first argument, which is all the component needs.
 */
type PillTabChange<T extends string> =
  | ((next: T) => void)
  | Dispatch<SetStateAction<T>>;

export const PillTabs = <T extends string>({
  tabs,
  value,
  onChange,
  className = "",
}: {
  tabs: PillTab<T>[];
  value: T;
  onChange: PillTabChange<T>;
  className?: string;
}) => {
  return (
    <div className={`owner-pill-tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          data-active={tab.value === value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default PillTabs;
