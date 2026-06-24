import {
  Condition,
  ConditionGroup,
  CUSTOM_CAMPAIGN_QUERY_FIELDS,
} from "@/components/modules/campaignOnboarding/customFilterBuilder";
import { ChartConfig } from "@/components/ui/chart";
import {
  CouponUsageType,
  CustomCampaignFilter,
  CustomEmailTargetType,
  Day,
  FilterDataEnum,
  Order,
  OrderStatus,
  PermissionTypeEnum,
  PromoDiscountType,
  ReportsTypeEnum,
  ResCustomConditionGroupInput,
  ResCustomConditionInput,
  ResCustomConnectorEnum,
  ResCustomFieldValueEnum,
  ResCustomOperatorEnum,
  HostEmailCampaignStatusEnum,
  RowsPerPageEnum,
  UserStatus,
} from "@/generated/graphql";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

export const formatWebsiteUrlClickable = (url: string) => {
  if (!url.match(/^https?:\/\//i)) {
    return `https://${url}`;
  }
  return url;
};

// errorUtils.ts

export const extractErrorMessage = (error: any): string => {
  if (
    error instanceof TypeError &&
    /failed to fetch|network/i.test(error.message)
  ) {
    return "Unable to reach Hoizr right now. Please check your connection and try again.";
  }
  const errorJson = JSON.parse(JSON.stringify(error));
  if (
    errorJson &&
    errorJson.response &&
    errorJson.response.errors &&
    errorJson.response.errors[0].message
  ) {
    return errorJson.response.errors[0].message
      .toString()
      .replace("Error: ", "");
  } else {
    const message = error?.message?.toString?.() || error?.toString?.() || "";
    if (/failed to fetch|network/i.test(message)) {
      return "Unable to reach Hoizr right now. Please check your connection and try again.";
    }
    return message || "Something went wrong. Please try again.";
  }
};

//Price Round Off

export const roundOffPrice = (price: number) => {
  return price;
  // const decimalPart = price % 1;

  // if (decimalPart === 0) {
  //   return price;
  // } else if (decimalPart < 0.5) {
  //   return Math.floor(price) + 0.49;
  // } else {
  //   return Math.floor(price) + 0.99;
  // }
};

// CHECK FOR VALID NAME

export const isValidNameAlphabetic = (name: string) => {
  const regex = /^[a-zA-Z0-9\s-]+$/;
  return regex.test(name);
};

// GENERATE DUPLICATE NAMES FOR MENU BUILDER

export const generateUniqueName = (baseName: string): string => {
  const nameWithoutSuffix = baseName.replace(/\s*-copy(\d*)\s*$/, "").trim();

  const hasCopySuffix = /-copy(\d*)$/.test(baseName);

  if (!hasCopySuffix) {
    return `${nameWithoutSuffix}-copy`;
  }

  const currentSuffix = (baseName.match(/-copy(\d*)$/) || [])[1];
  const nextSuffix = currentSuffix ? parseInt(currentSuffix, 10) + 1 : 2;

  return `${nameWithoutSuffix}-copy${nextSuffix}`;
};

// HIDE/HASH PERSONAL INFORMATION

export const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  return local.replace(/.(?=.{3})/g, "*") + "@" + domain;
};

export const maskNumber = (phone: string) => {
  return phone.replace(/\d(?=\d{4})/g, "*");
};

// export const maskEIN = (ein: string) => {
//   return ein.replace(/\d{4}$/, "****");
// };

export const formatSelectedItemPerPage = (
  selectedItemPerPage: RowsPerPageEnum
): number => {
  switch (selectedItemPerPage) {
    case RowsPerPageEnum.Ten:
      return 10;
    case RowsPerPageEnum.Thirty:
      return 30;
    case RowsPerPageEnum.Fifty:
      return 50;
    default:
      return 10; // Default value
  }
};

export const getPageSizeNumber = (pageSize: RowsPerPageEnum) => {
  switch (pageSize) {
    case RowsPerPageEnum.Ten:
      return 10;
    case RowsPerPageEnum.Thirty:
      return 30;
    case RowsPerPageEnum.Fifty:
      return 50;

    default:
      return 10;
  }
};

