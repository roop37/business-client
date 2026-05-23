import CButton from "@/components/common/button/button";
import { ButtonType } from "@/components/common/button/interface";
import ReusableModal from "@/components/common/modal/modal";
import debounce from "lodash.debounce";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { BsArrowUpRightCircle } from "react-icons/bs";
import { IoIosAddCircleOutline } from "react-icons/io";
import CustomSwitch from "../customSwitch/customSwitch";
import { Heading } from "../table/formTable";

interface Props {
  title: string;
  createLabel?: string;
  addLabel?: string;
  masterList: any[];
  selectedList: any[];
  headings: Heading[] | any[];
  isOpen: boolean;
  onClose: () => void;
  addHandler: (idsList: string[], dataList?: any[]) => void;
  createClickHandler?: () => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  hasMoreItems: boolean;
  comment?: string;
  emptyMessage?: string;
  searchEmptyMessage?: string;

  searchHandler: (event: ChangeEvent<HTMLInputElement>) => void;
  isItemIncluded?: boolean;
  itemsList?: any[];
  itemCurrentPage?: number;
  setItemCurrentPage?: (page: number) => void;
  addItemHandler?: (idsList: string[], dataList?: any[]) => void;
  itemsHasMore?: boolean;
}

const AddFormDropdown: React.FC<Props> = ({
  title,
  createLabel,
  addLabel,
  masterList,
  selectedList,
  headings,
  isOpen,
  onClose,
  addHandler,
  createClickHandler,
  currentPage,
  setCurrentPage,
  hasMoreItems,
  searchHandler,
  comment,
  emptyMessage = "Please Add Items",
  searchEmptyMessage = "No Items found",
  isItemIncluded = false,
  itemsList = [],
  itemCurrentPage = 1,
  setItemCurrentPage,
  addItemHandler = () => {},
  itemsHasMore = false,
}) => {
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedItemsDetail, setSelectedItemsDetail] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showItems, setShowItems] = useState(false);

  const debounceSearch = debounce(searchHandler, 600);

  const handleShowMore = () => {
    if (showItems) {
      setItemCurrentPage?.(itemCurrentPage + 1);
    } else {
      setCurrentPage(currentPage + 1);
    }
  };
  const activeList = showItems ? itemsList : filteredItems;
  const activeHasMore = showItems ? itemsHasMore : hasMoreItems;

  const selectItemHandler = (id: string, data: any) => {
    const idx = selectedItems.findIndex((e) => e === id);

    if (idx >= 0) {
      setSelectedItems((prev) => prev.filter((e) => e !== id));
      setSelectedItemsDetail((prev) => prev.filter((e: any) => e._id !== id));
    } else {
      setSelectedItems((prev) => [...prev, id]);
      setSelectedItemsDetail((prev) => [...prev, data]);
    }
  };

  useEffect(() => {
    setFilteredItems(masterList);
  }, [masterList]);

  useEffect(() => {
    setSelectedItems([]);
  }, [showItems]);

  const isSearchEmpty =
    searchInputRef.current?.value === "" ||
    searchInputRef.current?.value == null;
  const hasNoItems = masterList.length === 0;

  return (
    <ReusableModal
      title={title}
      comments={comment}
      isOpen={isOpen}
      onClose={() => {
        if (searchInputRef.current) {
          searchInputRef.current.value = "";
        }
        onClose();
      }}
    >
      <div className="space-y-4">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search here..."
          onChange={debounceSearch}
          className="input input-primary w-full"
        />
        <ul>
          {/* {hasNoItems && isSearchEmpty && (
            <li className="text-center py-6">{emptyMessage}</li>
          )}
          {hasNoItems && !isSearchEmpty && (
            <li className="text-left p-2">{searchEmptyMessage}</li>
          )} */}
          {isItemIncluded && (
            <div className="flex w-full justify-end mb-2">
              <label className="label flex justify-center items-center gap-2 cursor-pointer">
                <span className="label-text">Show Menu Items</span>
                <CustomSwitch
                  checked={showItems}
                  onChange={() => setShowItems(!showItems)}
                  label="Show Menu Items"
                  className="mr-2"
                />
              </label>
            </div>
          )}
          {activeList.length === 0 && (
            <li className="text-center py-6">
              {showItems
                ? isSearchEmpty
                  ? "There are no items to be added as modifiers. Please create one from the item table."
                  : "No items found matching your search."
                : isSearchEmpty
                ? emptyMessage
                : searchEmptyMessage}
            </li>
          )}
          {activeList?.map((item) => {
            // const isSelected = selectedList.some(
            //   (selectedItem) => selectedItem._id === item._id
            // );
            const isSelected = selectedList.some(
              (selectedItem) =>
                // Check both ID match (for modifiers) and name/price match (for converted items)
                selectedItem._id === item._id ||
                (showItems &&
                  selectedItem.name === item.name &&
                  selectedItem.price === item.price)
            );

            return (
              <li
                key={item._id}
                className={`flex items-center p-2 border-b ${
                  isSelected ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <input
                  aria-label="Add item"
                  type="checkbox"
                  checked={
                    selectedItems.some(
                      (selectedItem) => selectedItem === item._id
                    ) || isSelected
                  }
                  disabled={isSelected}
                  onChange={(e) => {
                    selectItemHandler(item._id, item);
                  }}
                  className="mr-2"
                />

                <div className="flex flex-1 justify-between">
                  <span
                    className={`${
                      isSelected ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                    onClick={() => {
                      if (!isSelected) {
                        selectItemHandler(item._id, item);
                      }
                    }}
                  >
                    {item.name}
                  </span>
                  <div className="flex space-x-2">
                    {headings.map((heading, index) => (
                      <div key={index} className="flex items-center">
                        <span className="font-medium"> </span>
                        {heading.render
                          ? heading.render(item)
                          : item[heading.dataKey]}
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {activeHasMore && (
          <div className="flex justify-center">
            <button
              onClick={handleShowMore}
              className="text-primary cursor-pointer hover:underline"
            >
              Show more data
            </button>
          </div>
        )}
        {/* {activeHasMore && <button onClick={handleShowMore}>Show more</button>} */}
        <div className="flex space-x-2 justify-end">
          {createLabel && createClickHandler && (
            <CButton onClick={createClickHandler} variant={ButtonType.Outlined}>
              <div className="flex justify-center items-center">
                {createLabel}

                <BsArrowUpRightCircle className="text-xl ml-1" />
              </div>
            </CButton>
          )}

          <CButton
            onClick={() => {
              if (isItemIncluded && showItems) {
                addItemHandler(selectedItems, selectedItemsDetail);
                setSelectedItems([]);
              } else {
                addHandler(selectedItems, selectedItemsDetail);
                setSelectedItems([]);
              }
            }}
            variant={ButtonType.Primary}
            disabled={selectedItems.length === 0}
          >
            <div className="flex justify-center items-center">
              {addLabel}

              <IoIosAddCircleOutline className="text-xl ml-1" />
            </div>
          </CButton>
        </div>
      </div>
    </ReusableModal>
  );
};

export default AddFormDropdown;
