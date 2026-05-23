import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DataDateRange from "@/components/ui/dateRange";
import { useDashboardMetricStore } from "@/store/dashboardMetric";
import DashboardMarketing from "./marketing/dashboard-marketing";
import DashboardMenu from "./menu/dashboard-menu";
import DashboardOverview from "./overview/overview";
import DashboardAnalytics from "./tracking/dashboard-analytics";

const DashboardMetrics = () => {
  const { selectedMenu, setSelectedMenu } = useDashboardMetricStore();

  const menuOptions = ["Overview", "Website Analytics", "Menu", "Marketing"];

  return (
    <div className="space-y-4">
      {/* Top Menu Section */}
      <div className="flex flex-col justify-start items-start space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <Tabs
          value={selectedMenu}
          onValueChange={(value) => setSelectedMenu(value as any)}
        >
          <TabsList className="flex flex-wrap md:space-x-2">
            {menuOptions.map((option) => (
              <TabsTrigger
                key={option}
                value={option}
                className="data-[state=active]:bg-white data-[state=active]:text-primary"
              >
                {option}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <DataDateRange
          allowCompare={["Overview", "Website Analytics"].includes(
            selectedMenu
          )}
        />
      </div>

      <div className="mt-4">
        {selectedMenu === "Overview" && <DashboardOverview />}
        {selectedMenu === "Website Analytics" && <DashboardAnalytics />}
        {selectedMenu === "Menu" && <DashboardMenu />}
        {selectedMenu === "Marketing" && <DashboardMarketing />}
      </div>
    </div>
  );
};

export default DashboardMetrics;