export const getPageSizeEnum = (size: number) => {
  switch (size) {
    case 10:
      return RowsPerPageEnum.Ten;
    case 30:
      return RowsPerPageEnum.Thirty;
    case 50:
      return RowsPerPageEnum.Fifty;

    default:
      return RowsPerPageEnum.Ten;
  }
};

export const formatUserStatus = (status: UserStatus): string => {
  switch (status) {
    case UserStatus.Active:
      return "Active";
    case UserStatus.Blocked:
      return "Blocked";
    case UserStatus.InternalVerificationPending:
      return "Internal Verification Pending";
    case UserStatus.OnboardingPending:
      return "Onboarding Pending";

    case UserStatus.RestaurantOnboardingPending:
      return "Host Onboarding Pending";
    case UserStatus.SubUserEmailVerificationPending:
      return "Email Verification Pending";

    default:
      return "";
  }
};

export const formatUserRole = (role: string): string => {
  switch (String(role)) {
    case "OWNER":
    case "Owner":
    case "owner":
      return "Owner";
    case "Staff":
    case "STAFF":
    case "staff":
      return "Staff";
    case "MANAGER":
    case "Manager":
    case "manager":
      return "Manager";
    case "MARKETING":
    case "Marketing":
    case "marketing":
    case "marketingPartner":
      return "Marketing";

    default:
      return String(role || "");
  }
};

export const sanitizeText = (text: string): string => {
  let sanitizedText = "";
  if (text) {
    sanitizedText = text.trim();
  }

  return sanitizedText;
};

export function calculateOrderTotal(order: Order): number {
  const discountAmount = order.appliedDiscount?.discountAmount ?? 0;
  const platformFeePercent = order.platformFeePercent ?? 0;
  const subTotalAmount = order.subTotal ?? 0;
  // Calculate Gross Amount
  const grossAmount = order.grossAmount ?? 0;
  const calculateOnSubtotal = discountAmount > subTotalAmount;

  // Calculate Platform Fee
  const platformFeeBase = calculateOnSubtotal ? subTotalAmount : grossAmount;
  const platformFee = (platformFeePercent / 100) * platformFeeBase;

  // Calculate Taxes and Other Charges
  const taxBase = calculateOnSubtotal ? subTotalAmount : grossAmount;
  const taxAmount = (taxBase * order.taxPercent) / 100;
  const tipAmount = ((order.tipPercent ?? 0) / 100) * subTotalAmount;
  const deliveryAmount = order.deliveryAmount ?? 0;

  // Calculate Final Amount
  const finalAmount =
    formatNumberToMax2(grossAmount) +
    formatNumberToMax2(taxAmount) +
    formatNumberToMax2(tipAmount) +
    formatNumberToMax2(platformFee) +
    formatNumberToMax2(deliveryAmount);
  return finalAmount;
}

export const getClickableUrlLink = (link: string) => {
  return link.startsWith("http://") || link.startsWith("https://")
    ? link
    : `https://${link}`;
};

/**
 * Formats a number to a maximum of 2 decimal places.
 * If the value is not a valid number, it returns 0.00.
 * @param value - The number to be formatted
 * @returns - The formatted number as a float
 */
export const formatNumberToMax2 = (value: number): number => {
  if (isNaN(value)) {
    return 0;
  }
  return parseFloat(value.toFixed(2));
};

export const parseHtmlWithValues = (
  html: string,
  values: Record<string, string>,
  keysToReplace: string[]
) => {
  // Create a Set of keys to replace for quick lookup
  const replaceKeys = new Set(keysToReplace);

  // Use regex to find placeholders
  return html.replace(/{{(.*?)}}/g, (match, variable) => {
    const trimmedVariable = variable.trim();

    // Check if the variable is in the list to replace
    if (
      replaceKeys.has(trimmedVariable) &&
      values[trimmedVariable] !== undefined
    ) {
      return values[trimmedVariable];
    }

    // If not replacing, return the placeholder as-is
    return match;
  });
};

export function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
  const innerRef = useRef<T>(null);

  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(innerRef.current);
    } else {
      ref.current = innerRef.current;
    }
  });

  return innerRef;
}

