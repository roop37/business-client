import React from 'react'
import { CustomerBehavior, CustomerBehaviorType } from "@/generated/graphql";
import { MdOutlineDelete, MdOutlineEdit } from "react-icons/md";

export const CustomerBehaviourCard: React.FC<{
  redemption: CustomerBehaviorType;
  customerBehaviorAmount: number
  points: number
  onEdit: (
    redemption: CustomerBehavior,   
  ) => void;
  onDelete: (id: string) => void;
  id: string
  rule: CustomerBehavior
}> = ({ redemption,  customerBehaviorAmount, points, onEdit, onDelete, id, rule }) => (
    <div className="shadow-md rounded p-3 hover:bg-gray-50 transition duration-200 relative flex justify-between items-start">
      
    {/* Left side: Details */}
    <div className="flex-1">
      <div className="font-medium">
        Behavior Type: {redemption}
      </div>
      <div className="text-gray-600">
        Amount Threshold: ${customerBehaviorAmount}
      </div>
      <div className="text-gray-600">
        Points Awarded: {points}
      </div>
    </div>

    {/* Right side: Edit and Delete icons */}
    <div className="flex space-x-2">

        <button
          onClick={() => onEdit(rule)}
          className="text-blue-500 hover:text-blue-700"
        //   aria-label={`Edit ${rule.customerBehaviorType} Rule`}
        >
          <MdOutlineEdit className="text-primary" size={18} />
        </button>
      
      { (
        <button
          onClick={() => onDelete(id)}
          className="text-red-500 hover:text-red-700"
          aria-label={`Delete ${redemption} Rule`}
        >
          <MdOutlineDelete className="text-primary" size={18} />
        </button>
      )}
    </div>
  </div>
);
