interface QuickActionsProps {
  quickActions: { name: string; icon: JSX.Element; link: string }[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ quickActions }) => (
  <div className="bg-white shadow rounded-xl p-4">
    <h2 className="font-semibold mb-4">Quick Actions</h2>
    <ul className="space-y-2">
      {quickActions.map((action) => (
        <li key={action.name} className="hover:scale-105 transition-transform">
          <a
            href={action.link}
            className="flex items-center space-x-3 text-primary text-sm"
          >
            {action.icon}
            <span>{action.name}</span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default QuickActions;
