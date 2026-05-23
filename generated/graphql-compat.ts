import * as G from "./graphql";

export * from "./graphql";

const legacyEnum = (fallback: Record<string, unknown> = {}) =>
  new Proxy(fallback, {
    get(target, property) {
      if (typeof property === "symbol") return Reflect.get(target, property);
      return property in target ? (target as any)[property] : property;
    },
  }) as any;

export const AddressInfo = legacyEnum({});
export type AddressInfo = any;

export const Admin = legacyEnum({});
export type Admin = any;

export const Business = legacyEnum({});
export type Business = any;

export const Config = legacyEnum({});
export type Config = any;

export const CustomerBehavior = legacyEnum({});
export type CustomerBehavior = any;

export const CustomerBehaviorType = legacyEnum({});
export type CustomerBehaviorType = any;

export const DeliveryZone = legacyEnum({});
export type DeliveryZone = any;

export const DeviceInfo = legacyEnum({});
export type DeviceInfo = any;

export const EdgeDeviceInfo = legacyEnum({});
export type EdgeDeviceInfo = any;

export const Host = legacyEnum({});
export type Host = any;

export const Permission = legacyEnum({});
export type Permission = any;

export const Restaurant = legacyEnum({});
export type Restaurant = any;

export const State = legacyEnum({});
export type State = any;

export const Timezone = legacyEnum({});
export type Timezone = any;

export const Cuisine = legacyEnum({});
export type Cuisine = any;

export const ItemOption = legacyEnum({});
export type ItemOption = any;

export const Order = legacyEnum({});
export type Order = any;

export const ReportsCommonData = legacyEnum({});
export type ReportsCommonData = any;

export const AdminDashboardData = legacyEnum({});
export type AdminDashboardData = any;

export const DetailedMetricTableItem = legacyEnum({});
export type DetailedMetricTableItem = any;

export const PayoutTransactionCustomResponse = legacyEnum({});
export type PayoutTransactionCustomResponse = any;

export const AddCuisineInput = legacyEnum({});
export type AddCuisineInput = any;

export const AddItemOptionInput = legacyEnum({});
export type AddItemOptionInput = any;

export const AddResEmailCampaignInput = legacyEnum({});
export type AddResEmailCampaignInput = any;

export const AddStateInput = legacyEnum({});
export type AddStateInput = any;

export const AddTimezoneInput = legacyEnum({});
export type AddTimezoneInput = any;

export const AvailabilityInput = legacyEnum({});
export type AvailabilityInput = any;

export const BusinessTypeEnum = legacyEnum({});
export type BusinessTypeEnum = any;

export const CancelPayoutInput = legacyEnum({});
export type CancelPayoutInput = any;

export const CustomCampaignFilter = legacyEnum({
  Active: (G as any).HostCampaignAudienceFilter?.Active ?? "Active",
  Dormant: (G as any).HostCampaignAudienceFilter?.Dormant ?? "Dormant",
  NewCustomers:
    (G as any).HostCampaignAudienceFilter?.NewCustomers ?? "NewCustomers",
  Repeat: (G as any).HostCampaignAudienceFilter?.Repeat ?? "Repeat",
  TopSpenders:
    (G as any).HostCampaignAudienceFilter?.TopSpenders ?? "TopSpenders",
  Male: (G as any).HostCampaignAudienceFilter?.Male ?? "Male",
  Female: (G as any).HostCampaignAudienceFilter?.Female ?? "Female",
  Other: (G as any).HostCampaignAudienceFilter?.Other ?? "Other",
});
export type CustomCampaignFilter = any;

export const CustomEmailTargetType = legacyEnum({
  AllCustomer:
    (G as any).HostEmailTargetType?.AllAttendees ?? "AllAttendees",
  AllAttendees:
    (G as any).HostEmailTargetType?.AllAttendees ?? "AllAttendees",
  Csv: (G as any).HostEmailTargetType?.Csv ?? "CSV",
  CSV: (G as any).HostEmailTargetType?.Csv ?? "CSV",
  CustomCustomer:
    (G as any).HostEmailTargetType?.CustomCustomer ?? "CustomCustomer",
  EventSpecific:
    (G as any).HostEmailTargetType?.EventSpecific ?? "EventSpecific",
});
export type CustomEmailTargetType = any;

export const EmailCampaignPublicationStatus = legacyEnum({
  Drafted:
    (G as any).HostEmailCampaignPublicationStatus?.Drafted ?? "Drafted",
  Active: (G as any).HostEmailCampaignPublicationStatus?.Active ?? "Active",
});
export type EmailCampaignPublicationStatus = any;

export const EmailCampaignScheduleTypes = legacyEnum({
  Now: (G as any).HostEmailCampaignScheduleType?.Now ?? "Now",
  Later: (G as any).HostEmailCampaignScheduleType?.Later ?? "Later",
});
export type EmailCampaignScheduleTypes = any;

export const EmailCampaignTargetTypes = CustomEmailTargetType;
export type EmailCampaignTargetTypes = any;

export const EmailCampaignStatusEnum = legacyEnum({
  Draft: (G as any).HostEmailCampaignStatusEnum?.Draft ?? "Draft",
  Processing:
    (G as any).HostEmailCampaignStatusEnum?.Processing ?? "Processing",
  Scheduled:
    (G as any).HostEmailCampaignStatusEnum?.Scheduled ?? "Scheduled",
  Completed:
    (G as any).HostEmailCampaignStatusEnum?.Completed ?? "Completed",
  Failed: (G as any).HostEmailCampaignStatusEnum?.Failed ?? "Failed",
  Success: (G as any).HostEmailCampaignStatusEnum?.Success ?? "Success",
});
export type EmailCampaignStatusEnum = any;

