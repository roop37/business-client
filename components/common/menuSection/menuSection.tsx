import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import { SectionContent } from "./interface";

type MenuSectionProps = {
  contentList: SectionContent[];
};

const MenuSection: React.FC<MenuSectionProps> = ({ contentList }) => {
  const [activeId, setActiveId] = useState<string>(contentList[0]?.id || "");

  return (
    <Tabs
      defaultValue={activeId}
      value={activeId}
      onValueChange={setActiveId}
      className="w-full"
    >
      <div className="flex flex-col space-y-4">
        <TabsList className="inline-flex items-center justify-start flex-wrap h-auto space-x-1 w-fit">
          {contentList.map((content) => (
            <TabsTrigger
              key={content.id}
              value={content.id}
              className="data-[state=active]:bg-white data-[state=active]:text-primary"
            >
              {content.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {contentList.map((content) => (
          <TabsContent
            key={content.id}
            value={content.id}
            className="w-full rounded-xl shadow-sm"
          >
            <content.Component />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export default MenuSection;
