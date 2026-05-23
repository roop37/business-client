import React from "react";
import { FaArrowRight } from "react-icons/fa";

type ScrollableQuickActionCards = {
  list: { id: string; name: string }[];
  onClick: (id: string) => void;
  title: string;
  emptyContentText: string;
};

const ScrollableQuickActionCard: React.FC<ScrollableQuickActionCards> = ({
  list,
  onClick,
  emptyContentText,
  title,
}) => {
  return (
    <div className="bg-white shadow rounded-xl p-4 h-64 col-span-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {list.length === 0 ? (
        <p className="text-center text-gray-600">{emptyContentText}</p>
      ) : (
        <ul className="overflow-y-auto scrollbar-hide h-40">
          {list.map((listItem, index) => (
            <li key={listItem.id} className="mb-2">
              <div
                onClick={() => {
                  onClick(listItem.id);
                }}
                className="block p-4 cursor-pointer transition-all border rounded-xl hover:bg-gray-100 group"
              >
                <div className="flex justify-between items-center text-sm">
                  <span>
                    {index + 1}. Complete {listItem.name} by clicking here.
                  </span>
                  <FaArrowRight className="w-5 h-5 text-primary transition-all group-hover:translate-x-2" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ScrollableQuickActionCard;
