import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTimeISO: { input: any; output: any; }
};

export type AccessHistory = {
  __typename?: 'AccessHistory';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  device: DeviceInfo;
};

export type AccountPreference = {
  __typename?: 'AccountPreference';
  email: Scalars['Boolean']['output'];
  sms: Scalars['Boolean']['output'];
  whatsapp: Scalars['Boolean']['output'];
};

export type AccountPreferenceInput = {
  email: Scalars['Boolean']['input'];
  sms: Scalars['Boolean']['input'];
  whatsapp: Scalars['Boolean']['input'];
};

export enum AccountType {
  Current = 'CURRENT',
  Savings = 'SAVINGS'
}

/** Types of actions performed in the system */
export enum ActivityActionType {
  CampaignCreated = 'CAMPAIGN_CREATED',
  CampaignSent = 'CAMPAIGN_SENT',
  CampaignUpdated = 'CAMPAIGN_UPDATED',
  CouponCreated = 'COUPON_CREATED',
  CouponDeleted = 'COUPON_DELETED',
  CouponUpdated = 'COUPON_UPDATED',
  EventCancelled = 'EVENT_CANCELLED',
  EventCreated = 'EVENT_CREATED',
  EventPublished = 'EVENT_PUBLISHED',
  EventUpdated = 'EVENT_UPDATED',
  HostSettingsUpdated = 'HOST_SETTINGS_UPDATED',
  LoyaltySettingsUpdated = 'LOYALTY_SETTINGS_UPDATED',
  OfflinePaymentLinkCreated = 'OFFLINE_PAYMENT_LINK_CREATED',
  OfflineTicketIssued = 'OFFLINE_TICKET_ISSUED',
  PayoutAdded = 'PAYOUT_ADDED',
  PayoutRejected = 'PAYOUT_REJECTED',
  PayoutVerified = 'PAYOUT_VERIFIED',
  PromoCodeUpdated = 'PROMO_CODE_UPDATED',
  TeamUpdated = 'TEAM_UPDATED',
  UserLogin = 'USER_LOGIN',
  UserLogout = 'USER_LOGOUT'
}

export type ActivityLogPaginatedResponse = {
  __typename?: 'ActivityLogPaginatedResponse';
  activityLogs: Array<ActivityLogResponse>;
  total: Scalars['Float']['output'];
};

export type ActivityLogResponse = {
  __typename?: 'ActivityLogResponse';
  _id: Scalars['String']['output'];
  actionType: ActivityActionType;
  createdAt: Scalars['DateTimeISO']['output'];
  description: Scalars['String']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  performedBy: Scalars['String']['output'];
  performedOn: Scalars['String']['output'];
  updatedAt: Scalars['DateTimeISO']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type AddAdminEmailCampaignInput = {
  campaignName: Scalars['String']['input'];
  emailSubject: Scalars['String']['input'];
  emailTemplate: AddAdminEmailTemplateInput;
};

export type AddAdminEmailTemplateInput = {
  content: Scalars['String']['input'];
  designJson: Scalars['String']['input'];
  html: Scalars['String']['input'];
};

export type AddAdminInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  role: AdminRole;
};

export type AddConfigInput = {
  boolVal?: InputMaybe<Scalars['Boolean']['input']>;
  numVal?: InputMaybe<Scalars['Float']['input']>;
  textVal?: InputMaybe<Scalars['String']['input']>;
  type: ConfigTypeEnum;
  valueType: ConfigValueEnum;
};

export type AddEventCategoryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
};

export type AddEventTagInput = {
  category: EventTagCategory;
  clusterKey?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type AddGenreTagInput = {
  value: Scalars['String']['input'];
};

export type AddHostEmailCampaignInput = {
  campaignName: Scalars['String']['input'];
  emailSubject: Scalars['String']['input'];
  emailTemplate: AddHostEmailTemplateInput;
};

export type AddHostEmailTemplateInput = {
  content: Scalars['String']['input'];
  designJson: Scalars['String']['input'];
  html: Scalars['String']['input'];
};

export type AddHostWhatsAppCampaignInput = {
  campaignName: Scalars['String']['input'];
  ctaSlug?: InputMaybe<Scalars['String']['input']>;
  headerMediaUrl?: InputMaybe<Scalars['String']['input']>;
  objectiveTag?: InputMaybe<Scalars['String']['input']>;
  templateId?: InputMaybe<Scalars['String']['input']>;
  templateVariables?: InputMaybe<Array<HostWhatsAppCampaignVariableInput>>;
};

export type AddIndianCityInput = {
  state?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
};

export type AddPayoutInput = {
  accountHolderName: Scalars['String']['input'];
  accountNumber: Scalars['String']['input'];
  accountType: AccountType;
  bankName: Scalars['String']['input'];
  branchName: Scalars['String']['input'];
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  entityName: Scalars['String']['input'];
  entityType: PayoutEntityType;
  gstRegistrationDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  gstRegistrationType?: InputMaybe<GstRegistrationType>;
  gstin?: InputMaybe<Scalars['String']['input']>;
  ifscCode: Scalars['String']['input'];
  isGstRegistered?: InputMaybe<Scalars['Boolean']['input']>;
  panNumber: Scalars['String']['input'];
  registeredBusinessName?: InputMaybe<Scalars['String']['input']>;
  section24DeclarationAccepted?: InputMaybe<Scalars['Boolean']['input']>;
  section24DeclarationVersion?: InputMaybe<Scalars['String']['input']>;
  taxDeductionAccountNumber?: InputMaybe<Scalars['String']['input']>;
  upiId?: InputMaybe<Scalars['String']['input']>;
};

export type AddPermissionInput = {
  isFunction?: Scalars['Boolean']['input'];
  preselect: Array<TeamRole>;
  type: PermissionTypeEnum;
};

export type AddTeamMemberInput = {
  accountPreferences: AccountPreferenceInput;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  permissions: Array<UserPermissionInput>;
  phone: Scalars['String']['input'];
  restaurants: Array<Scalars['String']['input']>;
  role: UserRole;
  teamRole?: InputMaybe<TeamRole>;
};

export type AddWaitListUserInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  number: Scalars['String']['input'];
  restaurantName: Scalars['String']['input'];
  software: SoftWareEnum;
  website: Scalars['String']['input'];
};

export type AddressInfo = {
  __typename?: 'AddressInfo';
  addressLine1?: Maybe<Scalars['String']['output']>;
  addressLine2?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  coordinate?: Maybe<CoordinatePoint>;
  formattedAddress?: Maybe<Scalars['String']['output']>;
  pincode?: Maybe<Scalars['String']['output']>;
  place?: Maybe<PlaceInfo>;
  state?: Maybe<Scalars['String']['output']>;
};

export type AddressInfoInput = {
  addressLine1?: InputMaybe<Scalars['String']['input']>;
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  coordinate?: InputMaybe<CoordinatePointInput>;
  formattedAddress?: InputMaybe<Scalars['String']['input']>;
  pincode?: InputMaybe<Scalars['String']['input']>;
  place?: InputMaybe<PlaceInfoInput>;
  state?: InputMaybe<Scalars['String']['input']>;
};

