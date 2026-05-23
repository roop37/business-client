// import React from "react";

// interface AuthScreenSectionProps {
//   title: string;
//   description: string;
//   imageUrl: string;
//   backgroundColor?: string;
// }

// const AuthScreenSection: React.FC<AuthScreenSectionProps> = ({
//   title,
//   description,
//   imageUrl,
//   backgroundColor = "#0f172a", // Darker blue background to match the image
// }) => {
//   return (
//     <div
//       className="hidden lg:block relative h-screen w-full"
//       style={{ backgroundColor }}
//     >
//       <div className="absolute inset-0">
//         <div className="flex flex-col h-full p-8">
//           {/* Text content at the top with exact spacing */}
//           <div className="mt-5">
//             <h2 className="text-3xl font-bold text-white leading-tight">
//               {title}
//             </h2>
//             <p className="max-w-md mt-4 text-base text-gray-400 leading-relaxed">
//               {description}
//             </p>
//           </div>

//           {/* Dashboard image container with precise positioning */}
//           <div className="absolute bottom-0 right-0 w-[90%] max-w-[800px]">
//             <img
//               src={imageUrl}
//               alt="Dashboard Preview"
//               className="w-full h-auto rounded-lg shadow-2xl"
//               style={{
//                 boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthScreenSection;

import Image from "next/image";
import React from "react";

interface AuthScreenSectionProps {
  title?: string;
  description: string;
  imageUrl: string;
  backgroundColor?: string;
  titleTextColor?: string;
  descriptionTextColor?: string;
}

const AuthScreenSection: React.FC<AuthScreenSectionProps> = ({
  title,
  description,
  imageUrl,
  backgroundColor = "#0f172a",
  titleTextColor = "text-white",
  descriptionTextColor = "text-white",
}) => {
  const renderStars = (count: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <span
          key={index}
          className={index < count ? "text-yellow-400" : "text-gray-400"}
        >
          ★
        </span>
      ));
  };

  return (
    <div
      className="hidden lg:block relative h-screen w-full"
      style={{ backgroundColor }}
    >
      <div className="flex flex-col h-full p-8 space-y-8">
        <div className="mt-5">
          {/* <h2
            className={`text-2xl font-semibold ${titleTextColor} leading-tight`}
          >
            {title}
          </h2> */}
          <p
            className={`max-w-full mt-4 text-2xl text-white/80 leading-relaxed`}
          >
            {description}
          </p>
        </div>

        <div className="w-full h-full relative">
          <Image
            src={imageUrl}
            alt="Hoizr auth visual"
            fill
            className="w-full h-full rounded-lg object-cover object-left"
          />
        </div>

        {/* Dashboard image container */}
        {/* <div className="absolute bottom-0 top-0 right-0">
            <div className="w-[50vw] h-full relative">
              <Image
                src={imageUrl}
                alt="Dashboard"
                fill
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div> */}
      </div>
    </div>
  );
};

export default AuthScreenSection;