export const HostDetailsInput = legacyEnum({});
export type HostDetailsInput = any;

export const IdentifierTypeEnum = legacyEnum({});
export type IdentifierTypeEnum = any;

export const RestaurantPayoutInput = legacyEnum({});
export type RestaurantPayoutInput = any;

export const RestaurantSubuserInput = legacyEnum({});
export type RestaurantSubuserInput = any;

export const ResCustomConditionGroupInput = legacyEnum({});
export type ResCustomConditionGroupInput = any;

export const ResCustomConditionInput = legacyEnum({});
export type ResCustomConditionInput = any;

export const UpdateDeliveryZoneInput = legacyEnum({});
export type UpdateDeliveryZoneInput = any;

export const UpdateFulfillmentConfigInput = legacyEnum({});
export type UpdateFulfillmentConfigInput = any;

export const UpdateItemOptionInput = legacyEnum({});
export type UpdateItemOptionInput = any;

export const UpdateOnlineOrderTimingConfigInput = legacyEnum({});
export type UpdateOnlineOrderTimingConfigInput = any;

export const UpdateProcessingConfigInput = legacyEnum({});
export type UpdateProcessingConfigInput = any;

export const UpdateResEmailCampaignInput = legacyEnum({});
export type UpdateResEmailCampaignInput = any;

export const UpdateTaxRateInput = legacyEnum({});
export type UpdateTaxRateInput = any;

export const BeverageCategory = legacyEnum({});
export type BeverageCategory = any;

export const ConfigTypeEnum = legacyEnum((G as any).ConfigTypeEnum ?? {});
export type ConfigTypeEnum = any;

export const CouponUsageType = legacyEnum({});
export type CouponUsageType = any;

export const Day = legacyEnum({});
export type Day = any;

export const FoodType = legacyEnum({});
export type FoodType = any;

export const ItemOptionsEnum = legacyEnum({});
export type ItemOptionsEnum = any;

export const MeatType = legacyEnum({});
export type MeatType = any;

export const MetricsDataRange = legacyEnum({});
export type MetricsDataRange = any;

export const MetricsTrendTypeEnum = legacyEnum({});
export type MetricsTrendTypeEnum = any;

export const MetricsValueTypeEnum = legacyEnum({});
export type MetricsValueTypeEnum = any;

export const OrderStatus = legacyEnum({});
export type OrderStatus = any;

export const PayoutRestaurantStatus = legacyEnum({});
export type PayoutRestaurantStatus = any;

export const PermissionTypeEnum = legacyEnum((G as any).PermissionTypeEnum ?? {});
export type PermissionTypeEnum = any;

export const PromoDiscountType = legacyEnum({});
export type PromoDiscountType = any;

export const ReportsTypeEnum = legacyEnum({});
export type ReportsTypeEnum = any;

export const ResCustomConnectorEnum = legacyEnum({});
export type ResCustomConnectorEnum = any;

export const ResCustomFieldValueEnum = legacyEnum({});
export type ResCustomFieldValueEnum = any;

export const ResCustomOperatorEnum = legacyEnum({});
export type ResCustomOperatorEnum = any;

export const RestaurantCategory = legacyEnum({});
export type RestaurantCategory = any;

export const RestaurantEmailCampaignStatusEnum = legacyEnum({});
export type RestaurantEmailCampaignStatusEnum = any;

export const RestaurantStatus = legacyEnum({});
export type RestaurantStatus = any;

export const RestaurantType = legacyEnum({});
export type RestaurantType = any;

export const StatusEnum = legacyEnum({});
export type StatusEnum = any;

export const StripeAccountStatusEnum = legacyEnum({});
export type StripeAccountStatusEnum = any;

export const UserRole = legacyEnum((G as any).UserRole ?? {});
export type UserRole = any;

export const UserStatus = legacyEnum((G as any).UserStatus ?? {});
export type UserStatus = any;

export const WalkthroughStates = legacyEnum({});
export type WalkthroughStates = any;

export const AdminRole = legacyEnum((G as any).AdminRole ?? {});
export type AdminRole = any;

export const ButtonType = legacyEnum({});
export type ButtonType = any;

export const ActivityActionType = legacyEnum((G as any).ActivityActionType ?? {});
export type ActivityActionType = any;

export const CampaignReportData = legacyEnum({});
export type CampaignReportData = any;

export const DashboardAnalyticsData = legacyEnum({});
export type DashboardAnalyticsData = any;

export const DashboardMarketingData = legacyEnum({});
export type DashboardMarketingData = any;

export const DashboardMenuData = legacyEnum({});
export type DashboardMenuData = any;

export const DashboardOverviewData = legacyEnum({});
export type DashboardOverviewData = any;

export const DeliveryProviderEnum = legacyEnum({});
export type DeliveryProviderEnum = any;

export const InvoiceStatusEnum = legacyEnum({});
export type InvoiceStatusEnum = any;

export const OnlineOrderingChecklist = legacyEnum({});
export type OnlineOrderingChecklist = any;

export const OrderType = legacyEnum({});
export type OrderType = any;

export const PayoutStatus = legacyEnum({});
export type PayoutStatus = any;

export const RestaurantDetailsInput = legacyEnum({});
export type RestaurantDetailsInput = any;

export const SalesChartData = legacyEnum({});
export type SalesChartData = any;

export const TrendsReportData = legacyEnum({});
export type TrendsReportData = any;