export type Admin = {
  __typename?: 'Admin';
  _id: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  isDeleted: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  role: AdminRole;
  status: AdminStatus;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type AdminAutomationTemplateView = {
  __typename?: 'AdminAutomationTemplateView';
  channels: Array<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  key: Scalars['String']['output'];
  supportsWhatsApp: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  whatsappTemplateId?: Maybe<Scalars['String']['output']>;
  whatsappTemplateName?: Maybe<Scalars['String']['output']>;
  whatsappTemplateReady: Scalars['Boolean']['output'];
};

/** Multi-select filter chip for admin Custom-target campaigns */
export enum AdminCampaignFilter {
  ArtistAdminVerified = 'ArtistAdminVerified',
  ArtistFollowedByMany = 'ArtistFollowedByMany',
  ArtistInLineupLast30d = 'ArtistInLineupLast30d',
  CityScoped = 'CityScoped',
  CustomerActive = 'CustomerActive',
  CustomerDormant = 'CustomerDormant',
  CustomerFemale = 'CustomerFemale',
  CustomerMale = 'CustomerMale',
  CustomerNew = 'CustomerNew',
  CustomerOther = 'CustomerOther',
  CustomerRepeat = 'CustomerRepeat',
  CustomerTopSpender = 'CustomerTopSpender',
  EmailOptInOnly = 'EmailOptInOnly',
  HostActiveLast30d = 'HostActiveLast30d',
  HostAdminVerified = 'HostAdminVerified',
  HostInactive90d = 'HostInactive90d',
  HostOnboardingPending = 'HostOnboardingPending',
  HostOrganizer = 'HostOrganizer',
  HostPromoter = 'HostPromoter',
  HostTop20 = 'HostTop20',
  HostTop50 = 'HostTop50',
  HostTop100 = 'HostTop100',
  HostVenue = 'HostVenue',
  SourceArtists = 'SourceArtists',
  SourceCustomers = 'SourceCustomers',
  SourceHosts = 'SourceHosts',
  SourceUsers = 'SourceUsers'
}

/** Publication status for admin email campaigns */
export enum AdminCampaignPublicationStatus {
  Active = 'Active',
  Drafted = 'Drafted'
}

/** Schedule type for admin email campaigns */
export enum AdminCampaignScheduleType {
  Later = 'later',
  Now = 'now'
}

/** Processing status of an admin email campaign */
export enum AdminCampaignStatus {
  Completed = 'completed',
  Draft = 'draft',
  Failed = 'failed',
  Processing = 'processing',
  Scheduled = 'scheduled'
}

/** Audience pool for admin email campaigns */
export enum AdminCampaignTargetType {
  AllArtists = 'AllArtists',
  AllCustomers = 'AllCustomers',
  AllHosts = 'AllHosts',
  AllUsers = 'AllUsers',
  Csv = 'CSV',
  Custom = 'Custom'
}

export type AdminCampaignsReport = {
  __typename?: 'AdminCampaignsReport';
  byPeriod: Array<AdminReportMetricRow>;
  byStatus: Array<AdminReportMetricRow>;
  campaignCount: Scalars['Int']['output'];
  clicked: Scalars['Int']['output'];
  converted: Scalars['Int']['output'];
  opened: Scalars['Int']['output'];
  sent: Scalars['Int']['output'];
};

export type AdminCustomersReport = {
  __typename?: 'AdminCustomersReport';
  byPeriod: Array<AdminReportMetricRow>;
  newSignups: Scalars['Int']['output'];
  repeatBuyers: Scalars['Int']['output'];
};

export type AdminDetailField = {
  __typename?: 'AdminDetailField';
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type AdminEmailCampaignStats = {
  __typename?: 'AdminEmailCampaignStats';
  mailsBounced?: Maybe<Scalars['Float']['output']>;
  mailsClicked: Array<AdminEmailStatEntry>;
  mailsDelivered: Scalars['Float']['output'];
  mailsOpened: Array<AdminEmailStatEntry>;
  mailsSent: Scalars['Float']['output'];
};

export type AdminEmailCampaignStatusHistoryItem = {
  __typename?: 'AdminEmailCampaignStatusHistoryItem';
  status: AdminCampaignStatus;
  timestamp?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type AdminEmailCampaignTestInput = {
  emails: Scalars['String']['input'];
  html: Scalars['String']['input'];
  subject: Scalars['String']['input'];
};

export type AdminEmailCampaignsObject = {
  __typename?: 'AdminEmailCampaignsObject';
  _id: Scalars['ID']['output'];
  campaignName?: Maybe<Scalars['String']['output']>;
  cityFilter?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  csvDataUrl?: Maybe<Scalars['String']['output']>;
  ctaLink?: Maybe<Scalars['String']['output']>;
  emailStatus?: Maybe<AdminCampaignPublicationStatus>;
  emailSubject?: Maybe<Scalars['String']['output']>;
  emailTemplate?: Maybe<AdminEmailTemplate>;
  filters?: Maybe<Array<AdminCampaignFilter>>;
  scheduleTime?: Maybe<Scalars['DateTimeISO']['output']>;
  scheduleType?: Maybe<AdminCampaignScheduleType>;
  sentAt?: Maybe<Scalars['DateTimeISO']['output']>;
  stats?: Maybe<AdminEmailCampaignStats>;
  status?: Maybe<AdminCampaignStatus>;
  statusChangeHistory?: Maybe<Array<AdminEmailCampaignStatusHistoryItem>>;
  target?: Maybe<AdminCampaignTargetType>;
  targetCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type AdminEmailCampaignsPaginatedResponse = {
  __typename?: 'AdminEmailCampaignsPaginatedResponse';
  items: Array<AdminEmailCampaignsObject>;
  total: Scalars['Float']['output'];
};

export type AdminEmailStatEntry = {
  __typename?: 'AdminEmailStatEntry';
  date: Scalars['DateTimeISO']['output'];
  email: Scalars['String']['output'];
};

export type AdminEmailTemplate = {
  __typename?: 'AdminEmailTemplate';
  content: Scalars['String']['output'];
  designJson: Scalars['String']['output'];
  html: Scalars['String']['output'];
};

export type AdminEntityDetail = {
  __typename?: 'AdminEntityDetail';
  fields: Array<AdminDetailField>;
  gallery: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  kind: Scalars['String']['output'];
  location?: Maybe<Scalars['String']['output']>;
  subtitle?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type AdminEventUpdateInput = {
  adminPaused?: InputMaybe<Scalars['Boolean']['input']>;
  adminRating?: InputMaybe<Scalars['Float']['input']>;
  eventId: Scalars['String']['input'];
  internalRating?: InputMaybe<Scalars['Float']['input']>;
  isHighDemand?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  popularityRating?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<EventStatus>;
};

export type AdminEventsReport = {
  __typename?: 'AdminEventsReport';
  byCategory: Array<AdminReportMetricRow>;
  byCity: Array<AdminReportMetricRow>;
  byPeriod: Array<AdminReportMetricRow>;
  byStatus: Array<AdminReportMetricRow>;
  cancelledCount: Scalars['Int']['output'];
  createdCount: Scalars['Int']['output'];
  publishedCount: Scalars['Int']['output'];
};

export type AdminFreshnessStatus = {
  __typename?: 'AdminFreshnessStatus';
  /** Last successful receipt/run time when instrumented. */
  lastSuccessAt?: Maybe<Scalars['DateTimeISO']['output']>;
  /** Freshness source name. */
  name: Scalars['String']['output'];
  /** Current freshness status. */
  status: Scalars['String']['output'];
};

export type AdminHealthCheck = {
  __typename?: 'AdminHealthCheck';
  /** Measured latency in milliseconds when relevant. */
  latencyMs?: Maybe<Scalars['Float']['output']>;
  /** Failure or diagnostic message. */
  message?: Maybe<Scalars['String']['output']>;
  /** Health section name. */
  name: Scalars['String']['output'];
  /** Whether the section is healthy. */
  ok: Scalars['Boolean']['output'];
};

export type AdminHostsReport = {
  __typename?: 'AdminHostsReport';
  activeCount: Scalars['Int']['output'];
  byPeriod: Array<AdminReportMetricRow>;
  inactiveCount: Scalars['Int']['output'];
  newJoins: Scalars['Int']['output'];
};

export type AdminKpiDateRangeInput = {
  /** Inclusive start for KPI leaderboards and range-scoped totals. */
  dateFrom: Scalars['DateTimeISO']['input'];
  /** Inclusive end for KPI leaderboards and range-scoped totals. */
  dateTo: Scalars['DateTimeISO']['input'];
};

export type AdminKpis = {
  __typename?: 'AdminKpis';
  /** Currently visible, published, non-paused events. */
  activeEventsCount: Scalars['Int']['output'];
  /** True when served from the 60 second in-memory cache. */
  cached: Scalars['Boolean']['output'];
  /** Timestamp when this KPI payload was generated. */
  generatedAt: Scalars['DateTimeISO']['output'];
  /** GMV from start of the current month until now. */
  gmvThisMonth: Scalars['Float']['output'];
  /** GMV from start of the current ISO week until now. */
  gmvThisWeek: Scalars['Float']['output'];
  /** GMV from start of today until now. */
  gmvToday: Scalars['Float']['output'];
  /** Total net payout amount currently pending. */
  payoutsPending: Scalars['Float']['output'];
  /** Total net payout amount paid today. */
  payoutsProcessedToday: Scalars['Float']['output'];
  /** Tickets sold from start of the current month until now. */
  ticketsSoldThisMonth: Scalars['Int']['output'];
  /** Tickets sold from start of the current ISO week until now. */
  ticketsSoldThisWeek: Scalars['Int']['output'];
  /** Tickets sold from start of today until now. */
  ticketsSoldToday: Scalars['Int']['output'];
  /** Top five events by ticket quantity in the requested range. */
  topEventsByTicketsSold: Array<AdminTopEventKpi>;
  /** Top five hosts by GMV in the requested range. */
  topHostsByGmv: Array<AdminTopHostKpi>;
};

export type AdminLoginVerificationInput = {
  email: Scalars['String']['input'];
  otp: Scalars['String']['input'];
  otpId: Scalars['String']['input'];
};

export type AdminOrderRow = {
  __typename?: 'AdminOrderRow';
  _id: Scalars['String']['output'];
  businessId?: Maybe<Scalars['String']['output']>;
  buyerName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  eventId?: Maybe<Scalars['String']['output']>;
  eventTitle?: Maybe<Scalars['String']['output']>;
  hostName?: Maybe<Scalars['String']['output']>;
  isGuest: Scalars['Boolean']['output'];
  orderStatus: OrderStatus;
  razorpayOrderId?: Maybe<Scalars['String']['output']>;
  ticketCount: Scalars['Int']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type AdminOrdersResponse = {
  __typename?: 'AdminOrdersResponse';
  items: Array<AdminOrderRow>;
  total: Scalars['Int']['output'];
};

export type AdminPaginatedResponse = {
  __typename?: 'AdminPaginatedResponse';
  items: Array<Admin>;
  total: Scalars['Float']['output'];
};

export type AdminPayoutsReport = {
  __typename?: 'AdminPayoutsReport';
  byPeriod: Array<AdminReportMetricRow>;
  byStatus: Array<AdminReportMetricRow>;
  failedTotal: Scalars['Float']['output'];
  pendingTotal: Scalars['Float']['output'];
  settledTotal: Scalars['Float']['output'];
  settlementCount: Scalars['Int']['output'];
};

export type AdminQueueDepth = {
  __typename?: 'AdminQueueDepth';
  /** Active jobs. */
  active: Scalars['Int']['output'];
  /** Completed jobs retained by BullMQ. */
  completed: Scalars['Int']['output'];
  /** Delayed jobs. */
  delayed: Scalars['Int']['output'];
  /** Failed jobs. */
  failed: Scalars['Int']['output'];
  /** BullMQ queue name. */
  name: Scalars['String']['output'];
  /** Waiting jobs. */
  waiting: Scalars['Int']['output'];
};

export type AdminRefundOrderRow = {
  __typename?: 'AdminRefundOrderRow';
  amount: Scalars['Float']['output'];
  capturedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  eventTitle: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  refundState: Scalars['String']['output'];
};

export type AdminReportCsvExportInput = {
  fileName: Scalars['String']['input'];
  filters: AdminReportFilterInput;
};

export type AdminReportFilterInput = {
  dateFrom: Scalars['DateTimeISO']['input'];
  dateTo: Scalars['DateTimeISO']['input'];
  eventId?: InputMaybe<Scalars['String']['input']>;
  hostId?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminReportMetricRow = {
  __typename?: 'AdminReportMetricRow';
  amount?: Maybe<Scalars['Float']['output']>;
  count: Scalars['Int']['output'];
  label: Scalars['String']['output'];
  ticketsSold?: Maybe<Scalars['Int']['output']>;
};

export enum AdminRole {
  Admin = 'ADMIN',
  Master = 'MASTER',
  Normal = 'NORMAL',
  SuperAdmin = 'SUPER_ADMIN'
}

export type AdminSearchResult = {
  __typename?: 'AdminSearchResult';
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  kind: Scalars['String']['output'];
  location?: Maybe<Scalars['String']['output']>;
  subtitle?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export enum AdminStatus {
  Active = 'ACTIVE',
  Blocked = 'BLOCKED'
}

export type AdminSystemHealth = {
  __typename?: 'AdminSystemHealth';
  /** True when served from the 60 second in-memory cache. */
  cached: Scalars['Boolean']['output'];
  /** Cron freshness. Empty until CronHeartbeat instrumentation is approved and added. */
  cronFreshness: Array<AdminFreshnessStatus>;
  /** Timestamp when this health payload was generated. */
  generatedAt: Scalars['DateTimeISO']['output'];
  /** Mongo connection readiness. */
  mongo: AdminHealthCheck;
  /** BullMQ queue depths by active queue. */
  queues: Array<AdminQueueDepth>;
  /** Redis ping status and latency. */
  redis: AdminHealthCheck;
  /** Webhook freshness. Empty until WebhookReceipt instrumentation is approved and added. */
  webhookFreshness: Array<AdminFreshnessStatus>;
};

export type AdminTicketsReport = {
  __typename?: 'AdminTicketsReport';
  byHost: Array<AdminReportMetricRow>;
  byPeriod: Array<AdminReportMetricRow>;
  orderCount: Scalars['Int']['output'];
  refundAmount: Scalars['Float']['output'];
  revenue: Scalars['Float']['output'];
  ticketsSold: Scalars['Int']['output'];
};

export type AdminTopEventKpi = {
  __typename?: 'AdminTopEventKpi';
  /** Event id for the ranked event. */
  eventId: Scalars['String']['output'];
  /** Gross merchandise value in the range. */
  gmv: Scalars['Float']['output'];
  /** Paid/check-in/refunded tickets sold in the range. */
  ticketsSold: Scalars['Int']['output'];
  /** Event title when available. */
  title?: Maybe<Scalars['String']['output']>;
};

export type AdminTopHostKpi = {
  __typename?: 'AdminTopHostKpi';
  /** Gross merchandise value in the range. */
  gmv: Scalars['Float']['output'];
  /** Host id for the ranked host. */
  hostId: Scalars['String']['output'];
  /** Host name when available. */
  name?: Maybe<Scalars['String']['output']>;
  /** Paid/check-in/refunded tickets sold in the range. */
  ticketsSold: Scalars['Int']['output'];
};

export type AiBoost = {
  __typename?: 'AiBoost';
  commissionPct: Scalars['Float']['output'];
  computed?: Maybe<AiBoostComputed>;
  confidenceScore: Scalars['Float']['output'];
  customerViewingMessage?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  extraAmount: Scalars['Float']['output'];
  hoizrAdminSummary?: Maybe<Scalars['String']['output']>;
  howMuchDifferentFromBasicOffer?: Maybe<AiBoostDelta>;
  howMuchDifferentFromCompetitors?: Maybe<AiBoostDelta>;
  label: Scalars['String']['output'];
  marketingCreditAmount?: Maybe<Scalars['Float']['output']>;
  marketingCreditDiscountPct?: Maybe<Scalars['Float']['output']>;
  offerCode: Scalars['String']['output'];
  shortReason?: Maybe<Scalars['String']['output']>;
  totalSavingsForHosts?: Maybe<AiBoostSavings>;
};

export type AiBoostAdminFeedback = {
  __typename?: 'AiBoostAdminFeedback';
  at?: Maybe<Scalars['DateTimeISO']['output']>;
  by?: Maybe<Scalars['String']['output']>;
  isNegative: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
};

export type AiBoostComputed = {
  __typename?: 'AiBoostComputed';
  expectedGrossSales: Scalars['Float']['output'];
  hoizrCommission: Scalars['Float']['output'];
  hoizrEstimatedLoss: Scalars['Float']['output'];
  hoizrNetContribution: Scalars['Float']['output'];
  hostPayout: Scalars['Float']['output'];
};

export type AiBoostDelta = {
  __typename?: 'AiBoostDelta';
  deltaPct: Scalars['Float']['output'];
};

export type AiBoostPaymentInfo = {
  __typename?: 'AiBoostPaymentInfo';
  alreadyPaid: Scalars['Boolean']['output'];
  currency: Scalars['String']['output'];
  eventId: Scalars['String']['output'];
  eventTitle: Scalars['String']['output'];
  hostName: Scalars['String']['output'];
  offerFeeAmount: Scalars['Float']['output'];
  offerFeeGstAmount: Scalars['Float']['output'];
  payableAmount: Scalars['Float']['output'];
};

export type AiBoostRazorpayOrderResponse = {
  __typename?: 'AiBoostRazorpayOrderResponse';
  currency: Scalars['String']['output'];
  offerFeeAmount: Scalars['Float']['output'];
  offerFeeGstAmount: Scalars['Float']['output'];
  payableAmount: Scalars['Float']['output'];
  razorpayKeyId: Scalars['String']['output'];
  razorpayOrderId: Scalars['String']['output'];
  receipt: Scalars['String']['output'];
};

export type AiBoostSavings = {
  __typename?: 'AiBoostSavings';
  value: Scalars['Float']['output'];
};

export type Artist = {
  __typename?: 'Artist';
  _id: Scalars['ID']['output'];
  appleMusicLink?: Maybe<Scalars['String']['output']>;
  authTokenVersion: Scalars['Int']['output'];
  bio?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  coverImage?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  genres?: Maybe<Array<Genre>>;
  instagramLink?: Maybe<Scalars['String']['output']>;
  isAdminVerified: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isTemp: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTimeISO']['output']>;
  lastName: Scalars['String']['output'];
  merchStoreLink?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  profilePhoto?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  soundcloudLink?: Maybe<Scalars['String']['output']>;
  spotifyLink?: Maybe<Scalars['String']['output']>;
  stageName?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status: ArtistStatus;
  tagline?: Maybe<Scalars['String']['output']>;
  totalFollowersCount: Scalars['Int']['output'];
  twitterLink?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  verificationStatus: ArtistVerificationStatus;
  youtubeLink?: Maybe<Scalars['String']['output']>;
};

export type ArtistAuthResult = {
  __typename?: 'ArtistAuthResult';
  artist: Artist;
  isNew: Scalars['Boolean']['output'];
};

export type ArtistDashboardSummary = {
  __typename?: 'ArtistDashboardSummary';
  followersDelta30d: Scalars['Int']['output'];
  lineupThisMonth: Scalars['Int']['output'];
  lineupUpcoming: Scalars['Int']['output'];
  merchRevenue30d: Scalars['Float']['output'];
  merchRevenueLifetime: Scalars['Float']['output'];
  paidMerchOrders30d: Scalars['Int']['output'];
  pendingFulfillments: Scalars['Int']['output'];
  profileCompletenessPct: Scalars['Int']['output'];
  totalFollowers: Scalars['Int']['output'];
};

export type ArtistFollowerCounts = {
  __typename?: 'ArtistFollowerCounts';
  isFollowing: Scalars['Boolean']['output'];
  totalFollowers: Scalars['Int']['output'];
};

export type ArtistGuestlistEventSummary = {
  __typename?: 'ArtistGuestlistEventSummary';
  acceptedCount: Scalars['Int']['output'];
  cap?: Maybe<Scalars['Int']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  eventFlyer?: Maybe<Scalars['String']['output']>;
  eventId: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isHighlighted: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  pendingCount: Scalars['Int']['output'];
  startDate?: Maybe<Scalars['DateTimeISO']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type ArtistLineupEvent = {
  __typename?: 'ArtistLineupEvent';
  city?: Maybe<Scalars['String']['output']>;
  eventFlyer?: Maybe<Scalars['String']['output']>;
  eventId: Scalars['String']['output'];
  guestlistEnabled: Scalars['Boolean']['output'];
  hostName?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTimeISO']['output']>;
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ArtistLink = {
  __typename?: 'ArtistLink';
  _id: Scalars['ID']['output'];
  artistId: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  icon: ArtistLinkIcon;
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  position: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  url: Scalars['String']['output'];
};

export enum ArtistLinkIcon {
  AppleMusic = 'APPLE_MUSIC',
  ContactEmail = 'CONTACT_EMAIL',
  Custom = 'CUSTOM',
  Instagram = 'INSTAGRAM',
  Merch = 'MERCH',
  Soundcloud = 'SOUNDCLOUD',
  Spotify = 'SPOTIFY',
  Tiktok = 'TIKTOK',
  Twitter = 'TWITTER',
  Website = 'WEBSITE',
  Whatsapp = 'WHATSAPP',
  Youtube = 'YOUTUBE'
}

export type ArtistMerch = {
  __typename?: 'ArtistMerch';
  _id: Scalars['ID']['output'];
  artistId: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  currency: MerchCurrency;
  description?: Maybe<Scalars['String']['output']>;
  externalCheckoutUrl?: Maybe<Scalars['String']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  stock?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type ArtistMerchOrder = {
  __typename?: 'ArtistMerchOrder';
  _id: Scalars['ID']['output'];
  artistId: Scalars['String']['output'];
  carrier?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  currency: MerchCurrency;
  customerId: Scalars['String']['output'];
  isDeleted: Scalars['Boolean']['output'];
  itemName: Scalars['String']['output'];
  merchId: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  razorpayOrderId?: Maybe<Scalars['String']['output']>;
  razorpayPaymentId?: Maybe<Scalars['String']['output']>;
  razorpayRefundId?: Maybe<Scalars['String']['output']>;
  razorpaySignature?: Maybe<Scalars['String']['output']>;
  refundAmount?: Maybe<Scalars['Float']['output']>;
  refundedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  shippedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  shippingAddressLine1?: Maybe<Scalars['String']['output']>;
  shippingAddressLine2?: Maybe<Scalars['String']['output']>;
  shippingCity?: Maybe<Scalars['String']['output']>;
  shippingName?: Maybe<Scalars['String']['output']>;
  shippingPhone?: Maybe<Scalars['String']['output']>;
  shippingPincode?: Maybe<Scalars['String']['output']>;
  shippingState?: Maybe<Scalars['String']['output']>;
  status: ArtistMerchOrderStatus;
  totalAmount: Scalars['Float']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
  unitPrice: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export enum ArtistMerchOrderStatus {
  Cancelled = 'CANCELLED',
  Fulfilled = 'FULFILLED',
  PaymentFailed = 'PAYMENT_FAILED',
  PaymentPending = 'PAYMENT_PENDING',
  PaymentSuccess = 'PAYMENT_SUCCESS',
  Refunded = 'REFUNDED'
}

export type ArtistOtpRequestResult = {
  __typename?: 'ArtistOtpRequestResult';
  message?: Maybe<Scalars['String']['output']>;
  otpId: Scalars['String']['output'];
  sent: Scalars['Boolean']['output'];
};

export type ArtistRequestOtpInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
  stageName?: InputMaybe<Scalars['String']['input']>;
};

export type ArtistRequirements = {
  __typename?: 'ArtistRequirements';
  artistType?: Maybe<ArtistType>;
  budget?: Maybe<Scalars['Float']['output']>;
  experience?: Maybe<Scalars['String']['output']>;
  genres?: Maybe<Array<Genre>>;
};

export type ArtistRequirementsInput = {
  artistType?: InputMaybe<ArtistType>;
  budget?: InputMaybe<Scalars['Float']['input']>;
  experience?: InputMaybe<Scalars['String']['input']>;
  genres?: InputMaybe<Array<Genre>>;
};

export type ArtistRider = {
  __typename?: 'ArtistRider';
  _id: Scalars['ID']['output'];
  artistId: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fileType?: Maybe<Scalars['String']['output']>;
  fileUrl?: Maybe<Scalars['String']['output']>;
  isDeleted: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  riderType: RiderType;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export enum ArtistStatus {
  Active = 'ACTIVE',
  Banned = 'BANNED',
  PendingOtp = 'PENDING_OTP',
  PendingProfile = 'PENDING_PROFILE',
  Suspended = 'SUSPENDED'
}

export type ArtistTokenRefreshResponse = {
  __typename?: 'ArtistTokenRefreshResponse';
  success: Scalars['Boolean']['output'];
};

export enum ArtistType {
  Band = 'BAND',
  Dj = 'DJ',
  Duo = 'DUO',
  Instrumentalist = 'INSTRUMENTALIST',
  Other = 'OTHER',
  Solo = 'SOLO',
  Vocalist = 'VOCALIST'
}

export type ArtistUploadSignature = {
  __typename?: 'ArtistUploadSignature';
  apiKey: Scalars['String']['output'];
  cloudName: Scalars['String']['output'];
  folder: Scalars['String']['output'];
  publicId: Scalars['String']['output'];
  signature: Scalars['String']['output'];
  timestamp: Scalars['Float']['output'];
  uploadUrl: Scalars['String']['output'];
};

export enum ArtistVerificationStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Verified = 'VERIFIED'
}

export type ArtistVerifyOtpInput = {
  otp: Scalars['String']['input'];
  otpId: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export enum AudienceAvailability {
  InviteOnly = 'INVITE_ONLY',
  Public = 'PUBLIC'
}

export type AutomationEventBreakdownRow = {
  __typename?: 'AutomationEventBreakdownRow';
  attributedRevenue: Scalars['Float']['output'];
  conversions: Scalars['Int']['output'];
  emailsSent: Scalars['Int']['output'];
  eventId: Scalars['String']['output'];
  eventTitle: Scalars['String']['output'];
  whatsappSent: Scalars['Int']['output'];
};

export type AutomationSuggestion = {
  __typename?: 'AutomationSuggestion';
  _id: Scalars['ID']['output'];
  adminNote?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  hostId: Scalars['String']['output'];
  hostName?: Maybe<Scalars['String']['output']>;
  priority: AutomationSuggestionPriority;
  status: AutomationSuggestionStatus;
  text: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export enum AutomationSuggestionPriority {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export enum AutomationSuggestionStatus {
  Declined = 'DECLINED',
  Done = 'DONE',
  New = 'NEW',
  Planned = 'PLANNED',
  UnderReview = 'UNDER_REVIEW'
}

export type AutomationView = {
  __typename?: 'AutomationView';
  active: Scalars['Boolean']['output'];
  attributedOrders: Scalars['Int']['output'];
  attributedRevenue: Scalars['Float']['output'];
  channels: Array<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  emailEnabled: Scalars['Boolean']['output'];
  freeChannels: Array<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  lastSentAt?: Maybe<Scalars['DateTimeISO']['output']>;
  pushEnabled: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  totalSent: Scalars['Int']['output'];
  whatsappEnabled: Scalars['Boolean']['output'];
};

export type AutomationsResponse = {
  __typename?: 'AutomationsResponse';
  items: Array<AutomationView>;
};

export type ChangeAdminRoleInput = {
  id: Scalars['String']['input'];
  role: AdminRole;
};

export type Config = {
  __typename?: 'Config';
  _id: Scalars['ID']['output'];
  boolVal?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['DateTimeISO']['output'];
  createdBy?: Maybe<Admin>;
  numVal?: Maybe<Scalars['Float']['output']>;
  textVal?: Maybe<Scalars['String']['output']>;
  type: ConfigTypeEnum;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy?: Maybe<Admin>;
  valueType: ConfigValueEnum;
};

/** Master config keys that admins can change at runtime without a deploy. Grouped by domain in declaration order — marketing channel costs → event commission → AI Boost band → upfront-fee gate → platform fees → marketing-credit pricing → Hoizr-side GST → operational → company identity → SAC codes → admin alerts → host marketing tiers. See docs/HOIZR_FINANCE_SOURCE_OF_TRUTH.md §31 for the locked V1 values. */
export enum ConfigTypeEnum {
  /** Comma-separated email addresses that receive internal payout, reconciliation and shortfall alerts. Use a distribution list when more than two admins need notifying. */
  AdminAlertEmails = 'adminAlertEmails',
  /** Sell-through % of paid-ticket capacity required before an AI-Boost upfront fee is actually charged on EXCLUSIVE events. Below this, the upfront is waived at settlement (or refunded if pre-paid) and only the offer commission applies. Locked: 60. */
  AiBoostUpfrontTriggerSellThroughPctExcl = 'aiBoostUpfrontTriggerSellThroughPctExcl',
  /** Same gate as above, for NON-EXCLUSIVE events. The bar is lower because the host can't drive sales on rival platforms — they should only owe the upfront when Hoizr-side sales clear this threshold. Locked: 40. */
  AiBoostUpfrontTriggerSellThroughPctNonExcl = 'aiBoostUpfrontTriggerSellThroughPctNonExcl',
  /** Credits debited per outbound email. 1 credit = ₹1, so this is also the rupee cost per email. Locked: 1. */
  EmailMarketingCost = 'emailMarketingCost',
  /** Hoizr commission percent on exclusive paid events (sold ONLY on Hoizr). Also acts as the ceiling for the AI Boost corridor — the AI can never propose a rate above this. Locked: 4.49. */
  FixedBasicComissionForExclEvent = 'fixedBasicComissionForExclEvent',
  /** Hoizr commission percent on free / guestlist events (no paid tickets). Locked: 0 — no money flow, no commission. */
  FixedBasicComissionForFreeEvent = 'fixedBasicComissionForFreeEvent',
  /** Hoizr commission percent on non-exclusive paid events (sold on Hoizr AND rival platforms). Also acts as the ceiling for the AI Boost corridor. Locked: 8.49. */
  FixedBasicComissionForNonExclEvent = 'fixedBasicComissionForNonExclEvent',
  /** GST percent on the AI Boost upfront fee invoiced to the host. Locked: 18. */
  GstOnAiBoost = 'gstOnAiBoost',
  /** GST percent collected on Hoizr's commission revenue at payout settlement. Locked: 18. */
  GstOnComission = 'gstOnComission',
  /** GST percent on marketing credit purchase, applied to the credit value. Locked: 18. */
  GstOnMarketingCredit = 'gstOnMarketingCredit',
  /** GST percent applied to the customer-facing platform fee. Hoizr remits this to the government. Locked: 18. */
  GstOnPlatformFeeOnEvent = 'gstOnPlatformFeeOnEvent',
  /** Hoizr Pvt Ltd's GSTIN, rendered on every invoice and tax document. Placeholder until Razorpay Rize incorporation completes — replace with the live GSTIN before launch. */
  HoizrGstin = 'hoizrGstin',
  /** Legal entity name rendered on every invoice and ticket PDF (e.g. 'Hoizr Pvt Ltd'). Must match the GSTIN registration exactly. */
  HoizrLegalName = 'hoizrLegalName',
  /** Hoizr's registered office address rendered on every invoice. Plain text, multi-line. Must match the GSTIN registration address. */
  HoizrRegisteredAddress = 'hoizrRegisteredAddress',
  /** Hoizr Pvt Ltd's two-digit GST state code (Maharashtra = 27, Karnataka = 29, etc.). Drives the CGST+SGST vs IGST split on every Hoizr-issued invoice. */
  HoizrStateCode = 'hoizrStateCode',
  /** Public support email rendered on customer invoices, ticket PDFs and order confirmation emails (e.g. 'contact@hoizr.com'). */
  HoizrSupportEmail = 'hoizrSupportEmail',
  /** Cumulative recipients-sent count a GROWING host must hit to graduate to ESTABLISHED tier. Locked: 75000. */
  HostMarketingEstablishedRecipientsThreshold = 'hostMarketingEstablishedRecipientsThreshold',
  /** Cumulative recipients-sent count a STARTER host must hit to graduate to GROWING tier. Locked: 25000. */
  HostMarketingGrowingRecipientsThreshold = 'hostMarketingGrowingRecipientsThreshold',
  /** Customer-base size a NEW host must hit (in their followed-customers list) to graduate to STARTER tier. Locked: 1000. */
  HostMarketingStarterCustomerCount = 'hostMarketingStarterCustomerCount',
  /** Max recipients per marketing campaign for hosts in the ESTABLISHED tier (large customer base, consistent sends). Locked: 200000. Hosts that exceed the next upgrade threshold move to UNLIMITED (no cap). */
  HostMarketingTierEstablishedMaxRecipients = 'hostMarketingTierEstablishedMaxRecipients',
  /** Max recipients per marketing campaign for hosts in the GROWING tier (regular event organisers with proven engagement). Locked: 75000. */
  HostMarketingTierGrowingMaxRecipients = 'hostMarketingTierGrowingMaxRecipients',
  /** Max recipients per marketing campaign for hosts in the NEW tier (just signed up, no track record yet). Locked: 10000. */
  HostMarketingTierNewMaxRecipients = 'hostMarketingTierNewMaxRecipients',
  /** Max recipients per marketing campaign for hosts in the STARTER tier (have demonstrated some customer growth). Locked: 25000. */
  HostMarketingTierStarterMaxRecipients = 'hostMarketingTierStarterMaxRecipients',
  /** Cumulative recipients-sent count an ESTABLISHED host must hit to unlock UNLIMITED tier (no per-campaign recipient cap). Locked: 200000. */
  HostMarketingUnlimitedRecipientsThreshold = 'hostMarketingUnlimitedRecipientsThreshold',
  /** Minimum credits per top-up (i.e. the smallest amount a host can buy in one purchase). Locked: 100 credits (₹100 + GST). */
  MarketingCreditMinimumPerPurchase = 'marketingCreditMinimumPerPurchase',
  /** Paise per marketing credit. 1 credit = ₹1 = 100 paise. Locked: 100 — do not change without a finance review. */
  MarketingCreditValuePaise = 'marketingCreditValuePaise',
  /** FLOOR on the AI-offer commission rate for exclusive paid events — the most aggressive cut the AI may propose. (Despite the historical 'max' name, this is the lower bound.) Locked: 1.89. */
  MaxAiBoostComissionForExclEvent = 'maxAiBoostComissionForExclEvent',
  /** (Legacy name — actually the floor.) Lowest commission the AI may propose for free events. Locked: 0 — irrelevant since free events never see an AI offer. */
  MaxAiBoostComissionForFreeEvent = 'maxAiBoostComissionForFreeEvent',
  /** FLOOR on the AI-offer commission rate for non-exclusive paid events. Locked: 3.89. */
  MaxAiBoostComissionForNonExclEvent = 'maxAiBoostComissionForNonExclEvent',
  /** Outer ceiling on the AI Boost upfront fee in rupees, applied at the EXCLUSIVE / NON-EXCLUSIVE corridor level. Per-template bands scale to event GTV inside this cap. Locked: 500000 (₹5L max). */
  MaxOfferChargeAmount = 'maxOfferChargeAmount',
  /** Floor on the AI Boost upfront fee in rupees. Locked: 0 — the AI may legitimately propose zero upfront for some templates. */
  MinOfferChargeAmount = 'minOfferChargeAmount',
  /** Customer-facing platform fee percent, charged on top of the ticket taxable value at checkout. Locked: 5. */
  PlatformFeeOnEvent = 'platformFeeOnEvent',
  /** Platform fee percent added to marketing credit top-ups (in addition to GST). Locked: 0 — SortMyScene parity, only GST is added. */
  PlatformFeeOnMarketingCredit = 'platformFeeOnMarketingCredit',
  /** Credits debited per push notification. Locked: 0 — push is free for hosts on Hoizr. */
  PushNotificationCost = 'pushNotificationCost',
  /** Number of working days after event end during which customers can still request a refund. Payouts to the host are blocked from releasing until this window closes. Locked: 2. */
  RefundWindowDaysAfterEvent = 'refundWindowDaysAfterEvent',
  /** SAC code printed on the AI Boost upfront-fee invoice issued to the host. CA confirms before launch. */
  SacAiBoost = 'sacAiBoost',
  /** SAC code printed on the host commission invoice. Defaults align with platform-service SAC; CA confirms before launch. */
  SacCommissionInvoice = 'sacCommissionInvoice',
  /** SAC code printed on the customer booking-fee invoice. SortMyScene uses 9997 — CA confirms the final code before launch. */
  SacCustomerPlatformFee = 'sacCustomerPlatformFee',
  /** SAC code printed on the host's ticket receipt (issued under the host's own GSTIN, not Hoizr's). CA confirms before launch. */
  SacHostTicketReceipt = 'sacHostTicketReceipt',
  /** SAC code printed on the marketing-credit top-up invoice issued to the host. CA confirms before launch. */
  SacMarketingCredit = 'sacMarketingCredit',
  /** Credits debited per outbound SMS. Locked: 0.2 (₹0.20 per SMS). */
  SmsMarketingCost = 'smsMarketingCost',
  /** Credits debited per outbound WhatsApp message. Locked: 0.5 (₹0.50 per WhatsApp). */
  WhatsappMarketingCost = 'whatsappMarketingCost'
}

/** Storage type for a Config row's value. Pick TEXT for strings (GSTIN, emails, SAC codes), NUMBER for percentages and rupee amounts, BOOLEAN for on/off flags. */
export enum ConfigValueEnum {
  /** True / false toggle. Use for feature flags (e.g. tdsEnabled, tcsEnabled, creditExpiryEnabled). */
  Boolean = 'BOOLEAN',
  /** Numeric value (integer or decimal). Use for fee percentages, GST rates, rupee floors/ceilings, day counts. */
  Number = 'NUMBER',
  /** Free-form string. Use for GSTIN, email addresses, SAC codes, state codes, legal names — anything that isn't a number or boolean. */
  Text = 'TEXT'
}

export type CoordinatePoint = {
  __typename?: 'CoordinatePoint';
  coordinates: Array<Scalars['Float']['output']>;
  type: Scalars['String']['output'];
};

export type CoordinatePointInput = {
  coordinates: Array<Scalars['Float']['input']>;
  type: Scalars['String']['input'];
};

export type Coupon = {
  __typename?: 'Coupon';
  _id: Scalars['ID']['output'];
  applicableDays?: Maybe<Array<Day>>;
  applicableTickets?: Maybe<Array<Scalars['String']['output']>>;
  code: Scalars['String']['output'];
  couponUsageSalesLimit?: Maybe<Scalars['Float']['output']>;
  couponUsageType: CouponUsageType;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  discountValue?: Maybe<Scalars['Float']['output']>;
  endDate: Scalars['DateTimeISO']['output'];
  eventId?: Maybe<Scalars['String']['output']>;
  host: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  maxUsage?: Maybe<Scalars['Int']['output']>;
  maxUsagePerCustomer?: Maybe<Scalars['Int']['output']>;
  minCartValue?: Maybe<Scalars['Float']['output']>;
  promoCodeDiscountType: PromoDiscountType;
  showToCustomers: Scalars['Boolean']['output'];
  startDate: Scalars['DateTimeISO']['output'];
  totalSalesUsed: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  uptoAmount?: Maybe<Scalars['Float']['output']>;
  usage: Array<CouponUsage>;
};

export type CouponUsage = {
  __typename?: 'CouponUsage';
  customer?: Maybe<Scalars['String']['output']>;
  discountApplied?: Maybe<Scalars['Float']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  saleAmount?: Maybe<Scalars['Float']['output']>;
  usedAt: Scalars['DateTimeISO']['output'];
};

export enum CouponUsageType {
  EntireSale = 'EntireSale',
  FirstSignedOrder = 'FirstSignedOrder'
}

export type CouponsPaginatedResponse = {
  __typename?: 'CouponsPaginatedResponse';
  items: Array<Coupon>;
  total: Scalars['Int']['output'];
};

export enum CoverType {
  CoverWithoutDrink = 'COVER_WITHOUT_DRINK',
  CoverWithDrink = 'COVER_WITH_DRINK',
  DrinkCover = 'DRINK_COVER',
  FoodAndDrinkCover = 'FOOD_AND_DRINK_COVER',
  FoodCover = 'FOOD_COVER',
  FullCover = 'FULL_COVER',
  NoCover = 'NO_COVER'
}

export type CreateArtistLinkInput = {
  icon?: InputMaybe<ArtistLinkIcon>;
  label: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type CreateArtistMerchInput = {
  currency?: InputMaybe<MerchCurrency>;
  description?: InputMaybe<Scalars['String']['input']>;
  externalCheckoutUrl?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  stock?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateArtistRiderInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fileType?: InputMaybe<Scalars['String']['input']>;
  fileUrl?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  riderType: RiderType;
  title: Scalars['String']['input'];
};

export type CreateCouponInput = {
  applicableDays?: InputMaybe<Array<Day>>;
  applicableTickets?: InputMaybe<Array<Scalars['String']['input']>>;
  code: Scalars['String']['input'];
  couponUsageSalesLimit?: InputMaybe<Scalars['Float']['input']>;
  couponUsageType?: InputMaybe<CouponUsageType>;
  description?: InputMaybe<Scalars['String']['input']>;
  discountValue?: InputMaybe<Scalars['Float']['input']>;
  endDate: Scalars['DateTimeISO']['input'];
  eventId?: InputMaybe<Scalars['String']['input']>;
  maxUsage?: InputMaybe<Scalars['Int']['input']>;
  maxUsagePerCustomer?: InputMaybe<Scalars['Int']['input']>;
  minCartValue?: InputMaybe<Scalars['Float']['input']>;
  promoCodeDiscountType: PromoDiscountType;
  showToCustomers?: InputMaybe<Scalars['Boolean']['input']>;
  startDate: Scalars['DateTimeISO']['input'];
  uptoAmount?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateEventInput = {
  eventType?: InputMaybe<Array<EventType>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateHostInput = {
  address?: InputMaybe<LegacyAddressInfoInput>;
  averageEventSize?: InputMaybe<Scalars['String']['input']>;
  businessRegistrationNumber?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  forceNew?: InputMaybe<Scalars['Boolean']['input']>;
  gallery?: InputMaybe<Array<Scalars['String']['input']>>;
  gstNumber?: InputMaybe<Scalars['String']['input']>;
  hostType?: InputMaybe<HostType>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  venueType?: InputMaybe<Scalars['String']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CreateHostPushCampaignInput = {
  campaignName: Scalars['String']['input'];
  csvDataUrl?: InputMaybe<Scalars['String']['input']>;
  deepLink?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<HostCampaignAudienceFilter>>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  pushBody: Scalars['String']['input'];
  pushTitle: Scalars['String']['input'];
  scheduleTime?: InputMaybe<Scalars['DateTimeISO']['input']>;
  scheduleType?: InputMaybe<HostPushCampaignScheduleType>;
  target?: InputMaybe<HostEmailTargetType>;
};

export type CreateMyWhatsAppTemplateInput = {
  bodyText: Scalars['String']['input'];
  buttonLabel?: InputMaybe<Scalars['String']['input']>;
  buttonPhone?: InputMaybe<Scalars['String']['input']>;
  buttonType: WhatsAppTemplateButtonType;
  buttonUrl?: InputMaybe<Scalars['String']['input']>;
  category: WhatsAppTemplateCategory;
  description?: InputMaybe<Scalars['String']['input']>;
  footerText?: InputMaybe<Scalars['String']['input']>;
  headerSampleMediaUrl?: InputMaybe<Scalars['String']['input']>;
  headerText?: InputMaybe<Scalars['String']['input']>;
  headerType: WhatsAppTemplateHeaderType;
  language?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  slugHint?: InputMaybe<Scalars['String']['input']>;
  variables?: InputMaybe<Array<WhatsAppTemplateVariableInput>>;
};

export type CreateScannerInput = {
  email: Scalars['String']['input'];
  eventId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  scannerName?: InputMaybe<Scalars['String']['input']>;
  scannerType?: InputMaybe<Scalars['String']['input']>;
};

export type CreateWhatsAppTemplateInput = {
  bodyText: Scalars['String']['input'];
  buttonLabel?: InputMaybe<Scalars['String']['input']>;
  buttonPhone?: InputMaybe<Scalars['String']['input']>;
  buttonType: WhatsAppTemplateButtonType;
  buttonUrl?: InputMaybe<Scalars['String']['input']>;
  category: WhatsAppTemplateCategory;
  description?: InputMaybe<Scalars['String']['input']>;
  footerText?: InputMaybe<Scalars['String']['input']>;
  headerSampleMediaUrl?: InputMaybe<Scalars['String']['input']>;
  headerText?: InputMaybe<Scalars['String']['input']>;
  headerType: WhatsAppTemplateHeaderType;
  internalOnly?: InputMaybe<Scalars['Boolean']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  variables?: InputMaybe<Array<WhatsAppTemplateVariableInput>>;
};

export type CsvExportInput = {
  fileName: Scalars['String']['input'];
  selectedRows?: InputMaybe<Array<Scalars['String']['input']>>;
};

export enum Day {
  Friday = 'Friday',
  Monday = 'Monday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
  Thursday = 'Thursday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday'
}

export type DeviceInfo = {
  __typename?: 'DeviceInfo';
  _id: Scalars['ID']['output'];
  deviceName: Scalars['String']['output'];
  deviceOS: Scalars['String']['output'];
  type: Scalars['String']['output'];
  uniqueId: Scalars['String']['output'];
};

export type EndedUnpaidEvent = {
  __typename?: 'EndedUnpaidEvent';
  endDate?: Maybe<Scalars['DateTimeISO']['output']>;
  eventId: Scalars['String']['output'];
  hostId: Scalars['String']['output'];
  hostName?: Maybe<Scalars['String']['output']>;
  netPayoutAmount?: Maybe<Scalars['Float']['output']>;
  settlementId?: Maybe<Scalars['String']['output']>;
  settlementStatus?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export enum EntryAgeBand {
  Age_13Plus = 'AGE_13_PLUS',
  Age_16Plus = 'AGE_16_PLUS',
  Age_18Plus = 'AGE_18_PLUS',
  Age_21Plus = 'AGE_21_PLUS',
  Age_25Plus = 'AGE_25_PLUS',
  AllAges = 'ALL_AGES'
}

export type Event = {
  __typename?: 'Event';
  _id: Scalars['ID']['output'];
  adminPaused?: Maybe<Scalars['Boolean']['output']>;
  adminRating?: Maybe<Scalars['Float']['output']>;
  aiBoostFeePaidAt?: Maybe<Scalars['DateTimeISO']['output']>;
  aiBoostRazorpayOrderId?: Maybe<Scalars['String']['output']>;
  aiBoostRazorpayPaymentId?: Maybe<Scalars['String']['output']>;
  aiEvalAdminSummary?: Maybe<Scalars['String']['output']>;
  aiEvalRanAt?: Maybe<Scalars['DateTimeISO']['output']>;
  aiEvalSnapshot?: Maybe<Scalars['String']['output']>;
  aiPricingOptions?: Maybe<Array<EventPricingSnapshot>>;
  aiSelectedCommissionPct?: Maybe<Scalars['Float']['output']>;
  aiSelectedExtraAmount?: Maybe<Scalars['Float']['output']>;
  aiSelectedMarketingCreditAmount?: Maybe<Scalars['Float']['output']>;
  aiSelectedMarketingCreditDiscountPct?: Maybe<Scalars['Float']['output']>;
  aiSelectedUpfrontTriggerSellThroughPct?: Maybe<Scalars['Float']['output']>;
  aiShortSummary?: Maybe<Scalars['String']['output']>;
  allowWalkIns?: Maybe<Scalars['Boolean']['output']>;
  artistRequirements?: Maybe<ArtistRequirements>;
  assignedTagIds?: Maybe<Array<Scalars['String']['output']>>;
  audienceAvailability?: Maybe<AudienceAvailability>;
  autoConfirmBookings?: Maybe<Scalars['Boolean']['output']>;
  cancellationPolicy?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  cityId?: Maybe<Scalars['String']['output']>;
  collaboratorToBeAnnounced?: Maybe<Scalars['Boolean']['output']>;
  contactForQueriesTables?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  days?: Maybe<Array<EventDay>>;
  description?: Maybe<Scalars['String']['output']>;
  draftedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  endDate?: Maybe<Scalars['DateTimeISO']['output']>;
  eventCategoryId?: Maybe<Scalars['String']['output']>;
  eventCollaborationBusiness?: Maybe<Array<EventBusinessPartner>>;
  eventFlyer?: Maybe<Scalars['String']['output']>;
  eventGuide?: Maybe<EventGuide>;
  eventInstructions?: Maybe<Array<Scalars['String']['output']>>;
  eventLocationDecided?: Maybe<Scalars['Boolean']['output']>;
  eventScore?: Maybe<Scalars['Float']['output']>;
  eventType?: Maybe<Array<EventType>>;
  expectedAudience?: Maybe<Scalars['Float']['output']>;
  expectedEventsDoneTillNow?: Maybe<Scalars['Float']['output']>;
  extras?: Maybe<Array<HoizrExtra>>;
  faqs?: Maybe<Array<EventFaq>>;
  feeSettlementMode?: Maybe<EventFeeSettlementMode>;
  firstSaleAt?: Maybe<Scalars['DateTimeISO']['output']>;
  firstStepCompleted: Scalars['Boolean']['output'];
  gallery?: Maybe<Array<EventGalleryItem>>;
  genreTagIds?: Maybe<Array<Scalars['String']['output']>>;
  genresPreferred?: Maybe<Array<Genre>>;
  guestlistAutoAccept?: Maybe<Scalars['Boolean']['output']>;
  guestlistEnabled?: Maybe<Scalars['Boolean']['output']>;
  horizontalFlyer?: Maybe<Scalars['String']['output']>;
  horizontalVideo?: Maybe<Scalars['String']['output']>;
  hostId: Scalars['String']['output'];
  instagramPost?: Maybe<Scalars['String']['output']>;
  instagramStory?: Maybe<Scalars['String']['output']>;
  internalRating?: Maybe<Scalars['Float']['output']>;
  isComingSoon?: Maybe<Scalars['Boolean']['output']>;
  isDeleted: Scalars['Boolean']['output'];
  isHighDemand?: Maybe<Scalars['Boolean']['output']>;
  isVisible?: Maybe<Scalars['Boolean']['output']>;
  lastSaleAt?: Maybe<Scalars['DateTimeISO']['output']>;
  lineUpToBeAnnounced?: Maybe<Scalars['Boolean']['output']>;
  lineup?: Maybe<Array<EventLineupArtist>>;
  location?: Maybe<AddressInfo>;
  lookingForArtist?: Maybe<Scalars['Boolean']['output']>;
  markSeparateDays?: Maybe<Scalars['Boolean']['output']>;
  maxCapacity?: Maybe<Scalars['Float']['output']>;
  offerDescription?: Maybe<Scalars['String']['output']>;
  paymentMethods?: Maybe<Array<Scalars['String']['output']>>;
  payoutProfile?: Maybe<Scalars['String']['output']>;
  payoutProfileId?: Maybe<Scalars['String']['output']>;
  popularityRating?: Maybe<Scalars['Float']['output']>;
  pricingSelectedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  pricingSnapshot?: Maybe<EventPricingSnapshot>;
  prohibitedItems?: Maybe<Array<Scalars['String']['output']>>;
  publishedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  refundPolicy?: Maybe<Scalars['String']['output']>;
  requiresIDVerification?: Maybe<Scalars['Boolean']['output']>;
  selectedAiBoostCode?: Maybe<Scalars['String']['output']>;
  selectedAiBoostGenerationId?: Maybe<Scalars['String']['output']>;
  selectedPricingPlan?: Maybe<EventPricingPlan>;
  seoSuggestions?: Maybe<Array<EventSeoSuggestion>>;
  showOffer?: Maybe<Scalars['Boolean']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  spellingMistakes?: Maybe<Array<EventSpellingMistake>>;
  startDate?: Maybe<Scalars['DateTimeISO']['output']>;
  status: EventStatus;
  tableLayoutImage?: Maybe<Scalars['String']['output']>;
  ticketSalesEndDate?: Maybe<Scalars['DateTimeISO']['output']>;
  ticketSalesStartDate?: Maybe<Scalars['DateTimeISO']['output']>;
  ticketingEnabled?: Maybe<Scalars['Boolean']['output']>;
  ticketingTerms?: Maybe<Scalars['String']['output']>;
  tickets?: Maybe<Array<EventTicket>>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  verticalVideo?: Maybe<Scalars['String']['output']>;
  videoSneakPeek?: Maybe<Scalars['String']['output']>;
};

export type EventArtistSearchResult = {
  __typename?: 'EventArtistSearchResult';
  artistLinkId?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  instagramLink?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  picture?: Maybe<Scalars['String']['output']>;
  source: Scalars['String']['output'];
  spotifyLink?: Maybe<Scalars['String']['output']>;
  tempArtistId?: Maybe<Scalars['String']['output']>;
  youtubeLink?: Maybe<Scalars['String']['output']>;
};

export type EventBusinessPartner = {
  __typename?: 'EventBusinessPartner';
  allowIssuingOfflineTickets?: Maybe<Scalars['Boolean']['output']>;
  businessLinkId?: Maybe<Scalars['String']['output']>;
  canCreateOffers?: Maybe<Scalars['Boolean']['output']>;
  canRunCampaigns?: Maybe<Scalars['Boolean']['output']>;
  canSeeMetrics?: Maybe<Scalars['Boolean']['output']>;
  collaborationStatus?: Maybe<EventCollabStatus>;
  createdBy?: Maybe<Scalars['String']['output']>;
  customerListShared?: Maybe<Scalars['Boolean']['output']>;
  hideOnEventPage?: Maybe<Scalars['Boolean']['output']>;
  invitedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  requestCustomerListAccess?: Maybe<Scalars['Boolean']['output']>;
  respondedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  sendTransactionalMails?: Maybe<Scalars['Boolean']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type EventBusinessPartnerInput = {
  allowIssuingOfflineTickets?: InputMaybe<Scalars['Boolean']['input']>;
  businessLinkId?: InputMaybe<Scalars['String']['input']>;
  canCreateOffers?: InputMaybe<Scalars['Boolean']['input']>;
  canRunCampaigns?: InputMaybe<Scalars['Boolean']['input']>;
  canSeeMetrics?: InputMaybe<Scalars['Boolean']['input']>;
  customerListShared?: InputMaybe<Scalars['Boolean']['input']>;
  hideOnEventPage?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  requestCustomerListAccess?: InputMaybe<Scalars['Boolean']['input']>;
  sendTransactionalMails?: InputMaybe<Scalars['Boolean']['input']>;
};

export type EventCategory = {
  __typename?: 'EventCategory';
  _id: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Admin>;
  description?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Admin>;
  value: Scalars['String']['output'];
};

export enum EventCollabStatus {
  Confirmed = 'CONFIRMED',
  Declined = 'DECLINED',
  Invited = 'INVITED'
}

export type EventCustomerRow = {
  __typename?: 'EventCustomerRow';
  checkedInOrders: Scalars['Int']['output'];
  customerId: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  isGuest: Scalars['Boolean']['output'];
  lastPurchaseAt?: Maybe<Scalars['DateTimeISO']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  orderCount: Scalars['Int']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  ticketCount: Scalars['Int']['output'];
  totalSpent: Scalars['Float']['output'];
};

export type EventCustomersResponse = {
  __typename?: 'EventCustomersResponse';
  items: Array<EventCustomerRow>;
  total: Scalars['Int']['output'];
};

export type EventDay = {
  __typename?: 'EventDay';
  dayId: Scalars['String']['output'];
  endDate: Scalars['DateTimeISO']['output'];
  startDate: Scalars['DateTimeISO']['output'];
  title: Scalars['String']['output'];
};

export type EventDayInput = {
  dayId?: InputMaybe<Scalars['String']['input']>;
  endDate: Scalars['DateTimeISO']['input'];
  startDate: Scalars['DateTimeISO']['input'];
  title: Scalars['String']['input'];
};

export type EventEvalResultView = {
  __typename?: 'EventEvalResultView';
  aiEvalAdminSummary: Scalars['String']['output'];
  aiShortSummary: Scalars['String']['output'];
  assignedTagIds: Array<Scalars['String']['output']>;
  eventScore: Scalars['Float']['output'];
  expectedAudience?: Maybe<Scalars['Int']['output']>;
  ranThroughAi: Scalars['Boolean']['output'];
  seoSuggestions: Array<EventSeoSuggestion>;
  spellingMistakes: Array<EventSpellingMistake>;
  suggestedDescription?: Maybe<Scalars['String']['output']>;
};

export type EventFaq = {
  __typename?: 'EventFAQ';
  answer: Scalars['String']['output'];
  question: Scalars['String']['output'];
};

export type EventFaqInput = {
  answer: Scalars['String']['input'];
  question: Scalars['String']['input'];
};

export enum EventFeeSettlementMode {
  DeductFromPayout = 'DEDUCT_FROM_PAYOUT',
  PayAfterEvent = 'PAY_AFTER_EVENT'
}

export type EventGalleryItem = {
  __typename?: 'EventGalleryItem';
  type: EventGalleryItemType;
  url: Scalars['String']['output'];
};

export type EventGalleryItemInput = {
  type: EventGalleryItemType;
  url: Scalars['String']['input'];
};

export enum EventGalleryItemType {
  Image = 'IMAGE',
  Video = 'VIDEO'
}

export type EventGuestlistSettingsInput = {
  eventId: Scalars['String']['input'];
  guestlistAutoAccept: Scalars['Boolean']['input'];
  guestlistEnabled: Scalars['Boolean']['input'];
};

export type EventGuide = {
  __typename?: 'EventGuide';
  gatesOpenBeforeEvent?: Maybe<Scalars['Boolean']['output']>;
  gatesOpenLeadHours?: Maybe<Scalars['Float']['output']>;
  gatesOpenLeadMinutes?: Maybe<Scalars['Float']['output']>;
  kidFriendly?: Maybe<KidFriendlyPolicy>;
  languageIds?: Maybe<Array<Scalars['String']['output']>>;
  minimumEntryAge?: Maybe<EntryAgeBand>;
  paidEntryAge?: Maybe<EntryAgeBand>;
  petFriendly?: Maybe<PetFriendlyPolicy>;
  seatingArrangement?: Maybe<SeatingArrangement>;
  venueLayout?: Maybe<VenueLayout>;
  youtubeLink?: Maybe<Scalars['String']['output']>;
};

export type EventGuideInput = {
  gatesOpenBeforeEvent?: InputMaybe<Scalars['Boolean']['input']>;
  gatesOpenLeadHours?: InputMaybe<Scalars['Float']['input']>;
  gatesOpenLeadMinutes?: InputMaybe<Scalars['Float']['input']>;
  kidFriendly?: InputMaybe<KidFriendlyPolicy>;
  languageIds?: InputMaybe<Array<Scalars['String']['input']>>;
  minimumEntryAge?: InputMaybe<EntryAgeBand>;
  paidEntryAge?: InputMaybe<EntryAgeBand>;
  petFriendly?: InputMaybe<PetFriendlyPolicy>;
  seatingArrangement?: InputMaybe<SeatingArrangement>;
  venueLayout?: InputMaybe<VenueLayout>;
  youtubeLink?: InputMaybe<Scalars['String']['input']>;
};

export type EventInput = {
  allowWalkIns?: InputMaybe<Scalars['Boolean']['input']>;
  artistRequirements?: InputMaybe<ArtistRequirementsInput>;
  audienceAvailability?: InputMaybe<AudienceAvailability>;
  autoConfirmBookings?: InputMaybe<Scalars['Boolean']['input']>;
  cancellationPolicy?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  cityId?: InputMaybe<Scalars['String']['input']>;
  collaboratorToBeAnnounced?: InputMaybe<Scalars['Boolean']['input']>;
  contactForQueriesTables?: InputMaybe<Scalars['String']['input']>;
  days?: InputMaybe<Array<EventDayInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  eventCategoryId?: InputMaybe<Scalars['String']['input']>;
  eventCollaborationBusiness?: InputMaybe<Array<EventBusinessPartnerInput>>;
  eventFlyer?: InputMaybe<Scalars['String']['input']>;
  eventGuide?: InputMaybe<EventGuideInput>;
  eventInstructions?: InputMaybe<Array<Scalars['String']['input']>>;
  eventLocationDecided?: InputMaybe<Scalars['Boolean']['input']>;
  eventType?: InputMaybe<Array<EventType>>;
  expectedEventsDoneTillNow?: InputMaybe<Scalars['Float']['input']>;
  extras?: InputMaybe<Array<HoizrExtraInput>>;
  faqs?: InputMaybe<Array<EventFaqInput>>;
  gallery?: InputMaybe<Array<EventGalleryItemInput>>;
  genreTagIds?: InputMaybe<Array<Scalars['String']['input']>>;
  horizontalFlyer?: InputMaybe<Scalars['String']['input']>;
  horizontalVideo?: InputMaybe<Scalars['String']['input']>;
  instagramPost?: InputMaybe<Scalars['String']['input']>;
  instagramStory?: InputMaybe<Scalars['String']['input']>;
  isComingSoon?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  lineUpToBeAnnounced?: InputMaybe<Scalars['Boolean']['input']>;
  lineup?: InputMaybe<Array<EventLineupArtistInput>>;
  location?: InputMaybe<AddressInfoInput>;
  lookingForArtist?: InputMaybe<Scalars['Boolean']['input']>;
  markSeparateDays?: InputMaybe<Scalars['Boolean']['input']>;
  maxCapacity?: InputMaybe<Scalars['Float']['input']>;
  offerDescription?: InputMaybe<Scalars['String']['input']>;
  paymentMethods?: InputMaybe<Array<Scalars['String']['input']>>;
  payoutProfile?: InputMaybe<Scalars['String']['input']>;
  payoutProfileId?: InputMaybe<Scalars['String']['input']>;
  prohibitedItems?: InputMaybe<Array<Scalars['String']['input']>>;
  refundPolicy?: InputMaybe<Scalars['String']['input']>;
  requiresIDVerification?: InputMaybe<Scalars['Boolean']['input']>;
  showOffer?: InputMaybe<Scalars['Boolean']['input']>;
  startDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  status?: InputMaybe<EventStatus>;
  tableLayoutImage?: InputMaybe<Scalars['String']['input']>;
  ticketSalesEndDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  ticketSalesStartDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  ticketingEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  ticketingTerms?: InputMaybe<Scalars['String']['input']>;
  tickets?: InputMaybe<Array<EventTicketInput>>;
  title?: InputMaybe<Scalars['String']['input']>;
  verticalVideo?: InputMaybe<Scalars['String']['input']>;
  videoSneakPeek?: InputMaybe<Scalars['String']['input']>;
};

export type EventLineupArtist = {
  __typename?: 'EventLineupArtist';
  artistLinkId?: Maybe<Scalars['String']['output']>;
  instagramLink?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  picture?: Maybe<Scalars['String']['output']>;
  respondedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  spotifyLink?: Maybe<Scalars['String']['output']>;
  status?: Maybe<EventLineupArtistStatus>;
  tempArtistId?: Maybe<Scalars['String']['output']>;
  youtubeLink?: Maybe<Scalars['String']['output']>;
};

export type EventLineupArtistInput = {
  artistLinkId?: InputMaybe<Scalars['String']['input']>;
  instagramLink?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  picture?: InputMaybe<Scalars['String']['input']>;
  spotifyLink?: InputMaybe<Scalars['String']['input']>;
  tempArtistId?: InputMaybe<Scalars['String']['input']>;
  youtubeLink?: InputMaybe<Scalars['String']['input']>;
};

export enum EventLineupArtistStatus {
  Accepted = 'ACCEPTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type EventManageCollaborator = {
  __typename?: 'EventManageCollaborator';
  allowIssuingOfflineTickets?: Maybe<Scalars['Boolean']['output']>;
  businessLinkId?: Maybe<Scalars['String']['output']>;
  canCreateOffers?: Maybe<Scalars['Boolean']['output']>;
  canRunCampaigns?: Maybe<Scalars['Boolean']['output']>;
  canSeeMetrics?: Maybe<Scalars['Boolean']['output']>;
  collaborationStatus?: Maybe<Scalars['String']['output']>;
  customerListShared?: Maybe<Scalars['Boolean']['output']>;
  hideOnEventPage?: Maybe<Scalars['Boolean']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  requestCustomerListAccess?: Maybe<Scalars['Boolean']['output']>;
  sendTransactionalMails?: Maybe<Scalars['Boolean']['output']>;
};

export type EventManageOverview = {
  __typename?: 'EventManageOverview';
  _id: Scalars['String']['output'];
  canAccessCustomerList?: Maybe<Scalars['Boolean']['output']>;
  canCreateOffers?: Maybe<Scalars['Boolean']['output']>;
  canRunCampaigns?: Maybe<Scalars['Boolean']['output']>;
  canSeeMetrics?: Maybe<Scalars['Boolean']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  collaborators?: Maybe<Array<EventManageCollaborator>>;
  endDate?: Maybe<Scalars['DateTimeISO']['output']>;
  eventFlyer?: Maybe<Scalars['String']['output']>;
  feeSettlementMode?: Maybe<EventFeeSettlementMode>;
  guestlistAutoAccept: Scalars['Boolean']['output'];
  guestlistEnabled: Scalars['Boolean']['output'];
  isCollaboratorView?: Maybe<Scalars['Boolean']['output']>;
  isVisible: Scalars['Boolean']['output'];
  pricingOptions?: Maybe<Array<EventManageOverviewPricingOption>>;
  pricingSnapshot?: Maybe<EventManageOverviewPricingOption>;
  scannersCount: Scalars['Int']['output'];
  selectedAiBoostCode?: Maybe<Scalars['String']['output']>;
  selectedCommissionRate?: Maybe<Scalars['Float']['output']>;
  selectedPricingPlan?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTimeISO']['output']>;
  status: EventStatus;
  ticketingEnabled: Scalars['Boolean']['output'];
  tickets: Array<EventManageTicketRow>;
  title?: Maybe<Scalars['String']['output']>;
  totals: TicketTotals;
  viewerTeamRole?: Maybe<TeamRole>;
};

export type EventManageOverviewPricingOption = {
  __typename?: 'EventManageOverviewPricingOption';
  badge?: Maybe<Scalars['String']['output']>;
  commissionRate?: Maybe<Scalars['Float']['output']>;
  customerPlatformFeeRate?: Maybe<Scalars['Float']['output']>;
  expectedGrossSales?: Maybe<Scalars['Float']['output']>;
  expectedPaidTickets?: Maybe<Scalars['Float']['output']>;
  hoizrGrossRevenue?: Maybe<Scalars['Float']['output']>;
  hoizrNetContribution?: Maybe<Scalars['Float']['output']>;
  hostPayout?: Maybe<Scalars['Float']['output']>;
  label: Scalars['String']['output'];
  opsBuffer?: Maybe<Scalars['Float']['output']>;
  optionId: Scalars['String']['output'];
  paymentGatewayCost?: Maybe<Scalars['Float']['output']>;
  payoutCycleDaysMax?: Maybe<Scalars['Float']['output']>;
  payoutCycleDaysMin?: Maybe<Scalars['Float']['output']>;
  plan?: Maybe<Scalars['String']['output']>;
  riskTier?: Maybe<EventPricingRiskTier>;
  upfrontFee?: Maybe<Scalars['Float']['output']>;
};

export type EventManageTicketRow = {
  __typename?: 'EventManageTicketRow';
  _id: Scalars['String']['output'];
  ticketCapacity: Scalars['Int']['output'];
  ticketName: Scalars['String']['output'];
  ticketPrice: Scalars['Float']['output'];
  ticketSold: Scalars['Int']['output'];
  ticketVisible?: Maybe<Scalars['Boolean']['output']>;
};

export type EventOfferGeneration = {
  __typename?: 'EventOfferGeneration';
  _id: Scalars['ID']['output'];
  adminFeedback?: Maybe<AiBoostAdminFeedback>;
  completionTokens?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  event?: Maybe<OfferGenerationEventSummary>;
  eventId: Scalars['String']['output'];
  generationContextJson?: Maybe<Scalars['String']['output']>;
  host?: Maybe<OfferGenerationHostSummary>;
  hostId: Scalars['String']['output'];
  isDeleted: Scalars['Boolean']['output'];
  modelName?: Maybe<Scalars['String']['output']>;
  offers: Array<AiBoost>;
  promptTokens?: Maybe<Scalars['Int']['output']>;
  recommendedOfferCode?: Maybe<Scalars['String']['output']>;
  selectedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  selectedOfferCode?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type EventOfferGenerationPaginatedResponse = {
  __typename?: 'EventOfferGenerationPaginatedResponse';
  items: Array<EventOfferGeneration>;
  total: Scalars['Int']['output'];
};

export type EventOnboardingChecklist = {
  __typename?: 'EventOnboardingChecklist';
  Scanner: Scalars['Int']['output'];
  adminverification: Scalars['Int']['output'];
  event: Scalars['Int']['output'];
  logo: Scalars['Int']['output'];
  nextSteps: Array<EventOnboardingStep>;
  payout: Scalars['Int']['output'];
};

export type EventOnboardingStep = {
  __typename?: 'EventOnboardingStep';
  actionHref?: Maybe<Scalars['String']['output']>;
  blocksEventCreation: Scalars['Boolean']['output'];
  blocksPaidEvent: Scalars['Boolean']['output'];
  description: Scalars['String']['output'];
  key: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type EventOrderRow = {
  __typename?: 'EventOrderRow';
  checkedIn: Scalars['Boolean']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  customerId?: Maybe<Scalars['String']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  customerPhone?: Maybe<Scalars['String']['output']>;
  isGuest: Scalars['Boolean']['output'];
  orderId: Scalars['String']['output'];
  shortId: Scalars['String']['output'];
  status: Scalars['String']['output'];
  ticketCount: Scalars['Int']['output'];
  ticketSummary: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type EventOrdersResponse = {
  __typename?: 'EventOrdersResponse';
  items: Array<EventOrderRow>;
  total: Scalars['Int']['output'];
};

export enum EventOrganizerSegment {
  New = 'NEW',
  PowerHost = 'POWER_HOST',
  Regular = 'REGULAR'
}

export type EventPaginatedResponse = {
  __typename?: 'EventPaginatedResponse';
  items: Array<Event>;
  total: Scalars['Int']['output'];
};

export type EventPricingCalculatorInput = {
  chargebackRate?: InputMaybe<Scalars['Float']['input']>;
  eventTypes: Array<EventType>;
  expectedEventsDoneTillNow?: InputMaybe<Scalars['Float']['input']>;
  expectedPaidTickets?: InputMaybe<Scalars['Float']['input']>;
  refundRate?: InputMaybe<Scalars['Float']['input']>;
  tickets?: InputMaybe<Array<EventPricingTicketCalculatorInput>>;
};

export type EventPricingOptionResponse = {
  __typename?: 'EventPricingOptionResponse';
  badge: Scalars['String']['output'];
  commissionRate: Scalars['Float']['output'];
  customerPlatformFeeRate: Scalars['Float']['output'];
  expectedGrossSales: Scalars['Float']['output'];
  expectedPaidTickets: Scalars['Float']['output'];
  hoizrGrossRevenue: Scalars['Float']['output'];
  hoizrNetContribution: Scalars['Float']['output'];
  hostPayout: Scalars['Float']['output'];
  label: Scalars['String']['output'];
  opsBuffer: Scalars['Float']['output'];
  optionId: Scalars['String']['output'];
  organizerSegment: EventOrganizerSegment;
  paymentGatewayCost: Scalars['Float']['output'];
  payoutCycleDaysMax: Scalars['Float']['output'];
  payoutCycleDaysMin: Scalars['Float']['output'];
  plan: EventPricingPlan;
  riskTier: EventPricingRiskTier;
  upfrontFee: Scalars['Float']['output'];
};

export enum EventPricingPlan {
  HighRoller = 'HIGH_ROLLER',
  Saver = 'SAVER',
  ZeroUpfront = 'ZERO_UPFRONT'
}

export enum EventPricingRiskTier {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export type EventPricingSnapshot = {
  __typename?: 'EventPricingSnapshot';
  badge: Scalars['String']['output'];
  commissionRate: Scalars['Float']['output'];
  customerPlatformFeeRate: Scalars['Float']['output'];
  expectedGrossSales: Scalars['Float']['output'];
  expectedPaidTickets: Scalars['Float']['output'];
  hoizrGrossRevenue: Scalars['Float']['output'];
  hoizrNetContribution: Scalars['Float']['output'];
  hostPayout: Scalars['Float']['output'];
  label: Scalars['String']['output'];
  opsBuffer: Scalars['Float']['output'];
  optionId: Scalars['String']['output'];
  organizerSegment: EventOrganizerSegment;
  paymentGatewayCost: Scalars['Float']['output'];
  payoutCycleDaysMax: Scalars['Float']['output'];
  payoutCycleDaysMin: Scalars['Float']['output'];
  plan: EventPricingPlan;
  riskTier: EventPricingRiskTier;
  upfrontFee: Scalars['Float']['output'];
};

export type EventPricingTicketCalculatorInput = {
  ticketCapacity: Scalars['Float']['input'];
  ticketPrice: Scalars['Float']['input'];
  ticketSold?: InputMaybe<Scalars['Float']['input']>;
};

export type EventReconciliationLedgerSummary = {
  __typename?: 'EventReconciliationLedgerSummary';
  balanced: Scalars['Boolean']['output'];
  totalCreditPaise: Scalars['Float']['output'];
  totalDebitPaise: Scalars['Float']['output'];
  transactionCount: Scalars['Int']['output'];
};

export type EventReconciliationOrderTotals = {
  __typename?: 'EventReconciliationOrderTotals';
  chargebackOrderCount: Scalars['Int']['output'];
  customerPaidPaise: Scalars['Float']['output'];
  failedOrderCount: Scalars['Int']['output'];
  orderCount: Scalars['Int']['output'];
  platformFeeGstPaise: Scalars['Float']['output'];
  platformFeePaise: Scalars['Float']['output'];
  refundedOrderCount: Scalars['Int']['output'];
  ticketCount: Scalars['Int']['output'];
  ticketGstFlowThroughPaise: Scalars['Float']['output'];
  ticketTaxablePaise: Scalars['Float']['output'];
};

export type EventReconciliationSettlement = {
  __typename?: 'EventReconciliationSettlement';
  finalDeclaredOfferAmount: Scalars['Float']['output'];
  grossAmount: Scalars['Float']['output'];
  hoizrCommissionGstTotal: Scalars['Float']['output'];
  hoizrCommissionTotal: Scalars['Float']['output'];
  netPayoutAmount: Scalars['Float']['output'];
  paidAt?: Maybe<Scalars['String']['output']>;
  scheduledFor?: Maybe<Scalars['String']['output']>;
  settlementId: Scalars['String']['output'];
  status: Scalars['String']['output'];
  ticketGstFlowThroughTotal: Scalars['Float']['output'];
};

export type EventReconciliationView = {
  __typename?: 'EventReconciliationView';
  endDate?: Maybe<Scalars['String']['output']>;
  entries: Array<LedgerEntry>;
  eventId: Scalars['String']['output'];
  eventTitle?: Maybe<Scalars['String']['output']>;
  hostId?: Maybe<Scalars['String']['output']>;
  hostName?: Maybe<Scalars['String']['output']>;
  ledgerSummary: EventReconciliationLedgerSummary;
  orderTotals: EventReconciliationOrderTotals;
  settlement?: Maybe<EventReconciliationSettlement>;
  transactions: Array<LedgerTransaction>;
};

export type EventSeoSuggestion = {
  __typename?: 'EventSeoSuggestion';
  field: Scalars['String']['output'];
  severity: EventSeoSuggestionSeverity;
  suggestion: Scalars['String']['output'];
};

export enum EventSeoSuggestionSeverity {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export type EventSpellingMistake = {
  __typename?: 'EventSpellingMistake';
  context?: Maybe<Scalars['String']['output']>;
  field: Scalars['String']['output'];
  suggestion?: Maybe<Scalars['String']['output']>;
  word: Scalars['String']['output'];
};

export enum EventStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Draft = 'DRAFT',
  Pending = 'PENDING',
  Published = 'PUBLISHED'
}

export type EventTag = {
  __typename?: 'EventTag';
  _id: Scalars['ID']['output'];
  aiGenerated: Scalars['Boolean']['output'];
  category: EventTagCategory;
  clusterKey?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Admin>;
  description?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Admin>;
  value: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
};

export enum EventTagCategory {
  AiEval = 'AI_EVAL',
  Audience = 'AUDIENCE',
  Format = 'FORMAT',
  Genre = 'GENRE',
  Location = 'LOCATION',
  Vibe = 'VIBE'
}

export type EventTicket = {
  __typename?: 'EventTicket';
  _id: Scalars['ID']['output'];
  advanceBookingAmount?: Maybe<Scalars['Float']['output']>;
  collectPartialAdvancePayment?: Maybe<Scalars['Boolean']['output']>;
  coverAmount?: Maybe<Scalars['Float']['output']>;
  coverType?: Maybe<CoverType>;
  dayId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  groupCapacity?: Maybe<Scalars['Float']['output']>;
  gstRate?: Maybe<Scalars['Float']['output']>;
  markAsComingSoon?: Maybe<Scalars['Boolean']['output']>;
  markAsOnGroundOnly?: Maybe<Scalars['Boolean']['output']>;
  maxTicketPerUser?: Maybe<Scalars['Float']['output']>;
  tableCapacity?: Maybe<Scalars['Float']['output']>;
  ticketCapacity: Scalars['Float']['output'];
  ticketCategory: TicketCategory;
  ticketExpiryDateTime?: Maybe<Scalars['DateTimeISO']['output']>;
  ticketGST?: Maybe<TicketGst>;
  ticketInfo?: Maybe<Scalars['String']['output']>;
  ticketName: Scalars['String']['output'];
  ticketPrice: Scalars['Float']['output'];
  ticketSold: Scalars['Float']['output'];
  ticketType?: Maybe<TicketType>;
  ticketVisible?: Maybe<Scalars['Boolean']['output']>;
};

export type EventTicketInput = {
  _id?: InputMaybe<Scalars['ID']['input']>;
  advanceBookingAmount?: InputMaybe<Scalars['Float']['input']>;
  collectPartialAdvancePayment?: InputMaybe<Scalars['Boolean']['input']>;
  coverAmount?: InputMaybe<Scalars['Float']['input']>;
  coverType?: InputMaybe<CoverType>;
  dayId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  groupCapacity?: InputMaybe<Scalars['Float']['input']>;
  gstRate?: InputMaybe<Scalars['Float']['input']>;
  markAsComingSoon?: InputMaybe<Scalars['Boolean']['input']>;
  markAsOnGroundOnly?: InputMaybe<Scalars['Boolean']['input']>;
  maxTicketPerUser?: InputMaybe<Scalars['Float']['input']>;
  tableCapacity?: InputMaybe<Scalars['Float']['input']>;
  ticketCapacity: Scalars['Float']['input'];
  ticketCategory: TicketCategory;
  ticketExpiryDateTime?: InputMaybe<Scalars['DateTimeISO']['input']>;
  ticketGST?: InputMaybe<TicketGst>;
  ticketInfo?: InputMaybe<Scalars['String']['input']>;
  ticketName: Scalars['String']['input'];
  ticketPrice: Scalars['Float']['input'];
  ticketType?: InputMaybe<TicketType>;
  ticketVisible?: InputMaybe<Scalars['Boolean']['input']>;
};

export type EventTicketSale = {
  __typename?: 'EventTicketSale';
  customerCity?: Maybe<Scalars['String']['output']>;
  customerEmail?: Maybe<Scalars['String']['output']>;
  customerId: Scalars['String']['output'];
  customerName?: Maybe<Scalars['String']['output']>;
  customerPhone?: Maybe<Scalars['String']['output']>;
  extras?: Maybe<Array<EventTicketSaleExtraLine>>;
  grossAmount: Scalars['Float']['output'];
  orderId: Scalars['String']['output'];
  promoterId?: Maybe<Scalars['String']['output']>;
  purchasedAt: Scalars['DateTimeISO']['output'];
  referralCode?: Maybe<Scalars['String']['output']>;
  ticketCount: Scalars['Float']['output'];
  tickets: Array<EventTicketSaleTicketLine>;
  totalAmount: Scalars['Float']['output'];
};

export type EventTicketSaleExtraLine = {
  __typename?: 'EventTicketSaleExtraLine';
  extraId: Scalars['String']['output'];
  extraName: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
};

export type EventTicketSaleTicketLine = {
  __typename?: 'EventTicketSaleTicketLine';
  quantity: Scalars['Float']['output'];
  ticketName: Scalars['String']['output'];
  ticketTypeId: Scalars['String']['output'];
  unitPrice: Scalars['Float']['output'];
};

export enum EventType {
  Exclusive = 'EXCLUSIVE',
  Free = 'FREE',
  NonExclusive = 'NON_EXCLUSIVE'
}

/** Enum to store the types of operation for data filtering */
export enum FilterDataEnum {
  Contains = 'Contains',
  Equals = 'Equals',
  GreaterThan = 'GreaterThan',
  LessThan = 'LessThan',
  NotEquals = 'NotEquals'
}

export type FilterDataInput = {
  key: Scalars['String']['input'];
  operation: FilterDataEnum;
  value?: InputMaybe<Scalars['String']['input']>;
  valueArr?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type FulfillArtistMerchOrderInput = {
  carrier?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
};

export type GenerateAiBoostsInput = {
  eventId: Scalars['String']['input'];
};

export enum Genre {
  Afro = 'AFRO',
  Afrobeat = 'AFROBEAT',
  AfroHouse = 'AFRO_HOUSE',
  Batida = 'BATIDA',
  Bollytech = 'BOLLYTECH',
  Bollywood = 'BOLLYWOOD',
  Comedy = 'COMEDY',
  Commercial = 'COMMERCIAL',
  Dancehall = 'DANCEHALL',
  DeepHouse = 'DEEP_HOUSE',
  Disco = 'DISCO',
  Dubstep = 'DUBSTEP',
  Edm = 'EDM',
  Electronic = 'ELECTRONIC',
  Garba = 'GARBA',
  Gqom = 'GQOM',
  Halloween = 'HALLOWEEN',
  HipHop = 'HIP_HOP',
  HiTech = 'HI_TECH',
  Hollywood = 'HOLLYWOOD',
  House = 'HOUSE',
  Indie = 'INDIE',
  Jazz = 'JAZZ',
  Jungle = 'JUNGLE',
  Kuduro = 'KUDURO',
  KPop = 'K_POP',
  Latin = 'LATIN',
  LiveMusic = 'LIVE_MUSIC',
  MelodicHouse = 'MELODIC_HOUSE',
  Metal = 'METAL',
  Minimal = 'MINIMAL',
  Pop = 'POP',
  Progressive = 'PROGRESSIVE',
  Psychedelic = 'PSYCHEDELIC',
  Punjabi = 'PUNJABI',
  Rap = 'RAP',
  Raves = 'RAVES',
  Reggae = 'REGGAE',
  Rock = 'ROCK',
  Soca = 'SOCA',
  Sports = 'SPORTS',
  Techno = 'TECHNO',
  Thumri = 'THUMRI'
}

export type GenreTag = {
  __typename?: 'GenreTag';
  _id: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Admin>;
  status: Scalars['Boolean']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Admin>;
  value: Scalars['String']['output'];
};

export type GstOutputBreakdown = {
  __typename?: 'GstOutputBreakdown';
  aiBoostGstPaise: Scalars['Float']['output'];
  commissionGstPaise: Scalars['Float']['output'];
  gstInputItcReceivablePaise: Scalars['Float']['output'];
  marketingCreditGstPaise: Scalars['Float']['output'];
  otherGstPaise: Scalars['Float']['output'];
  platformFeeGstPaise: Scalars['Float']['output'];
  ticketGstFlowThroughPaise: Scalars['Float']['output'];
  totalGstPaise: Scalars['Float']['output'];
};

export enum GstRegistrationType {
  CasualTaxablePerson = 'CASUAL_TAXABLE_PERSON',
  Composition = 'COMPOSITION',
  Regular = 'REGULAR',
  Unregistered = 'UNREGISTERED'
}

export type Guestlist = {
  __typename?: 'Guestlist';
  _id: Scalars['ID']['output'];
  cap?: Maybe<Scalars['Int']['output']>;
  code: Scalars['String']['output'];
  contributorId: Scalars['String']['output'];
  contributorName?: Maybe<Scalars['String']['output']>;
  contributorType: GuestlistContributorType;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  eventId: Scalars['String']['output'];
  hostId: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isHighlighted: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export enum GuestlistContributorType {
  Artist = 'ARTIST',
  Collaborator = 'COLLABORATOR',
  Host = 'HOST'
}

export type GuestlistEntry = {
  __typename?: 'GuestlistEntry';
  _id: Scalars['ID']['output'];
  checkedIn: Scalars['Boolean']['output'];
  checkedInAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  customerId: Scalars['String']['output'];
  eventId: Scalars['String']['output'];
  guestEmail?: Maybe<Scalars['String']['output']>;
  guestName?: Maybe<Scalars['String']['output']>;
  guestPhone?: Maybe<Scalars['String']['output']>;
  guestlistId: Scalars['String']['output'];
  qrCodeData?: Maybe<Scalars['String']['output']>;
  qrCodeHash?: Maybe<Scalars['String']['output']>;
  qrHashVersion?: Maybe<Scalars['Int']['output']>;
  revokedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  revokedBy?: Maybe<Scalars['String']['output']>;
  status: GuestlistEntryStatus;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export enum GuestlistEntryStatus {
  Accepted = 'ACCEPTED',
  Pending = 'PENDING',
  Revoked = 'REVOKED'
}

export type HoizrExtra = {
  __typename?: 'HoizrExtra';
  _id: Scalars['ID']['output'];
  description?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  linkedTicketTypes?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  quantity: Scalars['Float']['output'];
  sold: Scalars['Float']['output'];
  type: HoizrExtraType;
};

export type HoizrExtraInput = {
  _id?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  linkedTicketTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  quantity: Scalars['Float']['input'];
  type: HoizrExtraType;
};

export enum HoizrExtraType {
  FoodDrink = 'FOOD_DRINK',
  MeetAndGreet = 'MEET_AND_GREET',
  Merch = 'MERCH',
  Other = 'OTHER',
  VipUpgrade = 'VIP_UPGRADE'
}

export type Host = {
  __typename?: 'Host';
  _id: Scalars['ID']['output'];
  address?: Maybe<AddressInfo>;
  averageEventSize?: Maybe<Scalars['String']['output']>;
  businessRegistrationNumber?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  gallery?: Maybe<Array<Scalars['String']['output']>>;
  gstNumber?: Maybe<Scalars['String']['output']>;
  hostType: HostType;
  isActive: Scalars['Boolean']['output'];
  isAdminVerified: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  onboardingCompleted: Scalars['Boolean']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  profileComplete: Scalars['Boolean']['output'];
  status: HostStatus;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  userId?: Maybe<User>;
  venueType?: Maybe<Scalars['String']['output']>;
  websiteUrl?: Maybe<Scalars['String']['output']>;
};

/** Multi-select audience filter chip for CustomCustomer target */
export enum HostCampaignAudienceFilter {
  Active = 'Active',
  Dormant = 'Dormant',
  Female = 'Female',
  Male = 'Male',
  NewCustomers = 'NewCustomers',
  Other = 'Other',
  Repeat = 'Repeat',
  TopSpenders = 'TopSpenders'
}

export type HostContentDefaults = {
  __typename?: 'HostContentDefaults';
  _id: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  hostId: Scalars['String']['output'];
  refundPolicy?: Maybe<Scalars['String']['output']>;
  ticketingTerms?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type HostCustomerOrderRow = {
  __typename?: 'HostCustomerOrderRow';
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  eventDate?: Maybe<Scalars['DateTimeISO']['output']>;
  eventTitle?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['String']['output'];
  shortId: Scalars['String']['output'];
  status: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type HostCustomerOrdersResponse = {
  __typename?: 'HostCustomerOrdersResponse';
  items: Array<HostCustomerOrderRow>;
  total: Scalars['Int']['output'];
};

export type HostCustomerRow = {
  __typename?: 'HostCustomerRow';
  aov: Scalars['Float']['output'];
  customerId: Scalars['String']['output'];
  customerSince?: Maybe<Scalars['DateTimeISO']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  orderCount: Scalars['Int']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  showsAttended: Scalars['Int']['output'];
  totalSpent: Scalars['Float']['output'];
};

export type HostCustomersResponse = {
  __typename?: 'HostCustomersResponse';
  items: Array<HostCustomerRow>;
  total: Scalars['Int']['output'];
};

export type HostDashboardBreakdownRow = {
  __typename?: 'HostDashboardBreakdownRow';
  amount: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
  label: Scalars['String']['output'];
  percent: Scalars['Float']['output'];
};

export type HostDashboardCampaignRow = {
  __typename?: 'HostDashboardCampaignRow';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  recipientCount: Scalars['Int']['output'];
  scheduledFor?: Maybe<Scalars['DateTimeISO']['output']>;
  status: Scalars['String']['output'];
};

export enum HostDashboardRange {
  Last_7Days = 'LAST_7_DAYS',
  Last_30Days = 'LAST_30_DAYS',
  Today = 'TODAY',
  Yesterday = 'YESTERDAY'
}

export type HostDashboardSeriesPoint = {
  __typename?: 'HostDashboardSeriesPoint';
  date: Scalars['String']['output'];
  label: Scalars['String']['output'];
  orderCount: Scalars['Int']['output'];
  sales: Scalars['Float']['output'];
  tickets: Scalars['Int']['output'];
};

export type HostDashboardSummary = {
  __typename?: 'HostDashboardSummary';
  averageOrderValueLast30Days: Scalars['Float']['output'];
  draftEventsCount: Scalars['Int']['output'];
  lifetimeCampaignMessagesSent: Scalars['Int']['output'];
  marketingSubscribersCount: Scalars['Int']['output'];
  netTicketSales: Scalars['Float']['output'];
  orderCountLast30Days: Scalars['Int']['output'];
  paidOutLifetime: Scalars['Float']['output'];
  pendingSettlementsCount: Scalars['Int']['output'];
  publishedEventsCount: Scalars['Int']['output'];
  salesBySource: Array<HostDashboardBreakdownRow>;
  salesLast30Days: Scalars['Float']['output'];
  salesSeries: Array<HostDashboardSeriesPoint>;
  salesToday: Scalars['Float']['output'];
  ticketMix: Array<HostDashboardBreakdownRow>;
  ticketsSoldLast30Days: Scalars['Int']['output'];
  ticketsSoldToday: Scalars['Int']['output'];
  topItems: Array<HostDashboardBreakdownRow>;
  totalCollected: Scalars['Float']['output'];
  upcomingCampaigns: Array<HostDashboardCampaignRow>;
  upcomingEventsCount: Scalars['Int']['output'];
};

export type HostDashboardSummaryInput = {
  range?: InputMaybe<HostDashboardRange>;
};

/** Publication status for host email campaigns */
export enum HostEmailCampaignPublicationStatus {
  Active = 'Active',
  Drafted = 'Drafted'
}

/** Schedule type for host email campaigns */
export enum HostEmailCampaignScheduleType {
  Later = 'later',
  Now = 'now'
}

export type HostEmailCampaignStats = {
  __typename?: 'HostEmailCampaignStats';
  mailsBounced?: Maybe<Scalars['Float']['output']>;
  mailsClicked: Array<HostEmailStatEntry>;
  mailsDelivered: Scalars['Float']['output'];
  mailsOpened: Array<HostEmailStatEntry>;
  mailsSent: Scalars['Float']['output'];
};

/** Processing status of a host email campaign */
export enum HostEmailCampaignStatusEnum {
  Completed = 'completed',
  Draft = 'draft',
  Failed = 'failed',
  Paused = 'paused',
  Processing = 'processing',
  Scheduled = 'scheduled',
  Success = 'success'
}

export type HostEmailCampaignStatusHistoryItem = {
  __typename?: 'HostEmailCampaignStatusHistoryItem';
  status: HostEmailCampaignStatusEnum;
  timestamp?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type HostEmailCampaignTestInput = {
  emails: Scalars['String']['input'];
  html: Scalars['String']['input'];
  subject: Scalars['String']['input'];
};

export type HostEmailCampaignsObject = {
  __typename?: 'HostEmailCampaignsObject';
  _id: Scalars['ID']['output'];
  businessId: Scalars['String']['output'];
  campaignName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<User>;
  csvDataUrl?: Maybe<Scalars['String']['output']>;
  ctaLink?: Maybe<Scalars['String']['output']>;
  emailStatus?: Maybe<HostEmailCampaignPublicationStatus>;
  emailSubject?: Maybe<Scalars['String']['output']>;
  emailTemplate?: Maybe<HostEmailTemplate>;
  eventId?: Maybe<Scalars['String']['output']>;
  filters?: Maybe<Array<HostCampaignAudienceFilter>>;
  hostId?: Maybe<Scalars['String']['output']>;
  scheduleTime?: Maybe<Scalars['DateTimeISO']['output']>;
  scheduleType?: Maybe<HostEmailCampaignScheduleType>;
  sentAt?: Maybe<Scalars['DateTimeISO']['output']>;
  stats?: Maybe<HostEmailCampaignStats>;
  status?: Maybe<HostEmailCampaignStatusEnum>;
  statusChangeHistory?: Maybe<Array<HostEmailCampaignStatusHistoryItem>>;
  target?: Maybe<HostEmailTargetType>;
  targetCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<User>;
};

export type HostEmailCampaignsPaginatedResponse = {
  __typename?: 'HostEmailCampaignsPaginatedResponse';
  items: Array<HostEmailCampaignsObject>;
  total: Scalars['Float']['output'];
};

export type HostEmailStatEntry = {
  __typename?: 'HostEmailStatEntry';
  date: Scalars['DateTimeISO']['output'];
  email: Scalars['String']['output'];
};

/** Target audience type for host email campaigns */
export enum HostEmailTargetType {
  Admins = 'Admins',
  AllAttendees = 'AllAttendees',
  Csv = 'CSV',
  CustomCustomer = 'CustomCustomer',
  EventSpecific = 'EventSpecific',
  Users = 'Users',
  Waitlist = 'Waitlist'
}

export type HostEmailTemplate = {
  __typename?: 'HostEmailTemplate';
  content: Scalars['String']['output'];
  designJson: Scalars['String']['output'];
  html: Scalars['String']['output'];
};

export type HostEventFeedbackResponse = {
  __typename?: 'HostEventFeedbackResponse';
  averageRating?: Maybe<Scalars['Float']['output']>;
  items: Array<HostEventFeedbackRow>;
  total: Scalars['Int']['output'];
};

export type HostEventFeedbackRow = {
  __typename?: 'HostEventFeedbackRow';
  _id: Scalars['String']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  eventId?: Maybe<Scalars['String']['output']>;
  eventTitle?: Maybe<Scalars['String']['output']>;
  rating?: Maybe<Scalars['Float']['output']>;
};

export type HostEventScanRow = {
  __typename?: 'HostEventScanRow';
  checkedInAt?: Maybe<Scalars['DateTimeISO']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  customerPhone?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['String']['output'];
  scannerId?: Maybe<Scalars['String']['output']>;
  scannerName?: Maybe<Scalars['String']['output']>;
  ticketCount: Scalars['Int']['output'];
  ticketNames: Array<Scalars['String']['output']>;
};

export type HostEventScansPaginatedResponse = {
  __typename?: 'HostEventScansPaginatedResponse';
  items: Array<HostEventScanRow>;
  total: Scalars['Int']['output'];
};

export type HostFeedbackAdminListResponse = {
  __typename?: 'HostFeedbackAdminListResponse';
  items: Array<HostFeedbackAdminRow>;
  total: Scalars['Int']['output'];
};

export type HostFeedbackAdminRow = {
  __typename?: 'HostFeedbackAdminRow';
  _id: Scalars['String']['output'];
  channel?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  context?: Maybe<HostFeedbackContext>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  customerId?: Maybe<Scalars['String']['output']>;
  eventId?: Maybe<Scalars['String']['output']>;
  eventTitle?: Maybe<Scalars['String']['output']>;
  hostId?: Maybe<Scalars['String']['output']>;
  hostName?: Maybe<Scalars['String']['output']>;
  isResolved: Scalars['Boolean']['output'];
  kind?: Maybe<HostFeedbackKind>;
  rating?: Maybe<Scalars['Float']['output']>;
  source: HostFeedbackSource;
};

export enum HostFeedbackContext {
  CustomerPostEvent = 'CUSTOMER_POST_EVENT',
  CustomerPostPurchase = 'CUSTOMER_POST_PURCHASE',
  HostEventCompleted = 'HOST_EVENT_COMPLETED',
  HostEventCreated = 'HOST_EVENT_CREATED'
}

export enum HostFeedbackKind {
  Event = 'EVENT',
  HoizrPlatform = 'HOIZR_PLATFORM'
}

export enum HostFeedbackSource {
  Customer = 'CUSTOMER',
  Host = 'HOST'
}

export type HostInfo = {
  __typename?: 'HostInfo';
  _id?: Maybe<Scalars['ID']['output']>;
  hostStatus: HostStatus;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<UserPermission>>;
  teamRole?: Maybe<TeamRole>;
};

export type HostMarketingChannelLimit = {
  __typename?: 'HostMarketingChannelLimit';
  channel: Scalars['String']['output'];
  maxRecipients: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  unlimited: Scalars['Boolean']['output'];
};

export type HostMarketingLimitObject = {
  __typename?: 'HostMarketingLimitObject';
  benefits: Array<Scalars['String']['output']>;
  channels: Array<HostMarketingChannelLimit>;
  effectiveTier: HostMarketingReputationTier;
  lifetimeCampaignCount: Scalars['Float']['output'];
  lifetimeRecipientsSent: Scalars['Float']['output'];
  maxRecipients: Scalars['Float']['output'];
  nextTier?: Maybe<HostMarketingReputationTier>;
  nextTierLabel?: Maybe<Scalars['String']['output']>;
  progressPercentToNextTier: Scalars['Float']['output'];
  recipientsToNextTier?: Maybe<Scalars['Float']['output']>;
  source: Scalars['String']['output'];
  tier: HostMarketingReputationTier;
  tierLabel: Scalars['String']['output'];
  tierTagline: Scalars['String']['output'];
  unlimited: Scalars['Boolean']['output'];
  verifiedCustomerCount: Scalars['Float']['output'];
};

export enum HostMarketingReputationTier {
  Established = 'ESTABLISHED',
  Growing = 'GROWING',
  New = 'NEW',
  Starter = 'STARTER',
  Unlimited = 'UNLIMITED'
}

export type HostOrderDetail = {
  __typename?: 'HostOrderDetail';
  checkedIn: Scalars['Boolean']['output'];
  couponCode?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  customer: HostOrderDetailCustomer;
  event: HostOrderDetailEvent;
  money: HostOrderDetailMoney;
  orderId: Scalars['String']['output'];
  refundable: Scalars['Boolean']['output'];
  refundedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  source: Scalars['String']['output'];
  status: OrderStatus;
  tickets: Array<HostOrderDetailTicketLine>;
};

export type HostOrderDetailCustomer = {
  __typename?: 'HostOrderDetailCustomer';
  email?: Maybe<Scalars['String']['output']>;
  isGuest: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
};

export type HostOrderDetailEvent = {
  __typename?: 'HostOrderDetailEvent';
  city?: Maybe<Scalars['String']['output']>;
  flyer?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  location?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTimeISO']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type HostOrderDetailMoney = {
  __typename?: 'HostOrderDetailMoney';
  discount?: Maybe<Scalars['Float']['output']>;
  platformFee: Scalars['Float']['output'];
  platformFeeGst: Scalars['Float']['output'];
  refundAmount?: Maybe<Scalars['Float']['output']>;
  subtotal: Scalars['Float']['output'];
  taxes: Scalars['Float']['output'];
  taxesAndFees: Scalars['Float']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type HostOrderDetailTicketLine = {
  __typename?: 'HostOrderDetailTicketLine';
  lineTotal: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  qty: Scalars['Int']['output'];
};

export type HostOrderRow = {
  __typename?: 'HostOrderRow';
  checkedIn: Scalars['Boolean']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  customerEmail?: Maybe<Scalars['String']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  customerPhone?: Maybe<Scalars['String']['output']>;
  eventId: Scalars['String']['output'];
  eventTitle?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['String']['output'];
  source: Scalars['String']['output'];
  status: OrderStatus;
  ticketCount: Scalars['Int']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type HostOrdersResponse = {
  __typename?: 'HostOrdersResponse';
  items: Array<HostOrderRow>;
  total: Scalars['Int']['output'];
};

export type HostPaginatedResponse = {
  __typename?: 'HostPaginatedResponse';
  items: Array<Host>;
  total: Scalars['Int']['output'];
};

export type HostPayoutAccount = {
  __typename?: 'HostPayoutAccount';
  _id: Scalars['String']['output'];
  accountHolderName: Scalars['String']['output'];
  accountNumber: Scalars['String']['output'];
  accountType: AccountType;
  bankName: Scalars['String']['output'];
  branchName?: Maybe<Scalars['String']['output']>;
  businessName?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  entityName?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<PayoutEntityType>;
  gstRegistrationDate?: Maybe<Scalars['DateTimeISO']['output']>;
  gstRegistrationType?: Maybe<GstRegistrationType>;
  gstin?: Maybe<Scalars['String']['output']>;
  hostId?: Maybe<Scalars['String']['output']>;
  hostName?: Maybe<Scalars['String']['output']>;
  ifscCode: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isGstRegistered: Scalars['Boolean']['output'];
  isPrimary: Scalars['Boolean']['output'];
  last4: Scalars['String']['output'];
  panNumber?: Maybe<Scalars['String']['output']>;
  registeredBusinessName?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  taxDeductionAccountNumber?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  upiId?: Maybe<Scalars['String']['output']>;
  verificationStatus: VerificationStatus;
};

export type HostPayoutAccountPaginatedResponse = {
  __typename?: 'HostPayoutAccountPaginatedResponse';
  items: Array<HostPayoutAccount>;
  total: Scalars['Int']['output'];
};

export type HostPromoUsageInput = {
  code: Scalars['String']['input'];
  endDate: ReportDateInput;
  eventId?: InputMaybe<Scalars['String']['input']>;
  startDate: ReportDateInput;
};

export type HostPushCampaign = {
  __typename?: 'HostPushCampaign';
  _id: Scalars['ID']['output'];
  businessId: Scalars['String']['output'];
  campaignName: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  csvDataUrl?: Maybe<Scalars['String']['output']>;
  deepLink?: Maybe<Scalars['String']['output']>;
  eventId?: Maybe<Scalars['String']['output']>;
  filters?: Maybe<Array<HostCampaignAudienceFilter>>;
  hostId?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  isDeleted: Scalars['Boolean']['output'];
  publicationStatus?: Maybe<HostPushCampaignPublicationStatus>;
  pushBody: Scalars['String']['output'];
  pushTitle: Scalars['String']['output'];
  scheduleTime?: Maybe<Scalars['DateTimeISO']['output']>;
  scheduleType?: Maybe<HostPushCampaignScheduleType>;
  sentAt?: Maybe<Scalars['DateTimeISO']['output']>;
  stats?: Maybe<HostPushCampaignStats>;
  status?: Maybe<HostPushCampaignStatus>;
  statusChangeHistory?: Maybe<Array<HostPushCampaignStatusHistoryItem>>;
  target?: Maybe<HostEmailTargetType>;
  targetCount?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

/** Publication status for host push campaigns */
export enum HostPushCampaignPublicationStatus {
  Active = 'Active',
  Drafted = 'Drafted'
}

/** Schedule type for host push campaigns */
export enum HostPushCampaignScheduleType {
  Later = 'later',
  Now = 'now'
}

export type HostPushCampaignStats = {
  __typename?: 'HostPushCampaignStats';
  notificationsClicked: Array<HostPushNotificationStatEntry>;
  notificationsFailed: Scalars['Float']['output'];
  notificationsOpened: Array<HostPushNotificationStatEntry>;
  notificationsSent: Scalars['Float']['output'];
};

/** Processing status of a host push campaign */
export enum HostPushCampaignStatus {
  Completed = 'completed',
  Draft = 'draft',
  Failed = 'failed',
  Processing = 'processing',
  Scheduled = 'scheduled'
}

export type HostPushCampaignStatusHistoryItem = {
  __typename?: 'HostPushCampaignStatusHistoryItem';
  status: HostPushCampaignStatus;
  timestamp?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type HostPushCampaignsPaginatedResponse = {
  __typename?: 'HostPushCampaignsPaginatedResponse';
  items: Array<HostPushCampaign>;
  total: Scalars['Int']['output'];
};

export type HostPushNotificationStatEntry = {
  __typename?: 'HostPushNotificationStatEntry';
  customerId: Scalars['String']['output'];
  date: Scalars['DateTimeISO']['output'];
};

export type HostRefundResult = {
  __typename?: 'HostRefundResult';
  orderId: Scalars['String']['output'];
  refundAmount: Scalars['Float']['output'];
  refundedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  status: OrderStatus;
};

export type HostReportData = {
  __typename?: 'HostReportData';
  charts: Array<ReportChart>;
  freshnessLabel: Scalars['String']['output'];
  generatedAt: Scalars['DateTimeISO']['output'];
  metrics: Array<ReportMetric>;
  tables: Array<ReportTable>;
  type: HostReportType;
};

export type HostReportInput = {
  compareEndDate?: InputMaybe<ReportDateInput>;
  compareStartDate?: InputMaybe<ReportDateInput>;
  endDate: ReportDateInput;
  eventId?: InputMaybe<Scalars['String']['input']>;
  startDate: ReportDateInput;
  type: HostReportType;
};

export enum HostReportType {
  Addons = 'ADDONS',
  AiInsights = 'AI_INSIGHTS',
  ArtistCollab = 'ARTIST_COLLAB',
  AutomationPerformance = 'AUTOMATION_PERFORMANCE',
  CampaignPerformance = 'CAMPAIGN_PERFORMANCE',
  CampaignRoi = 'CAMPAIGN_ROI',
  CheckIn = 'CHECK_IN',
  CompNoshow = 'COMP_NOSHOW',
  CustomersFans = 'CUSTOMERS_FANS',
  Discounts = 'DISCOUNTS',
  DoorOffline = 'DOOR_OFFLINE',
  EventComparison = 'EVENT_COMPARISON',
  Guestlist = 'GUESTLIST',
  Orders = 'ORDERS',
  PayoutsSettlement = 'PAYOUTS_SETTLEMENT',
  PredictedSellout = 'PREDICTED_SELLOUT',
  Refunds = 'REFUNDS',
  SalesSummary = 'SALES_SUMMARY',
  TaxesGst = 'TAXES_GST',
  TicketSalesByType = 'TICKET_SALES_BY_TYPE',
  WebsiteFunnel = 'WEBSITE_FUNNEL',
  WebsiteMetrics = 'WEBSITE_METRICS'
}

export enum HostStatus {
  Active = 'ACTIVE',
  Blocked = 'BLOCKED',
  OnboardingPending = 'ONBOARDING_PENDING',
  VerificationRejected = 'VERIFICATION_REJECTED'
}

export enum HostType {
  EventOrg = 'EVENT_ORG',
  Venue = 'VENUE'
}

export type HostWhatsAppCampaign = {
  __typename?: 'HostWhatsAppCampaign';
  _id: Scalars['ID']['output'];
  businessId: Scalars['String']['output'];
  campaignName: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  csvDataUrl?: Maybe<Scalars['String']['output']>;
  ctaSlug?: Maybe<Scalars['String']['output']>;
  eventId?: Maybe<Scalars['String']['output']>;
  filters?: Maybe<Array<HostCampaignAudienceFilter>>;
  headerMediaUrl?: Maybe<Scalars['String']['output']>;
  hostId?: Maybe<Scalars['String']['output']>;
  isDeleted: Scalars['Boolean']['output'];
  objectiveTag?: Maybe<Scalars['String']['output']>;
  publicationStatus?: Maybe<HostWhatsAppCampaignPublicationStatus>;
  scheduleTime?: Maybe<Scalars['DateTimeISO']['output']>;
  scheduleType?: Maybe<HostWhatsAppCampaignScheduleType>;
  sentCount?: Maybe<Scalars['Int']['output']>;
  stats?: Maybe<HostWhatsAppCampaignStats>;
  status?: Maybe<HostWhatsAppCampaignStatus>;
  statusChangeHistory?: Maybe<Array<HostWhatsAppCampaignStatusHistoryItem>>;
  target?: Maybe<HostEmailTargetType>;
  targetCount?: Maybe<Scalars['Int']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
  templateLanguageSnapshot?: Maybe<Scalars['String']['output']>;
  templateSlugSnapshot?: Maybe<Scalars['String']['output']>;
  templateVariables: Array<HostWhatsAppCampaignVariable>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export enum HostWhatsAppCampaignPublicationStatus {
  Active = 'Active',
  Drafted = 'Drafted'
}

export enum HostWhatsAppCampaignScheduleType {
  Later = 'later',
  Now = 'now'
}

export type HostWhatsAppCampaignStats = {
  __typename?: 'HostWhatsAppCampaignStats';
  failureCodeSamples: Array<Scalars['String']['output']>;
  messagesClicked: Array<HostWhatsAppStatEntry>;
  messagesDelivered: Scalars['Int']['output'];
  messagesFailed: Scalars['Int']['output'];
  messagesRead: Scalars['Int']['output'];
  messagesSent: Scalars['Int']['output'];
  messagesSyncFailed: Scalars['Int']['output'];
};

export enum HostWhatsAppCampaignStatus {
  Completed = 'completed',
  Draft = 'draft',
  Failed = 'failed',
  Paused = 'paused',
  Processing = 'processing',
  Scheduled = 'scheduled'
}

export type HostWhatsAppCampaignStatusHistoryItem = {
  __typename?: 'HostWhatsAppCampaignStatusHistoryItem';
  status: HostWhatsAppCampaignStatus;
  timestamp?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type HostWhatsAppCampaignVariable = {
  __typename?: 'HostWhatsAppCampaignVariable';
  position: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

export type HostWhatsAppCampaignVariableInput = {
  position: Scalars['Int']['input'];
  value: Scalars['String']['input'];
};

export type HostWhatsAppCampaignsPaginatedResponse = {
  __typename?: 'HostWhatsAppCampaignsPaginatedResponse';
  items: Array<HostWhatsAppCampaign>;
  total: Scalars['Int']['output'];
};

export type HostWhatsAppStatEntry = {
  __typename?: 'HostWhatsAppStatEntry';
  date: Scalars['DateTimeISO']['output'];
  phone: Scalars['String']['output'];
};

export type IndianCity = {
  __typename?: 'IndianCity';
  _id: Scalars['ID']['output'];
  altitude?: Maybe<Scalars['Float']['output']>;
  city: Scalars['String']['output'];
  cityId: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Admin>;
  district?: Maybe<Scalars['String']['output']>;
  gstStateCode?: Maybe<Scalars['String']['output']>;
  iso31662?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  population?: Maybe<Scalars['Float']['output']>;
  rank?: Maybe<Scalars['Float']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status: Scalars['Boolean']['output'];
  stdCode?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Admin>;
  value: Scalars['String']['output'];
};

export enum KidFriendlyPolicy {
  KidsNotAllowed = 'KIDS_NOT_ALLOWED',
  KidsWelcome = 'KIDS_WELCOME',
  KidsWithGuardian = 'KIDS_WITH_GUARDIAN'
}

export type LanguageMaster = {
  __typename?: 'LanguageMaster';
  _id: Scalars['ID']['output'];
  code: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Admin>;
  isIndian: Scalars['Boolean']['output'];
  nativeName?: Maybe<Scalars['String']['output']>;
  order: Scalars['Float']['output'];
  status: Scalars['Boolean']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Admin>;
  value: Scalars['String']['output'];
};

export type LateCaptureRefundResponse = {
  __typename?: 'LateCaptureRefundResponse';
  orderId: Scalars['String']['output'];
  razorpayRefundId: Scalars['String']['output'];
  refundedAmount: Scalars['Float']['output'];
};

export enum LedgerAccount {
  Bank = 'BANK',
  ChargebackReceivable = 'CHARGEBACK_RECEIVABLE',
  CustomerReceivable = 'CUSTOMER_RECEIVABLE',
  GstInputItcReceivable = 'GST_INPUT_ITC_RECEIVABLE',
  GstOutputPayable = 'GST_OUTPUT_PAYABLE',
  HoizrAiBoostIncome = 'HOIZR_AI_BOOST_INCOME',
  HoizrCommissionIncome = 'HOIZR_COMMISSION_INCOME',
  HoizrMarketingRevenue = 'HOIZR_MARKETING_REVENUE',
  HoizrPlatformFeeIncome = 'HOIZR_PLATFORM_FEE_INCOME',
  HostTicketGstPayable = 'HOST_TICKET_GST_PAYABLE',
  HostTicketPayable = 'HOST_TICKET_PAYABLE',
  MarketingCreditLiability = 'MARKETING_CREDIT_LIABILITY',
  PaymentGatewayExpense = 'PAYMENT_GATEWAY_EXPENSE',
  PayoutClearing = 'PAYOUT_CLEARING',
  RazorpayClearing = 'RAZORPAY_CLEARING',
  RefundPayable = 'REFUND_PAYABLE',
  TcsPayable = 'TCS_PAYABLE',
  TdsReceivable = 'TDS_RECEIVABLE'
}

export type LedgerAccountBalance = {
  __typename?: 'LedgerAccountBalance';
  account: LedgerAccount;
  balancePaise: Scalars['Float']['output'];
  creditTotalPaise: Scalars['Float']['output'];
  debitTotalPaise: Scalars['Float']['output'];
};

export enum LedgerEntityType {
  AiOffer = 'AI_OFFER',
  Campaign = 'CAMPAIGN',
  Chargeback = 'CHARGEBACK',
  MarketingCreditPurchase = 'MARKETING_CREDIT_PURCHASE',
  Order = 'ORDER',
  PayoutSettlement = 'PAYOUT_SETTLEMENT',
  RazorpaySettlement = 'RAZORPAY_SETTLEMENT',
  Refund = 'REFUND'
}

export type LedgerEntry = {
  __typename?: 'LedgerEntry';
  _id: Scalars['ID']['output'];
  account: LedgerAccount;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  creditPaise: Scalars['Float']['output'];
  debitPaise: Scalars['Float']['output'];
  entityId?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<LedgerEntityType>;
  lineNarration?: Maybe<Scalars['String']['output']>;
  postedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  transactionId: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type LedgerTransaction = {
  __typename?: 'LedgerTransaction';
  _id: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  creditTotalPaise: Scalars['Float']['output'];
  debitTotalPaise: Scalars['Float']['output'];
  entityId: Scalars['String']['output'];
  entityType: LedgerEntityType;
  idempotencyKey: Scalars['String']['output'];
  kind: LedgerTransactionKind;
  narration: Scalars['String']['output'];
  postedAt: Scalars['DateTimeISO']['output'];
  postedBy?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export enum LedgerTransactionKind {
  AiBoostFeeAdjusted = 'AI_BOOST_FEE_ADJUSTED',
  AiBoostFeePaid = 'AI_BOOST_FEE_PAID',
  ChargebackReceived = 'CHARGEBACK_RECEIVED',
  MarketingCreditConsumed = 'MARKETING_CREDIT_CONSUMED',
  MarketingCreditPurchase = 'MARKETING_CREDIT_PURCHASE',
  MarketingCreditRefund = 'MARKETING_CREDIT_REFUND',
  OrderFreeIssued = 'ORDER_FREE_ISSUED',
  OrderPaid = 'ORDER_PAID',
  OrderRefund = 'ORDER_REFUND',
  PayoutConfirmed = 'PAYOUT_CONFIRMED',
  PayoutReleased = 'PAYOUT_RELEASED',
  PayoutReversed = 'PAYOUT_REVERSED',
  RazorpaySettlementReceived = 'RAZORPAY_SETTLEMENT_RECEIVED',
  SettlementCommission = 'SETTLEMENT_COMMISSION'
}

export type LegacyAddressInfoInput = {
  addressLine1: Scalars['String']['input'];
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  city: Scalars['String']['input'];
  coordinate?: InputMaybe<LegacyLocationCommonInput>;
  pincode: Scalars['String']['input'];
  place?: InputMaybe<PlaceInput>;
  state: Scalars['String']['input'];
};

export type LegacyLocationCommonInput = {
  coordinates: Array<Scalars['Float']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type ListHostPayoutSettlementsInput = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<PayoutSettlementStatus>;
};

export type ListOfferGenerationsInput = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  hostId?: InputMaybe<Scalars['String']['input']>;
  includeNegative?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type ListPayoutSettlementsInput = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  hostId?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<PayoutSettlementStatus>;
};

export type MarkOfferGenerationNegativeInput = {
  generationId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};

export type MarkWalkthroughDoneInput = {
  walkthrough: WalkthroughKey;
};

export type MarketingCreditLedgerEntry = {
  __typename?: 'MarketingCreditLedgerEntry';
  _id: Scalars['ID']['output'];
  activity: Scalars['String']['output'];
  amount: Scalars['Float']['output'];
  balance: Scalars['Float']['output'];
  businessId: Scalars['String']['output'];
  campaignId?: Maybe<Scalars['String']['output']>;
  channel?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  hostId?: Maybe<Scalars['String']['output']>;
  paymentReference?: Maybe<Scalars['String']['output']>;
  recipients?: Maybe<Scalars['Float']['output']>;
  type: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type MarketingCreditLedgerResponse = {
  __typename?: 'MarketingCreditLedgerResponse';
  balance: Scalars['Float']['output'];
  items: Array<MarketingCreditLedgerEntry>;
  total: Scalars['Int']['output'];
};

export type MarketingCreditTopUpInput = {
  amount: Scalars['Float']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  paymentReference?: InputMaybe<Scalars['String']['input']>;
  targetHostId: Scalars['String']['input'];
};

export type MarketingCreditTopUpOrder = {
  __typename?: 'MarketingCreditTopUpOrder';
  creditsAmount: Scalars['Float']['output'];
  currency: Scalars['String']['output'];
  gstAmount: Scalars['Float']['output'];
  payableAmount: Scalars['Float']['output'];
  platformFeeAmount: Scalars['Float']['output'];
  razorpayKeyId: Scalars['String']['output'];
  razorpayOrderId: Scalars['String']['output'];
  receipt: Scalars['String']['output'];
};

export type MarketingCreditTopUpOrderInput = {
  amount: Scalars['Float']['input'];
};

export type MarketingCreditTopUpVerifyInput = {
  razorpayOrderId: Scalars['String']['input'];
  razorpayPaymentId: Scalars['String']['input'];
  razorpaySignature: Scalars['String']['input'];
};

export type MarketingCreditTopUpVerifyResponse = {
  __typename?: 'MarketingCreditTopUpVerifyResponse';
  balance: Scalars['Float']['output'];
  entry: MarketingCreditLedgerEntry;
};

export type MarketingMarginRow = {
  __typename?: 'MarketingMarginRow';
  actualCost: Scalars['Float']['output'];
  channel: Scalars['String']['output'];
  charged: Scalars['Float']['output'];
  marginPerSend: Scalars['Float']['output'];
};

export type MarketingPricing = {
  __typename?: 'MarketingPricing';
  currency: Scalars['String']['output'];
  emailRate: Scalars['Float']['output'];
  gstPercent: Scalars['Float']['output'];
  platformFeePercent: Scalars['Float']['output'];
  pushRate: Scalars['Float']['output'];
  smsRate: Scalars['Float']['output'];
  whatsappRate: Scalars['Float']['output'];
};

export enum MerchCurrency {
  Inr = 'INR',
  Usd = 'USD'
}

export type Mutation = {
  __typename?: 'Mutation';
  activityLogCsvExport: Scalars['String']['output'];
  addAdmin: Scalars['Boolean']['output'];
  addConfig: Scalars['Boolean']['output'];
  addEventCategory: Scalars['Boolean']['output'];
  addEventTag: Scalars['Boolean']['output'];
  addGenreTag: Scalars['Boolean']['output'];
  addHostPayoutAccount: HostPayoutAccount;
  addIndianCity: Scalars['Boolean']['output'];
  addPayout: Payout;
  addPermission: Scalars['Boolean']['output'];
  addTeamMember: Scalars['Boolean']['output'];
  addWaitListUser: Scalars['Boolean']['output'];
  adminApproveWhatsAppTemplateReview: WhatsAppMessageTemplate;
  adminClearAutomationTemplate: Array<AdminAutomationTemplateView>;
  adminClearOfferGenerationNegative: EventOfferGeneration;
  adminCreateWhatsAppTemplate: WhatsAppMessageTemplate;
  adminDeleteWhatsAppTemplate: Scalars['Boolean']['output'];
  adminForceReleasePayout: PayoutSettlement;
  adminGenerateAiBoostPaymentLink: Scalars['String']['output'];
  adminInstantPayout: PayoutSettlement;
  adminMarkOfferGenerationNegative: EventOfferGeneration;
  adminOverrideHostMarketingReputation: HostMarketingLimitObject;
  adminPauseHostCampaign: Scalars['Boolean']['output'];
  adminPausePayoutSettlement: PayoutSettlement;
  adminRecordMarketingCreditTopUp: MarketingCreditLedgerEntry;
  adminRefreshPayoutSettlement: PayoutSettlement;
  adminRefundLateCapture: LateCaptureRefundResponse;
  adminRejectPayout: Payout;
  adminRejectWhatsAppTemplateReview: WhatsAppMessageTemplate;
  adminResumePayoutSettlement: PayoutSettlement;
  adminSetAutomationTemplate: Array<AdminAutomationTemplateView>;
  adminSetPlatformCosts: PlatformCostConfig;
  adminSubmitWhatsAppTemplateToMeta: WhatsAppTemplateSubmissionResult;
  adminTriggerRazorpaySettlementReconcile: RazorpayReconcileSummary;
  adminUpdateAutomationSuggestion: AutomationSuggestion;
  adminUpdateEvent: Event;
  adminUpdateHost: Host;
  adminUpdateWhatsAppTemplate: WhatsAppMessageTemplate;
  adminVerifyPayout: Payout;
  approveGuestlistEntry: Scalars['Boolean']['output'];
  artistApproveGuestlistEntry: Scalars['Boolean']['output'];
  artistCreateLink: ArtistLink;
  artistCreateMerch: ArtistMerch;
  artistCreateRider: ArtistRider;
  artistDeleteLink: Scalars['Boolean']['output'];
  artistDeleteMerch: Scalars['Boolean']['output'];
  artistDeleteRider: Scalars['Boolean']['output'];
  artistLogout: Scalars['Boolean']['output'];
  artistMarkMerchOrderFulfilled: ArtistMerchOrder;
  artistReorderLinks: Array<ArtistLink>;
  artistRequestOtp: ArtistOtpRequestResult;
  artistRequestUploadSignature: ArtistUploadSignature;
  artistRespondToLineup: Scalars['Boolean']['output'];
  artistRevokeGuestlistEntry: Scalars['Boolean']['output'];
  artistTokenRefresh: ArtistTokenRefreshResponse;
  artistUpdateLink: ArtistLink;
  artistUpdateMerch: ArtistMerch;
  artistUpdateProfile: Artist;
  artistUpdateRider: ArtistRider;
  artistVerifyOtp: ArtistAuthResult;
  autoGenerateEventDescription: EventEvalResultView;
  blockUnblockAdmin: Scalars['Boolean']['output'];
  bookmarkWhatsAppTemplate: Scalars['Boolean']['output'];
  changeAdminRole: Scalars['Boolean']['output'];
  completeHostOnboarding: Scalars['Boolean']['output'];
  createAdminEmailCampaign: Scalars['String']['output'];
  createAiBoostPaymentOrder: AiBoostRazorpayOrderResponse;
  createCoupon: Coupon;
  createEvent: Event;
  createHost: Scalars['Boolean']['output'];
  createHostEmailCampaign: Scalars['String']['output'];
  createHostPushCampaign: HostPushCampaign;
  createHostWhatsAppCampaign: Scalars['String']['output'];
  createMarketingCreditTopUpOrder: MarketingCreditTopUpOrder;
  createMyWhatsAppTemplate: WhatsAppMessageTemplate;
  createOfflinePaymentLink: OfflinePaymentLinkResponse;
  createScanner: ScannerCreateResponse;
  deleteAdminEmailCampaign: Scalars['Boolean']['output'];
  deleteCoupon: Scalars['Boolean']['output'];
  deleteEvent: Scalars['Boolean']['output'];
  deleteHostCloudinaryAsset: Scalars['Boolean']['output'];
  deleteHostEmailCampaign: Scalars['Boolean']['output'];
  deleteHostPushCampaign: Scalars['Boolean']['output'];
  deleteHostWhatsAppCampaign: Scalars['Boolean']['output'];
  deleteScanner: Scalars['Boolean']['output'];
  duplicateAdminEmailCampaign: Scalars['String']['output'];
  duplicateEvent: Event;
  duplicateHostEmailCampaign: Scalars['String']['output'];
  duplicateHostWhatsAppCampaign: Scalars['String']['output'];
  exportAdminCampaignsReportCSV: Scalars['String']['output'];
  exportAdminCustomersReportCSV: Scalars['String']['output'];
  exportAdminEventsReportCSV: Scalars['String']['output'];
  exportAdminHostsReportCSV: Scalars['String']['output'];
  exportAdminPayoutsReportCSV: Scalars['String']['output'];
  exportAdminTicketsReportCSV: Scalars['String']['output'];
  generateAiBoostsForEvent: EventOfferGeneration;
  hostRefundOrder: HostRefundResult;
  hostReverseCheckIn: Scalars['Boolean']['output'];
  hostRevokeAllScannersForEvent: Scalars['Int']['output'];
  issueOfflineTicket: OfflineOrder;
  publishEvent: Event;
  publishHostPushCampaign: HostPushCampaign;
  regenerateScannerAccessCode: ScannerCreateResponse;
  requestWhatsAppTemplate: WhatsAppMessageTemplate;
  respondToEventCollaboration: Event;
  resumeHostEmailCampaign: Scalars['Boolean']['output'];
  resumeHostWhatsAppCampaign: Scalars['Boolean']['output'];
  revokeAdminAccess: Scalars['Boolean']['output'];
  revokeGuestlistEntry: Scalars['Boolean']['output'];
  runEventEval: EventEvalResultView;
  saveMyHostContentDefaults: HostContentDefaults;
  selectAiBoost: EventOfferGeneration;
  selectEventPricingOption: Event;
  setArtistGuestlistHighlighted: Guestlist;
  setArtistGuestlistPublic: Guestlist;
  setAutomationActive: AutomationView;
  setAutomationChannel: AutomationView;
  setEventGuestlistSettings: Scalars['Boolean']['output'];
  setEventTicketVisibility: Scalars['Boolean']['output'];
  setPrimaryHostPayoutAccount: HostPayoutAccount;
  setPrimaryPayout: Payout;
  startNewHostOnboarding: Scalars['Boolean']['output'];
  submitAutomationSuggestion: Scalars['Boolean']['output'];
  submitHostFeedback: Scalars['Boolean']['output'];
  submitMyWhatsAppTemplateForReview: WhatsAppMessageTemplate;
  toggleCouponActive: Coupon;
  tokensRefresh: Scalars['Boolean']['output'];
  unbookmarkWhatsAppTemplate: Scalars['Boolean']['output'];
  updateAdmin: Scalars['Boolean']['output'];
  updateAdminEmailCampaign: Scalars['Boolean']['output'];
  updateConfig: Scalars['Boolean']['output'];
  updateCoupon: Coupon;
  updateEvent: Event;
  updateEventCategoryStatus: Scalars['Boolean']['output'];
  updateEventFeeSettlementMode: EventFeeSettlementMode;
  updateEventStep: Event;
  updateEventTag: Scalars['Boolean']['output'];
  updateEventTagStatus: Scalars['Boolean']['output'];
  updateGenreTagStatus: Scalars['Boolean']['output'];
  updateHost: Scalars['Boolean']['output'];
  updateHostEmailCampaign: Scalars['Boolean']['output'];
  updateHostPushCampaign: HostPushCampaign;
  updateHostWhatsAppCampaign: Scalars['Boolean']['output'];
  updateIndianCityStatus: Scalars['Boolean']['output'];
  updateMyWhatsAppTemplate: WhatsAppMessageTemplate;
  updatePermissionPreselect: Scalars['Boolean']['output'];
  updateScanner: ScannerUser;
  updateSubuserPermissions: Scalars['Boolean']['output'];
  updateSubuserRole: Scalars['Boolean']['output'];
  uploadHostLogo: Scalars['Boolean']['output'];
  upsertGuestlist: Guestlist;
  upsertPhantomArtist: PhantomArtist;
  verifyMarketingCreditTopUp: MarketingCreditTopUpVerifyResponse;
  verifyTeamEmail: Scalars['Boolean']['output'];
};


export type MutationActivityLogCsvExportArgs = {
  input: CsvExportInput;
};


export type MutationAddAdminArgs = {
  input: AddAdminInput;
};


export type MutationAddConfigArgs = {
  input: AddConfigInput;
};


export type MutationAddEventCategoryArgs = {
  input: AddEventCategoryInput;
};


export type MutationAddEventTagArgs = {
  input: AddEventTagInput;
};


export type MutationAddGenreTagArgs = {
  input: AddGenreTagInput;
};


export type MutationAddHostPayoutAccountArgs = {
  input: AddPayoutInput;
};


export type MutationAddIndianCityArgs = {
  input: AddIndianCityInput;
};


export type MutationAddPayoutArgs = {
  input: AddPayoutInput;
};


export type MutationAddPermissionArgs = {
  input: AddPermissionInput;
};


export type MutationAddTeamMemberArgs = {
  input: AddTeamMemberInput;
};


export type MutationAddWaitListUserArgs = {
  input: AddWaitListUserInput;
};


export type MutationAdminApproveWhatsAppTemplateReviewArgs = {
  templateId: Scalars['String']['input'];
};


export type MutationAdminClearAutomationTemplateArgs = {
  automationKey: Scalars['String']['input'];
};


export type MutationAdminClearOfferGenerationNegativeArgs = {
  generationId: Scalars['String']['input'];
};


export type MutationAdminCreateWhatsAppTemplateArgs = {
  input: CreateWhatsAppTemplateInput;
};


export type MutationAdminDeleteWhatsAppTemplateArgs = {
  templateId: Scalars['String']['input'];
};


export type MutationAdminForceReleasePayoutArgs = {
  settlementId: Scalars['String']['input'];
};


export type MutationAdminGenerateAiBoostPaymentLinkArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationAdminInstantPayoutArgs = {
  settlementId: Scalars['String']['input'];
};


export type MutationAdminMarkOfferGenerationNegativeArgs = {
  input: MarkOfferGenerationNegativeInput;
};


export type MutationAdminOverrideHostMarketingReputationArgs = {
  hostId: Scalars['String']['input'];
  maxRecipients?: InputMaybe<Scalars['Float']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  tier?: InputMaybe<HostMarketingReputationTier>;
};


export type MutationAdminPauseHostCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationAdminPausePayoutSettlementArgs = {
  input: PauseSettlementInput;
};


export type MutationAdminRecordMarketingCreditTopUpArgs = {
  input: MarketingCreditTopUpInput;
};


export type MutationAdminRefreshPayoutSettlementArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationAdminRefundLateCaptureArgs = {
  orderId: Scalars['String']['input'];
};


export type MutationAdminRejectPayoutArgs = {
  id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationAdminRejectWhatsAppTemplateReviewArgs = {
  reason: Scalars['String']['input'];
  templateId: Scalars['String']['input'];
};


export type MutationAdminResumePayoutSettlementArgs = {
  settlementId: Scalars['String']['input'];
};


export type MutationAdminSetAutomationTemplateArgs = {
  automationKey: Scalars['String']['input'];
  whatsappTemplateId: Scalars['String']['input'];
};


export type MutationAdminSetPlatformCostsArgs = {
  input: SetPlatformCostsInput;
};


export type MutationAdminSubmitWhatsAppTemplateToMetaArgs = {
  templateId: Scalars['String']['input'];
};


export type MutationAdminTriggerRazorpaySettlementReconcileArgs = {
  fromUnix?: InputMaybe<Scalars['Float']['input']>;
  toUnix?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationAdminUpdateAutomationSuggestionArgs = {
  adminNote?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  priority?: InputMaybe<AutomationSuggestionPriority>;
  status?: InputMaybe<AutomationSuggestionStatus>;
};


export type MutationAdminUpdateEventArgs = {
  input: AdminEventUpdateInput;
};


export type MutationAdminUpdateHostArgs = {
  hostId: Scalars['String']['input'];
  isAdminVerified?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<HostStatus>;
};


export type MutationAdminUpdateWhatsAppTemplateArgs = {
  input: UpdateWhatsAppTemplateInput;
};


export type MutationAdminVerifyPayoutArgs = {
  id: Scalars['String']['input'];
};


export type MutationApproveGuestlistEntryArgs = {
  entryId: Scalars['String']['input'];
};


export type MutationArtistApproveGuestlistEntryArgs = {
  entryId: Scalars['String']['input'];
};


export type MutationArtistCreateLinkArgs = {
  input: CreateArtistLinkInput;
};


export type MutationArtistCreateMerchArgs = {
  input: CreateArtistMerchInput;
};


export type MutationArtistCreateRiderArgs = {
  input: CreateArtistRiderInput;
};


export type MutationArtistDeleteLinkArgs = {
  linkId: Scalars['String']['input'];
};


export type MutationArtistDeleteMerchArgs = {
  merchId: Scalars['String']['input'];
};


export type MutationArtistDeleteRiderArgs = {
  riderId: Scalars['String']['input'];
};


export type MutationArtistMarkMerchOrderFulfilledArgs = {
  input: FulfillArtistMerchOrderInput;
};


export type MutationArtistReorderLinksArgs = {
  input: ReorderArtistLinksInput;
};


export type MutationArtistRequestOtpArgs = {
  input: ArtistRequestOtpInput;
};


export type MutationArtistRequestUploadSignatureArgs = {
  kind: Scalars['String']['input'];
};


export type MutationArtistRespondToLineupArgs = {
  accept: Scalars['Boolean']['input'];
  eventId: Scalars['String']['input'];
};


export type MutationArtistRevokeGuestlistEntryArgs = {
  entryId: Scalars['String']['input'];
};


export type MutationArtistUpdateLinkArgs = {
  input: UpdateArtistLinkInput;
};


export type MutationArtistUpdateMerchArgs = {
  input: UpdateArtistMerchInput;
};


export type MutationArtistUpdateProfileArgs = {
  input: UpdateArtistProfileInput;
};


export type MutationArtistUpdateRiderArgs = {
  input: UpdateArtistRiderInput;
};


export type MutationArtistVerifyOtpArgs = {
  input: ArtistVerifyOtpInput;
};


export type MutationAutoGenerateEventDescriptionArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationBlockUnblockAdminArgs = {
  id: Scalars['String']['input'];
};


export type MutationBookmarkWhatsAppTemplateArgs = {
  templateId: Scalars['String']['input'];
};


export type MutationChangeAdminRoleArgs = {
  input: ChangeAdminRoleInput;
};


export type MutationCreateAdminEmailCampaignArgs = {
  input: AddAdminEmailCampaignInput;
};


export type MutationCreateAiBoostPaymentOrderArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationCreateCouponArgs = {
  input: CreateCouponInput;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreateHostArgs = {
  input: CreateHostInput;
};


export type MutationCreateHostEmailCampaignArgs = {
  input: AddHostEmailCampaignInput;
};


export type MutationCreateHostPushCampaignArgs = {
  input: CreateHostPushCampaignInput;
};


export type MutationCreateHostWhatsAppCampaignArgs = {
  input: AddHostWhatsAppCampaignInput;
};


export type MutationCreateMarketingCreditTopUpOrderArgs = {
  input: MarketingCreditTopUpOrderInput;
};


export type MutationCreateMyWhatsAppTemplateArgs = {
  input: CreateMyWhatsAppTemplateInput;
};


export type MutationCreateOfflinePaymentLinkArgs = {
  input: OfflineOrderInput;
};


export type MutationCreateScannerArgs = {
  input: CreateScannerInput;
};


export type MutationDeleteAdminEmailCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationDeleteCouponArgs = {
  couponId: Scalars['String']['input'];
};


export type MutationDeleteEventArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteHostCloudinaryAssetArgs = {
  assetUrl: Scalars['String']['input'];
};


export type MutationDeleteHostEmailCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationDeleteHostPushCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationDeleteHostWhatsAppCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationDeleteScannerArgs = {
  scannerId: Scalars['String']['input'];
};


export type MutationDuplicateAdminEmailCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationDuplicateEventArgs = {
  id: Scalars['String']['input'];
};


export type MutationDuplicateHostEmailCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationDuplicateHostWhatsAppCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationExportAdminCampaignsReportCsvArgs = {
  input: AdminReportCsvExportInput;
};


export type MutationExportAdminCustomersReportCsvArgs = {
  input: AdminReportCsvExportInput;
};


export type MutationExportAdminEventsReportCsvArgs = {
  input: AdminReportCsvExportInput;
};


export type MutationExportAdminHostsReportCsvArgs = {
  input: AdminReportCsvExportInput;
};


export type MutationExportAdminPayoutsReportCsvArgs = {
  input: AdminReportCsvExportInput;
};


export type MutationExportAdminTicketsReportCsvArgs = {
  input: AdminReportCsvExportInput;
};


export type MutationGenerateAiBoostsForEventArgs = {
  input: GenerateAiBoostsInput;
};


export type MutationHostRefundOrderArgs = {
  orderId: Scalars['String']['input'];
};


export type MutationHostReverseCheckInArgs = {
  orderId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationHostRevokeAllScannersForEventArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationIssueOfflineTicketArgs = {
  input: OfflineOrderInput;
};


export type MutationPublishEventArgs = {
  id: Scalars['String']['input'];
};


export type MutationPublishHostPushCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationRegenerateScannerAccessCodeArgs = {
  scannerId: Scalars['String']['input'];
};


export type MutationRequestWhatsAppTemplateArgs = {
  input: RequestWhatsAppTemplateInput;
};


export type MutationRespondToEventCollaborationArgs = {
  accept: Scalars['Boolean']['input'];
  eventId: Scalars['String']['input'];
};


export type MutationResumeHostEmailCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationResumeHostWhatsAppCampaignArgs = {
  campaignId: Scalars['String']['input'];
};


export type MutationRevokeAdminAccessArgs = {
  id: Scalars['String']['input'];
};


export type MutationRevokeGuestlistEntryArgs = {
  entryId: Scalars['String']['input'];
};


export type MutationRunEventEvalArgs = {
  eventId: Scalars['String']['input'];
};


export type MutationSaveMyHostContentDefaultsArgs = {
  input: SaveHostContentDefaultsInput;
};


export type MutationSelectAiBoostArgs = {
  input: SelectAiBoostInput;
};


export type MutationSelectEventPricingOptionArgs = {
  input: SelectEventPricingInput;
};


export type MutationSetArtistGuestlistHighlightedArgs = {
  eventId: Scalars['String']['input'];
  isHighlighted: Scalars['Boolean']['input'];
};


export type MutationSetArtistGuestlistPublicArgs = {
  eventId: Scalars['String']['input'];
  isPublic: Scalars['Boolean']['input'];
};


export type MutationSetAutomationActiveArgs = {
  active: Scalars['Boolean']['input'];
  key: Scalars['String']['input'];
};


export type MutationSetAutomationChannelArgs = {
  channel: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
  key: Scalars['String']['input'];
};


export type MutationSetEventGuestlistSettingsArgs = {
  input: EventGuestlistSettingsInput;
};


export type MutationSetEventTicketVisibilityArgs = {
  id: Scalars['String']['input'];
  ticketId: Scalars['String']['input'];
  visible: Scalars['Boolean']['input'];
};


export type MutationSetPrimaryHostPayoutAccountArgs = {
  id: Scalars['String']['input'];
};


export type MutationSetPrimaryPayoutArgs = {
  id: Scalars['String']['input'];
};


export type MutationSubmitAutomationSuggestionArgs = {
  text: Scalars['String']['input'];
};


export type MutationSubmitHostFeedbackArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  context: HostFeedbackContext;
  eventId?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationSubmitMyWhatsAppTemplateForReviewArgs = {
  templateId: Scalars['String']['input'];
};


export type MutationToggleCouponActiveArgs = {
  active: Scalars['Boolean']['input'];
  couponId: Scalars['String']['input'];
};


export type MutationUnbookmarkWhatsAppTemplateArgs = {
  templateId: Scalars['String']['input'];
};


export type MutationUpdateAdminArgs = {
  input: UpdateAdminInput;
};


export type MutationUpdateAdminEmailCampaignArgs = {
  input: UpdateAdminEmailCampaignInput;
};


export type MutationUpdateConfigArgs = {
  id: Scalars['String']['input'];
  input: UpdateConfigInput;
};


export type MutationUpdateCouponArgs = {
  input: UpdateCouponInput;
};


export type MutationUpdateEventArgs = {
  id: Scalars['String']['input'];
  input: EventInput;
};


export type MutationUpdateEventCategoryStatusArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdateEventFeeSettlementModeArgs = {
  id: Scalars['String']['input'];
  mode: EventFeeSettlementMode;
};


export type MutationUpdateEventStepArgs = {
  id: Scalars['String']['input'];
  step: Scalars['Int']['input'];
  stepInput: EventInput;
};


export type MutationUpdateEventTagArgs = {
  id: Scalars['String']['input'];
  input: UpdateEventTagInput;
};


export type MutationUpdateEventTagStatusArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdateGenreTagStatusArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdateHostArgs = {
  input: UpdateHostInput;
};


export type MutationUpdateHostEmailCampaignArgs = {
  input: UpdateHostEmailCampaignInput;
};


export type MutationUpdateHostPushCampaignArgs = {
  input: UpdateHostPushCampaignInput;
};


export type MutationUpdateHostWhatsAppCampaignArgs = {
  input: UpdateHostWhatsAppCampaignInput;
};


export type MutationUpdateIndianCityStatusArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdateMyWhatsAppTemplateArgs = {
  input: UpdateMyWhatsAppTemplateInput;
};


export type MutationUpdatePermissionPreselectArgs = {
  id: Scalars['String']['input'];
  preselect: Array<TeamRole>;
};


export type MutationUpdateScannerArgs = {
  input: UpdateScannerInput;
};


export type MutationUpdateSubuserPermissionsArgs = {
  input: UpdateSubuserPermissionsInput;
};


export type MutationUpdateSubuserRoleArgs = {
  input: UpdateSubuserRoleInput;
};


export type MutationUploadHostLogoArgs = {
  logo: Scalars['String']['input'];
};


export type MutationUpsertGuestlistArgs = {
  input: UpsertGuestlistInput;
};


export type MutationUpsertPhantomArtistArgs = {
  input: UpsertPhantomArtistInput;
};


export type MutationVerifyMarketingCreditTopUpArgs = {
  input: MarketingCreditTopUpVerifyInput;
};


export type MutationVerifyTeamEmailArgs = {
  token: Scalars['String']['input'];
};

export type OfferGenerationEventSummary = {
  __typename?: 'OfferGenerationEventSummary';
  _id: Scalars['String']['output'];
  city?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['DateTimeISO']['output']>;
  eventType?: Maybe<Scalars['String']['output']>;
  flyerUrl?: Maybe<Scalars['String']['output']>;
  maxTicketPrice?: Maybe<Scalars['Float']['output']>;
  minTicketPrice?: Maybe<Scalars['Float']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTimeISO']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  ticketCount?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  totalTicketCapacity?: Maybe<Scalars['Int']['output']>;
  venueName?: Maybe<Scalars['String']['output']>;
};

export type OfferGenerationHostSummary = {
  __typename?: 'OfferGenerationHostSummary';
  _id: Scalars['String']['output'];
  city?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  hostType?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type OfflineOrder = {
  __typename?: 'OfflineOrder';
  _id: Scalars['ID']['output'];
  amountTotal: Scalars['Float']['output'];
  businessId: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdByCollaborator: Scalars['Boolean']['output'];
  createdByHostId?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  createdByUserId: Scalars['String']['output'];
  customerEmail?: Maybe<Scalars['String']['output']>;
  customerFirstName?: Maybe<Scalars['String']['output']>;
  customerLastName?: Maybe<Scalars['String']['output']>;
  customerPhone: Scalars['String']['output'];
  eventId: Scalars['String']['output'];
  isDeleted: Scalars['Boolean']['output'];
  issuedOrderId?: Maybe<Scalars['String']['output']>;
  lines: Array<OfflineOrderLine>;
  linkExpiresAt?: Maybe<Scalars['DateTimeISO']['output']>;
  linkedOrderId?: Maybe<Scalars['String']['output']>;
  mode: OfflineOrderMode;
  notes?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['DateTimeISO']['output']>;
  shortCode?: Maybe<Scalars['String']['output']>;
  status: OfflineOrderStatus;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type OfflineOrderInput = {
  customerEmail?: InputMaybe<Scalars['String']['input']>;
  customerFirstName?: InputMaybe<Scalars['String']['input']>;
  customerLastName?: InputMaybe<Scalars['String']['input']>;
  customerPhone: Scalars['String']['input'];
  eventId: Scalars['String']['input'];
  lines: Array<OfflineTicketLineInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type OfflineOrderLine = {
  __typename?: 'OfflineOrderLine';
  dayId?: Maybe<Scalars['String']['output']>;
  isExtra: Scalars['Boolean']['output'];
  itemId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  unitPrice: Scalars['Float']['output'];
};

export enum OfflineOrderMode {
  Issued = 'ISSUED',
  PaymentLink = 'PAYMENT_LINK'
}

export enum OfflineOrderStatus {
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  Issued = 'ISSUED',
  LinkSent = 'LINK_SENT',
  Paid = 'PAID'
}

export type OfflineOrdersPaginatedResponse = {
  __typename?: 'OfflineOrdersPaginatedResponse';
  items: Array<OfflineOrder>;
  total: Scalars['Int']['output'];
};

export type OfflinePaymentLinkResponse = {
  __typename?: 'OfflinePaymentLinkResponse';
  emailQueued: Scalars['Boolean']['output'];
  offlineOrderId: Scalars['String']['output'];
  shortUrl: Scalars['String']['output'];
  whatsappQueued: Scalars['Boolean']['output'];
};

export type OfflineTicketLineInput = {
  dayId?: InputMaybe<Scalars['String']['input']>;
  isExtra?: InputMaybe<Scalars['Boolean']['input']>;
  itemId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  unitPrice?: InputMaybe<Scalars['Float']['input']>;
};

export enum OrderStatus {
  Cancelled = 'CANCELLED',
  CheckedIn = 'CHECKED_IN',
  PaymentFailed = 'PAYMENT_FAILED',
  PaymentPending = 'PAYMENT_PENDING',
  PaymentSuccess = 'PAYMENT_SUCCESS',
  Refunded = 'REFUNDED',
  Superseded = 'SUPERSEDED'
}

export type PaginationInput = {
  pageNumber?: InputMaybe<Scalars['Float']['input']>;
  rowsPerPage?: InputMaybe<RowsPerPageEnum>;
};

export type PauseSettlementInput = {
  reason: Scalars['String']['input'];
  settlementId: Scalars['String']['input'];
};

export type Payout = {
  __typename?: 'Payout';
  _id: Scalars['ID']['output'];
  accountHolderName: Scalars['String']['output'];
  accountNumber: Scalars['String']['output'];
  accountType: AccountType;
  bankName: Scalars['String']['output'];
  branchName: Scalars['String']['output'];
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  entityName?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<PayoutEntityType>;
  gstRegistrationDate?: Maybe<Scalars['DateTimeISO']['output']>;
  gstRegistrationType?: Maybe<GstRegistrationType>;
  gstin?: Maybe<Scalars['String']['output']>;
  hostId?: Maybe<Host>;
  ifscCode: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isGstRegistered: Scalars['Boolean']['output'];
  isPrimary: Scalars['Boolean']['output'];
  panNumber?: Maybe<Scalars['String']['output']>;
  razorpayContactId?: Maybe<Scalars['String']['output']>;
  razorpayFundAccountId?: Maybe<Scalars['String']['output']>;
  registeredAddressLine1?: Maybe<Scalars['String']['output']>;
  registeredAddressLine2?: Maybe<Scalars['String']['output']>;
  registeredBusinessName?: Maybe<Scalars['String']['output']>;
  registeredCity?: Maybe<Scalars['String']['output']>;
  registeredPincode?: Maybe<Scalars['String']['output']>;
  registeredState?: Maybe<Scalars['String']['output']>;
  registeredStateCode?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  section24DeclarationAcceptedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  section24DeclarationIp?: Maybe<Scalars['String']['output']>;
  section24DeclarationUserAgent?: Maybe<Scalars['String']['output']>;
  section24DeclarationVersion?: Maybe<Scalars['String']['output']>;
  taxDeductionAccountNumber?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  upiId?: Maybe<Scalars['String']['output']>;
  verificationStatus: VerificationStatus;
  verifiedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  verifiedBy?: Maybe<Admin>;
};

export enum PayoutEntityType {
  Individual = 'INDIVIDUAL',
  Llp = 'LLP',
  Ngo = 'NGO',
  Partnership = 'PARTNERSHIP',
  PrivateLimited = 'PRIVATE_LIMITED',
  PublicLimited = 'PUBLIC_LIMITED',
  SoleProprietorship = 'SOLE_PROPRIETORSHIP',
  Trust = 'TRUST'
}

export type PayoutReleaseCheck = {
  __typename?: 'PayoutReleaseCheck';
  code: Scalars['String']['output'];
  detail?: Maybe<Scalars['String']['output']>;
  failureMessage: Scalars['String']['output'];
  label: Scalars['String']['output'];
  passed: Scalars['Boolean']['output'];
};

export type PayoutReleaseReadiness = {
  __typename?: 'PayoutReleaseReadiness';
  canRelease: Scalars['Boolean']['output'];
  checks: Array<PayoutReleaseCheck>;
  settlementId: Scalars['String']['output'];
};

export type PayoutSettlement = {
  __typename?: 'PayoutSettlement';
  _id: Scalars['ID']['output'];
  actualSellThroughPct?: Maybe<Scalars['Float']['output']>;
  aiBoostUpfrontOriginalAmount?: Maybe<Scalars['Float']['output']>;
  aiBoostUpfrontRefundDue?: Maybe<Scalars['Float']['output']>;
  aiBoostUpfrontTriggerSellThroughPct?: Maybe<Scalars['Float']['output']>;
  aiBoostUpfrontWaived?: Maybe<Scalars['Boolean']['output']>;
  aiBoostUpfrontWaivedReason?: Maybe<Scalars['String']['output']>;
  chargebacksTotal?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  eventId: Scalars['String']['output'];
  finalDeclaredOfferAmount: Scalars['Float']['output'];
  grossAmount: Scalars['Float']['output'];
  hoizrCommissionGstTotal: Scalars['Float']['output'];
  hoizrCommissionTotal: Scalars['Float']['output'];
  hostId: Scalars['String']['output'];
  invoiceId?: Maybe<Scalars['String']['output']>;
  invoiceUrl?: Maybe<Scalars['String']['output']>;
  netPayoutAmount: Scalars['Float']['output'];
  orderCount: Scalars['Float']['output'];
  paidAt?: Maybe<Scalars['DateTimeISO']['output']>;
  paidByAdmin?: Maybe<Scalars['String']['output']>;
  paidMethod?: Maybe<PayoutSettlementMethod>;
  pausedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  pausedBy?: Maybe<Scalars['String']['output']>;
  pausedReason?: Maybe<Scalars['String']['output']>;
  payoutAccountId?: Maybe<Scalars['String']['output']>;
  razorpayFeeTotal: Scalars['Float']['output'];
  razorpayPayoutId?: Maybe<Scalars['String']['output']>;
  refundsTotal?: Maybe<Scalars['Float']['output']>;
  scheduledFor: Scalars['DateTimeISO']['output'];
  status: PayoutSettlementStatus;
  taxWithholdingConfigId?: Maybe<Scalars['String']['output']>;
  taxWithholdingReason?: Maybe<Scalars['String']['output']>;
  tcsCollectedPaise?: Maybe<Scalars['Float']['output']>;
  tdsDeductedPaise?: Maybe<Scalars['Float']['output']>;
  ticketGstFlowThroughTotal: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export enum PayoutSettlementMethod {
  AdminInstant = 'ADMIN_INSTANT',
  Auto = 'AUTO'
}

export type PayoutSettlementPaginatedResponse = {
  __typename?: 'PayoutSettlementPaginatedResponse';
  items: Array<PayoutSettlement>;
  total: Scalars['Int']['output'];
};

export enum PayoutSettlementStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  OnHold = 'ON_HOLD',
  Paid = 'PAID',
  Paused = 'PAUSED',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Rejected = 'REJECTED',
  Scheduled = 'SCHEDULED',
  Verified = 'VERIFIED'
}

export type Permission = {
  __typename?: 'Permission';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['DateTimeISO']['output'];
  createdBy: Admin;
  isFunction: Scalars['Boolean']['output'];
  preselect: Array<TeamRole>;
  type: PermissionTypeEnum;
  updatedAt: Scalars['DateTimeISO']['output'];
  updatedBy: Admin;
};

/** Granular permissions assignable to a host's sub-users. The host owner has all permissions by default; sub-users get only the boxes the owner ticks. Permissions are evaluated server-side on every mutation/query — UI hiding is a UX nicety, not the security boundary. */
export enum PermissionTypeEnum {
  /** View the host's customer list — names, contact info, ticket history, followed-since dates. Required for the marketing audience-builder. Treat as PII access. */
  Customers = 'Customers',
  /** Export report data to CSV / PDF / Excel. Grant separately from Reports so finance/ops can export while marketers only view in-app. */
  DownloadReports = 'DownloadReports',
  /** Create, edit, publish, pause, cancel and duplicate events. Includes editing lineup, venue, refund policy, and ticketing terms. */
  Events = 'Events',
  /** Launch marketing campaigns (email, SMS, WhatsApp, push). Requires existing marketing credit balance. Recipient cap is set by the host's reputation tier (see hostMarketingTier* configs). */
  Marketing = 'Marketing',
  /** Manage AI Boost selections, accept/reject AI-generated offers, and create custom discount codes for events. */
  Offers = 'Offers',
  /** View individual ticket orders, issue refunds, mark as checked-in, resend ticket emails. Includes order-level customer detail. */
  Orders = 'Orders',
  /** Add, edit, mark primary, deactivate, and view bank/UPI payout accounts. Sensitive — only grant to finance-aware sub-users. */
  PayoutManagement = 'PayoutManagement',
  /** View sales, payout, audience demographic and event-performance dashboards. Read-only — does NOT include the ability to export raw data (see DownloadReports). */
  Reports = 'Reports',
  /** Invite new sub-users, edit their permissions, deactivate or remove them. Grant only to trusted ops leads — a sub-user with this can effectively grant themselves any other permission. */
  TeamManagement = 'TeamManagement',
  /** Manage ticket types within an event — create, edit prices, set capacity, mark sold-out, mark as on-ground-only. Does NOT include reading customer orders (see Orders). */
  Tickets = 'Tickets',
  /** Edit the business / venue profile — name, logo, GST registration details, contact info, registered address. Does NOT include payout or team management (separate permissions). */
  UpdateHost = 'UpdateHost'
}

export enum PetFriendlyPolicy {
  PetsNotAllowed = 'PETS_NOT_ALLOWED',
  PetsWelcome = 'PETS_WELCOME',
  ServiceAnimalsOnly = 'SERVICE_ANIMALS_ONLY'
}

export type PhantomArtist = {
  __typename?: 'PhantomArtist';
  _id: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  instagramLink?: Maybe<Scalars['String']['output']>;
  isDeleted: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  normalizedName?: Maybe<Scalars['String']['output']>;
  picture?: Maybe<Scalars['String']['output']>;
  spotifyLink?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  youtubeLink?: Maybe<Scalars['String']['output']>;
};

export type PlaceDetail = {
  __typename?: 'PlaceDetail';
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  latitude: Scalars['Float']['output'];
  longitude: Scalars['Float']['output'];
  state?: Maybe<Scalars['String']['output']>;
  zipcode?: Maybe<Scalars['String']['output']>;
};

export type PlaceInfo = {
  __typename?: 'PlaceInfo';
  displayName?: Maybe<Scalars['String']['output']>;
  placeId?: Maybe<Scalars['String']['output']>;
};

export type PlaceInfoInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  placeId?: InputMaybe<Scalars['String']['input']>;
};

export type PlaceInput = {
  displayName: Scalars['String']['input'];
  placeId: Scalars['String']['input'];
};

export type Places = {
  __typename?: 'Places';
  displayName: Scalars['String']['output'];
  placeId: Scalars['String']['output'];
};

export type PlatformCostConfig = {
  __typename?: 'PlatformCostConfig';
  _id: Scalars['ID']['output'];
  actualEmailCost: Scalars['Float']['output'];
  actualPushCost: Scalars['Float']['output'];
  actualSmsCost: Scalars['Float']['output'];
  actualWhatsappMarketingCost: Scalars['Float']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type ProhibitedItemMaster = {
  __typename?: 'ProhibitedItemMaster';
  _id: Scalars['ID']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Admin>;
  description?: Maybe<Scalars['String']['output']>;
  order: Scalars['Float']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Admin>;
  value: Scalars['String']['output'];
};

export enum PromoDiscountType {
  FixedAmount = 'FixedAmount',
  Free = 'Free',
  Percentage = 'Percentage'
}

export type PublicArtistEvent = {
  __typename?: 'PublicArtistEvent';
  city?: Maybe<Scalars['String']['output']>;
  coverImage?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['DateTimeISO']['output']>;
  eventId: Scalars['String']['output'];
  hostName?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTimeISO']['output']>;
  title: Scalars['String']['output'];
};

export type PublicArtistFilterInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type PublicArtistGuestlist = {
  __typename?: 'PublicArtistGuestlist';
  acceptedCount: Scalars['Int']['output'];
  cap?: Maybe<Scalars['Int']['output']>;
  code: Scalars['String']['output'];
  eventCity?: Maybe<Scalars['String']['output']>;
  eventFlyer?: Maybe<Scalars['String']['output']>;
  eventId: Scalars['String']['output'];
  eventTitle: Scalars['String']['output'];
  guestlistId: Scalars['String']['output'];
  isHighlighted: Scalars['Boolean']['output'];
  startDate?: Maybe<Scalars['DateTimeISO']['output']>;
};

export type PublicArtistListResponse = {
  __typename?: 'PublicArtistListResponse';
  artists: Array<Artist>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  adminAutomationSuggestions: Array<AutomationSuggestion>;
  adminAutomationTemplates: Array<AdminAutomationTemplateView>;
  adminCampaignsReport: AdminCampaignsReport;
  adminCsvExport: Scalars['String']['output'];
  adminCustomersReport: AdminCustomersReport;
  adminEntityDetail?: Maybe<AdminEntityDetail>;
  adminEventReconciliation: EventReconciliationView;
  adminEvents: EventPaginatedResponse;
  adminEventsReport: AdminEventsReport;
  adminGetOfferGeneration: EventOfferGeneration;
  adminGetPayoutReleaseReadiness: PayoutReleaseReadiness;
  adminGetPayoutSettlement: PayoutSettlement;
  /** Admin-set actual unit costs (email/WhatsApp/SMS/push). */
  adminGetPlatformCosts: PlatformCostConfig;
  /** Global admin search across organizers, venues, artists, and phantom artists. Safe fields only — no contacts. Min 2 chars, max 5 per type. */
  adminGlobalSearch: Array<AdminSearchResult>;
  adminGstOutputBreakdown: GstOutputBreakdown;
  adminHostActivityLogs: ActivityLogPaginatedResponse;
  adminHosts: HostPaginatedResponse;
  adminHostsReport: AdminHostsReport;
  adminLedgerAccountBalances: Array<LedgerAccountBalance>;
  adminListEndedUnpaidEvents: Array<EndedUnpaidEvent>;
  adminListFeedback: HostFeedbackAdminListResponse;
  adminListHostCampaigns: HostEmailCampaignsPaginatedResponse;
  adminListOfferGenerations: EventOfferGenerationPaginatedResponse;
  adminListOrders: AdminOrdersResponse;
  adminListPayoutReleaseReadiness: Array<PayoutReleaseReadiness>;
  adminListPayoutSettlements: PayoutSettlementPaginatedResponse;
  adminListWhatsAppTemplates: WhatsAppTemplatesPaginatedResponse;
  adminLogin: Scalars['String']['output'];
  adminLoginVerification: Scalars['String']['output'];
  adminLogout: Scalars['Boolean']['output'];
  /** Per-send marketing margin: what hosts are charged minus our actual cost. */
  adminMarketingMargins: Array<MarketingMarginRow>;
  adminOrdersNeedingRefund: Array<AdminRefundOrderRow>;
  adminPayoutsReport: AdminPayoutsReport;
  adminPendingWhatsAppTemplateReviews: WhatsAppTemplatesPaginatedResponse;
  adminTicketsReport: AdminTicketsReport;
  adminWhatsAppTemplateById: WhatsAppMessageTemplate;
  aiBoostPaymentInfo: AiBoostPaymentInfo;
  allAdmins: AdminPaginatedResponse;
  allHostPayoutAccounts: HostPayoutAccountPaginatedResponse;
  allUsers: UserPaginatedResponse;
  approvedWhatsAppTemplates: WhatsAppTemplatesPaginatedResponse;
  artistDashboardSummary: ArtistDashboardSummary;
  artistGuestlist: Guestlist;
  artistGuestlistEntries: Array<GuestlistEntry>;
  artistGuestlistEntriesCsv: Scalars['String']['output'];
  artistGuestlistEvents: Array<ArtistGuestlistEventSummary>;
  artistLineupEvents: Array<ArtistLineupEvent>;
  artistMe: Artist;
  artistMyLinks: Array<ArtistLink>;
  artistMyMerch: Array<ArtistMerch>;
  artistMyMerchOrders: Array<ArtistMerchOrder>;
  artistMyRiders: Array<ArtistRider>;
  artistSlugAvailable: Scalars['Boolean']['output'];
  artistSuggestSlug: Scalars['String']['output'];
  automation: AutomationView;
  automationEventBreakdown: Array<AutomationEventBreakdownRow>;
  changeUserStatus: Scalars['Boolean']['output'];
  couponById: Coupon;
  deleteTeamMember: Scalars['Boolean']['output'];
  disable2FA: Scalars['Boolean']['output'];
  enable2FA: Scalars['String']['output'];
  eventCustomers: EventCustomersResponse;
  eventGuestlists: Array<Guestlist>;
  eventOnboardingChecklist: EventOnboardingChecklist;
  eventOrders: EventOrdersResponse;
  eventPricingOptions: Array<EventPricingOptionResponse>;
  eventTicketOrders: HostCustomerOrdersResponse;
  eventsForOfflineIssuing: Array<Event>;
  fetchAdminCampaignById: AdminEmailCampaignsObject;
  fetchHostCampaignById: HostEmailCampaignsObject;
  fetchHostPushCampaignById?: Maybe<HostPushCampaign>;
  fetchHostWhatsAppCampaignById: HostWhatsAppCampaign;
  getActiveEventCategories: Array<EventCategory>;
  getActiveGenreTags: Array<GenreTag>;
  getActiveIndianCities: Array<IndianCity>;
  getActiveLanguages: Array<LanguageMaster>;
  getActivePayout?: Maybe<Payout>;
  getActiveProhibitedItems: Array<ProhibitedItemMaster>;
  getActiveStates: Array<StateOption>;
  getActivityLogs: ActivityLogPaginatedResponse;
  getAdminAudienceCount: Scalars['Int']['output'];
  /** Returns admin dashboard KPIs. The payload is cached in-memory for 60 seconds per date range. */
  getAdminKpis: AdminKpis;
  getAllAdminEmailCampaigns: AdminEmailCampaignsPaginatedResponse;
  getAllConfigs: Array<Config>;
  getAllEventCategories: Array<EventCategory>;
  getAllEventTags: Array<EventTag>;
  getAllGenreTags: Array<GenreTag>;
  getAllHostEmailCampaigns: HostEmailCampaignsPaginatedResponse;
  getAllHostPushCampaigns: HostPushCampaignsPaginatedResponse;
  getAllHostWhatsAppCampaigns: HostWhatsAppCampaignsPaginatedResponse;
  getAllIndianCities: Array<IndianCity>;
  getAllPermissions: Array<Permission>;
  getConfig: Config;
  getCurrentHostOnboarding?: Maybe<Host>;
  getEvent?: Maybe<Event>;
  getEventBySlug?: Maybe<Event>;
  getEventManageOverview: EventManageOverview;
  getEventTicketSales: Array<EventTicketSale>;
  getEventsByBusiness: Array<Event>;
  getEventsByHost: EventPaginatedResponse;
  getHost?: Maybe<Host>;
  getHostAttendeesTargetCount: Scalars['Int']['output'];
  getHostDashboardSummary: HostDashboardSummary;
  getHostPromoUsage: ReportTable;
  getHostReport: HostReportData;
  getHostWhatsAppAttendeesTargetCount: Scalars['Int']['output'];
  getHostsByBusiness: Array<Host>;
  getLatestAiBoostGeneration?: Maybe<EventOfferGeneration>;
  getMarketingPricing: MarketingPricing;
  getMyCollaboratedEvents: Array<Event>;
  getMyEvents: Array<Event>;
  getMyHostContentDefaults?: Maybe<HostContentDefaults>;
  getPayoutsByBusiness: Array<Payout>;
  getPlaceDetails?: Maybe<PlaceDetail>;
  getPlacesList: Array<Places>;
  /** Returns lightweight Mongo, Redis, BullMQ, cron, and webhook health data. The payload is cached in-memory for 60 seconds. */
  getSystemHealth: AdminSystemHealth;
  getTeamMembers: Array<SubUser>;
  getUser?: Maybe<User>;
  getWaitListUsers: Array<WaitListUser>;
  guestlistEntries: Array<GuestlistEntry>;
  guestlistEntriesCsv: Scalars['String']['output'];
  hostCustomerOrders: HostCustomerOrdersResponse;
  hostCustomers: HostCustomersResponse;
  hostEmailCampaignCsvExport: Scalars['String']['output'];
  hostEventFeedback: HostEventFeedbackResponse;
  hostGetPayoutSettlement: PayoutSettlement;
  hostGetPayoutStatementUrl: SignedPdfUrl;
  hostListEventScans: HostEventScansPaginatedResponse;
  hostListPayoutSettlements: PayoutSettlementPaginatedResponse;
  hostOrderDetail: HostOrderDetail;
  hostOrders: HostOrdersResponse;
  hostPayoutAccounts: Array<HostPayoutAccount>;
  isMultiAccountUser: Scalars['Boolean']['output'];
  listScannersForEvent: Array<ScannerUser>;
  markWalkthroughDone: Scalars['Boolean']['output'];
  meAdmin: Admin;
  meContactDetails?: Maybe<User>;
  meUser?: Maybe<User>;
  meUserJourney: UserJourney;
  myAutomations: AutomationsResponse;
  myCoupons: CouponsPaginatedResponse;
  myMarketingCreditLedger: MarketingCreditLedgerResponse;
  myMarketingReputation: HostMarketingLimitObject;
  myOfflineOrders: OfflineOrdersPaginatedResponse;
  myWhatsAppTemplateBookmarkIds: Array<Scalars['String']['output']>;
  myWhatsAppTemplateBookmarks: WhatsAppTemplatesPaginatedResponse;
  myWhatsAppTemplateById: WhatsAppMessageTemplate;
  myWhatsAppTemplates: WhatsAppTemplatesPaginatedResponse;
  publicArtistEvents: Array<PublicArtistEvent>;
  publicArtistFollowerCounts: ArtistFollowerCounts;
  publicArtistGuestlists: Array<PublicArtistGuestlist>;
  publicArtistLinks: Array<ArtistLink>;
  publicArtistMerch: Array<ArtistMerch>;
  publicArtistProfile: Artist;
  publicArtistRiders: Array<ArtistRider>;
  publicArtists: PublicArtistListResponse;
  rejectUserDetails: Scalars['Boolean']['output'];
  searchCollaboratorHosts: Array<Host>;
  searchEventArtists: Array<EventArtistSearchResult>;
  selectableWhatsAppTemplates: WhatsAppTemplatesPaginatedResponse;
  sendTestAdminEmail: Scalars['Boolean']['output'];
  sendTestHostCampaignEmail: Scalars['Boolean']['output'];
  setHostIdAsCookie: Scalars['Boolean']['output'];
  updateUserDetails: Scalars['Boolean']['output'];
  userCsvExport: Scalars['String']['output'];
  userLogin: Scalars['String']['output'];
  userLoginVerification: Scalars['Boolean']['output'];
  userLogout: Scalars['Boolean']['output'];
  userLogoutFromEverywhere: Scalars['Boolean']['output'];
  userSignup: Scalars['String']['output'];
  userSignupVerification: Scalars['Boolean']['output'];
  verify2FASetup: Scalars['Boolean']['output'];
  whatsAppTemplateById: WhatsAppMessageTemplate;
};


export type QueryAdminAutomationSuggestionsArgs = {
  status?: InputMaybe<AutomationSuggestionStatus>;
};


export type QueryAdminCampaignsReportArgs = {
  input: AdminReportFilterInput;
};


export type QueryAdminCsvExportArgs = {
  input: CsvExportInput;
};


export type QueryAdminCustomersReportArgs = {
  input: AdminReportFilterInput;
};


export type QueryAdminEntityDetailArgs = {
  id: Scalars['String']['input'];
  kind: Scalars['String']['input'];
};


export type QueryAdminEventReconciliationArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryAdminEventsArgs = {
  filters?: InputMaybe<Array<FilterDataInput>>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminEventsReportArgs = {
  input: AdminReportFilterInput;
};


export type QueryAdminGetOfferGenerationArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminGetPayoutReleaseReadinessArgs = {
  settlementId: Scalars['String']['input'];
};


export type QueryAdminGetPayoutSettlementArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminGlobalSearchArgs = {
  q: Scalars['String']['input'];
};


export type QueryAdminGstOutputBreakdownArgs = {
  from?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminHostActivityLogsArgs = {
  hostId: Scalars['String']['input'];
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminHostsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminHostsReportArgs = {
  input: AdminReportFilterInput;
};


export type QueryAdminLedgerAccountBalancesArgs = {
  from?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminListEndedUnpaidEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAdminListFeedbackArgs = {
  kind?: InputMaybe<HostFeedbackKind>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminListHostCampaignsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminListOfferGenerationsArgs = {
  input?: InputMaybe<ListOfferGenerationsInput>;
};


export type QueryAdminListOrdersArgs = {
  pagination?: InputMaybe<PaginationInput>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OrderStatus>;
};


export type QueryAdminListPayoutReleaseReadinessArgs = {
  settlementIds: Array<Scalars['String']['input']>;
};


export type QueryAdminListPayoutSettlementsArgs = {
  input?: InputMaybe<ListPayoutSettlementsInput>;
};


export type QueryAdminListWhatsAppTemplatesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminLoginArgs = {
  email: Scalars['String']['input'];
};


export type QueryAdminLoginVerificationArgs = {
  input: AdminLoginVerificationInput;
};


export type QueryAdminPayoutsReportArgs = {
  input: AdminReportFilterInput;
};


export type QueryAdminPendingWhatsAppTemplateReviewsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAdminTicketsReportArgs = {
  input: AdminReportFilterInput;
};


export type QueryAdminWhatsAppTemplateByIdArgs = {
  templateId: Scalars['String']['input'];
};


export type QueryAiBoostPaymentInfoArgs = {
  token: Scalars['String']['input'];
};


export type QueryAllAdminsArgs = {
  filter?: InputMaybe<Array<FilterDataInput>>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<SortDataInput>;
};


export type QueryAllHostPayoutAccountsArgs = {
  filter?: InputMaybe<Array<FilterDataInput>>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<SortDataInput>;
};


export type QueryAllUsersArgs = {
  filter?: InputMaybe<Array<FilterDataInput>>;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<SortDataInput>;
};


export type QueryApprovedWhatsAppTemplatesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryArtistGuestlistArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryArtistGuestlistEntriesArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryArtistGuestlistEntriesCsvArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryArtistSlugAvailableArgs = {
  slug: Scalars['String']['input'];
};


export type QueryArtistSuggestSlugArgs = {
  seed: Scalars['String']['input'];
};


export type QueryAutomationArgs = {
  key: Scalars['String']['input'];
};


export type QueryAutomationEventBreakdownArgs = {
  key: Scalars['String']['input'];
};


export type QueryChangeUserStatusArgs = {
  input: UserStatusChangeInput;
};


export type QueryCouponByIdArgs = {
  couponId: Scalars['String']['input'];
};


export type QueryDeleteTeamMemberArgs = {
  id: Scalars['String']['input'];
};


export type QueryDisable2FaArgs = {
  authCode: Scalars['String']['input'];
};


export type QueryEventCustomersArgs = {
  eventId: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryEventGuestlistsArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryEventOrdersArgs = {
  customerId?: InputMaybe<Scalars['String']['input']>;
  eventId: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  ticketTypeId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEventPricingOptionsArgs = {
  input: EventPricingCalculatorInput;
};


export type QueryEventTicketOrdersArgs = {
  eventId: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  ticketId: Scalars['String']['input'];
};


export type QueryFetchAdminCampaignByIdArgs = {
  campaignId: Scalars['String']['input'];
};


export type QueryFetchHostCampaignByIdArgs = {
  campaignId: Scalars['String']['input'];
};


export type QueryFetchHostPushCampaignByIdArgs = {
  campaignId: Scalars['String']['input'];
};


export type QueryFetchHostWhatsAppCampaignByIdArgs = {
  campaignId: Scalars['String']['input'];
};


export type QueryGetActivePayoutArgs = {
  targetHostId: Scalars['String']['input'];
};


export type QueryGetActivityLogsArgs = {
  filter?: InputMaybe<Array<FilterDataInput>>;
  pagination?: InputMaybe<PaginationInput>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<SortDataInput>;
};


export type QueryGetAdminAudienceCountArgs = {
  cityFilter?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<AdminCampaignFilter>>;
  target?: InputMaybe<AdminCampaignTargetType>;
};


export type QueryGetAdminKpisArgs = {
  dateRange: AdminKpiDateRangeInput;
};


export type QueryGetAllAdminEmailCampaignsArgs = {
  filter?: InputMaybe<Array<FilterDataInput>>;
  pagination?: InputMaybe<PaginationInput>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<SortDataInput>;
};


export type QueryGetAllHostEmailCampaignsArgs = {
  filter?: InputMaybe<Array<FilterDataInput>>;
  pagination?: InputMaybe<PaginationInput>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<SortDataInput>;
};


export type QueryGetAllHostPushCampaignsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryGetAllHostWhatsAppCampaignsArgs = {
  filter?: InputMaybe<Array<FilterDataInput>>;
  pagination?: InputMaybe<PaginationInput>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<SortDataInput>;
};


export type QueryGetConfigArgs = {
  type: ConfigTypeEnum;
};


export type QueryGetEventArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetEventBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetEventManageOverviewArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetEventTicketSalesArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryGetEventsByBusinessArgs = {
  filters?: InputMaybe<Array<FilterDataInput>>;
};


export type QueryGetEventsByHostArgs = {
  filters?: InputMaybe<Array<FilterDataInput>>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryGetHostAttendeesTargetCountArgs = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<HostCampaignAudienceFilter>>;
  target?: InputMaybe<HostEmailTargetType>;
};


export type QueryGetHostDashboardSummaryArgs = {
  input?: InputMaybe<HostDashboardSummaryInput>;
};


export type QueryGetHostPromoUsageArgs = {
  input: HostPromoUsageInput;
};


export type QueryGetHostReportArgs = {
  input: HostReportInput;
};


export type QueryGetHostWhatsAppAttendeesTargetCountArgs = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<HostCampaignAudienceFilter>>;
  target?: InputMaybe<HostEmailTargetType>;
};


export type QueryGetLatestAiBoostGenerationArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryGetPayoutsByBusinessArgs = {
  targetHostId: Scalars['String']['input'];
};


export type QueryGetPlaceDetailsArgs = {
  placeId: Scalars['String']['input'];
};


export type QueryGetPlacesListArgs = {
  input: Scalars['String']['input'];
};


export type QueryGetUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryGuestlistEntriesArgs = {
  eventId: Scalars['String']['input'];
  guestlistId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGuestlistEntriesCsvArgs = {
  eventId: Scalars['String']['input'];
  guestlistId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryHostCustomerOrdersArgs = {
  customerId: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryHostCustomersArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryHostEmailCampaignCsvExportArgs = {
  input: CsvExportInput;
};


export type QueryHostEventFeedbackArgs = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryHostGetPayoutSettlementArgs = {
  id: Scalars['String']['input'];
};


export type QueryHostGetPayoutStatementUrlArgs = {
  settlementId: Scalars['String']['input'];
};


export type QueryHostListEventScansArgs = {
  eventId: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryHostListPayoutSettlementsArgs = {
  input?: InputMaybe<ListHostPayoutSettlementsInput>;
};


export type QueryHostOrderDetailArgs = {
  orderId: Scalars['String']['input'];
};


export type QueryHostOrdersArgs = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryListScannersForEventArgs = {
  eventId: Scalars['String']['input'];
};


export type QueryMarkWalkthroughDoneArgs = {
  input: MarkWalkthroughDoneInput;
};


export type QueryMyCouponsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryMyMarketingCreditLedgerArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryMyOfflineOrdersArgs = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyWhatsAppTemplateBookmarksArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryMyWhatsAppTemplateByIdArgs = {
  templateId: Scalars['String']['input'];
};


export type QueryMyWhatsAppTemplatesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryPublicArtistEventsArgs = {
  idOrSlug: Scalars['String']['input'];
};


export type QueryPublicArtistFollowerCountsArgs = {
  idOrSlug: Scalars['String']['input'];
};


export type QueryPublicArtistGuestlistsArgs = {
  idOrSlug: Scalars['String']['input'];
};


export type QueryPublicArtistLinksArgs = {
  idOrSlug: Scalars['String']['input'];
};


export type QueryPublicArtistMerchArgs = {
  idOrSlug: Scalars['String']['input'];
};


export type QueryPublicArtistProfileArgs = {
  idOrSlug: Scalars['String']['input'];
};


export type QueryPublicArtistRidersArgs = {
  idOrSlug: Scalars['String']['input'];
};


export type QueryPublicArtistsArgs = {
  input?: InputMaybe<PublicArtistFilterInput>;
};


export type QueryRejectUserDetailsArgs = {
  input: RejectUserDetailsInput;
};


export type QuerySearchCollaboratorHostsArgs = {
  search: Scalars['String']['input'];
};


export type QuerySearchEventArtistsArgs = {
  search: Scalars['String']['input'];
};


export type QuerySelectableWhatsAppTemplatesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QuerySendTestAdminEmailArgs = {
  input: AdminEmailCampaignTestInput;
};


export type QuerySendTestHostCampaignEmailArgs = {
  input: HostEmailCampaignTestInput;
};


export type QuerySetHostIdAsCookieArgs = {
  hostId: Scalars['String']['input'];
};


export type QueryUpdateUserDetailsArgs = {
  input: UpdateUserInput;
};


export type QueryUserCsvExportArgs = {
  input: CsvExportInput;
};


export type QueryUserLoginArgs = {
  input: Scalars['String']['input'];
};


export type QueryUserLoginVerificationArgs = {
  input: UserLoginVerificationInput;
};


export type QueryUserSignupArgs = {
  input: UserSignupInput;
};


export type QueryUserSignupVerificationArgs = {
  input: UserSignupVerificationInput;
};


export type QueryVerify2FaSetupArgs = {
  authCode: Scalars['String']['input'];
};


export type QueryWhatsAppTemplateByIdArgs = {
  templateId: Scalars['String']['input'];
};

export type RazorpayReconcileSummary = {
  __typename?: 'RazorpayReconcileSummary';
  posted: Scalars['Int']['output'];
  skipped: Scalars['Int']['output'];
  windowFrom: Scalars['DateTimeISO']['output'];
  windowTo: Scalars['DateTimeISO']['output'];
};

export type RejectRecord = {
  __typename?: 'RejectRecord';
  reason: Scalars['String']['output'];
  rejectedAt: Scalars['DateTimeISO']['output'];
  rejectedBy?: Maybe<Scalars['String']['output']>;
};

export type RejectUserDetailsInput = {
  content: Scalars['String']['input'];
  id: Scalars['String']['input'];
};

export type ReorderArtistLinksInput = {
  orderedLinkIds: Array<Scalars['String']['input']>;
};

export type ReportChart = {
  __typename?: 'ReportChart';
  key: Scalars['String']['output'];
  points: Array<ReportChartPoint>;
  seriesKeys: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: ReportChartType;
  xKey: Scalars['String']['output'];
};

export type ReportChartPoint = {
  __typename?: 'ReportChartPoint';
  values: Array<ReportChartSeriesValue>;
  x: Scalars['String']['output'];
};

export type ReportChartSeriesValue = {
  __typename?: 'ReportChartSeriesValue';
  key: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export enum ReportChartType {
  Area = 'Area',
  Bar = 'Bar',
  Donut = 'Donut',
  Line = 'Line'
}

export type ReportDateInput = {
  day: Scalars['Int']['input'];
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};

export type ReportMetric = {
  __typename?: 'ReportMetric';
  helpText?: Maybe<Scalars['String']['output']>;
  key: Scalars['String']['output'];
  label: Scalars['String']['output'];
  trendDirection?: Maybe<Scalars['String']['output']>;
  trendValue?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
  valueType: ReportValueType;
};

export type ReportTable = {
  __typename?: 'ReportTable';
  columns: Array<ReportTableColumn>;
  rows: Array<ReportTableRow>;
  title: Scalars['String']['output'];
};

export type ReportTableCell = {
  __typename?: 'ReportTableCell';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type ReportTableColumn = {
  __typename?: 'ReportTableColumn';
  align?: Maybe<Scalars['String']['output']>;
  header: Scalars['String']['output'];
  key: Scalars['String']['output'];
  valueType?: Maybe<ReportValueType>;
};

export type ReportTableRow = {
  __typename?: 'ReportTableRow';
  cells: Array<ReportTableCell>;
};

export enum ReportValueType {
  Amount = 'Amount',
  Number = 'Number',
  Percentage = 'Percentage',
  Text = 'Text'
}

export type RequestWhatsAppTemplateInput = {
  bodyText?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<WhatsAppTemplateCategory>;
  name: Scalars['String']['input'];
  requestNote: Scalars['String']['input'];
};

export enum RiderType {
  FoodAndBeverage = 'FOOD_AND_BEVERAGE',
  Hospitality = 'HOSPITALITY',
  Other = 'OTHER',
  StagePlot = 'STAGE_PLOT',
  Tech = 'TECH',
  Travel = 'TRAVEL'
}

/** Enum to store the count of items per page */
export enum RowsPerPageEnum {
  Fifty = 'FIFTY',
  Hundred = 'HUNDRED',
  One = 'ONE',
  Ten = 'TEN',
  Thirty = 'THIRTY',
  TwentyFive = 'TWENTY_FIVE'
}

export type SaveHostContentDefaultsInput = {
  refundPolicy?: InputMaybe<Scalars['String']['input']>;
  ticketingTerms?: InputMaybe<Scalars['String']['input']>;
};

export type ScannerCreateResponse = {
  __typename?: 'ScannerCreateResponse';
  accessCode: Scalars['String']['output'];
  scanner: ScannerUser;
};

export type ScannerUser = {
  __typename?: 'ScannerUser';
  _id: Scalars['ID']['output'];
  accessCodeExpiresAt?: Maybe<Scalars['DateTimeISO']['output']>;
  businessId: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdByUserId?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  eventId: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTimeISO']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  scannerName: Scalars['String']['output'];
  scannerType: Scalars['String']['output'];
  totalScanned: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
};

export enum SeatingArrangement {
  Seated = 'SEATED',
  SeatedAndStanding = 'SEATED_AND_STANDING',
  Standing = 'STANDING'
}

export type SelectAiBoostInput = {
  feeSettlementMode?: InputMaybe<EventFeeSettlementMode>;
  generationId: Scalars['String']['input'];
  offerCode: Scalars['String']['input'];
};

export type SelectEventPricingInput = {
  eventId: Scalars['String']['input'];
  feeSettlementMode: EventFeeSettlementMode;
  optionId: Scalars['String']['input'];
};

export type SetPlatformCostsInput = {
  actualEmailCost?: InputMaybe<Scalars['Float']['input']>;
  actualPushCost?: InputMaybe<Scalars['Float']['input']>;
  actualSmsCost?: InputMaybe<Scalars['Float']['input']>;
  actualWhatsappMarketingCost?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type SignedPdfUrl = {
  __typename?: 'SignedPdfUrl';
  expiresAt: Scalars['DateTimeISO']['output'];
  signedUrl: Scalars['String']['output'];
};

/** Types of SoftWare Enum */
export enum SoftWareEnum {
  Clover = 'Clover',
  None = 'None',
  Owner = 'Owner',
  Square = 'Square',
  Toast = 'Toast'
}

/** Enum to store the types of sorting options data filtering */
export enum SortDataEnum {
  Asc = 'Asc',
  Desc = 'Desc',
  None = 'None'
}

export type SortDataInput = {
  key: Scalars['String']['input'];
  sortType: SortDataEnum;
};

export type StateOption = {
  __typename?: 'StateOption';
  _id: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type SubUser = {
  __typename?: 'SubUser';
  _id?: Maybe<User>;
  createdAt: Scalars['DateTimeISO']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  hosts?: Maybe<Array<HostInfo>>;
  lastName: Scalars['String']['output'];
  permissions: Array<UserPermission>;
  phone: Scalars['String']['output'];
  role: Scalars['String']['output'];
  status: UserStatus;
  updatedAt: Scalars['DateTimeISO']['output'];
};

export enum TeamRole {
  Manager = 'MANAGER',
  Marketing = 'MARKETING',
  Owner = 'OWNER',
  Staff = 'Staff'
}

export enum TicketCategory {
  Backstage = 'BACKSTAGE',
  Entry = 'ENTRY',
  Group = 'GROUP',
  Guestlist = 'GUESTLIST',
  Normal = 'NORMAL',
  Table = 'TABLE',
  Vip = 'VIP'
}

export enum TicketGst {
  CgstSgst_18 = 'CGST_SGST_18',
  Igst_18 = 'IGST_18',
  None = 'NONE',
  Other = 'OTHER',
  Zero = 'ZERO'
}

export type TicketTotals = {
  __typename?: 'TicketTotals';
  capacity: Scalars['Int']['output'];
  grossRevenue: Scalars['Float']['output'];
  sold: Scalars['Int']['output'];
};

export enum TicketType {
  Couple = 'COUPLE',
  Group = 'GROUP',
  Single = 'SINGLE',
  Table = 'TABLE'
}

export type UpdateAdminEmailCampaignInput = {
  campaignId: Scalars['ID']['input'];
  campaignName?: InputMaybe<Scalars['String']['input']>;
  cityFilter?: InputMaybe<Scalars['String']['input']>;
  csvDataUrl?: InputMaybe<Scalars['String']['input']>;
  ctaLink?: InputMaybe<Scalars['String']['input']>;
  emailStatus?: InputMaybe<AdminCampaignPublicationStatus>;
  emailSubject?: InputMaybe<Scalars['String']['input']>;
  emailTemplate?: InputMaybe<AddAdminEmailTemplateInput>;
  filters?: InputMaybe<Array<AdminCampaignFilter>>;
  scheduleTime?: InputMaybe<Scalars['DateTimeISO']['input']>;
  scheduleType?: InputMaybe<AdminCampaignScheduleType>;
  target?: InputMaybe<AdminCampaignTargetType>;
  targetCount?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateAdminInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateArtistLinkInput = {
  icon?: InputMaybe<ArtistLinkIcon>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  linkId: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateArtistMerchInput = {
  currency?: InputMaybe<MerchCurrency>;
  description?: InputMaybe<Scalars['String']['input']>;
  externalCheckoutUrl?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  merchId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateArtistProfileInput = {
  appleMusicLink?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  coverImage?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  genres?: InputMaybe<Array<Genre>>;
  instagramLink?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  profilePhoto?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  soundcloudLink?: InputMaybe<Scalars['String']['input']>;
  spotifyLink?: InputMaybe<Scalars['String']['input']>;
  stageName?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  tagline?: InputMaybe<Scalars['String']['input']>;
  twitterLink?: InputMaybe<Scalars['String']['input']>;
  youtubeLink?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateArtistRiderInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fileType?: InputMaybe<Scalars['String']['input']>;
  fileUrl?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  riderId: Scalars['String']['input'];
  riderType?: InputMaybe<RiderType>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateConfigInput = {
  boolVal?: InputMaybe<Scalars['Boolean']['input']>;
  numVal?: InputMaybe<Scalars['Float']['input']>;
  textVal?: InputMaybe<Scalars['String']['input']>;
  valueType: ConfigValueEnum;
};

export type UpdateCouponInput = {
  applicableDays?: InputMaybe<Array<Day>>;
  applicableTickets?: InputMaybe<Array<Scalars['String']['input']>>;
  couponId: Scalars['ID']['input'];
  couponUsageSalesLimit?: InputMaybe<Scalars['Float']['input']>;
  couponUsageType?: InputMaybe<CouponUsageType>;
  description?: InputMaybe<Scalars['String']['input']>;
  discountValue?: InputMaybe<Scalars['Float']['input']>;
  endDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxUsage?: InputMaybe<Scalars['Int']['input']>;
  maxUsagePerCustomer?: InputMaybe<Scalars['Int']['input']>;
  minCartValue?: InputMaybe<Scalars['Float']['input']>;
  promoCodeDiscountType?: InputMaybe<PromoDiscountType>;
  showToCustomers?: InputMaybe<Scalars['Boolean']['input']>;
  startDate?: InputMaybe<Scalars['DateTimeISO']['input']>;
  uptoAmount?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateEventTagInput = {
  category?: InputMaybe<EventTagCategory>;
  clusterKey?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateHostEmailCampaignInput = {
  campaignId: Scalars['ID']['input'];
  campaignName?: InputMaybe<Scalars['String']['input']>;
  csvDataUrl?: InputMaybe<Scalars['String']['input']>;
  ctaLink?: InputMaybe<Scalars['String']['input']>;
  emailStatus?: InputMaybe<HostEmailCampaignPublicationStatus>;
  emailSubject?: InputMaybe<Scalars['String']['input']>;
  emailTemplate?: InputMaybe<AddHostEmailTemplateInput>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<HostCampaignAudienceFilter>>;
  scheduleTime?: InputMaybe<Scalars['DateTimeISO']['input']>;
  scheduleType?: InputMaybe<HostEmailCampaignScheduleType>;
  target?: InputMaybe<HostEmailTargetType>;
  targetCount?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateHostInput = {
  address?: InputMaybe<LegacyAddressInfoInput>;
  averageEventSize?: InputMaybe<Scalars['String']['input']>;
  businessRegistrationNumber?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  gallery?: InputMaybe<Array<Scalars['String']['input']>>;
  gstNumber?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  venueType?: InputMaybe<Scalars['String']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateHostPushCampaignInput = {
  _id: Scalars['String']['input'];
  campaignName?: InputMaybe<Scalars['String']['input']>;
  csvDataUrl?: InputMaybe<Scalars['String']['input']>;
  deepLink?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<HostCampaignAudienceFilter>>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  pushBody?: InputMaybe<Scalars['String']['input']>;
  pushTitle?: InputMaybe<Scalars['String']['input']>;
  scheduleTime?: InputMaybe<Scalars['DateTimeISO']['input']>;
  scheduleType?: InputMaybe<HostPushCampaignScheduleType>;
  target?: InputMaybe<HostEmailTargetType>;
};

export type UpdateHostWhatsAppCampaignInput = {
  campaignId: Scalars['ID']['input'];
  campaignName?: InputMaybe<Scalars['String']['input']>;
  csvDataUrl?: InputMaybe<Scalars['String']['input']>;
  ctaSlug?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<HostCampaignAudienceFilter>>;
  headerMediaUrl?: InputMaybe<Scalars['String']['input']>;
  objectiveTag?: InputMaybe<Scalars['String']['input']>;
  publicationStatus?: InputMaybe<HostWhatsAppCampaignPublicationStatus>;
  scheduleTime?: InputMaybe<Scalars['DateTimeISO']['input']>;
  scheduleType?: InputMaybe<HostWhatsAppCampaignScheduleType>;
  target?: InputMaybe<HostEmailTargetType>;
  targetCount?: InputMaybe<Scalars['Int']['input']>;
  templateId?: InputMaybe<Scalars['String']['input']>;
  templateVariables?: InputMaybe<Array<HostWhatsAppCampaignVariableInput>>;
};

export type UpdateMyWhatsAppTemplateInput = {
  bodyText?: InputMaybe<Scalars['String']['input']>;
  buttonLabel?: InputMaybe<Scalars['String']['input']>;
  buttonPhone?: InputMaybe<Scalars['String']['input']>;
  buttonType?: InputMaybe<WhatsAppTemplateButtonType>;
  buttonUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  footerText?: InputMaybe<Scalars['String']['input']>;
  headerSampleMediaUrl?: InputMaybe<Scalars['String']['input']>;
  headerText?: InputMaybe<Scalars['String']['input']>;
  headerType?: InputMaybe<WhatsAppTemplateHeaderType>;
  name?: InputMaybe<Scalars['String']['input']>;
  templateId: Scalars['ID']['input'];
  variables?: InputMaybe<Array<WhatsAppTemplateVariableInput>>;
};

export type UpdateScannerInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  scannerId: Scalars['String']['input'];
  scannerName?: InputMaybe<Scalars['String']['input']>;
  scannerType?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSubuserPermissionsInput = {
  id: Scalars['String']['input'];
  permissions?: InputMaybe<Array<UserPermissionInput>>;
};

export type UpdateSubuserRoleInput = {
  id: Scalars['String']['input'];
  role?: InputMaybe<TeamRole>;
};

export type UpdateUserInput = {
  accountPreferences?: InputMaybe<AccountPreferenceInput>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWhatsAppTemplateInput = {
  bodyText?: InputMaybe<Scalars['String']['input']>;
  buttonLabel?: InputMaybe<Scalars['String']['input']>;
  buttonPhone?: InputMaybe<Scalars['String']['input']>;
  buttonUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  footerText?: InputMaybe<Scalars['String']['input']>;
  headerSampleMediaUrl?: InputMaybe<Scalars['String']['input']>;
  headerText?: InputMaybe<Scalars['String']['input']>;
  internalOnly?: InputMaybe<Scalars['Boolean']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  templateId: Scalars['ID']['input'];
  variables?: InputMaybe<Array<WhatsAppTemplateVariableInput>>;
};

export type UpsertGuestlistInput = {
  cap?: InputMaybe<Scalars['Int']['input']>;
  contributorId: Scalars['String']['input'];
  contributorName?: InputMaybe<Scalars['String']['input']>;
  contributorType: GuestlistContributorType;
  eventId: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpsertPhantomArtistInput = {
  instagramLink?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  picture?: InputMaybe<Scalars['String']['input']>;
  spotifyLink?: InputMaybe<Scalars['String']['input']>;
  youtubeLink?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID']['output'];
  accessHistory?: Maybe<Array<AccessHistory>>;
  accountPreferences?: Maybe<AccountPreference>;
  additionalEmails?: Maybe<Array<Scalars['String']['output']>>;
  completedWalkthroughs: Array<WalkthroughKey>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  creatorUser?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  enable2FA: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  hosts?: Maybe<Array<HostInfo>>;
  isDeleted: Scalars['Boolean']['output'];
  lastLoggedIn?: Maybe<Scalars['DateTimeISO']['output']>;
  lastName: Scalars['String']['output'];
  permissions?: Maybe<Array<UserPermission>>;
  phone: Scalars['String']['output'];
  role: UserRole;
  status: UserStatus;
  teamRole: TeamRole;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  verificationRejections?: Maybe<Array<RejectRecord>>;
};

export type UserJourney = {
  __typename?: 'UserJourney';
  canPublish: Scalars['Boolean']['output'];
  hasHostAccess: Scalars['String']['output'];
  hostId?: Maybe<Scalars['String']['output']>;
  hostOnboardingCompleted: Scalars['Boolean']['output'];
  hostStatus?: Maybe<HostStatus>;
  isAdminVerified: Scalars['Boolean']['output'];
  suggestedRoute: Scalars['String']['output'];
  userStatus: UserStatus;
};

export type UserLoginVerificationInput = {
  emailOrNumber: Scalars['String']['input'];
  otp: Scalars['String']['input'];
  otpId: Scalars['String']['input'];
};

export type UserPaginatedResponse = {
  __typename?: 'UserPaginatedResponse';
  items: Array<User>;
  total: Scalars['Float']['output'];
};

export type UserPermission = {
  __typename?: 'UserPermission';
  id: Scalars['String']['output'];
  status: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
};

export type UserPermissionInput = {
  id: Scalars['String']['input'];
  status: Scalars['Boolean']['input'];
  type: Scalars['String']['input'];
};

export enum UserRole {
  Artist = 'ARTIST',
  Host = 'HOST'
}

export type UserSignupInput = {
  accountPreferences?: AccountPreferenceInput;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type UserSignupVerificationInput = {
  accountPreferences?: AccountPreferenceInput;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  otp: Scalars['String']['input'];
  otpId: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export enum UserStatus {
  Active = 'ACTIVE',
  Blocked = 'BLOCKED',
  HostOnboardingPending = 'HOST_ONBOARDING_PENDING',
  SubUserEmailVerificationPending = 'SUB_USER_EMAIL_VERIFICATION_PENDING'
}

export type UserStatusChangeInput = {
  block: Scalars['Boolean']['input'];
  id: Scalars['String']['input'];
};

export enum VenueLayout {
  Indoor = 'INDOOR',
  Mixed = 'MIXED',
  Outdoor = 'OUTDOOR'
}

export enum VerificationStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Verified = 'VERIFIED'
}

export type WaitListUser = {
  __typename?: 'WaitListUser';
  _id?: Maybe<Scalars['ID']['output']>;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  number: Scalars['String']['output'];
  restaurantName: Scalars['String']['output'];
  software: SoftWareEnum;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  website: Scalars['String']['output'];
};

export enum WalkthroughKey {
  Campaign = 'CAMPAIGN',
  Main = 'MAIN',
  Payments = 'PAYMENTS',
  Teams = 'TEAMS'
}

export type WhatsAppMessageTemplate = {
  __typename?: 'WhatsAppMessageTemplate';
  _id: Scalars['ID']['output'];
  approvedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  bodyText: Scalars['String']['output'];
  buttonLabel?: Maybe<Scalars['String']['output']>;
  buttonPhone?: Maybe<Scalars['String']['output']>;
  buttonType: WhatsAppTemplateButtonType;
  buttonUrl?: Maybe<Scalars['String']['output']>;
  category: WhatsAppTemplateCategory;
  createdAt?: Maybe<Scalars['DateTimeISO']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  footerText?: Maybe<Scalars['String']['output']>;
  headerSampleMediaUrl?: Maybe<Scalars['String']['output']>;
  headerText?: Maybe<Scalars['String']['output']>;
  headerType: WhatsAppTemplateHeaderType;
  internalOnly: Scalars['Boolean']['output'];
  isActive: Scalars['Boolean']['output'];
  language: Scalars['String']['output'];
  metaStatus: WhatsAppTemplateStatus;
  metaTemplateId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  ownerHostId?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  requestNote?: Maybe<Scalars['String']['output']>;
  reviewRejectionReason?: Maybe<Scalars['String']['output']>;
  reviewStatus: WhatsAppTemplateReviewStatus;
  reviewedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  reviewedBy?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  source: WhatsAppTemplateSource;
  submittedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedAt?: Maybe<Scalars['DateTimeISO']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  variables: Array<WhatsAppTemplateVariable>;
};

export enum WhatsAppTemplateButtonType {
  None = 'NONE',
  Phone = 'PHONE',
  QuickReply = 'QUICK_REPLY',
  Url = 'URL'
}

export enum WhatsAppTemplateCategory {
  Authentication = 'AUTHENTICATION',
  Marketing = 'MARKETING',
  Utility = 'UTILITY'
}

export enum WhatsAppTemplateHeaderType {
  Document = 'DOCUMENT',
  Image = 'IMAGE',
  None = 'NONE',
  Text = 'TEXT',
  Video = 'VIDEO'
}

export enum WhatsAppTemplateReviewStatus {
  ApprovedInternal = 'APPROVED_INTERNAL',
  Draft = 'DRAFT',
  PendingReview = 'PENDING_REVIEW',
  RejectedInternal = 'REJECTED_INTERNAL'
}

export enum WhatsAppTemplateSource {
  Admin = 'ADMIN',
  Host = 'HOST'
}

export enum WhatsAppTemplateStatus {
  Approved = 'APPROVED',
  Disabled = 'DISABLED',
  InAppeal = 'IN_APPEAL',
  Paused = 'PAUSED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type WhatsAppTemplateSubmissionResult = {
  __typename?: 'WhatsAppTemplateSubmissionResult';
  metaStatus: Scalars['String']['output'];
  metaTemplateId?: Maybe<Scalars['String']['output']>;
  templateId: Scalars['String']['output'];
};

export type WhatsAppTemplateVariable = {
  __typename?: 'WhatsAppTemplateVariable';
  example?: Maybe<Scalars['String']['output']>;
  hint?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  position: Scalars['Int']['output'];
};

export type WhatsAppTemplateVariableInput = {
  example?: InputMaybe<Scalars['String']['input']>;
  hint?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
  position: Scalars['Int']['input'];
};

export type WhatsAppTemplatesPaginatedResponse = {
  __typename?: 'WhatsAppTemplatesPaginatedResponse';
  items: Array<WhatsAppMessageTemplate>;
  total: Scalars['Int']['output'];
};

export type UserLogoutQueryVariables = Exact<{ [key: string]: never; }>;


export type UserLogoutQuery = { __typename?: 'Query', userLogout: boolean };

export type UserLogoutFromEverywhereQueryVariables = Exact<{ [key: string]: never; }>;


export type UserLogoutFromEverywhereQuery = { __typename?: 'Query', userLogoutFromEverywhere: boolean };

export type UserLoginQueryVariables = Exact<{
  input: Scalars['String']['input'];
}>;


export type UserLoginQuery = { __typename?: 'Query', userLogin: string };

export type MeUserQueryVariables = Exact<{ [key: string]: never; }>;


export type MeUserQuery = { __typename?: 'Query', meUser?: { __typename?: 'User', _id: string, firstName: string, lastName: string, status: UserStatus, email: string, phone: string, creatorUser?: string | null, role: UserRole, completedWalkthroughs: Array<WalkthroughKey>, permissions?: Array<{ __typename?: 'UserPermission', status: boolean, type: string }> | null } | null };

export type MarkWalkthroughDoneQueryVariables = Exact<{
  input: MarkWalkthroughDoneInput;
}>;


export type MarkWalkthroughDoneQuery = { __typename?: 'Query', markWalkthroughDone: boolean };

export type MeContactDetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type MeContactDetailsQuery = { __typename?: 'Query', meContactDetails?: { __typename?: 'User', email: string, phone: string } | null };

export type MeCheckUserQueryVariables = Exact<{ [key: string]: never; }>;


export type MeCheckUserQuery = { __typename?: 'Query', meUser?: { __typename?: 'User', _id: string, firstName: string, status: UserStatus, creatorUser?: string | null, permissions?: Array<{ __typename?: 'UserPermission', type: string, status: boolean }> | null } | null };

export type MeUserJourneyQueryVariables = Exact<{ [key: string]: never; }>;


export type MeUserJourneyQuery = { __typename?: 'Query', meUserJourney: { __typename?: 'UserJourney', userStatus: UserStatus, hostStatus?: HostStatus | null, hostOnboardingCompleted: boolean, isAdminVerified: boolean, canPublish: boolean, suggestedRoute: string, hostId?: string | null } };

export type UserLoginVerificationQueryVariables = Exact<{
  input: UserLoginVerificationInput;
}>;


export type UserLoginVerificationQuery = { __typename?: 'Query', userLoginVerification: boolean };

export type UserSignUpQueryVariables = Exact<{
  input: UserSignupInput;
}>;


export type UserSignUpQuery = { __typename?: 'Query', userSignup: string };

export type UserSignupVerificationQueryVariables = Exact<{
  input: UserSignupVerificationInput;
}>;


export type UserSignupVerificationQuery = { __typename?: 'Query', userSignupVerification: boolean };

export type GetAllHostEmailCampaignsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
  filter?: InputMaybe<Array<FilterDataInput> | FilterDataInput>;
  sort?: InputMaybe<SortDataInput>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAllHostEmailCampaignsQuery = { __typename?: 'Query', getAllHostEmailCampaigns: { __typename?: 'HostEmailCampaignsPaginatedResponse', total: number, items: Array<{ __typename?: 'HostEmailCampaignsObject', _id: string, businessId: string, hostId?: string | null, campaignName?: string | null, emailSubject?: string | null, status?: HostEmailCampaignStatusEnum | null, target?: HostEmailTargetType | null, eventId?: string | null, targetCount?: number | null, csvDataUrl?: string | null, filters?: Array<HostCampaignAudienceFilter> | null, scheduleType?: HostEmailCampaignScheduleType | null, scheduleTime?: any | null, ctaLink?: string | null, emailStatus?: HostEmailCampaignPublicationStatus | null, sentAt?: any | null, createdAt?: any | null, updatedAt?: any | null, emailTemplate?: { __typename?: 'HostEmailTemplate', designJson: string, content: string, html: string } | null, statusChangeHistory?: Array<{ __typename?: 'HostEmailCampaignStatusHistoryItem', status: HostEmailCampaignStatusEnum, timestamp?: any | null }> | null, stats?: { __typename?: 'HostEmailCampaignStats', mailsSent: number, mailsDelivered: number, mailsBounced?: number | null, mailsOpened: Array<{ __typename?: 'HostEmailStatEntry', email: string, date: any }>, mailsClicked: Array<{ __typename?: 'HostEmailStatEntry', email: string, date: any }> } | null }> } };

export type FetchHostCampaignByIdQueryVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type FetchHostCampaignByIdQuery = { __typename?: 'Query', fetchHostCampaignById: { __typename?: 'HostEmailCampaignsObject', _id: string, businessId: string, hostId?: string | null, campaignName?: string | null, emailSubject?: string | null, status?: HostEmailCampaignStatusEnum | null, target?: HostEmailTargetType | null, eventId?: string | null, targetCount?: number | null, csvDataUrl?: string | null, filters?: Array<HostCampaignAudienceFilter> | null, scheduleType?: HostEmailCampaignScheduleType | null, scheduleTime?: any | null, ctaLink?: string | null, emailStatus?: HostEmailCampaignPublicationStatus | null, createdAt?: any | null, updatedAt?: any | null, emailTemplate?: { __typename?: 'HostEmailTemplate', designJson: string, content: string, html: string } | null, statusChangeHistory?: Array<{ __typename?: 'HostEmailCampaignStatusHistoryItem', status: HostEmailCampaignStatusEnum, timestamp?: any | null }> | null, stats?: { __typename?: 'HostEmailCampaignStats', mailsSent: number, mailsDelivered: number, mailsBounced?: number | null, mailsOpened: Array<{ __typename?: 'HostEmailStatEntry', email: string, date: any }>, mailsClicked: Array<{ __typename?: 'HostEmailStatEntry', email: string, date: any }> } | null } };

export type CreateHostEmailCampaignMutationVariables = Exact<{
  input: AddHostEmailCampaignInput;
}>;


export type CreateHostEmailCampaignMutation = { __typename?: 'Mutation', createHostEmailCampaign: string };

export type UpdateHostEmailCampaignMutationVariables = Exact<{
  input: UpdateHostEmailCampaignInput;
}>;


export type UpdateHostEmailCampaignMutation = { __typename?: 'Mutation', updateHostEmailCampaign: boolean };

export type DeleteHostEmailCampaignMutationVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type DeleteHostEmailCampaignMutation = { __typename?: 'Mutation', deleteHostEmailCampaign: boolean };

export type DuplicateHostEmailCampaignMutationVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type DuplicateHostEmailCampaignMutation = { __typename?: 'Mutation', duplicateHostEmailCampaign: string };

export type ResumeHostEmailCampaignMutationVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type ResumeHostEmailCampaignMutation = { __typename?: 'Mutation', resumeHostEmailCampaign: boolean };

export type CreateMarketingCreditTopUpOrderMutationVariables = Exact<{
  input: MarketingCreditTopUpOrderInput;
}>;


export type CreateMarketingCreditTopUpOrderMutation = { __typename?: 'Mutation', createMarketingCreditTopUpOrder: { __typename?: 'MarketingCreditTopUpOrder', razorpayOrderId: string, razorpayKeyId: string, creditsAmount: number, gstAmount: number, platformFeeAmount: number, payableAmount: number, currency: string, receipt: string } };

export type VerifyMarketingCreditTopUpMutationVariables = Exact<{
  input: MarketingCreditTopUpVerifyInput;
}>;


export type VerifyMarketingCreditTopUpMutation = { __typename?: 'Mutation', verifyMarketingCreditTopUp: { __typename?: 'MarketingCreditTopUpVerifyResponse', balance: number, entry: { __typename?: 'MarketingCreditLedgerEntry', _id: string, amount: number, balance: number, activity: string, paymentReference?: string | null, createdAt?: any | null } } };

export type GetHostAttendeesTargetCountQueryVariables = Exact<{
  target?: InputMaybe<HostEmailTargetType>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<HostCampaignAudienceFilter> | HostCampaignAudienceFilter>;
}>;


export type GetHostAttendeesTargetCountQuery = { __typename?: 'Query', getHostAttendeesTargetCount: number };

export type HostEmailCampaignCsvExportQueryVariables = Exact<{
  input: CsvExportInput;
}>;


export type HostEmailCampaignCsvExportQuery = { __typename?: 'Query', hostEmailCampaignCsvExport: string };

export type SendTestHostCampaignEmailQueryVariables = Exact<{
  input: HostEmailCampaignTestInput;
}>;


export type SendTestHostCampaignEmailQuery = { __typename?: 'Query', sendTestHostCampaignEmail: boolean };

export type MyMarketingCreditLedgerQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type MyMarketingCreditLedgerQuery = { __typename?: 'Query', myMarketingCreditLedger: { __typename?: 'MarketingCreditLedgerResponse', balance: number, total: number, items: Array<{ __typename?: 'MarketingCreditLedgerEntry', _id: string, businessId: string, hostId?: string | null, type: string, amount: number, balance: number, activity: string, recipients?: number | null, channel?: string | null, campaignId?: string | null, paymentReference?: string | null, createdAt?: any | null, updatedAt?: any | null }> } };

export type AiBoostFieldsFragment = { __typename?: 'AiBoost', offerCode: string, label: string, description?: string | null, shortReason?: string | null, confidenceScore: number, commissionPct: number, extraAmount: number, customerViewingMessage?: string | null, hoizrAdminSummary?: string | null, totalSavingsForHosts?: { __typename?: 'AiBoostSavings', value: number } | null, howMuchDifferentFromBasicOffer?: { __typename?: 'AiBoostDelta', deltaPct: number } | null, howMuchDifferentFromCompetitors?: { __typename?: 'AiBoostDelta', deltaPct: number } | null, computed?: { __typename?: 'AiBoostComputed', expectedGrossSales: number, hoizrCommission: number, hostPayout: number, hoizrNetContribution: number, hoizrEstimatedLoss: number } | null };

export type EventOfferGenerationFieldsFragment = { __typename?: 'EventOfferGeneration', _id: string, eventId: string, hostId: string, modelName?: string | null, recommendedOfferCode?: string | null, selectedOfferCode?: string | null, selectedAt?: any | null, offers: Array<{ __typename?: 'AiBoost', offerCode: string, label: string, description?: string | null, shortReason?: string | null, confidenceScore: number, commissionPct: number, extraAmount: number, customerViewingMessage?: string | null, hoizrAdminSummary?: string | null, totalSavingsForHosts?: { __typename?: 'AiBoostSavings', value: number } | null, howMuchDifferentFromBasicOffer?: { __typename?: 'AiBoostDelta', deltaPct: number } | null, howMuchDifferentFromCompetitors?: { __typename?: 'AiBoostDelta', deltaPct: number } | null, computed?: { __typename?: 'AiBoostComputed', expectedGrossSales: number, hoizrCommission: number, hostPayout: number, hoizrNetContribution: number, hoizrEstimatedLoss: number } | null }> };

export type GenerateAiBoostsForEventMutationVariables = Exact<{
  input: GenerateAiBoostsInput;
}>;


export type GenerateAiBoostsForEventMutation = { __typename?: 'Mutation', generateAiBoostsForEvent: { __typename?: 'EventOfferGeneration', _id: string, eventId: string, hostId: string, modelName?: string | null, recommendedOfferCode?: string | null, selectedOfferCode?: string | null, selectedAt?: any | null, offers: Array<{ __typename?: 'AiBoost', offerCode: string, label: string, description?: string | null, shortReason?: string | null, confidenceScore: number, commissionPct: number, extraAmount: number, customerViewingMessage?: string | null, hoizrAdminSummary?: string | null, totalSavingsForHosts?: { __typename?: 'AiBoostSavings', value: number } | null, howMuchDifferentFromBasicOffer?: { __typename?: 'AiBoostDelta', deltaPct: number } | null, howMuchDifferentFromCompetitors?: { __typename?: 'AiBoostDelta', deltaPct: number } | null, computed?: { __typename?: 'AiBoostComputed', expectedGrossSales: number, hoizrCommission: number, hostPayout: number, hoizrNetContribution: number, hoizrEstimatedLoss: number } | null }> } };

export type SelectAiBoostMutationVariables = Exact<{
  input: SelectAiBoostInput;
}>;


export type SelectAiBoostMutation = { __typename?: 'Mutation', selectAiBoost: { __typename?: 'EventOfferGeneration', _id: string, eventId: string, hostId: string, modelName?: string | null, recommendedOfferCode?: string | null, selectedOfferCode?: string | null, selectedAt?: any | null, offers: Array<{ __typename?: 'AiBoost', offerCode: string, label: string, description?: string | null, shortReason?: string | null, confidenceScore: number, commissionPct: number, extraAmount: number, customerViewingMessage?: string | null, hoizrAdminSummary?: string | null, totalSavingsForHosts?: { __typename?: 'AiBoostSavings', value: number } | null, howMuchDifferentFromBasicOffer?: { __typename?: 'AiBoostDelta', deltaPct: number } | null, howMuchDifferentFromCompetitors?: { __typename?: 'AiBoostDelta', deltaPct: number } | null, computed?: { __typename?: 'AiBoostComputed', expectedGrossSales: number, hoizrCommission: number, hostPayout: number, hoizrNetContribution: number, hoizrEstimatedLoss: number } | null }> } };

export type GetLatestAiBoostGenerationQueryVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type GetLatestAiBoostGenerationQuery = { __typename?: 'Query', getLatestAiBoostGeneration?: { __typename?: 'EventOfferGeneration', _id: string, eventId: string, hostId: string, modelName?: string | null, recommendedOfferCode?: string | null, selectedOfferCode?: string | null, selectedAt?: any | null, offers: Array<{ __typename?: 'AiBoost', offerCode: string, label: string, description?: string | null, shortReason?: string | null, confidenceScore: number, commissionPct: number, extraAmount: number, customerViewingMessage?: string | null, hoizrAdminSummary?: string | null, totalSavingsForHosts?: { __typename?: 'AiBoostSavings', value: number } | null, howMuchDifferentFromBasicOffer?: { __typename?: 'AiBoostDelta', deltaPct: number } | null, howMuchDifferentFromCompetitors?: { __typename?: 'AiBoostDelta', deltaPct: number } | null, computed?: { __typename?: 'AiBoostComputed', expectedGrossSales: number, hoizrCommission: number, hostPayout: number, hoizrNetContribution: number, hoizrEstimatedLoss: number } | null }> } | null };

export type RunEventEvalMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type RunEventEvalMutation = { __typename?: 'Mutation', runEventEval: { __typename?: 'EventEvalResultView', ranThroughAi: boolean, eventScore: number, aiShortSummary: string, expectedAudience?: number | null, assignedTagIds: Array<string>, aiEvalAdminSummary: string, spellingMistakes: Array<{ __typename?: 'EventSpellingMistake', field: string, word: string, suggestion?: string | null, context?: string | null }>, seoSuggestions: Array<{ __typename?: 'EventSeoSuggestion', field: string, suggestion: string, severity: EventSeoSuggestionSeverity }> } };

export type AutoGenerateEventDescriptionMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type AutoGenerateEventDescriptionMutation = { __typename?: 'Mutation', autoGenerateEventDescription: { __typename?: 'EventEvalResultView', suggestedDescription?: string | null, aiShortSummary: string } };

export type EventOnboardingChecklistQueryVariables = Exact<{ [key: string]: never; }>;


export type EventOnboardingChecklistQuery = { __typename?: 'Query', eventOnboardingChecklist: { __typename?: 'EventOnboardingChecklist', logo: number, adminverification: number, payout: number, event: number, Scanner: number, nextSteps: Array<{ __typename?: 'EventOnboardingStep', key: string, title: string, description: string, actionHref?: string | null, blocksEventCreation: boolean, blocksPaidEvent: boolean }> } };

export type DuplicateEventMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DuplicateEventMutation = { __typename?: 'Mutation', duplicateEvent: { __typename?: 'Event', _id: string, title?: string | null, slug?: string | null, status: EventStatus } };

export type CreateEventMutationVariables = Exact<{
  input: CreateEventInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: { __typename?: 'Event', _id: string, title?: string | null, status: EventStatus, eventType?: Array<EventType> | null, slug?: string | null } };

export type UpdateEventStepMutationVariables = Exact<{
  id: Scalars['String']['input'];
  step: Scalars['Int']['input'];
  stepInput: EventInput;
}>;


export type UpdateEventStepMutation = { __typename?: 'Mutation', updateEventStep: { __typename?: 'Event', _id: string, title?: string | null, status: EventStatus, eventType?: Array<EventType> | null, city?: string | null, isVisible?: boolean | null } };

export type EventPricingOptionsQueryVariables = Exact<{
  input: EventPricingCalculatorInput;
}>;


export type EventPricingOptionsQuery = { __typename?: 'Query', eventPricingOptions: Array<{ __typename?: 'EventPricingOptionResponse', optionId: string, plan: EventPricingPlan, label: string, commissionRate: number, customerPlatformFeeRate: number, upfrontFee: number, expectedPaidTickets: number, expectedGrossSales: number, hostPayout: number, hoizrNetContribution: number, payoutCycleDaysMin: number, payoutCycleDaysMax: number, badge: string }> };

export type SelectEventPricingOptionMutationVariables = Exact<{
  input: SelectEventPricingInput;
}>;


export type SelectEventPricingOptionMutation = { __typename?: 'Mutation', selectEventPricingOption: { __typename?: 'Event', _id: string, selectedPricingPlan?: EventPricingPlan | null, feeSettlementMode?: EventFeeSettlementMode | null } };

export type GetMyEventsForSelectorQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyEventsForSelectorQuery = { __typename?: 'Query', getMyEvents: Array<{ __typename?: 'Event', _id: string, title?: string | null, description?: string | null, eventFlyer?: string | null, eventType?: Array<EventType> | null, startDate?: any | null, endDate?: any | null, city?: string | null, slug?: string | null, status: EventStatus, tickets?: Array<{ __typename?: 'EventTicket', ticketCapacity: number, ticketSold: number, ticketPrice: number, ticketVisible?: boolean | null, ticketName: string, description?: string | null }> | null }> };

export type HostListEventScansQueryVariables = Exact<{
  eventId: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type HostListEventScansQuery = { __typename?: 'Query', hostListEventScans: { __typename?: 'HostEventScansPaginatedResponse', total: number, items: Array<{ __typename?: 'HostEventScanRow', orderId: string, customerName?: string | null, customerPhone?: string | null, ticketCount: number, ticketNames: Array<string>, checkedInAt?: any | null, scannerId?: string | null, scannerName?: string | null }> } };

export type HostReverseCheckInMutationVariables = Exact<{
  orderId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
}>;


export type HostReverseCheckInMutation = { __typename?: 'Mutation', hostReverseCheckIn: boolean };

export type HostRevokeAllScannersForEventMutationVariables = Exact<{
  eventId: Scalars['String']['input'];
}>;


export type HostRevokeAllScannersForEventMutation = { __typename?: 'Mutation', hostRevokeAllScannersForEvent: number };

export type AddressInfoFragment = { __typename?: 'AddressInfo', addressLine1?: string | null, addressLine2?: string | null, state?: string | null, city?: string | null, pincode?: string | null, coordinate?: { __typename?: 'CoordinatePoint', coordinates: Array<number> } | null, place?: { __typename?: 'PlaceInfo', displayName?: string | null, placeId?: string | null } | null };

export type GetMyHostContentDefaultsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyHostContentDefaultsQuery = { __typename?: 'Query', getMyHostContentDefaults?: { __typename?: 'HostContentDefaults', _id: string, hostId: string, ticketingTerms?: string | null, refundPolicy?: string | null } | null };

export type SaveMyHostContentDefaultsMutationVariables = Exact<{
  input: SaveHostContentDefaultsInput;
}>;


export type SaveMyHostContentDefaultsMutation = { __typename?: 'Mutation', saveMyHostContentDefaults: { __typename?: 'HostContentDefaults', _id: string, hostId: string, ticketingTerms?: string | null, refundPolicy?: string | null } };

export type MyMarketingReputationQueryVariables = Exact<{ [key: string]: never; }>;


export type MyMarketingReputationQuery = { __typename?: 'Query', myMarketingReputation: { __typename?: 'HostMarketingLimitObject', tier: HostMarketingReputationTier, effectiveTier: HostMarketingReputationTier, tierLabel: string, tierTagline: string, maxRecipients: number, unlimited: boolean, source: string, lifetimeRecipientsSent: number, verifiedCustomerCount: number, lifetimeCampaignCount: number, nextTier?: HostMarketingReputationTier | null, nextTierLabel?: string | null, recipientsToNextTier?: number | null, progressPercentToNextTier: number, benefits: Array<string>, channels: Array<{ __typename?: 'HostMarketingChannelLimit', channel: string, maxRecipients: number, unlimited: boolean, status: string }> } };

export type GetAllHostPushCampaignsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type GetAllHostPushCampaignsQuery = { __typename?: 'Query', getAllHostPushCampaigns: { __typename?: 'HostPushCampaignsPaginatedResponse', total: number, items: Array<{ __typename?: 'HostPushCampaign', _id: string, businessId: string, hostId?: string | null, campaignName: string, pushTitle: string, pushBody: string, deepLink?: string | null, imageUrl?: string | null, target?: HostEmailTargetType | null, eventId?: string | null, csvDataUrl?: string | null, filters?: Array<HostCampaignAudienceFilter> | null, targetCount?: number | null, status?: HostPushCampaignStatus | null, publicationStatus?: HostPushCampaignPublicationStatus | null, scheduleType?: HostPushCampaignScheduleType | null, scheduleTime?: any | null, sentAt?: any | null, createdAt?: any | null, updatedAt?: any | null, stats?: { __typename?: 'HostPushCampaignStats', notificationsSent: number, notificationsFailed: number, notificationsOpened: Array<{ __typename?: 'HostPushNotificationStatEntry', customerId: string, date: any }>, notificationsClicked: Array<{ __typename?: 'HostPushNotificationStatEntry', customerId: string, date: any }> } | null, statusChangeHistory?: Array<{ __typename?: 'HostPushCampaignStatusHistoryItem', status: HostPushCampaignStatus, timestamp?: any | null }> | null }> } };

export type FetchHostPushCampaignByIdQueryVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type FetchHostPushCampaignByIdQuery = { __typename?: 'Query', fetchHostPushCampaignById?: { __typename?: 'HostPushCampaign', _id: string, businessId: string, hostId?: string | null, campaignName: string, pushTitle: string, pushBody: string, deepLink?: string | null, imageUrl?: string | null, target?: HostEmailTargetType | null, eventId?: string | null, csvDataUrl?: string | null, filters?: Array<HostCampaignAudienceFilter> | null, targetCount?: number | null, status?: HostPushCampaignStatus | null, publicationStatus?: HostPushCampaignPublicationStatus | null, scheduleType?: HostPushCampaignScheduleType | null, scheduleTime?: any | null, sentAt?: any | null, createdAt?: any | null, updatedAt?: any | null, stats?: { __typename?: 'HostPushCampaignStats', notificationsSent: number, notificationsFailed: number, notificationsOpened: Array<{ __typename?: 'HostPushNotificationStatEntry', customerId: string, date: any }>, notificationsClicked: Array<{ __typename?: 'HostPushNotificationStatEntry', customerId: string, date: any }> } | null, statusChangeHistory?: Array<{ __typename?: 'HostPushCampaignStatusHistoryItem', status: HostPushCampaignStatus, timestamp?: any | null }> | null } | null };

export type CreateHostPushCampaignMutationVariables = Exact<{
  input: CreateHostPushCampaignInput;
}>;


export type CreateHostPushCampaignMutation = { __typename?: 'Mutation', createHostPushCampaign: { __typename?: 'HostPushCampaign', _id: string } };

export type UpdateHostPushCampaignMutationVariables = Exact<{
  input: UpdateHostPushCampaignInput;
}>;


export type UpdateHostPushCampaignMutation = { __typename?: 'Mutation', updateHostPushCampaign: { __typename?: 'HostPushCampaign', _id: string } };

export type DeleteHostPushCampaignMutationVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type DeleteHostPushCampaignMutation = { __typename?: 'Mutation', deleteHostPushCampaign: boolean };

export type PublishHostPushCampaignMutationVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type PublishHostPushCampaignMutation = { __typename?: 'Mutation', publishHostPushCampaign: { __typename?: 'HostPushCampaign', _id: string, status?: HostPushCampaignStatus | null, publicationStatus?: HostPushCampaignPublicationStatus | null } };

export type GetHostsByBusinessQueryVariables = Exact<{ [key: string]: never; }>;


export type GetHostsByBusinessQuery = { __typename?: 'Query', getHostsByBusiness: Array<{ __typename?: 'Host', _id: string, name?: string | null, email?: string | null, phone?: string | null, hostType: HostType, venueType?: string | null, description?: string | null, logo?: string | null, businessRegistrationNumber?: string | null, gstNumber?: string | null, websiteUrl?: string | null, averageEventSize?: string | null, profileComplete: boolean, status: HostStatus, onboardingCompleted: boolean, isAdminVerified: boolean, isActive: boolean, createdAt?: any | null, updatedAt?: any | null, address?: { __typename?: 'AddressInfo', addressLine1?: string | null, addressLine2?: string | null, state?: string | null, city?: string | null, pincode?: string | null, coordinate?: { __typename?: 'CoordinatePoint', coordinates: Array<number> } | null, place?: { __typename?: 'PlaceInfo', displayName?: string | null, placeId?: string | null } | null } | null }> };

export type GetHostQueryVariables = Exact<{ [key: string]: never; }>;


export type GetHostQuery = { __typename?: 'Query', getHost?: { __typename?: 'Host', _id: string, name?: string | null, email?: string | null, phone?: string | null, hostType: HostType, venueType?: string | null, description?: string | null, logo?: string | null, businessRegistrationNumber?: string | null, gstNumber?: string | null, websiteUrl?: string | null, averageEventSize?: string | null, profileComplete: boolean, status: HostStatus, onboardingCompleted: boolean, isAdminVerified: boolean, isActive: boolean, createdAt?: any | null, updatedAt?: any | null, address?: { __typename?: 'AddressInfo', addressLine1?: string | null, addressLine2?: string | null, state?: string | null, city?: string | null, pincode?: string | null, coordinate?: { __typename?: 'CoordinatePoint', coordinates: Array<number> } | null, place?: { __typename?: 'PlaceInfo', displayName?: string | null, placeId?: string | null } | null } | null } | null };

export type GetHostDashboardSummaryQueryVariables = Exact<{
  input?: InputMaybe<HostDashboardSummaryInput>;
}>;


export type GetHostDashboardSummaryQuery = { __typename?: 'Query', getHostDashboardSummary: { __typename?: 'HostDashboardSummary', upcomingEventsCount: number, publishedEventsCount: number, draftEventsCount: number, salesToday: number, ticketsSoldToday: number, salesLast30Days: number, ticketsSoldLast30Days: number, orderCountLast30Days: number, averageOrderValueLast30Days: number, pendingSettlementsCount: number, paidOutLifetime: number, marketingSubscribersCount: number, lifetimeCampaignMessagesSent: number, salesSeries: Array<{ __typename?: 'HostDashboardSeriesPoint', date: string, label: string, sales: number, tickets: number, orderCount: number }>, salesBySource: Array<{ __typename?: 'HostDashboardBreakdownRow', label: string, amount: number, count: number, percent: number }>, ticketMix: Array<{ __typename?: 'HostDashboardBreakdownRow', label: string, amount: number, count: number, percent: number }>, topItems: Array<{ __typename?: 'HostDashboardBreakdownRow', label: string, amount: number, count: number, percent: number }>, upcomingCampaigns: Array<{ __typename?: 'HostDashboardCampaignRow', id: string, name: string, status: string, scheduledFor?: any | null, recipientCount: number }> } };

export type CreateHostMutationVariables = Exact<{
  input: CreateHostInput;
}>;


export type CreateHostMutation = { __typename?: 'Mutation', createHost: boolean };

export type UpdateHostMutationVariables = Exact<{
  input: UpdateHostInput;
}>;


export type UpdateHostMutation = { __typename?: 'Mutation', updateHost: boolean };

export type UploadHostLogoMutationVariables = Exact<{
  logo: Scalars['String']['input'];
}>;


export type UploadHostLogoMutation = { __typename?: 'Mutation', uploadHostLogo: boolean };

export type GetActiveIndianCitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveIndianCitiesQuery = { __typename?: 'Query', getActiveIndianCities: Array<{ __typename?: 'IndianCity', _id: string, value: string, state?: string | null }> };

export type GetActiveStatesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveStatesQuery = { __typename?: 'Query', getActiveStates: Array<{ __typename?: 'StateOption', _id: string, value: string }> };

export type GetActiveEventCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveEventCategoriesQuery = { __typename?: 'Query', getActiveEventCategories: Array<{ __typename?: 'EventCategory', _id: string, value: string, description?: string | null }> };

export type GetActiveGenreTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveGenreTagsQuery = { __typename?: 'Query', getActiveGenreTags: Array<{ __typename?: 'GenreTag', _id: string, value: string }> };

export type GetActiveLanguagesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveLanguagesQuery = { __typename?: 'Query', getActiveLanguages: Array<{ __typename?: 'LanguageMaster', _id: string, code: string, value: string, nativeName?: string | null, isIndian: boolean, order: number }> };

export type GetActiveProhibitedItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveProhibitedItemsQuery = { __typename?: 'Query', getActiveProhibitedItems: Array<{ __typename?: 'ProhibitedItemMaster', _id: string, slug: string, value: string, description?: string | null, order: number }> };

export type GetConfigQueryVariables = Exact<{
  type: ConfigTypeEnum;
}>;


export type GetConfigQuery = { __typename?: 'Query', getConfig: { __typename?: 'Config', _id: string, type: ConfigTypeEnum, valueType: ConfigValueEnum, textVal?: string | null, numVal?: number | null, boolVal?: boolean | null, createdAt: any, updatedAt: any, createdBy?: { __typename?: 'Admin', firstName?: string | null, lastName?: string | null } | null, updatedBy?: { __typename?: 'Admin', firstName?: string | null, lastName?: string | null } | null } };

export type GetMarketingPricingQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMarketingPricingQuery = { __typename?: 'Query', getMarketingPricing: { __typename?: 'MarketingPricing', emailRate: number, smsRate: number, whatsappRate: number, pushRate: number, gstPercent: number, platformFeePercent: number, currency: string } };

export type DeleteHostCloudinaryAssetMutationVariables = Exact<{
  assetUrl: Scalars['String']['input'];
}>;


export type DeleteHostCloudinaryAssetMutation = { __typename?: 'Mutation', deleteHostCloudinaryAsset: boolean };

export type AllPlacesQueryVariables = Exact<{
  input: Scalars['String']['input'];
}>;


export type AllPlacesQuery = { __typename?: 'Query', getPlacesList: Array<{ __typename?: 'Places', placeId: string, displayName: string }> };

export type PlaceDetailsQueryVariables = Exact<{
  placeId: Scalars['String']['input'];
}>;


export type PlaceDetailsQuery = { __typename?: 'Query', getPlaceDetails?: { __typename?: 'PlaceDetail', latitude: number, longitude: number, city?: string | null, state?: string | null, address?: string | null, zipcode?: string | null } | null };

export type CreateHostOnboardingMutationVariables = Exact<{
  input: CreateHostInput;
}>;


export type CreateHostOnboardingMutation = { __typename?: 'Mutation', createHost: boolean };

export type UpdateHostOnboardingMutationVariables = Exact<{
  input: UpdateHostInput;
}>;


export type UpdateHostOnboardingMutation = { __typename?: 'Mutation', updateHost: boolean };

export type CompleteHostOnboardingMutationVariables = Exact<{ [key: string]: never; }>;


export type CompleteHostOnboardingMutation = { __typename?: 'Mutation', completeHostOnboarding: boolean };

export type StartNewHostOnboardingMutationVariables = Exact<{ [key: string]: never; }>;


export type StartNewHostOnboardingMutation = { __typename?: 'Mutation', startNewHostOnboarding: boolean };

export type HostOnboardingDataQueryVariables = Exact<{ [key: string]: never; }>;


export type HostOnboardingDataQuery = { __typename?: 'Query', getCurrentHostOnboarding?: { __typename?: 'Host', _id: string, name?: string | null, email?: string | null, phone?: string | null, description?: string | null, logo?: string | null, hostType: HostType, venueType?: string | null, status: HostStatus, onboardingCompleted: boolean, isAdminVerified: boolean, businessRegistrationNumber?: string | null, averageEventSize?: string | null, gstNumber?: string | null, websiteUrl?: string | null, address?: { __typename?: 'AddressInfo', addressLine1?: string | null, addressLine2?: string | null, state?: string | null, city?: string | null, pincode?: string | null, coordinate?: { __typename?: 'CoordinatePoint', coordinates: Array<number> } | null, place?: { __typename?: 'PlaceInfo', displayName?: string | null, placeId?: string | null } | null } | null } | null };

export type MeUserInResOnboardingQueryVariables = Exact<{ [key: string]: never; }>;


export type MeUserInResOnboardingQuery = { __typename?: 'Query', meUser?: { __typename?: 'User', status: UserStatus } | null };

export type HostPayoutAccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type HostPayoutAccountsQuery = { __typename?: 'Query', hostPayoutAccounts: Array<{ __typename?: 'HostPayoutAccount', _id: string, entityName?: string | null, entityType?: PayoutEntityType | null, panNumber?: string | null, taxDeductionAccountNumber?: string | null, contactEmail?: string | null, contactPhone?: string | null, accountHolderName: string, accountNumber: string, last4: string, ifscCode: string, bankName: string, branchName?: string | null, accountType: AccountType, upiId?: string | null, isActive: boolean, isPrimary: boolean, verificationStatus: VerificationStatus, rejectionReason?: string | null, isGstRegistered: boolean, gstin?: string | null, gstRegistrationType?: GstRegistrationType | null, registeredBusinessName?: string | null, gstRegistrationDate?: any | null, createdAt?: any | null, updatedAt?: any | null }> };

export type HostListPayoutSettlementsQueryVariables = Exact<{
  input?: InputMaybe<ListHostPayoutSettlementsInput>;
}>;


export type HostListPayoutSettlementsQuery = { __typename?: 'Query', hostListPayoutSettlements: { __typename?: 'PayoutSettlementPaginatedResponse', total: number, items: Array<{ __typename?: 'PayoutSettlement', _id: string, eventId: string, grossAmount: number, hoizrCommissionTotal: number, hoizrCommissionGstTotal: number, ticketGstFlowThroughTotal: number, finalDeclaredOfferAmount: number, razorpayFeeTotal: number, netPayoutAmount: number, refundsTotal?: number | null, chargebacksTotal?: number | null, orderCount: number, status: PayoutSettlementStatus, scheduledFor: any, paidAt?: any | null, paidMethod?: PayoutSettlementMethod | null, razorpayPayoutId?: string | null, invoiceId?: string | null, invoiceUrl?: string | null, errorMessage?: string | null, createdAt?: any | null, updatedAt?: any | null }> } };

export type HostGetPayoutStatementUrlQueryVariables = Exact<{
  settlementId: Scalars['String']['input'];
}>;


export type HostGetPayoutStatementUrlQuery = { __typename?: 'Query', hostGetPayoutStatementUrl: { __typename?: 'SignedPdfUrl', signedUrl: string, expiresAt: any } };

export type AddPayoutMutationVariables = Exact<{
  input: AddPayoutInput;
}>;


export type AddPayoutMutation = { __typename?: 'Mutation', addPayout: { __typename?: 'Payout', _id: string, verificationStatus: VerificationStatus } };

export type AddHostPayoutAccountMutationVariables = Exact<{
  input: AddPayoutInput;
}>;


export type AddHostPayoutAccountMutation = { __typename?: 'Mutation', addHostPayoutAccount: { __typename?: 'HostPayoutAccount', _id: string, verificationStatus: VerificationStatus, isPrimary: boolean, last4: string } };

export type SetPrimaryPayoutMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type SetPrimaryPayoutMutation = { __typename?: 'Mutation', setPrimaryPayout: { __typename?: 'Payout', _id: string, isPrimary: boolean } };

export type SetPrimaryHostPayoutAccountMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type SetPrimaryHostPayoutAccountMutation = { __typename?: 'Mutation', setPrimaryHostPayoutAccount: { __typename?: 'HostPayoutAccount', _id: string, isPrimary: boolean } };

export type AddTeamMemberMutationVariables = Exact<{
  AddTeamMemberInput: AddTeamMemberInput;
}>;


export type AddTeamMemberMutation = { __typename?: 'Mutation', addTeamMember: boolean };

export type UpdateSubuserPermissionsMutationVariables = Exact<{
  input: UpdateSubuserPermissionsInput;
}>;


export type UpdateSubuserPermissionsMutation = { __typename?: 'Mutation', updateSubuserPermissions: boolean };

export type UpdateSubuserRoleMutationVariables = Exact<{
  input: UpdateSubuserRoleInput;
}>;


export type UpdateSubuserRoleMutation = { __typename?: 'Mutation', updateSubuserRole: boolean };

export type GetTeamMembersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTeamMembersQuery = { __typename?: 'Query', getTeamMembers: Array<{ __typename?: 'SubUser', firstName: string, lastName: string, email: string, phone: string, role: string, status: UserStatus, _id?: { __typename?: 'User', _id: string } | null }> };

export type GetUserQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', _id: string, role: UserRole, teamRole: TeamRole, permissions?: Array<{ __typename?: 'UserPermission', status: boolean, type: string, id: string }> | null, hosts?: Array<{ __typename?: 'HostInfo', _id?: string | null }> | null } | null };

export type DeleteTeamMemberQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteTeamMemberQuery = { __typename?: 'Query', deleteTeamMember: boolean };

export type VerifyTeamEmailMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type VerifyTeamEmailMutation = { __typename?: 'Mutation', verifyTeamEmail: boolean };

export type GetAllPermissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllPermissionsQuery = { __typename?: 'Query', getAllPermissions: Array<{ __typename?: 'Permission', _id: string, type: PermissionTypeEnum, preselect: Array<TeamRole>, isFunction: boolean }> };

export type UpdateUserDetailsQueryVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateUserDetailsQuery = { __typename?: 'Query', updateUserDetails: boolean };

export type MeUserforProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type MeUserforProfileQuery = { __typename?: 'Query', meUser?: { __typename?: 'User', enable2FA: boolean, _id: string, firstName: string, lastName: string, status: UserStatus, email: string, phone: string, accountPreferences?: { __typename?: 'AccountPreference', sms: boolean, email: boolean, whatsapp: boolean } | null } | null };

export type Enable2FaQueryVariables = Exact<{ [key: string]: never; }>;


export type Enable2FaQuery = { __typename?: 'Query', enable2FA: string };

export type Disable2FQueryVariables = Exact<{
  authCode: Scalars['String']['input'];
}>;


export type Disable2FQuery = { __typename?: 'Query', disable2FA: boolean };

export type Verify2FaSetupQueryVariables = Exact<{
  authCode: Scalars['String']['input'];
}>;


export type Verify2FaSetupQuery = { __typename?: 'Query', verify2FASetup: boolean };

export type IsMultiAccountUserQueryVariables = Exact<{ [key: string]: never; }>;


export type IsMultiAccountUserQuery = { __typename?: 'Query', isMultiAccountUser: boolean };

export type SetHostIdAsCookieQueryVariables = Exact<{
  hostId: Scalars['String']['input'];
}>;


export type SetHostIdAsCookieQuery = { __typename?: 'Query', setHostIdAsCookie: boolean };

export type GetAllHostWhatsAppCampaignsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
  filter?: InputMaybe<Array<FilterDataInput> | FilterDataInput>;
  sort?: InputMaybe<SortDataInput>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAllHostWhatsAppCampaignsQuery = { __typename?: 'Query', getAllHostWhatsAppCampaigns: { __typename?: 'HostWhatsAppCampaignsPaginatedResponse', total: number, items: Array<{ __typename?: 'HostWhatsAppCampaign', _id: string, businessId: string, hostId?: string | null, campaignName: string, objectiveTag?: string | null, templateId?: string | null, templateSlugSnapshot?: string | null, templateLanguageSnapshot?: string | null, headerMediaUrl?: string | null, ctaSlug?: string | null, target?: HostEmailTargetType | null, eventId?: string | null, csvDataUrl?: string | null, filters?: Array<HostCampaignAudienceFilter> | null, targetCount?: number | null, status?: HostWhatsAppCampaignStatus | null, publicationStatus?: HostWhatsAppCampaignPublicationStatus | null, scheduleType?: HostWhatsAppCampaignScheduleType | null, scheduleTime?: any | null, createdAt?: any | null, updatedAt?: any | null, templateVariables: Array<{ __typename?: 'HostWhatsAppCampaignVariable', position: number, value: string }>, stats?: { __typename?: 'HostWhatsAppCampaignStats', messagesSent: number, messagesSyncFailed: number, messagesDelivered: number, messagesRead: number, messagesFailed: number } | null, statusChangeHistory?: Array<{ __typename?: 'HostWhatsAppCampaignStatusHistoryItem', status: HostWhatsAppCampaignStatus, timestamp?: any | null }> | null }> } };

export type FetchHostWhatsAppCampaignByIdQueryVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type FetchHostWhatsAppCampaignByIdQuery = { __typename?: 'Query', fetchHostWhatsAppCampaignById: { __typename?: 'HostWhatsAppCampaign', _id: string, campaignName: string, objectiveTag?: string | null, templateId?: string | null, templateSlugSnapshot?: string | null, templateLanguageSnapshot?: string | null, headerMediaUrl?: string | null, ctaSlug?: string | null, target?: HostEmailTargetType | null, eventId?: string | null, csvDataUrl?: string | null, filters?: Array<HostCampaignAudienceFilter> | null, targetCount?: number | null, status?: HostWhatsAppCampaignStatus | null, publicationStatus?: HostWhatsAppCampaignPublicationStatus | null, scheduleType?: HostWhatsAppCampaignScheduleType | null, scheduleTime?: any | null, templateVariables: Array<{ __typename?: 'HostWhatsAppCampaignVariable', position: number, value: string }>, stats?: { __typename?: 'HostWhatsAppCampaignStats', messagesSent: number, messagesSyncFailed: number, messagesDelivered: number, messagesRead: number, messagesFailed: number } | null } };

export type GetHostWhatsAppAttendeesTargetCountQueryVariables = Exact<{
  target?: InputMaybe<HostEmailTargetType>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<Array<HostCampaignAudienceFilter> | HostCampaignAudienceFilter>;
}>;


export type GetHostWhatsAppAttendeesTargetCountQuery = { __typename?: 'Query', getHostWhatsAppAttendeesTargetCount: number };

export type CreateHostWhatsAppCampaignMutationVariables = Exact<{
  input: AddHostWhatsAppCampaignInput;
}>;


export type CreateHostWhatsAppCampaignMutation = { __typename?: 'Mutation', createHostWhatsAppCampaign: string };

export type UpdateHostWhatsAppCampaignMutationVariables = Exact<{
  input: UpdateHostWhatsAppCampaignInput;
}>;


export type UpdateHostWhatsAppCampaignMutation = { __typename?: 'Mutation', updateHostWhatsAppCampaign: boolean };

export type DeleteHostWhatsAppCampaignMutationVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type DeleteHostWhatsAppCampaignMutation = { __typename?: 'Mutation', deleteHostWhatsAppCampaign: boolean };

export type DuplicateHostWhatsAppCampaignMutationVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type DuplicateHostWhatsAppCampaignMutation = { __typename?: 'Mutation', duplicateHostWhatsAppCampaign: string };

export type ResumeHostWhatsAppCampaignMutationVariables = Exact<{
  campaignId: Scalars['String']['input'];
}>;


export type ResumeHostWhatsAppCampaignMutation = { __typename?: 'Mutation', resumeHostWhatsAppCampaign: boolean };

export type ApprovedWhatsAppTemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type ApprovedWhatsAppTemplatesQuery = { __typename?: 'Query', approvedWhatsAppTemplates: { __typename?: 'WhatsAppTemplatesPaginatedResponse', total: number, items: Array<{ __typename?: 'WhatsAppMessageTemplate', _id: string, slug: string, name: string, category: WhatsAppTemplateCategory, language: string, headerType: WhatsAppTemplateHeaderType, bodyText: string, buttonType: WhatsAppTemplateButtonType, metaStatus: WhatsAppTemplateStatus, isActive: boolean, variables: Array<{ __typename?: 'WhatsAppTemplateVariable', position: number, example?: string | null }> }> } };

export const AiBoostFieldsFragmentDoc = gql`
    fragment AiBoostFields on AiBoost {
  offerCode
  label
  description
  shortReason
  confidenceScore
  commissionPct
  extraAmount
  customerViewingMessage
  hoizrAdminSummary
  totalSavingsForHosts {
    value
  }
  howMuchDifferentFromBasicOffer {
    deltaPct
  }
  howMuchDifferentFromCompetitors {
    deltaPct
  }
  computed {
    expectedGrossSales
    hoizrCommission
    hostPayout
    hoizrNetContribution
    hoizrEstimatedLoss
  }
}
    `;
export const EventOfferGenerationFieldsFragmentDoc = gql`
    fragment EventOfferGenerationFields on EventOfferGeneration {
  _id
  eventId
  hostId
  modelName
  recommendedOfferCode
  selectedOfferCode
  selectedAt
  offers {
    ...AiBoostFields
  }
}
    ${AiBoostFieldsFragmentDoc}`;
export const AddressInfoFragmentDoc = gql`
    fragment addressInfo on AddressInfo {
  addressLine1
  addressLine2
  state
  city
  pincode
  coordinate {
    coordinates
  }
  place {
    displayName
    placeId
  }
}
    `;
export const UserLogoutDocument = gql`
    query userLogout {
  userLogout
}
    `;
export const UserLogoutFromEverywhereDocument = gql`
    query userLogoutFromEverywhere {
  userLogoutFromEverywhere
}
    `;
export const UserLoginDocument = gql`
    query userLogin($input: String!) {
  userLogin(input: $input)
}
    `;
export const MeUserDocument = gql`
    query MeUser {
  meUser {
    _id
    firstName
    lastName
    status
    email
    phone
    creatorUser
    permissions {
      status
      type
    }
    role
    completedWalkthroughs
  }
}
    `;
export const MarkWalkthroughDoneDocument = gql`
    query MarkWalkthroughDone($input: MarkWalkthroughDoneInput!) {
  markWalkthroughDone(input: $input)
}
    `;
export const MeContactDetailsDocument = gql`
    query MeContactDetails {
  meContactDetails {
    email
    phone
  }
}
    `;
export const MeCheckUserDocument = gql`
    query MeCheckUser {
  meUser {
    _id
    firstName
    status
    creatorUser
    permissions {
      type
      status
    }
  }
}
    `;
export const MeUserJourneyDocument = gql`
    query MeUserJourney {
  meUserJourney {
    userStatus
    hostStatus
    hostOnboardingCompleted
    isAdminVerified
    canPublish
    suggestedRoute
    hostId
  }
}
    `;
export const UserLoginVerificationDocument = gql`
    query userLoginVerification($input: UserLoginVerificationInput!) {
  userLoginVerification(input: $input)
}
    `;
export const UserSignUpDocument = gql`
    query UserSignUp($input: UserSignupInput!) {
  userSignup(input: $input)
}
    `;
export const UserSignupVerificationDocument = gql`
    query userSignupVerification($input: UserSignupVerificationInput!) {
  userSignupVerification(input: $input)
}
    `;
export const GetAllHostEmailCampaignsDocument = gql`
    query getAllHostEmailCampaigns($pagination: PaginationInput, $filter: [FilterDataInput!], $sort: SortDataInput, $search: String) {
  getAllHostEmailCampaigns(
    pagination: $pagination
    filter: $filter
    sort: $sort
    search: $search
  ) {
    total
    items {
      _id
      businessId
      hostId
      campaignName
      emailSubject
      status
      target
      eventId
      targetCount
      csvDataUrl
      filters
      scheduleType
      scheduleTime
      ctaLink
      emailStatus
      sentAt
      createdAt
      updatedAt
      emailTemplate {
        designJson
        content
        html
      }
      statusChangeHistory {
        status
        timestamp
      }
      stats {
        mailsSent
        mailsDelivered
        mailsBounced
        mailsOpened {
          email
          date
        }
        mailsClicked {
          email
          date
        }
      }
    }
  }
}
    `;
export const FetchHostCampaignByIdDocument = gql`
    query fetchHostCampaignById($campaignId: String!) {
  fetchHostCampaignById(campaignId: $campaignId) {
    _id
    businessId
    hostId
    campaignName
    emailSubject
    status
    target
    eventId
    targetCount
    csvDataUrl
    filters
    scheduleType
    scheduleTime
    ctaLink
    emailStatus
    createdAt
    updatedAt
    emailTemplate {
      designJson
      content
      html
    }
    statusChangeHistory {
      status
      timestamp
    }
    stats {
      mailsSent
      mailsDelivered
      mailsBounced
      mailsOpened {
        email
        date
      }
      mailsClicked {
        email
        date
      }
    }
  }
}
    `;
export const CreateHostEmailCampaignDocument = gql`
    mutation createHostEmailCampaign($input: AddHostEmailCampaignInput!) {
  createHostEmailCampaign(input: $input)
}
    `;
export const UpdateHostEmailCampaignDocument = gql`
    mutation updateHostEmailCampaign($input: UpdateHostEmailCampaignInput!) {
  updateHostEmailCampaign(input: $input)
}
    `;
export const DeleteHostEmailCampaignDocument = gql`
    mutation deleteHostEmailCampaign($campaignId: String!) {
  deleteHostEmailCampaign(campaignId: $campaignId)
}
    `;
export const DuplicateHostEmailCampaignDocument = gql`
    mutation duplicateHostEmailCampaign($campaignId: String!) {
  duplicateHostEmailCampaign(campaignId: $campaignId)
}
    `;
export const ResumeHostEmailCampaignDocument = gql`
    mutation resumeHostEmailCampaign($campaignId: String!) {
  resumeHostEmailCampaign(campaignId: $campaignId)
}
    `;
export const CreateMarketingCreditTopUpOrderDocument = gql`
    mutation createMarketingCreditTopUpOrder($input: MarketingCreditTopUpOrderInput!) {
  createMarketingCreditTopUpOrder(input: $input) {
    razorpayOrderId
    razorpayKeyId
    creditsAmount
    gstAmount
    platformFeeAmount
    payableAmount
    currency
    receipt
  }
}
    `;
export const VerifyMarketingCreditTopUpDocument = gql`
    mutation verifyMarketingCreditTopUp($input: MarketingCreditTopUpVerifyInput!) {
  verifyMarketingCreditTopUp(input: $input) {
    balance
    entry {
      _id
      amount
      balance
      activity
      paymentReference
      createdAt
    }
  }
}
    `;
export const GetHostAttendeesTargetCountDocument = gql`
    query getHostAttendeesTargetCount($target: HostEmailTargetType, $eventId: String, $filters: [HostCampaignAudienceFilter!]) {
  getHostAttendeesTargetCount(
    target: $target
    eventId: $eventId
    filters: $filters
  )
}
    `;
export const HostEmailCampaignCsvExportDocument = gql`
    query hostEmailCampaignCsvExport($input: CsvExportInput!) {
  hostEmailCampaignCsvExport(input: $input)
}
    `;
export const SendTestHostCampaignEmailDocument = gql`
    query sendTestHostCampaignEmail($input: HostEmailCampaignTestInput!) {
  sendTestHostCampaignEmail(input: $input)
}
    `;
export const MyMarketingCreditLedgerDocument = gql`
    query myMarketingCreditLedger($pagination: PaginationInput) {
  myMarketingCreditLedger(pagination: $pagination) {
    balance
    total
    items {
      _id
      businessId
      hostId
      type
      amount
      balance
      activity
      recipients
      channel
      campaignId
      paymentReference
      createdAt
      updatedAt
    }
  }
}
    `;
export const GenerateAiBoostsForEventDocument = gql`
    mutation GenerateAiBoostsForEvent($input: GenerateAiBoostsInput!) {
  generateAiBoostsForEvent(input: $input) {
    ...EventOfferGenerationFields
  }
}
    ${EventOfferGenerationFieldsFragmentDoc}`;
export const SelectAiBoostDocument = gql`
    mutation SelectAiBoost($input: SelectAiBoostInput!) {
  selectAiBoost(input: $input) {
    ...EventOfferGenerationFields
  }
}
    ${EventOfferGenerationFieldsFragmentDoc}`;
export const GetLatestAiBoostGenerationDocument = gql`
    query GetLatestAiBoostGeneration($eventId: String!) {
  getLatestAiBoostGeneration(eventId: $eventId) {
    ...EventOfferGenerationFields
  }
}
    ${EventOfferGenerationFieldsFragmentDoc}`;
export const RunEventEvalDocument = gql`
    mutation RunEventEval($eventId: String!) {
  runEventEval(eventId: $eventId) {
    ranThroughAi
    eventScore
    aiShortSummary
    expectedAudience
    assignedTagIds
    spellingMistakes {
      field
      word
      suggestion
      context
    }
    seoSuggestions {
      field
      suggestion
      severity
    }
    aiEvalAdminSummary
  }
}
    `;
export const AutoGenerateEventDescriptionDocument = gql`
    mutation AutoGenerateEventDescription($eventId: String!) {
  autoGenerateEventDescription(eventId: $eventId) {
    suggestedDescription
    aiShortSummary
  }
}
    `;
export const EventOnboardingChecklistDocument = gql`
    query eventOnboardingChecklist {
  eventOnboardingChecklist {
    logo
    adminverification
    payout
    event
    Scanner
    nextSteps {
      key
      title
      description
      actionHref
      blocksEventCreation
      blocksPaidEvent
    }
  }
}
    `;
export const DuplicateEventDocument = gql`
    mutation duplicateEvent($id: String!) {
  duplicateEvent(id: $id) {
    _id
    title
    slug
    status
  }
}
    `;
export const CreateEventDocument = gql`
    mutation createEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    _id
    title
    status
    eventType
    slug
  }
}
    `;
export const UpdateEventStepDocument = gql`
    mutation updateEventStep($id: String!, $step: Int!, $stepInput: EventInput!) {
  updateEventStep(id: $id, step: $step, stepInput: $stepInput) {
    _id
    title
    status
    eventType
    city
    isVisible
  }
}
    `;
export const EventPricingOptionsDocument = gql`
    query eventPricingOptions($input: EventPricingCalculatorInput!) {
  eventPricingOptions(input: $input) {
    optionId
    plan
    label
    commissionRate
    customerPlatformFeeRate
    upfrontFee
    expectedPaidTickets
    expectedGrossSales
    hostPayout
    hoizrNetContribution
    payoutCycleDaysMin
    payoutCycleDaysMax
    badge
  }
}
    `;
export const SelectEventPricingOptionDocument = gql`
    mutation selectEventPricingOption($input: SelectEventPricingInput!) {
  selectEventPricingOption(input: $input) {
    _id
    selectedPricingPlan
    feeSettlementMode
  }
}
    `;
export const GetMyEventsForSelectorDocument = gql`
    query getMyEventsForSelector {
  getMyEvents {
    _id
    title
    description
    eventFlyer
    eventType
    startDate
    endDate
    city
    slug
    status
    tickets {
      ticketCapacity
      ticketSold
      ticketPrice
      ticketVisible
      ticketName
      description
    }
  }
}
    `;
export const HostListEventScansDocument = gql`
    query hostListEventScans($eventId: String!, $page: Int, $pageSize: Int) {
  hostListEventScans(eventId: $eventId, page: $page, pageSize: $pageSize) {
    total
    items {
      orderId
      customerName
      customerPhone
      ticketCount
      ticketNames
      checkedInAt
      scannerId
      scannerName
    }
  }
}
    `;
export const HostReverseCheckInDocument = gql`
    mutation hostReverseCheckIn($orderId: String!, $reason: String!) {
  hostReverseCheckIn(orderId: $orderId, reason: $reason)
}
    `;
export const HostRevokeAllScannersForEventDocument = gql`
    mutation hostRevokeAllScannersForEvent($eventId: String!) {
  hostRevokeAllScannersForEvent(eventId: $eventId)
}
    `;
export const GetMyHostContentDefaultsDocument = gql`
    query getMyHostContentDefaults {
  getMyHostContentDefaults {
    _id
    hostId
    ticketingTerms
    refundPolicy
  }
}
    `;
export const SaveMyHostContentDefaultsDocument = gql`
    mutation saveMyHostContentDefaults($input: SaveHostContentDefaultsInput!) {
  saveMyHostContentDefaults(input: $input) {
    _id
    hostId
    ticketingTerms
    refundPolicy
  }
}
    `;
export const MyMarketingReputationDocument = gql`
    query myMarketingReputation {
  myMarketingReputation {
    tier
    effectiveTier
    tierLabel
    tierTagline
    maxRecipients
    unlimited
    source
    lifetimeRecipientsSent
    verifiedCustomerCount
    lifetimeCampaignCount
    nextTier
    nextTierLabel
    recipientsToNextTier
    progressPercentToNextTier
    benefits
    channels {
      channel
      maxRecipients
      unlimited
      status
    }
  }
}
    `;
export const GetAllHostPushCampaignsDocument = gql`
    query getAllHostPushCampaigns($pagination: PaginationInput) {
  getAllHostPushCampaigns(pagination: $pagination) {
    total
    items {
      _id
      businessId
      hostId
      campaignName
      pushTitle
      pushBody
      deepLink
      imageUrl
      target
      eventId
      csvDataUrl
      filters
      targetCount
      status
      publicationStatus
      scheduleType
      scheduleTime
      sentAt
      createdAt
      updatedAt
      stats {
        notificationsSent
        notificationsFailed
        notificationsOpened {
          customerId
          date
        }
        notificationsClicked {
          customerId
          date
        }
      }
      statusChangeHistory {
        status
        timestamp
      }
    }
  }
}
    `;
export const FetchHostPushCampaignByIdDocument = gql`
    query fetchHostPushCampaignById($campaignId: String!) {
  fetchHostPushCampaignById(campaignId: $campaignId) {
    _id
    businessId
    hostId
    campaignName
    pushTitle
    pushBody
    deepLink
    imageUrl
    target
    eventId
    csvDataUrl
    filters
    targetCount
    status
    publicationStatus
    scheduleType
    scheduleTime
    sentAt
    createdAt
    updatedAt
    stats {
      notificationsSent
      notificationsFailed
      notificationsOpened {
        customerId
        date
      }
      notificationsClicked {
        customerId
        date
      }
    }
    statusChangeHistory {
      status
      timestamp
    }
  }
}
    `;
export const CreateHostPushCampaignDocument = gql`
    mutation createHostPushCampaign($input: CreateHostPushCampaignInput!) {
  createHostPushCampaign(input: $input) {
    _id
  }
}
    `;
export const UpdateHostPushCampaignDocument = gql`
    mutation updateHostPushCampaign($input: UpdateHostPushCampaignInput!) {
  updateHostPushCampaign(input: $input) {
    _id
  }
}
    `;
export const DeleteHostPushCampaignDocument = gql`
    mutation deleteHostPushCampaign($campaignId: String!) {
  deleteHostPushCampaign(campaignId: $campaignId)
}
    `;
export const PublishHostPushCampaignDocument = gql`
    mutation publishHostPushCampaign($campaignId: String!) {
  publishHostPushCampaign(campaignId: $campaignId) {
    _id
    status
    publicationStatus
  }
}
    `;
export const GetHostsByBusinessDocument = gql`
    query getHostsByBusiness {
  getHostsByBusiness {
    _id
    name
    email
    phone
    hostType
    venueType
    description
    logo
    businessRegistrationNumber
    gstNumber
    websiteUrl
    averageEventSize
    profileComplete
    status
    onboardingCompleted
    isAdminVerified
    isActive
    address {
      ...addressInfo
    }
    createdAt
    updatedAt
  }
}
    ${AddressInfoFragmentDoc}`;
export const GetHostDocument = gql`
    query getHost {
  getHost {
    _id
    name
    email
    phone
    hostType
    venueType
    description
    logo
    businessRegistrationNumber
    gstNumber
    websiteUrl
    averageEventSize
    profileComplete
    status
    onboardingCompleted
    isAdminVerified
    isActive
    address {
      ...addressInfo
    }
    createdAt
    updatedAt
  }
}
    ${AddressInfoFragmentDoc}`;
export const GetHostDashboardSummaryDocument = gql`
    query getHostDashboardSummary($input: HostDashboardSummaryInput) {
  getHostDashboardSummary(input: $input) {
    upcomingEventsCount
    publishedEventsCount
    draftEventsCount
    salesToday
    ticketsSoldToday
    salesLast30Days
    ticketsSoldLast30Days
    orderCountLast30Days
    averageOrderValueLast30Days
    pendingSettlementsCount
    paidOutLifetime
    marketingSubscribersCount
    lifetimeCampaignMessagesSent
    salesSeries {
      date
      label
      sales
      tickets
      orderCount
    }
    salesBySource {
      label
      amount
      count
      percent
    }
    ticketMix {
      label
      amount
      count
      percent
    }
    topItems {
      label
      amount
      count
      percent
    }
    upcomingCampaigns {
      id
      name
      status
      scheduledFor
      recipientCount
    }
  }
}
    `;
export const CreateHostDocument = gql`
    mutation createHost($input: CreateHostInput!) {
  createHost(input: $input)
}
    `;
export const UpdateHostDocument = gql`
    mutation updateHost($input: UpdateHostInput!) {
  updateHost(input: $input)
}
    `;
export const UploadHostLogoDocument = gql`
    mutation uploadHostLogo($logo: String!) {
  uploadHostLogo(logo: $logo)
}
    `;
export const GetActiveIndianCitiesDocument = gql`
    query getActiveIndianCities {
  getActiveIndianCities {
    _id
    value
    state
  }
}
    `;
export const GetActiveStatesDocument = gql`
    query getActiveStates {
  getActiveStates {
    _id
    value
  }
}
    `;
export const GetActiveEventCategoriesDocument = gql`
    query getActiveEventCategories {
  getActiveEventCategories {
    _id
    value
    description
  }
}
    `;
export const GetActiveGenreTagsDocument = gql`
    query getActiveGenreTags {
  getActiveGenreTags {
    _id
    value
  }
}
    `;
export const GetActiveLanguagesDocument = gql`
    query getActiveLanguages {
  getActiveLanguages {
    _id
    code
    value
    nativeName
    isIndian
    order
  }
}
    `;
export const GetActiveProhibitedItemsDocument = gql`
    query getActiveProhibitedItems {
  getActiveProhibitedItems {
    _id
    slug
    value
    description
    order
  }
}
    `;
export const GetConfigDocument = gql`
    query GetConfig($type: ConfigTypeEnum!) {
  getConfig(type: $type) {
    _id
    type
    valueType
    textVal
    numVal
    boolVal
    createdBy {
      firstName
      lastName
    }
    updatedBy {
      firstName
      lastName
    }
    createdAt
    updatedAt
  }
}
    `;
export const GetMarketingPricingDocument = gql`
    query GetMarketingPricing {
  getMarketingPricing {
    emailRate
    smsRate
    whatsappRate
    pushRate
    gstPercent
    platformFeePercent
    currency
  }
}
    `;
export const DeleteHostCloudinaryAssetDocument = gql`
    mutation deleteHostCloudinaryAsset($assetUrl: String!) {
  deleteHostCloudinaryAsset(assetUrl: $assetUrl)
}
    `;
export const AllPlacesDocument = gql`
    query AllPlaces($input: String!) {
  getPlacesList(input: $input) {
    placeId
    displayName
  }
}
    `;
export const PlaceDetailsDocument = gql`
    query PlaceDetails($placeId: String!) {
  getPlaceDetails(placeId: $placeId) {
    latitude
    longitude
    city
    state
    address
    zipcode
  }
}
    `;
export const CreateHostOnboardingDocument = gql`
    mutation createHostOnboarding($input: CreateHostInput!) {
  createHost(input: $input)
}
    `;
export const UpdateHostOnboardingDocument = gql`
    mutation updateHostOnboarding($input: UpdateHostInput!) {
  updateHost(input: $input)
}
    `;
export const CompleteHostOnboardingDocument = gql`
    mutation completeHostOnboarding {
  completeHostOnboarding
}
    `;
export const StartNewHostOnboardingDocument = gql`
    mutation startNewHostOnboarding {
  startNewHostOnboarding
}
    `;
export const HostOnboardingDataDocument = gql`
    query hostOnboardingData {
  getCurrentHostOnboarding {
    _id
    name
    email
    phone
    description
    logo
    hostType
    venueType
    status
    onboardingCompleted
    isAdminVerified
    businessRegistrationNumber
    averageEventSize
    gstNumber
    websiteUrl
    address {
      ...addressInfo
    }
  }
}
    ${AddressInfoFragmentDoc}`;
export const MeUserInResOnboardingDocument = gql`
    query meUserInResOnboarding {
  meUser {
    status
  }
}
    `;
export const HostPayoutAccountsDocument = gql`
    query hostPayoutAccounts {
  hostPayoutAccounts {
    _id
    entityName
    entityType
    panNumber
    taxDeductionAccountNumber
    contactEmail
    contactPhone
    accountHolderName
    accountNumber
    last4
    ifscCode
    bankName
    branchName
    accountType
    upiId
    isActive
    isPrimary
    verificationStatus
    rejectionReason
    isGstRegistered
    gstin
    gstRegistrationType
    registeredBusinessName
    gstRegistrationDate
    createdAt
    updatedAt
  }
}
    `;
export const HostListPayoutSettlementsDocument = gql`
    query hostListPayoutSettlements($input: ListHostPayoutSettlementsInput) {
  hostListPayoutSettlements(input: $input) {
    items {
      _id
      eventId
      grossAmount
      hoizrCommissionTotal
      hoizrCommissionGstTotal
      ticketGstFlowThroughTotal
      finalDeclaredOfferAmount
      razorpayFeeTotal
      netPayoutAmount
      refundsTotal
      chargebacksTotal
      orderCount
      status
      scheduledFor
      paidAt
      paidMethod
      razorpayPayoutId
      invoiceId
      invoiceUrl
      errorMessage
      createdAt
      updatedAt
    }
    total
  }
}
    `;
export const HostGetPayoutStatementUrlDocument = gql`
    query hostGetPayoutStatementUrl($settlementId: String!) {
  hostGetPayoutStatementUrl(settlementId: $settlementId) {
    signedUrl
    expiresAt
  }
}
    `;
export const AddPayoutDocument = gql`
    mutation addPayout($input: AddPayoutInput!) {
  addPayout(input: $input) {
    _id
    verificationStatus
  }
}
    `;
export const AddHostPayoutAccountDocument = gql`
    mutation addHostPayoutAccount($input: AddPayoutInput!) {
  addHostPayoutAccount(input: $input) {
    _id
    verificationStatus
    isPrimary
    last4
  }
}
    `;
export const SetPrimaryPayoutDocument = gql`
    mutation setPrimaryPayout($id: String!) {
  setPrimaryPayout(id: $id) {
    _id
    isPrimary
  }
}
    `;
export const SetPrimaryHostPayoutAccountDocument = gql`
    mutation setPrimaryHostPayoutAccount($id: String!) {
  setPrimaryHostPayoutAccount(id: $id) {
    _id
    isPrimary
  }
}
    `;
export const AddTeamMemberDocument = gql`
    mutation addTeamMember($AddTeamMemberInput: AddTeamMemberInput!) {
  addTeamMember(input: $AddTeamMemberInput)
}
    `;
export const UpdateSubuserPermissionsDocument = gql`
    mutation updateSubuserPermissions($input: UpdateSubuserPermissionsInput!) {
  updateSubuserPermissions(input: $input)
}
    `;
export const UpdateSubuserRoleDocument = gql`
    mutation updateSubuserRole($input: UpdateSubuserRoleInput!) {
  updateSubuserRole(input: $input)
}
    `;
export const GetTeamMembersDocument = gql`
    query getTeamMembers {
  getTeamMembers {
    _id {
      _id
    }
    firstName
    lastName
    email
    phone
    role
    status
  }
}
    `;
export const GetUserDocument = gql`
    query getUser($id: String!) {
  getUser(id: $id) {
    _id
    permissions {
      status
      type
      id
    }
    role
    teamRole
    hosts {
      _id
    }
  }
}
    `;
export const DeleteTeamMemberDocument = gql`
    query deleteTeamMember($id: String!) {
  deleteTeamMember(id: $id)
}
    `;
export const VerifyTeamEmailDocument = gql`
    mutation verifyTeamEmail($token: String!) {
  verifyTeamEmail(token: $token)
}
    `;
export const GetAllPermissionsDocument = gql`
    query getAllPermissions {
  getAllPermissions {
    _id
    type
    preselect
    isFunction
  }
}
    `;
export const UpdateUserDetailsDocument = gql`
    query updateUserDetails($input: UpdateUserInput!) {
  updateUserDetails(input: $input)
}
    `;
export const MeUserforProfileDocument = gql`
    query MeUserforProfile {
  meUser {
    enable2FA
    _id
    firstName
    lastName
    status
    email
    phone
    accountPreferences {
      sms
      email
      whatsapp
    }
  }
}
    `;
export const Enable2FaDocument = gql`
    query enable2FA {
  enable2FA
}
    `;
export const Disable2FDocument = gql`
    query disable2F($authCode: String!) {
  disable2FA(authCode: $authCode)
}
    `;
export const Verify2FaSetupDocument = gql`
    query verify2FASetup($authCode: String!) {
  verify2FASetup(authCode: $authCode)
}
    `;
export const IsMultiAccountUserDocument = gql`
    query IsMultiAccountUser {
  isMultiAccountUser
}
    `;
export const SetHostIdAsCookieDocument = gql`
    query SetHostIdAsCookie($hostId: String!) {
  setHostIdAsCookie(hostId: $hostId)
}
    `;
export const GetAllHostWhatsAppCampaignsDocument = gql`
    query getAllHostWhatsAppCampaigns($pagination: PaginationInput, $filter: [FilterDataInput!], $sort: SortDataInput, $search: String) {
  getAllHostWhatsAppCampaigns(
    pagination: $pagination
    filter: $filter
    sort: $sort
    search: $search
  ) {
    total
    items {
      _id
      businessId
      hostId
      campaignName
      objectiveTag
      templateId
      templateSlugSnapshot
      templateLanguageSnapshot
      headerMediaUrl
      ctaSlug
      target
      eventId
      csvDataUrl
      filters
      targetCount
      status
      publicationStatus
      scheduleType
      scheduleTime
      createdAt
      updatedAt
      templateVariables {
        position
        value
      }
      stats {
        messagesSent
        messagesSyncFailed
        messagesDelivered
        messagesRead
        messagesFailed
      }
      statusChangeHistory {
        status
        timestamp
      }
    }
  }
}
    `;
export const FetchHostWhatsAppCampaignByIdDocument = gql`
    query fetchHostWhatsAppCampaignById($campaignId: String!) {
  fetchHostWhatsAppCampaignById(campaignId: $campaignId) {
    _id
    campaignName
    objectiveTag
    templateId
    templateSlugSnapshot
    templateLanguageSnapshot
    headerMediaUrl
    ctaSlug
    target
    eventId
    csvDataUrl
    filters
    targetCount
    status
    publicationStatus
    scheduleType
    scheduleTime
    templateVariables {
      position
      value
    }
    stats {
      messagesSent
      messagesSyncFailed
      messagesDelivered
      messagesRead
      messagesFailed
    }
  }
}
    `;
export const GetHostWhatsAppAttendeesTargetCountDocument = gql`
    query getHostWhatsAppAttendeesTargetCount($target: HostEmailTargetType, $eventId: String, $filters: [HostCampaignAudienceFilter!]) {
  getHostWhatsAppAttendeesTargetCount(
    target: $target
    eventId: $eventId
    filters: $filters
  )
}
    `;
export const CreateHostWhatsAppCampaignDocument = gql`
    mutation createHostWhatsAppCampaign($input: AddHostWhatsAppCampaignInput!) {
  createHostWhatsAppCampaign(input: $input)
}
    `;
export const UpdateHostWhatsAppCampaignDocument = gql`
    mutation updateHostWhatsAppCampaign($input: UpdateHostWhatsAppCampaignInput!) {
  updateHostWhatsAppCampaign(input: $input)
}
    `;
export const DeleteHostWhatsAppCampaignDocument = gql`
    mutation deleteHostWhatsAppCampaign($campaignId: String!) {
  deleteHostWhatsAppCampaign(campaignId: $campaignId)
}
    `;
export const DuplicateHostWhatsAppCampaignDocument = gql`
    mutation duplicateHostWhatsAppCampaign($campaignId: String!) {
  duplicateHostWhatsAppCampaign(campaignId: $campaignId)
}
    `;
export const ResumeHostWhatsAppCampaignDocument = gql`
    mutation resumeHostWhatsAppCampaign($campaignId: String!) {
  resumeHostWhatsAppCampaign(campaignId: $campaignId)
}
    `;
export const ApprovedWhatsAppTemplatesDocument = gql`
    query approvedWhatsAppTemplates {
  approvedWhatsAppTemplates {
    total
    items {
      _id
      slug
      name
      category
      language
      headerType
      bodyText
      buttonType
      metaStatus
      isActive
      variables {
        position
        example
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    userLogout(variables?: UserLogoutQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UserLogoutQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UserLogoutQuery>(UserLogoutDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'userLogout', 'query', variables);
    },
    userLogoutFromEverywhere(variables?: UserLogoutFromEverywhereQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UserLogoutFromEverywhereQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UserLogoutFromEverywhereQuery>(UserLogoutFromEverywhereDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'userLogoutFromEverywhere', 'query', variables);
    },
    userLogin(variables: UserLoginQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UserLoginQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UserLoginQuery>(UserLoginDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'userLogin', 'query', variables);
    },
    MeUser(variables?: MeUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MeUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeUserQuery>(MeUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'MeUser', 'query', variables);
    },
    MarkWalkthroughDone(variables: MarkWalkthroughDoneQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MarkWalkthroughDoneQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MarkWalkthroughDoneQuery>(MarkWalkthroughDoneDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'MarkWalkthroughDone', 'query', variables);
    },
    MeContactDetails(variables?: MeContactDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MeContactDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeContactDetailsQuery>(MeContactDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'MeContactDetails', 'query', variables);
    },
    MeCheckUser(variables?: MeCheckUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MeCheckUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeCheckUserQuery>(MeCheckUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'MeCheckUser', 'query', variables);
    },
    MeUserJourney(variables?: MeUserJourneyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MeUserJourneyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeUserJourneyQuery>(MeUserJourneyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'MeUserJourney', 'query', variables);
    },
    userLoginVerification(variables: UserLoginVerificationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UserLoginVerificationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UserLoginVerificationQuery>(UserLoginVerificationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'userLoginVerification', 'query', variables);
    },
    UserSignUp(variables: UserSignUpQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UserSignUpQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UserSignUpQuery>(UserSignUpDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UserSignUp', 'query', variables);
    },
    userSignupVerification(variables: UserSignupVerificationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UserSignupVerificationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UserSignupVerificationQuery>(UserSignupVerificationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'userSignupVerification', 'query', variables);
    },
    getAllHostEmailCampaigns(variables?: GetAllHostEmailCampaignsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllHostEmailCampaignsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllHostEmailCampaignsQuery>(GetAllHostEmailCampaignsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllHostEmailCampaigns', 'query', variables);
    },
    fetchHostCampaignById(variables: FetchHostCampaignByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchHostCampaignByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchHostCampaignByIdQuery>(FetchHostCampaignByIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchHostCampaignById', 'query', variables);
    },
    createHostEmailCampaign(variables: CreateHostEmailCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateHostEmailCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateHostEmailCampaignMutation>(CreateHostEmailCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createHostEmailCampaign', 'mutation', variables);
    },
    updateHostEmailCampaign(variables: UpdateHostEmailCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateHostEmailCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateHostEmailCampaignMutation>(UpdateHostEmailCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateHostEmailCampaign', 'mutation', variables);
    },
    deleteHostEmailCampaign(variables: DeleteHostEmailCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeleteHostEmailCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteHostEmailCampaignMutation>(DeleteHostEmailCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteHostEmailCampaign', 'mutation', variables);
    },
    duplicateHostEmailCampaign(variables: DuplicateHostEmailCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DuplicateHostEmailCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DuplicateHostEmailCampaignMutation>(DuplicateHostEmailCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'duplicateHostEmailCampaign', 'mutation', variables);
    },
    resumeHostEmailCampaign(variables: ResumeHostEmailCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ResumeHostEmailCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResumeHostEmailCampaignMutation>(ResumeHostEmailCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'resumeHostEmailCampaign', 'mutation', variables);
    },
    createMarketingCreditTopUpOrder(variables: CreateMarketingCreditTopUpOrderMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateMarketingCreditTopUpOrderMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateMarketingCreditTopUpOrderMutation>(CreateMarketingCreditTopUpOrderDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createMarketingCreditTopUpOrder', 'mutation', variables);
    },
    verifyMarketingCreditTopUp(variables: VerifyMarketingCreditTopUpMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<VerifyMarketingCreditTopUpMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<VerifyMarketingCreditTopUpMutation>(VerifyMarketingCreditTopUpDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'verifyMarketingCreditTopUp', 'mutation', variables);
    },
    getHostAttendeesTargetCount(variables?: GetHostAttendeesTargetCountQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetHostAttendeesTargetCountQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetHostAttendeesTargetCountQuery>(GetHostAttendeesTargetCountDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getHostAttendeesTargetCount', 'query', variables);
    },
    hostEmailCampaignCsvExport(variables: HostEmailCampaignCsvExportQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<HostEmailCampaignCsvExportQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HostEmailCampaignCsvExportQuery>(HostEmailCampaignCsvExportDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'hostEmailCampaignCsvExport', 'query', variables);
    },
    sendTestHostCampaignEmail(variables: SendTestHostCampaignEmailQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SendTestHostCampaignEmailQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SendTestHostCampaignEmailQuery>(SendTestHostCampaignEmailDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'sendTestHostCampaignEmail', 'query', variables);
    },
    myMarketingCreditLedger(variables?: MyMarketingCreditLedgerQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MyMarketingCreditLedgerQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MyMarketingCreditLedgerQuery>(MyMarketingCreditLedgerDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'myMarketingCreditLedger', 'query', variables);
    },
    GenerateAiBoostsForEvent(variables: GenerateAiBoostsForEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GenerateAiBoostsForEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<GenerateAiBoostsForEventMutation>(GenerateAiBoostsForEventDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GenerateAiBoostsForEvent', 'mutation', variables);
    },
    SelectAiBoost(variables: SelectAiBoostMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SelectAiBoostMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SelectAiBoostMutation>(SelectAiBoostDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SelectAiBoost', 'mutation', variables);
    },
    GetLatestAiBoostGeneration(variables: GetLatestAiBoostGenerationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetLatestAiBoostGenerationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLatestAiBoostGenerationQuery>(GetLatestAiBoostGenerationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetLatestAiBoostGeneration', 'query', variables);
    },
    RunEventEval(variables: RunEventEvalMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RunEventEvalMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RunEventEvalMutation>(RunEventEvalDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RunEventEval', 'mutation', variables);
    },
    AutoGenerateEventDescription(variables: AutoGenerateEventDescriptionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AutoGenerateEventDescriptionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AutoGenerateEventDescriptionMutation>(AutoGenerateEventDescriptionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AutoGenerateEventDescription', 'mutation', variables);
    },
    eventOnboardingChecklist(variables?: EventOnboardingChecklistQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<EventOnboardingChecklistQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<EventOnboardingChecklistQuery>(EventOnboardingChecklistDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'eventOnboardingChecklist', 'query', variables);
    },
    duplicateEvent(variables: DuplicateEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DuplicateEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DuplicateEventMutation>(DuplicateEventDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'duplicateEvent', 'mutation', variables);
    },
    createEvent(variables: CreateEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateEventMutation>(CreateEventDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createEvent', 'mutation', variables);
    },
    updateEventStep(variables: UpdateEventStepMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateEventStepMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateEventStepMutation>(UpdateEventStepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateEventStep', 'mutation', variables);
    },
    eventPricingOptions(variables: EventPricingOptionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<EventPricingOptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<EventPricingOptionsQuery>(EventPricingOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'eventPricingOptions', 'query', variables);
    },
    selectEventPricingOption(variables: SelectEventPricingOptionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SelectEventPricingOptionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SelectEventPricingOptionMutation>(SelectEventPricingOptionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'selectEventPricingOption', 'mutation', variables);
    },
    getMyEventsForSelector(variables?: GetMyEventsForSelectorQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetMyEventsForSelectorQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetMyEventsForSelectorQuery>(GetMyEventsForSelectorDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getMyEventsForSelector', 'query', variables);
    },
    hostListEventScans(variables: HostListEventScansQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<HostListEventScansQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HostListEventScansQuery>(HostListEventScansDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'hostListEventScans', 'query', variables);
    },
    hostReverseCheckIn(variables: HostReverseCheckInMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<HostReverseCheckInMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<HostReverseCheckInMutation>(HostReverseCheckInDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'hostReverseCheckIn', 'mutation', variables);
    },
    hostRevokeAllScannersForEvent(variables: HostRevokeAllScannersForEventMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<HostRevokeAllScannersForEventMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<HostRevokeAllScannersForEventMutation>(HostRevokeAllScannersForEventDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'hostRevokeAllScannersForEvent', 'mutation', variables);
    },
    getMyHostContentDefaults(variables?: GetMyHostContentDefaultsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetMyHostContentDefaultsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetMyHostContentDefaultsQuery>(GetMyHostContentDefaultsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getMyHostContentDefaults', 'query', variables);
    },
    saveMyHostContentDefaults(variables: SaveMyHostContentDefaultsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SaveMyHostContentDefaultsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveMyHostContentDefaultsMutation>(SaveMyHostContentDefaultsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'saveMyHostContentDefaults', 'mutation', variables);
    },
    myMarketingReputation(variables?: MyMarketingReputationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MyMarketingReputationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MyMarketingReputationQuery>(MyMarketingReputationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'myMarketingReputation', 'query', variables);
    },
    getAllHostPushCampaigns(variables?: GetAllHostPushCampaignsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllHostPushCampaignsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllHostPushCampaignsQuery>(GetAllHostPushCampaignsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllHostPushCampaigns', 'query', variables);
    },
    fetchHostPushCampaignById(variables: FetchHostPushCampaignByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchHostPushCampaignByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchHostPushCampaignByIdQuery>(FetchHostPushCampaignByIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchHostPushCampaignById', 'query', variables);
    },
    createHostPushCampaign(variables: CreateHostPushCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateHostPushCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateHostPushCampaignMutation>(CreateHostPushCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createHostPushCampaign', 'mutation', variables);
    },
    updateHostPushCampaign(variables: UpdateHostPushCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateHostPushCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateHostPushCampaignMutation>(UpdateHostPushCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateHostPushCampaign', 'mutation', variables);
    },
    deleteHostPushCampaign(variables: DeleteHostPushCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeleteHostPushCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteHostPushCampaignMutation>(DeleteHostPushCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteHostPushCampaign', 'mutation', variables);
    },
    publishHostPushCampaign(variables: PublishHostPushCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PublishHostPushCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PublishHostPushCampaignMutation>(PublishHostPushCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'publishHostPushCampaign', 'mutation', variables);
    },
    getHostsByBusiness(variables?: GetHostsByBusinessQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetHostsByBusinessQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetHostsByBusinessQuery>(GetHostsByBusinessDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getHostsByBusiness', 'query', variables);
    },
    getHost(variables?: GetHostQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetHostQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetHostQuery>(GetHostDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getHost', 'query', variables);
    },
    getHostDashboardSummary(variables?: GetHostDashboardSummaryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetHostDashboardSummaryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetHostDashboardSummaryQuery>(GetHostDashboardSummaryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getHostDashboardSummary', 'query', variables);
    },
    createHost(variables: CreateHostMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateHostMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateHostMutation>(CreateHostDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createHost', 'mutation', variables);
    },
    updateHost(variables: UpdateHostMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateHostMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateHostMutation>(UpdateHostDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateHost', 'mutation', variables);
    },
    uploadHostLogo(variables: UploadHostLogoMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UploadHostLogoMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UploadHostLogoMutation>(UploadHostLogoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'uploadHostLogo', 'mutation', variables);
    },
    getActiveIndianCities(variables?: GetActiveIndianCitiesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetActiveIndianCitiesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetActiveIndianCitiesQuery>(GetActiveIndianCitiesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getActiveIndianCities', 'query', variables);
    },
    getActiveStates(variables?: GetActiveStatesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetActiveStatesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetActiveStatesQuery>(GetActiveStatesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getActiveStates', 'query', variables);
    },
    getActiveEventCategories(variables?: GetActiveEventCategoriesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetActiveEventCategoriesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetActiveEventCategoriesQuery>(GetActiveEventCategoriesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getActiveEventCategories', 'query', variables);
    },
    getActiveGenreTags(variables?: GetActiveGenreTagsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetActiveGenreTagsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetActiveGenreTagsQuery>(GetActiveGenreTagsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getActiveGenreTags', 'query', variables);
    },
    getActiveLanguages(variables?: GetActiveLanguagesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetActiveLanguagesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetActiveLanguagesQuery>(GetActiveLanguagesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getActiveLanguages', 'query', variables);
    },
    getActiveProhibitedItems(variables?: GetActiveProhibitedItemsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetActiveProhibitedItemsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetActiveProhibitedItemsQuery>(GetActiveProhibitedItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getActiveProhibitedItems', 'query', variables);
    },
    GetConfig(variables: GetConfigQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetConfigQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetConfigQuery>(GetConfigDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetConfig', 'query', variables);
    },
    GetMarketingPricing(variables?: GetMarketingPricingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetMarketingPricingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetMarketingPricingQuery>(GetMarketingPricingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetMarketingPricing', 'query', variables);
    },
    deleteHostCloudinaryAsset(variables: DeleteHostCloudinaryAssetMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeleteHostCloudinaryAssetMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteHostCloudinaryAssetMutation>(DeleteHostCloudinaryAssetDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteHostCloudinaryAsset', 'mutation', variables);
    },
    AllPlaces(variables: AllPlacesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AllPlacesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<AllPlacesQuery>(AllPlacesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AllPlaces', 'query', variables);
    },
    PlaceDetails(variables: PlaceDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PlaceDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<PlaceDetailsQuery>(PlaceDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'PlaceDetails', 'query', variables);
    },
    createHostOnboarding(variables: CreateHostOnboardingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateHostOnboardingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateHostOnboardingMutation>(CreateHostOnboardingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createHostOnboarding', 'mutation', variables);
    },
    updateHostOnboarding(variables: UpdateHostOnboardingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateHostOnboardingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateHostOnboardingMutation>(UpdateHostOnboardingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateHostOnboarding', 'mutation', variables);
    },
    completeHostOnboarding(variables?: CompleteHostOnboardingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CompleteHostOnboardingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CompleteHostOnboardingMutation>(CompleteHostOnboardingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'completeHostOnboarding', 'mutation', variables);
    },
    startNewHostOnboarding(variables?: StartNewHostOnboardingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<StartNewHostOnboardingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StartNewHostOnboardingMutation>(StartNewHostOnboardingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'startNewHostOnboarding', 'mutation', variables);
    },
    hostOnboardingData(variables?: HostOnboardingDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<HostOnboardingDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HostOnboardingDataQuery>(HostOnboardingDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'hostOnboardingData', 'query', variables);
    },
    meUserInResOnboarding(variables?: MeUserInResOnboardingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MeUserInResOnboardingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeUserInResOnboardingQuery>(MeUserInResOnboardingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'meUserInResOnboarding', 'query', variables);
    },
    hostPayoutAccounts(variables?: HostPayoutAccountsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<HostPayoutAccountsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HostPayoutAccountsQuery>(HostPayoutAccountsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'hostPayoutAccounts', 'query', variables);
    },
    hostListPayoutSettlements(variables?: HostListPayoutSettlementsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<HostListPayoutSettlementsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HostListPayoutSettlementsQuery>(HostListPayoutSettlementsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'hostListPayoutSettlements', 'query', variables);
    },
    hostGetPayoutStatementUrl(variables: HostGetPayoutStatementUrlQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<HostGetPayoutStatementUrlQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<HostGetPayoutStatementUrlQuery>(HostGetPayoutStatementUrlDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'hostGetPayoutStatementUrl', 'query', variables);
    },
    addPayout(variables: AddPayoutMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddPayoutMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddPayoutMutation>(AddPayoutDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addPayout', 'mutation', variables);
    },
    addHostPayoutAccount(variables: AddHostPayoutAccountMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddHostPayoutAccountMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddHostPayoutAccountMutation>(AddHostPayoutAccountDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addHostPayoutAccount', 'mutation', variables);
    },
    setPrimaryPayout(variables: SetPrimaryPayoutMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetPrimaryPayoutMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetPrimaryPayoutMutation>(SetPrimaryPayoutDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setPrimaryPayout', 'mutation', variables);
    },
    setPrimaryHostPayoutAccount(variables: SetPrimaryHostPayoutAccountMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetPrimaryHostPayoutAccountMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetPrimaryHostPayoutAccountMutation>(SetPrimaryHostPayoutAccountDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'setPrimaryHostPayoutAccount', 'mutation', variables);
    },
    addTeamMember(variables: AddTeamMemberMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddTeamMemberMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddTeamMemberMutation>(AddTeamMemberDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addTeamMember', 'mutation', variables);
    },
    updateSubuserPermissions(variables: UpdateSubuserPermissionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateSubuserPermissionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateSubuserPermissionsMutation>(UpdateSubuserPermissionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateSubuserPermissions', 'mutation', variables);
    },
    updateSubuserRole(variables: UpdateSubuserRoleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateSubuserRoleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateSubuserRoleMutation>(UpdateSubuserRoleDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateSubuserRole', 'mutation', variables);
    },
    getTeamMembers(variables?: GetTeamMembersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetTeamMembersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTeamMembersQuery>(GetTeamMembersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getTeamMembers', 'query', variables);
    },
    getUser(variables: GetUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserQuery>(GetUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUser', 'query', variables);
    },
    deleteTeamMember(variables: DeleteTeamMemberQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeleteTeamMemberQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteTeamMemberQuery>(DeleteTeamMemberDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteTeamMember', 'query', variables);
    },
    verifyTeamEmail(variables: VerifyTeamEmailMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<VerifyTeamEmailMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<VerifyTeamEmailMutation>(VerifyTeamEmailDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'verifyTeamEmail', 'mutation', variables);
    },
    getAllPermissions(variables?: GetAllPermissionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllPermissionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllPermissionsQuery>(GetAllPermissionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllPermissions', 'query', variables);
    },
    updateUserDetails(variables: UpdateUserDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateUserDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateUserDetailsQuery>(UpdateUserDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateUserDetails', 'query', variables);
    },
    MeUserforProfile(variables?: MeUserforProfileQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<MeUserforProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<MeUserforProfileQuery>(MeUserforProfileDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'MeUserforProfile', 'query', variables);
    },
    enable2FA(variables?: Enable2FaQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<Enable2FaQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Enable2FaQuery>(Enable2FaDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'enable2FA', 'query', variables);
    },
    disable2F(variables: Disable2FQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<Disable2FQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Disable2FQuery>(Disable2FDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'disable2F', 'query', variables);
    },
    verify2FASetup(variables: Verify2FaSetupQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<Verify2FaSetupQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<Verify2FaSetupQuery>(Verify2FaSetupDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'verify2FASetup', 'query', variables);
    },
    IsMultiAccountUser(variables?: IsMultiAccountUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<IsMultiAccountUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<IsMultiAccountUserQuery>(IsMultiAccountUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'IsMultiAccountUser', 'query', variables);
    },
    SetHostIdAsCookie(variables: SetHostIdAsCookieQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetHostIdAsCookieQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetHostIdAsCookieQuery>(SetHostIdAsCookieDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetHostIdAsCookie', 'query', variables);
    },
    getAllHostWhatsAppCampaigns(variables?: GetAllHostWhatsAppCampaignsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllHostWhatsAppCampaignsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllHostWhatsAppCampaignsQuery>(GetAllHostWhatsAppCampaignsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getAllHostWhatsAppCampaigns', 'query', variables);
    },
    fetchHostWhatsAppCampaignById(variables: FetchHostWhatsAppCampaignByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FetchHostWhatsAppCampaignByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FetchHostWhatsAppCampaignByIdQuery>(FetchHostWhatsAppCampaignByIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'fetchHostWhatsAppCampaignById', 'query', variables);
    },
    getHostWhatsAppAttendeesTargetCount(variables?: GetHostWhatsAppAttendeesTargetCountQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetHostWhatsAppAttendeesTargetCountQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetHostWhatsAppAttendeesTargetCountQuery>(GetHostWhatsAppAttendeesTargetCountDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getHostWhatsAppAttendeesTargetCount', 'query', variables);
    },
    createHostWhatsAppCampaign(variables: CreateHostWhatsAppCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateHostWhatsAppCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateHostWhatsAppCampaignMutation>(CreateHostWhatsAppCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'createHostWhatsAppCampaign', 'mutation', variables);
    },
    updateHostWhatsAppCampaign(variables: UpdateHostWhatsAppCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateHostWhatsAppCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateHostWhatsAppCampaignMutation>(UpdateHostWhatsAppCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'updateHostWhatsAppCampaign', 'mutation', variables);
    },
    deleteHostWhatsAppCampaign(variables: DeleteHostWhatsAppCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DeleteHostWhatsAppCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DeleteHostWhatsAppCampaignMutation>(DeleteHostWhatsAppCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'deleteHostWhatsAppCampaign', 'mutation', variables);
    },
    duplicateHostWhatsAppCampaign(variables: DuplicateHostWhatsAppCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DuplicateHostWhatsAppCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DuplicateHostWhatsAppCampaignMutation>(DuplicateHostWhatsAppCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'duplicateHostWhatsAppCampaign', 'mutation', variables);
    },
    resumeHostWhatsAppCampaign(variables: ResumeHostWhatsAppCampaignMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ResumeHostWhatsAppCampaignMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ResumeHostWhatsAppCampaignMutation>(ResumeHostWhatsAppCampaignDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'resumeHostWhatsAppCampaign', 'mutation', variables);
    },
    approvedWhatsAppTemplates(variables?: ApprovedWhatsAppTemplatesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ApprovedWhatsAppTemplatesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ApprovedWhatsAppTemplatesQuery>(ApprovedWhatsAppTemplatesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'approvedWhatsAppTemplates', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;