export const areObjectsEqual = <T extends Record<string, any>>(
  obj1: T,
  obj2: T
): boolean => {
  // Check if both objects have the same keys
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if every key in obj1 has the same value in obj2
  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (key === "domainConfig") continue;

    // Check if values are objects or arrays, recursively compare
    if (Array.isArray(val1) && Array.isArray(val2)) {
      if (val1.length !== val2.length) {
        return false;
      }
      for (let i = 0; i < val1.length; i++) {
        if (typeof val1[i] === "object" && typeof val2[i] === "object") {
          if (!areObjectsEqual(val1[i], val2[i])) {
            return false;
          }
        } else if (val1[i] !== val2[i]) {
          return false;
        }
      }
    } else if (
      typeof val1 === "object" &&
      typeof val2 === "object" &&
      val1 !== null &&
      val2 !== null
    ) {
      if (!areObjectsEqual(val1, val2)) {
        return false;
      }
    } else if (val1 !== val2) {
      return false;
    }
  }

  return true;
};

/**
 * Calculates start and end dates based on a given MetricsDataRange
 * @param range MetricsDataRange enum value
 * @returns Object containing start and end dates
 */

interface DateRange {
  start: Date;
  end: Date;
}

export const formatFilterOperation = (value: FilterDataEnum) => {
  switch (value) {
    case FilterDataEnum.Contains:
      return "Contains";
    case FilterDataEnum.Equals:
      return "Equals";
    case FilterDataEnum.NotEquals:
      return "Not Equals";
    // case FilterDataEnum.InArray:
    //   return "In List";
    // case FilterDataEnum.NotInArray:
    //   return "Not In List";
    case FilterDataEnum.GreaterThan:
      return "Greater Than";
    case FilterDataEnum.LessThan:
      return "Less Than";
    default:
      return "";
  }
};

export const formatReportType = (value: string) => {
  const c = value as ReportsTypeEnum;
  switch (c) {
    case ReportsTypeEnum.CategoryItemReport:
      return "Category & Item Report";
    case ReportsTypeEnum.DiscountSummaryReport:
      return "Discount Summary Report";
    case ReportsTypeEnum.FailedOrdersReport:
      return "Order (Failed & Processing)";
    case ReportsTypeEnum.LtvReport:
      return "Lifetime Value Report";
    case ReportsTypeEnum.OrdersReport:
      return "Orders Report";
    case ReportsTypeEnum.PaymentReport:
      return "Payment Report";
    case ReportsTypeEnum.SalesReport:
      return "Sales Report";
    case ReportsTypeEnum.TaxReport:
      return "Tax Report";
    case ReportsTypeEnum.SalesSummaryReport:
      return "Sales Summary Report";
    case ReportsTypeEnum.SalesTrend:
      return "Sales Trend";
    case ReportsTypeEnum.CustomerReport:
      return "Customer Report";
    case ReportsTypeEnum.MarketingSummary:
      return "Marketing Summary";
    case ReportsTypeEnum.ModifierReport:
      return "Modifier Report";
    case ReportsTypeEnum.RefundReport:
      return "Refund Report";
    case ReportsTypeEnum.WebsiteSummary:
      return "Website Summary";
    case ReportsTypeEnum.RefundLoyaltyReport:
      return "Refund Loyalty Report";
    case ReportsTypeEnum.MenuReport:
      return "Menu Report";
    case ReportsTypeEnum.WebsiteVisitSummary:
      return "Marketing Analytics Report";
    case ReportsTypeEnum.PayoutReport:
      return "Payout Report";
    case ReportsTypeEnum.MonthlyReport:
      return "Monthly Performance Report";
    case ReportsTypeEnum.CampaignReport:
      return "Campaign Report";
    case ReportsTypeEnum.FeedBackReport:
      return "Feedback Report";

    default:
      return "";
  }
};
/**
 * Derive the DISPLAY status of an event from its stored status + dates. A
 * PUBLISHED event whose window contains "now" shows as "Ongoing"; one whose end
 * has passed shows "Completed" even if the cron hasn't flipped it yet. Anything
 * else returns the raw status untouched. Pure (caller passes `now` or defaults).
 */
