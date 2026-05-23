import React from "react";

import StaticLayout from "@/components/layouts/StaticPageLayout";

type NextPageWithLayout = React.FC & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

const Error: NextPageWithLayout = () => {
  return (
    <div className="w-full  flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <p className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider text-primary mt-8">
          404
        </p>
        <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-600 mt-2">
          Lost Your Way
        </p>
        <p className="md:text-lg xl:text-xl text-gray-500 mt-4">
          {`Looks like you've found the doorway to the great nothing`}
        </p>
      </div>
    </div>
  );
};

Error.getLayout = function getLayout(page: React.ReactNode) {
  return <StaticLayout>{page}</StaticLayout>;
};

export default Error;
