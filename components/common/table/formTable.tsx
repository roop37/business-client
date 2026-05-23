import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { CiImageOn } from "react-icons/ci";
import { GoGrabber } from "react-icons/go";
import { ImFileEmpty } from "react-icons/im";
import { IoIosAddCircleOutline } from "react-icons/io";
import CButton from "../button/button";
import { ButtonType } from "../button/interface";
import ReusableModal from "../modal/modal";
import { StatusEnum } from "@/generated/graphql";

export interface Heading {
  title: string;
  dataKey: string;
  render?: (rowData: DataItemFormAddTable) => React.ReactNode;
}

interface DataItemFormAddTable {
  _id: string;
  name: string;
  index: number;
  [key: string]: any;
}

interface FormAddTableProps {
  data?: DataItemFormAddTable[];
  headings: Heading[] | any[];
  title: string;
  emptyMessage: string;
  caption?: string;
  infotext: string;
  emptyCaption?: string;
  // buttonText: string;
  // onAddClick: () => void;
  isShowImage?: boolean;
  onSave?: (updatedData: DataItemFormAddTable[]) => void;
  isSortable?: boolean;
  onSort?: (sortedData: DataItemFormAddTable[]) => void;
  hasBulkPriceIncrease?: boolean;
}

const FormAddTable: React.FC<FormAddTableProps> = ({
  data = [],
  headings,
  title,
  caption,
  infotext,
  emptyMessage,
  emptyCaption = "",
  // buttonText,
  // onAddClick,
  isShowImage = false,
  onSave = () => {},
  isSortable = false,
  onSort = () => {},
  hasBulkPriceIncrease = false,
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState<{
    [key: string]: DataItemFormAddTable;
  }>({});

  const [bulkPriceIncreaseModalOpen, setBulkPriceIncreaseModalOpen] =
    useState(false);
  const [increaseValue, setIncreaseValue] = useState<number>(0);
  const [increaseBy, setIncreaseBy] = useState<"amount" | "percentage">(
    "amount"
  );

  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">(
    "increase"
  );

  const filteredData = [...data]
    .sort((a, b) => a.index - b.index)
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    if (action === "delete") {
      // Implement delete logic
    } else if (action === "aggregate") {
      setBulkPriceIncreaseModalOpen(true);
    }
  };

  const handleBulkPriceIncrease = () => {
    const updatedData = Object.keys(editableData).reduce<{
      [key: string]: DataItemFormAddTable;
    }>((acc, itemId) => {
      const item = editableData[itemId];
      const priceHeading = headings.find(
        (heading) =>
          heading.dataKey.toLowerCase() === "price" ||
          heading.title.toLowerCase() === "price"
      );

      if (priceHeading) {
        const currentPrice = Number(item[priceHeading.dataKey]);

        if (!isNaN(currentPrice)) {
          let newPrice = 0;

          if (increaseBy === "percentage") {
            const change = currentPrice * (increaseValue / 100);
            newPrice =
              adjustmentType === "increase"
                ? currentPrice + change
                : currentPrice - change;
          } else {
            newPrice =
              adjustmentType === "increase"
                ? currentPrice + increaseValue
                : currentPrice - increaseValue;
          }
          newPrice = Math.max(newPrice, 0);

          acc[itemId] = {
            ...item,
            [priceHeading.dataKey]: Math.round(newPrice * 100) / 100,
          };
        }
      }
      return acc;
    }, {});

    setEditableData(updatedData);
  };

  const handleSave = () => {
    onSave(Object.values(editableData));
    setEditMode(false);
  };

  const handleQuickEdit = () => {
    setEditMode(true);
    const initialEditableData = filteredData.reduce((acc, item) => {
      acc[item._id] = { ...item };
      return acc;
    }, {} as { [key: string]: DataItemFormAddTable });
    setEditableData(initialEditableData);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setEditableData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(filteredData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update indexes
    const updatedItems = items.map((item, index) => ({
      ...item,
      index,
    }));

    onSort(updatedItems);
  };

  const hasPriceField = headings.some(
    (heading) =>
      heading.dataKey.toLowerCase() === "price" ||
      heading.title.toLowerCase() === "price"
  );

  const hasStatusField = headings.some(
    (heading) =>
      heading.dataKey.toLowerCase() === "masterstatus" ||
      heading.title.toLowerCase() === "status"
  );

  return (
    <div className="w-full  rounded-xl  ">
      <h2 className="block mb-1 text-sm font-medium text-left text-gray-700">
        {title}
      </h2>
      {caption ? (
        <p className="text-gray-500 text-xs text-start ">{caption}</p>
      ) : null}
      <div className="flex items-center justify-between mb-2">
        {searchTerm.length > 0 || filteredData.length ? (
          <input
            type="text"
            placeholder="Search among selected items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded-xl w-1/3 max-h-8"
          />
        ) : null}

        {filteredData.length > 0 && (hasPriceField || hasStatusField) && (
          <div className="flex items-center space-x-4">
            {editMode ? (
              <>
                {hasBulkPriceIncrease && (
                  <button
                    type="button"
                    className="text-primary hover:underline hover:cursor-pointer text-sm"
                    onClick={() => handleBulkAction("aggregate")}
                  >
                    Bulk Price Update
                  </button>
                )}
                <button
                  type="button"
                  className="text-primary hover:underline hover:cursor-pointer text-sm"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="text-primary hover:underline hover:cursor-pointer text-sm"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="text-primary hover:underline hover:cursor-pointer text-sm"
                onClick={handleQuickEdit}
              >
                Quick Edit
              </button>
            )}
          </div>
        )}
      </div>

      {filteredData.length === 0 ? (
        <div className="flex justify-start align-middle p-4 border rounded-xl space-x-4">
          <div className="flex text-xl text-gray-500 items-center">
            <ImFileEmpty />
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-gray-500 text-start">
              {searchTerm ? "No Data Found" : emptyMessage}
            </p>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {filteredData.map((item, index) => (
                  <Draggable
                    key={item._id}
                    draggableId={item._id}
                    index={index}
                    isDragDisabled={
                      !isSortable ||
                      filteredData.length <= 1 ||
                      searchTerm.length > 0
                    }
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex bg-white justify-between items-center p-2 border rounded-xl mb-2"
                      >
                        <div className="flex items-center">
                          {isSortable && filteredData.length > 1 && (
                            <div
                              {...provided.dragHandleProps}
                              className="mr-2 cursor-move"
                            >
                              <GoGrabber size={28} />
                            </div>
                          )}
                          <div className="flex items-center space-x-2 py-1">
                            {isShowImage &&
                              (item?.image?.trim() && !imageError ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-xl"
                                  onError={() => setImageError(true)}
                                />
                              ) : (
                                <div className="text-primary text-2xl">
                                  <CiImageOn />
                                </div>
                              ))}
                            {/* Status dot indicator - hidden in edit mode */}
                            {hasStatusField && !editMode && (
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  item.masterStatus === "active"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                            )}
                            {editMode ? (
                              <input
                                type="text"
                                value={editableData[item._id]?.name || ""}
                                readOnly
                                // onChange={(e) =>
                                //   handleInputChange(
                                //     item._id,
                                //     "name",
                                //     e.target.value
                                //   )
                                // }
                                className="p-1 select-none outline-none pointer-events-none"
                              />
                            ) : (
                              <span className="text-md">{item?.name}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex  items-center space-x-2">
                          {headings.map((heading) => (
                            <span
                              key={heading.dataKey}
                              className="flex items-center"
                            >
                              {heading.title === "Status" ? (
                                // Status column: only show switch in edit mode
                                editMode ? (
                                  heading.render ? (
                                    heading.render({
                                      ...item,
                                      [heading.dataKey]:
                                        editableData[item._id]?.[
                                          heading.dataKey
                                        ] ?? item[heading.dataKey],
                                      onChange: (newStatus: boolean) =>
                                        handleInputChange(
                                          item._id,
                                          heading.dataKey,
                                          newStatus ? StatusEnum.Active : StatusEnum.Inactive
                                        ),
                                    })
                                  ) : null
                                ) : null
                              ) : editMode && heading.title !== "Actions" ? (
                                <input
                                  type={
                                    [
                                      "Price",
                                      "price",
                                      "Count",
                                      "count",
                                    ].includes(heading.title)
                                      ? "number"
                                      : "text"
                                  }
                                  value={
                                    editableData[item._id]?.[heading.dataKey] ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      item._id,
                                      heading.dataKey,
                                      e.target.value
                                    )
                                  }
                                  className="p-2 border border-gray-500 rounded-xl w-20 max-h-8 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                              ) : heading.render ? (
                                heading.render(item)
                              ) : (
                                item[heading.dataKey]
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {infotext ? (
                  <p className="text-gray-700 text-xs font-semibold text-start mb-1 ">
                    <span className="text-red-600 text-base relative -mr-1 top-[2px] ">
                      *
                    </span>{" "}
                    {infotext}
                  </p>
                ) : null}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      {/* {!editMode && (
        <CButton
          type="button"
          variant={ButtonType.Outlined}
          onClick={onAddClick}
          className="w-full mt-2 mb-2"
        >
          <div className="flex justify-center items-center">
            {buttonText}
            <IoIosAddCircleOutline className="text-xl ml-1" />
          </div>
        </CButton>
      )} */}
      <ReusableModal
        title="Bulk Price Update"
        isOpen={bulkPriceIncreaseModalOpen}
        onClose={() => setBulkPriceIncreaseModalOpen(false)}
        width="md"
      >
        <div className="space-y-6 mt-2">
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-left mb-2 text-gray-700">
                Adjustment Type
              </Label>
              <RadioGroup
                defaultValue="increase"
                onValueChange={(value) =>
                  setAdjustmentType(value as "increase" | "decrease")
                }
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="increase" id="increase" />
                    <Label htmlFor="increase">Increase</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="decrease" id="decrease" />
                    <Label htmlFor="decrease">Decrease</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="block text-sm font-medium text-left text-gray-700 mb-2">
                Adjustment Method
              </Label>
              <RadioGroup
                defaultValue="amount"
                onValueChange={(value) =>
                  setIncreaseBy(value as "amount" | "percentage")
                }
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="amount" id="amount" />
                    <Label htmlFor="amount">By Amount</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage">By Percentage</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="relative">
            {increaseBy === "amount" && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-700 font-bold sm:text-sm">$</span>
              </div>
            )}

            <input
              type="number"
              placeholder={`Enter ${
                increaseBy === "amount" ? "amount" : "percentage"
              }`}
              className={`input input-primary w-full ${
                increaseBy === "amount" ? "pl-7" : "pr-7"
              }`} // Adjust padding based on symbol
              onChange={(e) => setIncreaseValue(Number(e.target.value))}
              step="0.01"
              onWheel={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-" || e.key === "+") {
                  e.preventDefault();
                }
              }}
              onFocus={(e) =>
                e.target.addEventListener("wheel", (event) =>
                  event.preventDefault()
                )
              }
            />

            {increaseBy === "percentage" && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-700 font-bold sm:text-sm">%</span>
              </div>
            )}
          </div>
          <CButton
            className="w-full"
            variant={ButtonType.Primary}
            onClick={() => {
              handleBulkPriceIncrease();

              setBulkPriceIncreaseModalOpen(false);
              setIncreaseValue(0);
              setIncreaseBy("amount");
              setAdjustmentType("increase");
            }}
          >
            Update
          </CButton>
        </div>
      </ReusableModal>
    </div>
  );
};

export default FormAddTable;
