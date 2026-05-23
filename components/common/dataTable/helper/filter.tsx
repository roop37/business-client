import { FilterDataEnum } from "@/generated/graphql";
import { FilterFn, Row, Table } from "@tanstack/react-table";

// Helper for type safety when working with values
type FilterValue = string | number | (string | number)[];

// Helper function to handle array type checks
const toArray = (value: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

// Helper function for numeric comparisons
const toNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Type guard to check if a value is numeric
const isNumeric = (value: any): boolean => {
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
};

// Helper to safely convert value to string
const toString = (value: any): string => {
  if (value === null || value === undefined) return "";
  return String(value);
};

// Custom filter functions for each FilterDataEnum type
export const filterFunctions = {
  [FilterDataEnum.Contains]: (
    row: Row<any>,
    columnId: string,
    filterValue: FilterValue
  ): boolean => {
    const value = toString(row.getValue(columnId));
    return value.toLowerCase().includes(toString(filterValue).toLowerCase());
  },

  [FilterDataEnum.Equals]: (
    row: Row<any>,
    columnId: string,
    filterValue: FilterValue
  ): boolean => {
    const value = row.getValue(columnId);

    // Handle numeric equality
    if (isNumeric(value) && isNumeric(filterValue)) {
      return toNumber(value) === toNumber(filterValue);
    }

    // String equality
    return (
      toString(value).toLowerCase() === toString(filterValue).toLowerCase()
    );
  },

  [FilterDataEnum.NotEquals]: (
    row: Row<any>,
    columnId: string,
    filterValue: FilterValue
  ): boolean => {
    const value = row.getValue(columnId);

    // Handle numeric inequality
    if (isNumeric(value) && isNumeric(filterValue)) {
      return toNumber(value) !== toNumber(filterValue);
    }

    // String inequality
    return (
      toString(value).toLowerCase() !== toString(filterValue).toLowerCase()
    );
  },

  [FilterDataEnum.GreaterThan]: (
    row: Row<any>,
    columnId: string,
    filterValue: FilterValue
  ): boolean => {
    const value = row.getValue(columnId);

    // Handle numeric comparison
    if (isNumeric(value) && isNumeric(filterValue)) {
      return toNumber(value) > toNumber(filterValue);
    }

    // String comparison (lexicographic)
    return toString(value).localeCompare(toString(filterValue)) > 0;
  },

  [FilterDataEnum.LessThan]: (
    row: Row<any>,
    columnId: string,
    filterValue: FilterValue
  ): boolean => {
    const value = row.getValue(columnId);

    // Handle numeric comparison
    if (isNumeric(value) && isNumeric(filterValue)) {
      return toNumber(value) < toNumber(filterValue);
    }

    // String comparison (lexicographic)
    return toString(value).localeCompare(toString(filterValue)) < 0;
  },

  // [FilterDataEnum.InArray]: (
  //   row: Row<any>,
  //   columnId: string,
  //   filterValue: FilterValue
  // ): boolean => {
  //   const value = row.getValue(columnId);
  //   const searchArray = Array.isArray(filterValue)
  //     ? filterValue
  //     : toArray(toString(filterValue));

  //   // Handle numeric arrays
  //   if (isNumeric(value) && searchArray.every((v) => isNumeric(v))) {
  //     return searchArray.map(toNumber).includes(toNumber(value));
  //   }

  //   // String arrays
  //   return searchArray
  //     .map((v) => toString(v).toLowerCase())
  //     .includes(toString(value).toLowerCase());
  // },

  // [FilterDataEnum.NotInArray]: (
  //   row: Row<any>,
  //   columnId: string,
  //   filterValue: FilterValue
  // ): boolean => {
  //   const value = row.getValue(columnId);
  //   const searchArray = Array.isArray(filterValue)
  //     ? filterValue
  //     : toArray(toString(filterValue));

  //   // Handle numeric arrays
  //   if (isNumeric(value) && searchArray.every((v) => isNumeric(v))) {
  //     return !searchArray.map(toNumber).includes(toNumber(value));
  //   }

  //   // String arrays
  //   return !searchArray
  //     .map((v) => toString(v).toLowerCase())
  //     .includes(toString(value).toLowerCase());
  // },
};

interface FilterFunctionParams {
  row: Row<any>;
  columnId: string;
  filterValue: FilterValue;
}

// Type for the custom filter function
type CustomFilterFunction = (params: FilterFunctionParams) => boolean;

export const applyColumnFilter = (
  table: Table<any>,
  columnId: string,
  filterFn: FilterDataEnum,
  value: string | string[]
): void => {
  const column = table.getColumn(columnId);

  if (!column) {
    console.warn(`Column ${columnId} not found in table`);
    return;
  }

  try {
    // Set the filter value
    column.setFilterValue(value);

    // Create a custom filter function that wraps our filterFunctions
    const customFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
      try {
        return filterFunctions[filterFn](row, columnId, filterValue);
      } catch (error) {
        console.error(
          `Error applying filter ${filterFn} to column ${columnId}:`,
          error
        );
        return true; // Return true to show the row in case of error
      }
    };

    // Apply the custom filter function to the column
    column.columnDef.filterFn = customFilterFn;
  } catch (error) {
    console.error(`Error setting up filter for column ${columnId}:`, error);
  }
};
// Export a function to reset filters
export const resetColumnFilter = (
  table: Table<any>,
  columnId?: string
): void => {
  if (columnId) {
    const column = table.getColumn(columnId);
    if (column) {
      column.setFilterValue(undefined);
    }
  } else {
    // Reset all filters if no columnId is provided
    table.resetColumnFilters();
  }
};
