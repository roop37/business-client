import React from "react";

type QuickActionsProps = {
  actions: { name: string; link: string; onClick: () => void }[];
};

const QuickActionsDashboard: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="bg-white shadow rounded-xl p-4 h-auto overflow-y-auto scrollbar-hide col-span-2">
      <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
      <ul>
        {actions.map((action, index) => (
          <li key={action.name} className="mb-2">
            <button
              onClick={action.onClick}
              className="text-primary hover:scale-105 transition-all text-sm"
            >
              {action.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickActionsDashboard;
