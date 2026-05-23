"use client";
// Categories Badge Component

interface ModifierGroupProps {
  modifierGroups: string[];
}

const ModifierGroupBadges: React.FC<ModifierGroupProps> = ({ modifierGroups }) => {
  if (!modifierGroups || modifierGroups.length === 0) {
    return null;
  }
  return (
    <div>
      <p className="block text-sm font-medium text-left text-gray-700 mb-1">
        {modifierGroups.length > 1 ? "Modifier Groups" : "Modifier Group"}
      </p>
      <div className=" flex  flex-wrap gap-2">
        {modifierGroups.map((modifierGroup, index) => (
          <span
            key={index}
            className="bg-[#E5F2FF] bg-opacity-10 text-primary text-xs px-3 py-1 rounded-full font-medium"
          >
            {modifierGroup}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ModifierGroupBadges;
