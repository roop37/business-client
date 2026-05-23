"use client";

interface ItemBadgesProps {
  items: string[];
}

const ItemBadges: React.FC<ItemBadgesProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }
  return (
    <div>
      <p className="block text-sm font-medium text-left text-gray-700 mb-1">
        {items.length > 1 ? "Items" : "Item"}
      </p>
      <div className=" flex  flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="bg-[#E5F2FF] bg-opacity-10 text-primary text-xs px-3 py-1 rounded-full font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ItemBadges;