export const eventDisplayStatus = (
  status?: string | null,
  startDate?: string | Date | null,
  endDate?: string | Date | null,
  now: Date = new Date()
): string => {
  const raw = String(status ?? "").trim();
  if (!/^published$/i.test(raw)) return raw || "Draft";
  const t = now.getTime();
  const s = startDate ? new Date(startDate).getTime() : NaN;
  const e = endDate ? new Date(endDate).getTime() : NaN;
  if (!Number.isNaN(e) && t > e) return "Completed";
  if (!Number.isNaN(s) && t >= s && (Number.isNaN(e) || t <= e)) return "Ongoing";
  return raw; // Published (upcoming)
};

export const formatOrderStatus = (value: string) => {
  const c = value as OrderStatus;
  switch (c) {
    case OrderStatus.CancelledFullRefund:
      return "Cancelled with full refund";
    case OrderStatus.CancelledPartialRefund:
      return "Partially refunded";
    case OrderStatus.Fulfilled:
      return "Order Fulfilled";
    case OrderStatus.Placed:
      return "Order Placed";
    case OrderStatus.Processing:
      return "Order Processing";
    case OrderStatus.Scheduled:
      return "Order Scheduled";
    case OrderStatus.CancelledLoyaltyRefund:
      return "Loyalty Points Refunded";
    case OrderStatus.Failed:
      return "Order Failed";

    default:
      return "";
  }
};

export const formatCouponUsageType = (value: CouponUsageType) => {
  switch (value) {
    case CouponUsageType.EntireSale:
      return "Entire Sale";
    case CouponUsageType.SpecificCategory:
      return "Specific Categories";
    case CouponUsageType.SpecificItem:
      return "Specific Items";
    case CouponUsageType.DeliveryOrder:
      return "Delivery Order";
    case CouponUsageType.FirstSignedOrder:
      return "First Order (Registered User)";

    default:
      return "";
  }
};
export const formatPromoDIscountType = (value: PromoDiscountType) => {
  switch (value) {
    case PromoDiscountType.FixedAmount:
      return "Fixed Amount";
    case PromoDiscountType.Free:
      return "Free (Entire Cart)";
    case PromoDiscountType.FreeDelivery:
      return "Free Delivery";
    case PromoDiscountType.Item:
      return "Free Item";
    case PromoDiscountType.Percentage:
      return "Percentage";

    default:
      return "";
  }
};

// CHART FORMATTER FOR REPORTDATA
interface ChartItem {
  key: string;
  value: number | string;
}

interface ChartDataItem {
  itemData: ChartItem[];
}

interface APIChartData {
  xAxisKey: string;
  yAxisKeys: string[];
  chartData: ChartDataItem[];
}

export const formatChartData = (apiChartData: APIChartData) => {
  const { xAxisKey, yAxisKeys, chartData } = apiChartData;

  // Transform the chart data into the required format
  const formattedData = chartData.map((item) => {
    const dataPoint: Record<string, any> = {};

    // Process each item's data
    item.itemData.forEach((dataItem) => {
      if (dataItem.key === xAxisKey) {
        // Convert timestamp to date string if needed
        dataPoint[dataItem.key] = format(new Date(dataItem.value), "MMM dd");
      } else {
        dataPoint[dataItem.key] = dataItem.value;
      }
    });
    return dataPoint;
  });

  // Generate dynamic chart config
  const chartConfig: Record<string, any> = {
    [xAxisKey]: {
      label: formatLabel(xAxisKey),
    },
  };

  yAxisKeys.forEach((key, index) => {
    chartConfig[key] = {
      label: formatLabel(key),
      color: index === 0 ? "hsl(217, 91%, 60%)" : "hsl(201, 96%, 32%)",
    };
  });

  return {
    chartData: formattedData,
    chartConfig: chartConfig as ChartConfig,
    yAxisKeys,
  };
};

