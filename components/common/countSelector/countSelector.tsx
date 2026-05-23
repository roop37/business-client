import React, { useEffect, useState } from "react";
import {
    IoIosAddCircleOutline,
    IoIosRemoveCircleOutline,
} from "react-icons/io";

interface CountSelectorProps {
  title: string;
  initialValue: number;
  onCountChange: (count: number) => void;
}

const CountSelector: React.FC<CountSelectorProps> = ({
  title,
  initialValue,
  onCountChange,
}) => {
  const [count, setCount] = useState(initialValue);
  const [isLimited, setIsLimited] = useState(false);

  const handleCountChange = (increment: number) => {
    const newCount = count + increment;
    setCount(newCount);
    onCountChange(newCount);
  };
  useEffect(() => {
    setCount(initialValue);
  }, [initialValue]);

  return (
    <div className="w-full">
      <div className="flex bg-white border items-center py-3 rounded-xl px-3 justify-between">
        <span className="text-left font-medium text-gray-700">{title}</span>
        <div className="flex space-x-3">
          <div
            className={`text-2xl hover:text-primary ${
              (count <= 0 || isLimited) && "text-gray-300 hover:text-gray-200"
            } cursor-pointer`}
          >
            <IoIosRemoveCircleOutline
              onClick={() => {
                if (count <= 0 || isLimited) {
                  return;
                } else {
                  handleCountChange(-1);
                }
              }}
            />
          </div>
          <span className={`${!isLimited ? "text-black " : " text-gray-400"}`}>
            {count}
          </span>

          <div className="text-2xl hover:text-primary cursor-pointer">
            <IoIosAddCircleOutline onClick={() => handleCountChange(1)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountSelector;
