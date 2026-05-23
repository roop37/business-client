import React from "react";

interface TabItem {
  label: string;
  path: string;
}

interface TabsProps {
  items: TabItem[];
  activeTab: number;
  onTabClick: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ items, activeTab, onTabClick }) => {
  return (
    <div className="flex space-x-2 border-b">
      {items.map((item, index) => (
        <button
          key={index}
          className={`pb-2 px-2 text-sm ${
            index === activeTab
              ? "border-b-2 border-primary text-primary"
              : "text-black"
          }`}
          onClick={() => onTabClick(index)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
