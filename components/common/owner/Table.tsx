"use client";

import { Loader2, Search } from "lucide-react";
import {
  Children,
  forwardRef,
  isValidElement,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";

/**
 * Owner table shell. Use as the standard data-table container across
 * the app (Payments, Scanners, Tickets, Customers, Reports, etc.).
 *
 * Layout:
 *
 *   <OwnerTable>
 *     <OwnerTable.Toolbar>{search + filters}</OwnerTable.Toolbar>
 *     <OwnerTable.Head>
 *       <OwnerTable.HeaderCell>Column</OwnerTable.HeaderCell>
 *     </OwnerTable.Head>
 *     <OwnerTable.Body>
 *       <OwnerTable.Row>
 *         <OwnerTable.Cell>data</OwnerTable.Cell>
 *       </OwnerTable.Row>
 *     </OwnerTable.Body>
 *     <OwnerTable.Footer summary="142 rows">{pagination}</OwnerTable.Footer>
 *   </OwnerTable>
 *
 * Numeric cells: pass `align="right"` + the value will be tabular-nums.
 * Empty/loading: pass `loading` / `empty` props on `<OwnerTable>`.
 */

const TableShell = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    loading?: boolean;
    empty?: ReactNode;
    rowCount?: number;
    className?: string;
  }
>(({ children, loading, empty, rowCount, className = "" }, ref) => {
  // If `loading` or `empty` are set, render only the toolbar and a
  // status row — keep the rest of the table out of the DOM so callers
  // don't have to do their own conditional rendering.
  let toolbar: ReactNode = null;
  let head: ReactNode = null;
  let body: ReactNode = null;
  let footer: ReactNode = null;
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const type = (child.type as any).__OWNER_TABLE_PART__;
    if (type === "toolbar") toolbar = child;
    else if (type === "head") head = child;
    else if (type === "body") body = child;
    else if (type === "footer") footer = child;
  });

  return (
    <div
      ref={ref}
      className={`overflow-hidden rounded-owner-lg border border-owner-border bg-owner-bg ${className}`}
    >
      {toolbar ? (
        <div className="border-b border-owner-border-soft px-5 py-4">
          {toolbar}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="owner-table w-full">
          {head}
          {!loading && (rowCount === undefined || rowCount > 0) ? body : null}
        </table>
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-12 text-[13px] text-owner-fg-3">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : rowCount === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-owner-fg-3">
            {empty ?? "No records yet."}
          </div>
        ) : null}
      </div>
      {footer && !loading && (rowCount === undefined || rowCount > 0)
        ? footer
        : null}
    </div>
  );
});
TableShell.displayName = "OwnerTable";

const Toolbar = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    {children}
  </div>
);
(Toolbar as any).__OWNER_TABLE_PART__ = "toolbar";

const Head = ({ children }: { children: ReactNode }) => (
  <thead>
    <tr>{children}</tr>
  </thead>
);
(Head as any).__OWNER_TABLE_PART__ = "head";

const HeaderCell = ({
  children,
  align,
  width,
  className = "",
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right" | "center";
  width?: number | string;
}) => (
  <th
    scope="col"
    className={`${align === "right" ? "!text-right" : align === "center" ? "!text-center" : ""} ${className}`}
    style={{ width }}
    {...rest}
  >
    {children}
  </th>
);

const Body = ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>;
(Body as any).__OWNER_TABLE_PART__ = "body";

const Row = ({
  children,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={`transition hover:bg-owner-bg-subtle ${className}`}
    {...rest}
  >
    {children}
  </tr>
);

const Cell = ({
  children,
  align,
  monospace,
  bold,
  muted,
  className = "",
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right" | "center";
  monospace?: boolean;
  bold?: boolean;
  muted?: boolean;
}) => {
  const alignCls =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "";
  const fontCls = monospace ? "font-ownerMono" : "";
  const colorCls = muted ? "text-owner-fg-4" : "text-owner-fg-1";
  const weightCls = bold ? "font-semibold" : "";
  const numCls = align === "right" ? "tabular-nums" : "";
  return (
    <td
      className={`${alignCls} ${fontCls} ${colorCls} ${weightCls} ${numCls} ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
};

const Footer = ({
  summary,
  children,
}: {
  summary?: ReactNode;
  children?: ReactNode;
}) => (
  <div className="flex flex-col items-start gap-3 border-t border-owner-border-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    {summary ? (
      <span className="text-[13px] text-owner-fg-4">{summary}</span>
    ) : (
      <span />
    )}
    {children ?? null}
  </div>
);
(Footer as any).__OWNER_TABLE_PART__ = "footer";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <div className={`owner-search ${className}`}>
    <Search size={16} />
    <input
      type="search"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

export const OwnerTable = Object.assign(TableShell, {
  Toolbar,
  Head,
  HeaderCell,
  Body,
  Row,
  Cell,
  Footer,
  SearchInput,
});
