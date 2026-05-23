"use client";
// Categories Badge Component

interface CategoriesBadgesProps {
  categories: any[];
}

const CategoriesBadges: React.FC<CategoriesBadgesProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="block text-sm font-medium text-left text-gray-700 mb-1">
        {categories.length > 1 ? "Categories" : "Category"}
      </p>
      <div className=" flex  flex-wrap gap-2">
        {categories.map((category, index) => (
          <span
            key={index}
            className="bg-[#E5F2FF] bg-opacity-10 text-primary text-xs px-3 py-1 rounded-full font-medium"
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CategoriesBadges;
