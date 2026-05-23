import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterDataEnum } from "@/generated/graphql";
import useGlobalStore from "@/store/global";
import { formatFilterOperation } from "@/utils/utilFUncs";
import { Table } from "@tanstack/react-table";
import { download, generateCsv, mkConfig } from "export-to-csv";
import debounce from "lodash.debounce";
import { useState } from "react";
import { IoMdFunnel } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import { RxMixerHorizontal } from "react-icons/rx";
import CButton from "../../button/button";
import { ButtonType } from "../../button/interface";
import { applyColumnFilter } from "../helper/filter";
import DataDateRangeTable from "@/components/ui/tableDateRange";
import ReusableModal from "../../modal/modal";
import { useRouter } from "next/router";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  manual: boolean;
  hideDownloadButton?: boolean;
  addClickHandler?: () => void;
  downloadClickHandler?: (selectedIds?: string[]) => Promise<void>;
  fileName?: string;
  downloadLoading?: boolean;
  filterLoading?: boolean;
  filterClickHandler?: (data: {
    key?: string;
    filterFn?: FilterDataEnum;
    value?: string | string[];
  }) => Promise<void>;
  hideSearch?: boolean;
  searchFilter?: string;
  setSearchFilter?: (value: string) => void;
  showDateRange?: boolean;
  dateRangeCompareAllowed?: boolean;
  bulkUpdateItemsClick?: (selectedIds?: string[]) => void;
}