// Helper function to format labels
const formatLabel = (key: string): string => {
  return key
    .split(/(?=[A-Z])|_/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatResEmailTarget = (value: string) => {
  const c = value as CustomEmailTargetType;
  switch (c) {
    case CustomEmailTargetType.AllCustomer:
      return "All Attendees";
    case CustomEmailTargetType.Csv:
      return "CSV";
    case CustomEmailTargetType.CustomCustomer:
      return "Custom Audience";
    case CustomEmailTargetType.EventSpecific:
      return "Event Attendees";

    default:
      return "";
  }
};

export const formatResEmailFilters = (value: string) => {
  const c = value as CustomCampaignFilter;
  switch (c) {
    case CustomCampaignFilter.Active:
      return "Active Customers";
    case CustomCampaignFilter.Dormant:
      return "Dormant Customers";
    case CustomCampaignFilter.NewCustomers:
      return "New Customers";
    case CustomCampaignFilter.Repeat:
      return "Repeat Customers";
    case CustomCampaignFilter.TopSpenders:
      return "Top Spending Customers";
    case CustomCampaignFilter.Male:
      return "Male";
    case CustomCampaignFilter.Female:
      return "Female";
    case CustomCampaignFilter.Other:
      return "Other";

    default:
      return "";
  }
};

export const formatHostEmailStatus = (value: string) => {
  const c = value as HostEmailCampaignStatusEnum;
  switch (c) {
    case HostEmailCampaignStatusEnum.Completed:
      return "Completed";
    case HostEmailCampaignStatusEnum.Failed:
      return "Failed";
    case HostEmailCampaignStatusEnum.Processing:
      return "Processing";
    case HostEmailCampaignStatusEnum.Scheduled:
      return "Scheduled";
    case HostEmailCampaignStatusEnum.Draft:
      return "Draft";
    default:
      return "";
  }
};

export const formatPermissionType = (type: PermissionTypeEnum) => {
  switch (String(type)) {
    case "UpdateHost":
    case "UpdateOrganization":
    case "UpdateBusiness":
      return "Update Host";
    case "Dashboard":
      return "Dashboard";
    case "Marketing":
      return "Campaigns";
    case "Rewards":
      return "Rewards & Loyalty";
    case "Offers":
      return "Offers & Promotions";
    case "Orders":
      return "Ticket Sales";
    case "Customers":
      return "Customers Management";
    case "TeamManagement":
    case "UserManagement":
      return "Team Management";
    case "PayoutManagement":
    case "PaymentManagement":
      return "Payout Management";
    case "Events":
      return "Events";
    case "Tickets":
      return "Tickets";
    case "Reports":
      return "View Reports";
    case "DownloadReports":
      return "Download Reports";
    default:
      return String(type);
  }
};

export const base64Encode = (str: Buffer) => {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export const formatDateToReportObject = (date: Date | null) => {
  if (!date) return null;
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
};

export const convertCustomFilterToInput = (
  group: ConditionGroup
): ResCustomConditionGroupInput => {
  const convertCondition = (condition: Condition): ResCustomConditionInput => {
    const fieldType =
      CUSTOM_CAMPAIGN_QUERY_FIELDS.find((f) => f.value === condition.field)
        ?.type ?? "string";

    const input: ResCustomConditionInput = {
      field: condition.field as ResCustomFieldValueEnum,
      fieldType,
      operator: condition.operator as ResCustomOperatorEnum,
    };

    // Set the appropriate value field based on the field type
    switch (fieldType) {
      case "number":
        input.numberValue = Number(condition.value);
        break;
      case "boolean":
        input.booleanValue = Boolean(condition.value);
        break;
      default:
        input.stringValue = String(condition.value);
    }

    return input;
  };

  // const convertGroup = (
  //   group: ConditionGroup
  // ): ResCustomConditionGroupInput => ({
  //   connector: group.connector as ResCustomConnectorEnum,
  //   items: group.items.map((item) =>
  //     "type" in item && item.type === "group"
  //       ? convertGroup(item as ConditionGroup)
  //       : convertCondition(item as Condition)
  //   ) as ResCustomConditionInput[],
  // });

  const convertGroup = (
    group: ConditionGroup
  ): ResCustomConditionGroupInput => ({
    connector: group.connector as ResCustomConnectorEnum,
    items: group.items.map((item) => ({
      ...("type" in item && item.type === "group"
        ? { group: convertGroup(item as ConditionGroup) }
        : { condition: convertCondition(item as Condition) }),
    })) as any,
  });

  return convertGroup(group);
};

function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function convertApiCustomFiltersToConditionGroup(
  apiGroup: ResCustomConditionGroupInput
): ConditionGroup {
  const processItem = (
    item: ResCustomConditionInput | ResCustomConditionGroupInput
  ): Condition | ConditionGroup => {
    // Check if it's a condition group
    if ("connector" in item && "items" in item) {
      return {
        id: generateUniqueId("group"),
        type: "group",
        connector: item.connector as ResCustomConnectorEnum,
        items: item.items.map(processItem as any),
      };
    }

    // It's a condition - process field type from client config
    const condition = item as ResCustomConditionInput;
    const fieldConfig = CUSTOM_CAMPAIGN_QUERY_FIELDS.find(
      (f) => f.value === condition.field
    );
    const fieldType = fieldConfig?.type ?? "string";

    let value: string | number | boolean = "";
    let timeUnit: string | undefined;

    // Handle value conversion based on field type and operator
    switch (fieldType) {
      case "number":
        value = condition.numberValue ?? 0;
        break;

      case "boolean":
        value = condition.booleanValue ?? false;
        break;

      case "date":
        const date = condition.dateValue
          ? new Date(condition.dateValue)
          : new Date();
        value = date.toISOString().split("T")[0]; // YYYY-MM-DD format

        break;

      default:
        value = condition.stringValue ?? "";
    }

    return {
      id: generateUniqueId("condition"),
      field: condition.field as ResCustomFieldValueEnum,
      fieldType,
      operator: condition.operator as ResCustomOperatorEnum,
      value,
      timeUnit,
    };
  };

  return {
    id: generateUniqueId("group"),
    type: "group",
    connector: apiGroup.connector as ResCustomConnectorEnum,
    items: apiGroup.items.map(processItem as any),
  };
}

export function isEmailContentValid(design: {
  body: { rows: { columns: { contents: any[] }[] }[] };
}): boolean {
  const rows = design?.body?.rows;
  if (!rows || rows.length === 0) return false;

  for (const row of rows) {
    if (row.columns?.some((col) => col.contents && col.contents.length > 0)) {
      return true;
    }
  }

  return false;
}

export interface AvailabilityDay {
  _id?: string;
  day: Day;
  hours?: {
    start: string;
    end: string;
  }[];
  active: boolean;
}

export const formatAvailabilityDays = (
  availability?: AvailabilityDay[] | null
): string => {
  if (!availability || availability.length === 0) {
    return "Not set";
  }

  // Filter only active days
  const activeDays = availability.filter((day) => day.active);

  if (activeDays.length === 0) {
    return "Not available";
  }

  // Define day order for proper sorting
  const dayOrder = [
    Day.Monday,
    Day.Tuesday,
    Day.Wednesday,
    Day.Thursday,
    Day.Friday,
    Day.Saturday,
    Day.Sunday,
  ];

  // Sort active days according to week order
  const sortedActiveDays = activeDays
    .map((day) => day.day.toLowerCase())
    .sort((a, b) => dayOrder.indexOf(a as Day) - dayOrder.indexOf(b as Day));

  // Check for all days (7 days)
  if (sortedActiveDays.length === 7) {
    return "All days";
  }

  // Check for weekend (Saturday and Sunday only)
  const weekendDays = ["saturday", "sunday"];
  if (
    sortedActiveDays.length === 2 &&
    sortedActiveDays.every((day) => weekendDays.includes(day))
  ) {
    return "Weekend";
  }

  // Check for weekdays (Monday to Friday only)
  const weekdaysList = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  if (
    sortedActiveDays.length === 5 &&
    sortedActiveDays.every((day) => weekdaysList.includes(day))
  ) {
    return "Weekdays";
  }

  // For single day
  if (sortedActiveDays.length === 1) {
    return capitalize(sortedActiveDays[0]);
  }

  // For multiple specific days, format as comma-separated list
  const capitalizedDays = sortedActiveDays.map((day) => capitalize(day));

  return capitalizedDays.join(", ");
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
