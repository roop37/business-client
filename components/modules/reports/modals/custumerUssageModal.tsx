import React from "react";
import ReusableModal from "@/components/common/modal/modal";

interface CustomerUsageData {
  name?: string;
  email: string;
  phone: string;
  orderDate: Date | string;
  orderId: string;
}

interface CustomerUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerUsageData: CustomerUsageData[];
  discountKey: string;
  discountType: string;
}

const CustomerUsageModal: React.FC<CustomerUsageModalProps> = ({
  isOpen,
  onClose,
  customerUsageData,
  discountKey,
  discountType,
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const modalComments = `${discountKey} • ${discountType} • ${customerUsageData.length} usage(s)`;

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Usage Details"
      comments={modalComments}
      width="xl"
      className="rounded-lg"
    >
      <div className="max-h-[60vh] overflow-y-auto">
        {customerUsageData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No usage data found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerUsageData.map((customer, index) => (
                  <tr
                    key={`${customer.orderId}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name || "Guest User"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{customer.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.orderDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer with Close button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Close
          </button>
        </div>
      </div>
    </ReusableModal>
  );
};

export default CustomerUsageModal;