const DataTableToolbar = <TData,>(props: DataTableToolbarProps<TData>) => {
  const { setToastData } = useGlobalStore();
  const router = useRouter();
  const {
    // Table Configs
    table,
    manual,

    // Add Button
    addClickHandler,

    // Export Button
    fileName,
    hideDownloadButton = true,
    downloadClickHandler,
    downloadLoading,

    // Filter Button
    filterLoading,
    filterClickHandler,

    // Search
    hideSearch = false,
    searchFilter,
    setSearchFilter,
    showDateRange = false,
    dateRangeCompareAllowed = false,
    bulkUpdateItemsClick,
  } = props;

  const [filterPopover, setFilterPopover] = useState(false);
  const [filterData, setFilterData] = useState<{
    key?: string;
    filterFn?: FilterDataEnum;
    value?: string | string[];
  }>();
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [selectAllLoading, setSelectAllLoading] = useState(false);
  const [bulkUpdateModalOpen, setBulkUpdateModalOpen] = useState(false);

  const [downloadType, setDownloadType] = useState<"selected" | "full">("full");
  const [downloadPopover, setDownloadPopover] = useState(false);
  const csvConfig = mkConfig({
    useKeysAsHeaders: true,
    filename: fileName,
  });

  const pagename = router.asPath.split("/").pop() || "items";
  const handleSelectAllFromModal = () => {
    setSelectAllLoading(true);

    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
      setToastData({
        type: "warning",
        message: `No ${pagename} available to select.`,
      });
      setBulkUpdateModalOpen(false);
      setSelectAllLoading(false);
      return;
    }

    // Select all rows from current table data
    table.setRowSelection(
      Object.fromEntries(rows.map((row) => [row.id, true]))
    );
    setBulkUpdateModalOpen(false);
    setSelectAllLoading(false);
  };

  const handleFilterApply = async () => {
    if (!filterData || !filterData?.key) {
      return;
    }

    if (manual && filterClickHandler) {
      filterClickHandler(filterData);
    } else {
      // Apply the custom filter
      applyColumnFilter(
        table,
        filterData.key,
        filterData.filterFn ?? FilterDataEnum.Contains,
        filterData.value ?? ""
      );
    }

    setFiltersApplied(true);
    setFilterPopover(false);
  };

  const searchHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim().toLowerCase();
    if (setSearchFilter) {
      setSearchFilter(value);
    }
  };

  const debounceSearch = debounce(searchHandler, 600);

  return (
    <div className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:items-center justify-between p-4 w-full border-b">
      <div className="flex items-center justify-start space-x-5 w-full mr-auto">
        {!hideSearch ? (
          <input
            // value={searchFilter ?? ""}
            type="text"
            placeholder="Search here..."
            onChange={debounceSearch}
            className="input input-primary max-w-56 py-[.8rem] px-[1rem]"
          />
        ) : null}

        {(filterClickHandler || !manual) && (
          <Popover
            onOpenChange={(open) => {
              setFilterPopover(open);
            }}
            open={filterPopover}
          >
            <PopoverTrigger asChild>
              <button className="flex justify-center items-center btn btn-outlined relative">
                <span className="text-xs">Filters</span>
                <IoMdFunnel size={16} className="ml-2" />

                {/* Active Indicator */}
                {filterData?.key && filterData?.value && filtersApplied && (
                  <>
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary bg-opacity-80 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  </>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[22rem] md:w-[32rem]"
              side="bottom"
              align="start"
            >
              <div className="grid gap-4">
                <h4 className="font-medium leading-none">Apply Filters</h4>
                <div className="flex items-center justify-between md:space-x-2 md:flex-nowrap flex-wrap w-full">
                  <div className="w-full">
                    <Label htmlFor="column" className="text-xs">
                      Column
                    </Label>
                    <Select
                      value={filterData?.key ?? ""}
                      onValueChange={(value) => {
                        setFilterData((prev) => ({ ...prev, key: value }));
                      }}
                    >
                      <SelectTrigger id="column" className="h-8 text-xs">
                        <SelectValue placeholder={"Choose column"} />
                      </SelectTrigger>
                      <SelectContent side="bottom">
                        {table
                          .getAllColumns()
                          .filter(
                            (e) =>
                              ![
                                "select",
                                "status",
                                "createdAt",
                                "updatedAt",
                                "actions",
                              ].includes(e.id) && e.getCanFilter()
                          )
                          .map((e) => {
                            return (
                              <SelectItem
                                key={e.id}
                                value={e.id}
                                className="capitalize"
                              >
                                {e.columnDef?.header?.toString() ?? ""}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full">
                    <Label htmlFor="operation" className="text-xs">
                      Operation
                    </Label>
                    <Select
                      value={filterData?.filterFn ?? ""}
                      onValueChange={(value) => {
                        setFilterData((prev) => ({
                          ...prev,
                          filterFn: value as FilterDataEnum,
                        }));
                      }}
                    >
                      <SelectTrigger id="operation" className="h-8 text-xs">
                        <SelectValue placeholder={"Choose operation"} />
                      </SelectTrigger>
                      {/* <SelectContent side="bottom">
                          {Object.keys(FilterDataEnum).map((e) => {
                            return (
                              <SelectItem key={e} value={e}>
                                {e}
                              </SelectItem>
                            );
                          })}
                        </SelectContent> */}
                      <SelectContent side="bottom">
                        {Object.keys(FilterDataEnum).map((e) => (
                          <SelectItem key={e} value={e}>
                            {formatFilterOperation(e as FilterDataEnum)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full">
                    <Label htmlFor="value" className="text-xs">
                      Value
                    </Label>
                    <Input
                      id="value"
                      type="text"
                      placeholder="Enter value"
                      className="text-xs h-8"
                      value={filterData?.value ?? ""}
                      onChange={(e) => {
                        // if (
                        //   filterData?.filterFn &&
                        //   [
                        //     FilterDataEnum.InArray,
                        //     FilterDataEnum.NotInArray,
                        //   ].includes(filterData?.filterFn)
                        // ) {
                        //   setFilterData((prev) => ({
                        //     ...prev,
                        //     value: e.target.value.split(","),
                        //   }));
                        // } else {
                        // }
                        setFilterData((prev) => ({
                          ...prev,
                          value: e.target.value.toString(),
                        }));
                      }}
                    />
                    {/* <Label>{"Separate multiple values usign ','."}</Label> */}
                  </div>
                </div>
                {/* {filterData?.filterFn &&
                [FilterDataEnum.InArray, FilterDataEnum.NotInArray].includes(
                  filterData?.filterFn
                ) ? (
                  <p className="text-xs font-medium">
                    Separate multiple values using comma.
                  </p>
                ) : null} */}
                <div className="flex justify-start items-center space-x-4">
                  <CButton
                    variant={ButtonType.Primary}
                    className="text-xs mt-4"
                    loading={filterLoading}
                    disabled={
                      filterLoading || !filterData?.key || !filterData.value
                    }
                    // onClick={async () => {
                    //   if (!filterData || !filterData?.key) {
                    //     return;
                    //   }

                    //   if (manual && filterClickHandler) {
                    //     filterClickHandler(filterData);
                    //   } else {
                    //     table
                    //       .getColumn(filterData.key)
                    //       ?.setFilterValue(filterData.value);
                    //   }

                    //   setFiltersApplied(true);
                    // }}
                    onClick={handleFilterApply}
                  >
                    Apply
                  </CButton>
                  <CButton
                    variant={ButtonType.Text}
                    className="mt-4"
                    loading={filterLoading}
                    disabled={filterLoading}
                    onClick={() => {
                      const initFilterData = {
                        key: undefined,
                        filterFn: undefined,
                        value: undefined,
                      };
                      setFilterData(initFilterData);

                      if (manual && filterClickHandler) {
                        filterClickHandler(initFilterData);
                      } else {
                        table.setState((prev) => ({
                          ...prev,
                          columnFilters: [],
                        }));
                      }
                      setFiltersApplied(false);
                    }}
                  >
                    Reset
                  </CButton>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {(filterData?.key || filterData?.value || filtersApplied) && (
          <CButton
            variant={ButtonType.Text}
            className="text-xs"
            onClick={() => {
              const initFilterData = {
                key: undefined,
                filterFn: undefined,
                value: undefined,
              };
              setFilterData(initFilterData);

              if (manual && filterClickHandler) {
                filterClickHandler(initFilterData);
              } else {
                table.setState((prev) => ({
                  ...prev,
                  columnFilters: [],
                }));
              }
              setFiltersApplied(false);
            }}
          >
            Reset
          </CButton>
        )}
      </div>

      <div className="flex md:flex-nowrap flex-wrap md:items-center items-start md:justify-center justify-start space-x-3">
        {showDateRange ? (
          <DataDateRangeTable allowCompare={dateRangeCompareAllowed} />
        ) : null}

        {/* Add */}
        {bulkUpdateItemsClick && (
          <>
            <CButton
              loading={false}
              variant={ButtonType.Primary}
              onClick={() => {
                const ids = Object.keys(table.getState().rowSelection);
                if (ids.length <= 0) {
                  setBulkUpdateModalOpen(true);
                  // setToastData({
                  //   type: "error",
                  //   message:
                  //     "There are no row(s) selected to bulk update, please try again.",
                  // });
                  return;
                }
                bulkUpdateItemsClick(ids);
              }}
              className="flex flex-shrink-0 justify-center items-center"
            >
              <span className="text-xs">Bulk Update</span>
            </CButton>

            <ReusableModal
              isOpen={bulkUpdateModalOpen}
              onClose={() => setBulkUpdateModalOpen(false)}
              title={`Select ${pagename}`}
              width="sm"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  To use the bulk update feature, please select the {pagename}{" "}
                  you wish to update. You can quickly select all available{" "}
                  {pagename} by clicking the select all button below.
                </p>
                <div className="flex justify-end space-x-3 pt-4">
                  <CButton
                    variant={ButtonType.Outlined}
                    onClick={() => setBulkUpdateModalOpen(false)}
                    className="text-xs"
                  >
                    Close
                  </CButton>
                  <CButton
                    variant={ButtonType.Primary}
                    onClick={handleSelectAllFromModal}
                    loading={selectAllLoading}
                    disabled={selectAllLoading}
                    className="text-xs"
                  >
                    Select All
                  </CButton>
                </div>
              </div>
            </ReusableModal>
          </>
        )}
        {addClickHandler && (
          <CButton
            loading={false}
            variant={ButtonType.Add}
            onClick={() => {
              addClickHandler();
            }}
            className="flex justify-center items-center"
          >
            <span className="text-xs">Add</span>
            {/* <MdAddCircleOutline size={16} className="ml-2" /> */}
          </CButton>
        )}
        {/* Export CSV */}
        {(downloadClickHandler || !manual) && (
          <Popover
            onOpenChange={(open) => {
              setDownloadPopover(open);
              setDownloadType("selected");
            }}
            open={downloadPopover}
          >
            <PopoverTrigger asChild>
              <button className="flex justify-center items-center btn btn-outlined">
                <MdOutlineFileDownload size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">
                    Download Table Data
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Choose the type of data you want to download
                  </p>
                </div>
                <div>
                  <RadioGroup
                    value={downloadType}
                    onValueChange={(value: "selected" | "full") =>
                      setDownloadType(value)
                    }
                    defaultValue="selected"
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="selected" id="selected" />
                      <Label htmlFor="selected" className="text-xs">
                        {`Selected rows (${
                          Object.keys(table.getState().rowSelection).length
                        })`}
                      </Label>
                    </div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full" className="text-xs">
                        Full data
                      </Label>
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-6">
                      Downloads all data till date, irrespective of filters
                      applied
                    </p>
                    </div>
                  </RadioGroup>
                  <CButton
                    variant={ButtonType.Primary}
                    className="text-xs mt-4"
                    loading={downloadLoading}
                    disabled={downloadLoading || !downloadType}
                    onClick={async () => {
                      if (downloadType === "selected") {
                        if (!manual) {
                          let d = table.getSelectedRowModel().rows;

                          if (d.length <= 0) {
                            setToastData({
                              type: "warning",
                              message:
                                "There are no row(s) selected to download, please try again",
                            });
                            return;
                          }

                          const headers = table
                            .getAllColumns()
                            .filter(
                              (e) =>
                                ![
                                  "select",
                                  "createdAt",
                                  "updatedAt",
                                  "actions",
                                ].includes(e.id)
                            )
                            .map((e) => ({
                              key: e.id,
                              displayLabel:
                                e.columnDef?.header?.toString() ?? "",
                            }));

                          // Converts your Array<Object> to a CsvOutput string based on the configs
                          const csv = generateCsv({
                            ...csvConfig,
                            useKeysAsHeaders: false,
                            columnHeaders: headers,
                          })(d.map((e) => e.original) as any);

                          download(csvConfig)(csv);
                        }

                        if (manual && downloadClickHandler) {
                          const ids = Object.keys(
                            table.getState().rowSelection
                          );

                          if (
                            ids.length > 0 &&
                            !ids.some((e) => e === null || e === undefined)
                          ) {
                            await downloadClickHandler(ids);
                          } else {
                            setToastData({
                              type: "warning",
                              message:
                                "There are no row(s) selected to download, please try again",
                            });
                            return;
                          }
                        }
                      }

                      if (downloadType === "full") {
                        if (!manual) {
                          let d = table.getFilteredRowModel().rows;

                          if (d.length <= 0) {
                            setToastData({
                              type: "warning",
                              message:
                                "There are no row(s) selected to download, please try again",
                            });
                            return;
                          }

                          const headers = table
                            .getAllColumns()
                            .filter(
                              (e) =>
                                ![
                                  "select",
                                  "createdAt",
                                  "updatedAt",
                                  "actions",
                                ].includes(e.id)
                            )
                            .map((e) => ({
                              key: e.id,
                              displayLabel:
                                e.columnDef?.header?.toString() ?? "",
                            }));

                          // Converts your Array<Object> to a CsvOutput string based on the configs
                          const csv = generateCsv({
                            ...csvConfig,
                            useKeysAsHeaders: false,
                            columnHeaders: headers,
                          })(d.map((e) => e.original) as any);

                          download(csvConfig)(csv);
                        } else if (downloadClickHandler) {
                          await downloadClickHandler();
                        }
                      }

                      setDownloadPopover(false);
                    }}
                  >
                    Download
                  </CButton>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {/* {(downloadClickHandler || !manual) && !hideDownloadButton && (
          <CButton
            variant={ButtonType.Outlined}
            className=""
            loading={downloadLoading}
            disabled={downloadLoading || !downloadType}
            onClick={async () => {
              if (downloadType === "selected") {
                if (!manual) {
                  let d = table.getSelectedRowModel().rows;

                  if (d.length <= 0) {
                    setToastData({
                      type: "warning",
                      message:
                        "There are no row(s) selected to download, please try again.",
                    });
                    return;
                  }

                  // Converts your Array<Object> to a CsvOutput string based on the configs
                  const csv = generateCsv(csvConfig)(
                    d.map((e) => e.original) as any
                  );

                  download(csvConfig)(csv);
                }

                if (manual && downloadClickHandler) {
                  const ids = Object.keys(table.getState().rowSelection);

                  if (
                    ids.length > 0 &&
                    !ids.some((e) => e === null || e === undefined)
                  ) {
                    await downloadClickHandler(ids);
                  } else {
                    setToastData({
                      type: "warning",
                      message:
                        "There are no row(s) selected to download, please try again.",
                    });
                    return;
                  }
                }
              }

              if (downloadType === "full") {
                if (!manual) {
                  let d = table.getFilteredRowModel().rows;

                  if (d.length <= 0) {
                    setToastData({
                      type: "warning",
                      message:
                        "There are no row(s) selected to download, please try again.",
                    });
                    return;
                  }

                  // Converts your Array<Object> to a CsvOutput string based on the configs
                  const csv = generateCsv(csvConfig)(
                    d.map((e) => e.original) as any
                  );

                  download(csvConfig)(csv);
                } else if (downloadClickHandler) {
                  await downloadClickHandler();
                }
              }

              setDownloadPopover(false);
            }}
          >
            <MdOutlineFileDownload size={18} />
          </CButton>
        )} */}
        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex justify-center items-center btn btn-outlined">
              <RxMixerHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[160px] w-auto">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DataTableToolbar;
