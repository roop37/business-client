
import { getSdk } from "@/generated/graphql";
import { GraphQLClient } from "graphql-request";

const TOKEN_REFRESH_QUERY = "mutation TokenRefresh { tokensRefresh }";

// Resolve at module load without throwing. A missing env var (Vercel
// build before envs are wired, local checkout without .env, etc.)
// would otherwise crash Next.js's page-data collection and fail the
// whole build — even for routes marked `dynamic = "force-dynamic"`.
// Runtime requests will still fail loudly if the env stays unset, but
// the build proceeds and the misconfiguration is recoverable without
// a redeploy of code.
const resolveEndpoint = (): string => {
  const base = process.env.NEXT_PUBLIC_SERVER_BASE_URL?.replace(/\/+$/, "");
  if (!base) {
    if (
      process.env.NEXT_PUBLIC_HOIZR_ENV === "prod" &&
      typeof window !== "undefined"
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        "[hoizr] NEXT_PUBLIC_SERVER_BASE_URL is not set; falling back to http://localhost:4000/graphql"
      );
    }
    return "http://localhost:4000/graphql";
  }
  return base.endsWith("/graphql") ? base : `${base}/graphql`;
};

const endpoint = resolveEndpoint();

const graphQLClient = new GraphQLClient(endpoint, {
  credentials: "include",
  fetch: async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let response = await fetch(input, init);

    if (response.status === 401) {
      try {
        const client = new GraphQLClient(endpoint, { credentials: "include" });
        await client.request(TOKEN_REFRESH_QUERY, {}, init?.headers);
        response = await fetch(input, init);
      } catch (error) {
        console.error("Error refreshing tokens:", error);
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return response;
  },
});

const generatedSdk = getSdk(graphQLClient) as any;
const truthy = async (key: string) => ({ [key]: true });
const emptyList = async (key: string) => ({ [key]: [] });

export const sdk: any = generatedSdk;

Object.assign(sdk, {
  getAllRestauranteEmailCampaigns: async (...args: any[]) => {
    const response = await sdk.getAllHostEmailCampaigns(...args);
    return {
      getAllRestauranteEmailCampaigns: response.getAllHostEmailCampaigns,
    };
  },
  fetchRestaurantCampaignById: async (variables: any, ...args: any[]) => {
    const campaignId = variables?.campaignId ?? variables?.id;
    const response = await sdk.fetchHostCampaignById(
      { campaignId },
      ...args
    );
    return {
      fetchRestaurantCampaignById: response.fetchHostCampaignById,
    };
  },
  createRestaurantEmailCampaign: async (...args: any[]) => {
    const response = await sdk.createHostEmailCampaign(...args);
    return {
      createRestaurantEmailCampaign: response.createHostEmailCampaign,
    };
  },
  updateRestaurantEmailCampaign: async (...args: any[]) => {
    const response = await sdk.updateHostEmailCampaign(...args);
    return {
      updateRestaurantEmailCampaign: response.updateHostEmailCampaign,
    };
  },
  deleteRestaurantEmailCampaign: async (variables: any, ...args: any[]) => {
    const campaignId = variables?.campaignId ?? variables?.id;
    const response = await sdk.deleteHostEmailCampaign(
      { campaignId },
      ...args
    );
    return {
      deleteRestaurantEmailCampaign: response.deleteHostEmailCampaign,
    };
  },
  hostEmailCampaignCsvExport: async (...args: any[]) => {
    const response = await sdk.hostEmailCampaignCsvExport(...args);
    return {
      hostEmailCampaignCsvExport: response.hostEmailCampaignCsvExport,
    };
  },
  sendTestMarketingEmail: async (...args: any[]) => {
    const response = await sdk.sendTestHostCampaignEmail(...args);
    return {
      sendTestMarketingEmail: response.sendTestHostCampaignEmail,
    };
  },
  getCustomersForTarget: async (variables: any, ...args: any[]) => {
    const response = await sdk.getHostAttendeesTargetCount(
      {
        target: variables?.target,
        eventId: variables?.eventId ?? null,
        filters: variables?.filters ?? null,
      },
      ...args
    );
    return {
      getRestaurantCustomersTargetCount: response.getHostAttendeesTargetCount,
    };
  },
  restaurantStatusCheck: (...args: any[]) => sdk.businessStatusCheck(...args),
  userRestaurants: async (...args: any[]) => {
    const response = await sdk.getHostsByBusiness(...args);
    return { userRestaurants: response.getHostsByBusiness ?? [] };
  },
  userSwitchableRestaurants: async (...args: any[]) => {
    const response = await sdk.getHostsByBusiness(...args);
    return { userSwitchableRestaurants: response.getHostsByBusiness ?? [] };
  },
  restaurantDetails: async () => {
    const response = await sdk.getHost();
    return { restaurantDetails: response.getHost ?? null };
  },
  setRestaurantIdAsCookie: async (variables: any) => {
    const hostId = variables?.hostId ?? variables?.id;
    const response = await sdk.SetHostIdAsCookie({ hostId });
    return { setRestaurantIdAsCookie: response.setHostIdAsCookie };
  },
  userRestaurantsPending: () => emptyList("userRestaurantsPending"),
  userHostsPending: () => emptyList("userHostsPending"),
  deleteIncompleteRestaurant: () => truthy("deleteIncompleteRestaurant"),
  updateWalkthroughStatus: () => truthy("updateWalkthroughStatus"),
  getActiveStates: async () => {
    const response = await sdk.getActiveIndianCities();
    const uniqueStates = Array.from(
      new Set(
        (response.getActiveIndianCities ?? [])
          .map((city: any) => city.state)
          .filter(Boolean)
      )
    ).sort();

    return {
      getActiveStates: uniqueStates.map((state) => ({
        _id: state,
        value: state,
      })),
    };
  },
  getActiveTimezones: () => emptyList("getActiveTimezones"),
  getActiveCuisines: async (...args: any[]) => {
    const response = await sdk.getActiveEventCategories(...args);
    return {
      getActiveCuisines: response.getActiveEventCategories ?? [],
    };
  },
  hostOnboarding: async (...args: any[]) => {
    const response = await sdk.createHostOnboarding(...args);
    return { ...response, hostOnboarding: response.createHost };
  },
  updateTaxRate: () => truthy("updateTaxRate"),
  addTaxRate: () => truthy("addTaxRate"),
  updateRestaurantDetails: () => truthy("updateRestaurantDetails"),
  updateRestaurantPickupStatus: () => truthy("updateRestaurantPickupStatus"),
  updateRestaurantAllowTips: () => truthy("updateRestaurantAllowTips"),
  updateRestaurantGiftCardEnabled: () => truthy("updateRestaurantGiftCardEnabled"),
  updateRestaurantScheduleOrders: () => truthy("updateRestaurantScheduleOrders"),
  updateRestaurantShowItemFilters: () => truthy("updateRestaurantShowItemFilters"),
  updateRestaurantProvideDelivery: () => truthy("updateRestaurantProvideDelivery"),
  updateFulfillmentConfig: () => truthy("updateFulfillmentConfig"),
  removeDeliveryZone: () => truthy("removeDeliveryZone"),
  updateDeliveryZone: () => truthy("updateDeliveryZone"),
  addDeliveryZone: () => truthy("addDeliveryZone"),
  updateRestaurantOnlineOrderingStatus: () => truthy("updateRestaurantOnlineOrderingStatus"),
  updateOnlineOrderTimingConfig: () => truthy("updateOnlineOrderTimingConfig"),
  OnlineOrderingChecklist: () => ({ onlineOrderingChecklist: [] }),
  getWebsiteLink: async () => ({ getWebsiteLink: "" }),
  getSyncRules: () => emptyList("getSyncRules"),
  UpdateSyncRules: () => truthy("updateSyncRules"),
  GetCategoriesAndItemsForSyncRules: async () => ({ getCategoriesAndItemsForSyncRules: { items: [], total: 0 } }),
  GetCmsDetails: async () => ({ getCmsAllDetails: null }),
  fetchRestaurantCustomers: async () => ({ fetchRestaurantCustomers: { items: [], total: 0 } }),
  restaurantCustomerCSVDownload: async () => ({ restaurantCustomerCSVDownload: "" }),
  fetchRestaurantGuests: async () => ({ fetchRestaurantGuests: { items: [], total: 0 } }),
  restaurantGuestCSVDownload: async () => ({ restaurantGuestCSVDownload: "" }),
  fetchLoyaltyPointsTransactions: async () => ({ fetchLoyaltyPointsTransactions: [] }),
  fetchRestaurantCustomersReport: async () => ({ fetchRestaurantCustomersReport: { items: [], total: 0 } }),
  restaurantCustomerReportCSVDownload: async () => ({ restaurantCustomerReportCSVDownload: "" }),
  getCustomerIdsArray: async () => ({ getCustomerIdsArray: [] }),
  getGuestIdsArray: async () => ({ getGuestIdsArray: [] }),
  DashboardOverviewData: async () => ({ dashboardOverviewData: {} }),
  DashboardAnalyticsData: async () => ({ dashboardAnalyticsData: {} }),
  DashboardMenuData: async () => ({ dashboardMenuData: {} }),
  DashboardMarketingData: async () => ({ dashboardMarketingData: {} }),
  getReport: async () => ({ getReport: null }),
  getCsvErrors: async () => ({ getCsvErrors: [] }),
  getSalesTrendReport: async () => ({ getSalesTrendReport: [] }),
  getCampaignReport: async () => ({ getCampaignReport: [] }),
  removeRestaurantSubuser: () => truthy("removeRestaurantSubuser"),
  addRestaurantSubuser: () => truthy("addRestaurantSubuser"),
  hostPayoutAccounts: async () =>
    graphQLClient.request(`
      query hostPayoutAccounts {
        hostPayoutAccounts {
          _id
          entityName
          entityType
          panNumber
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
          registeredBusinessName
          createdAt
          updatedAt
        }
      }
    `),
  getHostDashboardSummary: async () =>
    graphQLClient.request(`
      query getHostDashboardSummary {
        getHostDashboardSummary {
          upcomingEventsCount
          publishedEventsCount
          draftEventsCount
          salesToday
          ticketsSoldToday
          salesLast30Days
          ticketsSoldLast30Days
          pendingSettlementsCount
          paidOutLifetime
        }
      }
    `),
  hostListPayoutSettlements: async (variables: any) =>
    graphQLClient.request(
      `
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
      `,
      variables
    ),
  hostGetPayoutStatementUrl: async (variables: { settlementId: string }) =>
    graphQLClient.request(
      `
        query hostGetPayoutStatementUrl($settlementId: String!) {
          hostGetPayoutStatementUrl(settlementId: $settlementId) {
            signedUrl
            expiresAt
          }
        }
      `,
      variables
    ),
  addHostPayoutAccount: async (variables: any) =>
    graphQLClient.request(
      `
        mutation addHostPayoutAccount($input: AddPayoutInput!) {
          addHostPayoutAccount(input: $input) {
            _id
            verificationStatus
            isPrimary
            last4
          }
        }
      `,
      variables
    ),
  setPrimaryHostPayoutAccount: async (variables: any) =>
    graphQLClient.request(
      `
        mutation setPrimaryHostPayoutAccount($id: String!) {
          setPrimaryHostPayoutAccount(id: $id) {
            _id
            isPrimary
          }
        }
      `,
      variables
    ),
  eventOnboardingChecklist: async () =>
    graphQLClient.request(
      `
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
      `,
      {}
    ),
  createEvent: async (variables: any) =>
    graphQLClient.request(
      `
        mutation createEvent($input: CreateEventInput!) {
          createEvent(input: $input) {
            _id
            title
            status
            eventType
            slug
            city
            isVisible
          }
        }
      `,
      variables
    ),
  getMyEvents: async () =>
    graphQLClient.request(`
      query getMyEvents {
        getMyEvents {
          _id
          title
          status
          eventType
          eventFlyer
          startDate
          endDate
          city
          isVisible
          ticketingEnabled
          tickets {
            _id
            ticketName
            ticketCategory
            ticketCapacity
            ticketSold
            ticketPrice
            ticketVisible
          }
          createdAt
          updatedAt
        }
      }
    `),
  // Slim variant for /events/:id/manage and similar surfaces that only
  // render top-of-page chrome (title, status, city, flyer). The full
  // getEvent below requests every nested field — when even one entry in
  // tickets/lineup/collaborators/extras has a stale required subfield,
  // the whole response fails with a GraphQL non-nullable violation and
  // the user sees "Something went wrong" with no clue why. Pages that
  // only show chrome should call this method.
  getEventForManage: async (variables: { id: string }) =>
    graphQLClient.request(
      `
        query getEventForManage($id: String!) {
          getEvent(id: $id) {
            _id
            title
            status
            city
            eventFlyer
            slug
          }
        }
      `,
      variables
    ),
  // Full Manage Event dashboard payload (TASK-046) — single round-trip.
  getEventManageOverview: async (variables: { id: string }) =>
    graphQLClient.request(
      `
        query getEventManageOverview($id: String!) {
          getEventManageOverview(id: $id) {
            _id
            title
            status
            city
            eventFlyer
            startDate
            endDate
            isVisible
            ticketingEnabled
            isCollaboratorView
            canSeeMetrics
            canRunCampaigns
            canCreateOffers
            canAccessCustomerList
            totals { capacity sold grossRevenue }
            tickets {
              _id
              ticketName
              ticketCapacity
              ticketSold
              ticketPrice
              ticketVisible
            }
            selectedPricingPlan
            selectedCommissionRate
            selectedAiBoostCode
            scannersCount
          }
        }
      `,
      variables
    ),
  updateEventPartial: async (variables: { id: string; input: any }) =>
    graphQLClient.request(
      `
        mutation updateEventPartial($id: String!, $input: EventInput!) {
          updateEvent(id: $id, input: $input) {
            _id
            isVisible
            ticketingEnabled
          }
        }
      `,
      variables
    ),
  getEvent: async (variables: any) =>
    graphQLClient.request(
      `
        query getEvent($id: String!) {
          getEvent(id: $id) {
            _id
            title
            description
            eventFlyer
            eventType
            status
            startDate
            endDate
            markSeparateDays
            isComingSoon
            city
            location {
              addressLine1
              addressLine2
              city
              state
              pincode
              formattedAddress
              coordinate {
                coordinates
              }
              place {
                displayName
                placeId
              }
            }
            eventLocationDecided
            isVisible
            ticketingEnabled
            allowWalkIns
            ticketSalesStartDate
            ticketSalesEndDate
            maxCapacity
            autoConfirmBookings
            requiresIDVerification
            ticketingTerms
            refundPolicy
            cancellationPolicy
            contactForQueriesTables
            expectedEventsDoneTillNow
            selectedPricingPlan
            feeSettlementMode
            pricingSelectedAt
            pricingSnapshot {
              optionId
            }
            tickets {
              _id
              ticketCategory
              ticketName
              ticketType
              ticketCapacity
              ticketSold
              ticketPrice
              ticketInfo
              maxTicketPerUser
              coverType
              coverAmount
              ticketGST
              gstRate
              ticketExpiryDateTime
              markAsComingSoon
              markAsOnGroundOnly
              tableCapacity
              groupCapacity
              collectPartialAdvancePayment
              advanceBookingAmount
              ticketVisible
            }
            lineup {
              name
              picture
              artistLinkId
              tempArtistId
              instagramLink
              spotifyLink
              youtubeLink
            }
            eventCollaborationBusiness {
              name
              businessLinkId
              logo
              requestCustomerListAccess
              customerListShared
              hideOnEventPage
              allowIssuingOfflineTickets
              sendTransactionalMails
              canSeeMetrics
              canRunCampaigns
              canCreateOffers
            }
            extras {
              _id
              name
              description
              price
              quantity
              sold
              image
              type
              linkedTicketTypes
            }
          }
        }
      `,
      variables
    ),
  searchEventArtists: async (variables: any) =>
    graphQLClient.request(
      `
        query searchEventArtists($search: String!) {
          searchEventArtists(search: $search) {
            id
            source
            name
            picture
            artistLinkId
            tempArtistId
            instagramLink
            spotifyLink
            youtubeLink
          }
        }
      `,
      variables
    ),
  getActiveGenreTags: async () =>
    graphQLClient.request(`
      query getActiveGenreTags {
        getActiveGenreTags {
          _id
          value
        }
      }
    `),
  searchCollaboratorHosts: async (variables: any) =>
    graphQLClient.request(
      `
        query searchCollaboratorHosts($search: String!) {
          searchCollaboratorHosts(search: $search) {
            _id
            name
            email
            phone
            logo
          }
        }
      `,
      variables
    ),
  updateEventStep: async (variables: any) =>
    graphQLClient.request(
      `
        mutation updateEventStep($id: String!, $step: Int!, $stepInput: EventInput!) {
          updateEventStep(id: $id, step: $step, stepInput: $stepInput) {
            _id
            title
            status
            eventType
            city
            isVisible
            ticketingEnabled
          }
        }
      `,
      variables
    ),
  deleteEvent: async (variables: any) =>
    graphQLClient.request(
      `
        mutation deleteEvent($id: String!) {
          deleteEvent(id: $id)
        }
      `,
      variables
    ),
  publishEvent: async (variables: any) =>
    graphQLClient.request(
      `
        mutation publishEvent($id: String!) {
          publishEvent(id: $id) {
            _id
            status
          }
        }
      `,
      variables
    ),
  eventPricingOptions: async (variables: any) =>
    graphQLClient.request(
      `
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
      `,
      variables
    ),
  selectEventPricingOption: async (variables: any) =>
    graphQLClient.request(
      `
        mutation selectEventPricingOption($input: SelectEventPricingInput!) {
          selectEventPricingOption(input: $input) {
            _id
            selectedPricingPlan
            feeSettlementMode
          }
        }
      `,
      variables
    ),

  listScannersForEvent: async (variables: { eventId: string }) =>
    graphQLClient.request(
      `
        query listScannersForEvent($eventId: String!) {
          listScannersForEvent(eventId: $eventId) {
            _id
            name
            scannerName
            scannerType
            email
            phone
            eventId
            totalScanned
            lastLoginAt
            isActive
            createdAt
          }
        }
      `,
      variables
    ),

  hostListEventScans: async (variables: {
    eventId: string;
    page?: number;
    pageSize?: number;
  }) =>
    graphQLClient.request(
      `
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
      `,
      variables
    ),

  hostReverseCheckIn: async (variables: { orderId: string; reason: string }) =>
    graphQLClient.request(
      `
        mutation hostReverseCheckIn($orderId: String!, $reason: String!) {
          hostReverseCheckIn(orderId: $orderId, reason: $reason)
        }
      `,
      variables
    ),

  hostRevokeAllScannersForEvent: async (variables: { eventId: string }) =>
    graphQLClient.request(
      `
        mutation hostRevokeAllScannersForEvent($eventId: String!) {
          hostRevokeAllScannersForEvent(eventId: $eventId)
        }
      `,
      variables
    ),

  createScanner: async (variables: { input: any }) =>
    graphQLClient.request(
      `
        mutation createScanner($input: CreateScannerInput!) {
          createScanner(input: $input) {
            scanner {
              _id
              name
              scannerName
              scannerType
              email
              phone
              eventId
              isActive
              createdAt
            }
            accessCode
          }
        }
      `,
      variables
    ),

  updateScanner: async (variables: { input: any }) =>
    graphQLClient.request(
      `
        mutation updateScanner($input: UpdateScannerInput!) {
          updateScanner(input: $input) {
            _id
            scannerName
            scannerType
            phone
            isActive
          }
        }
      `,
      variables
    ),

  regenerateScannerAccessCode: async (variables: { scannerId: string }) =>
    graphQLClient.request(
      `
        mutation regenerateScannerAccessCode($scannerId: String!) {
          regenerateScannerAccessCode(scannerId: $scannerId) {
            scanner {
              _id
            }
            accessCode
          }
        }
      `,
      variables
    ),

  deleteScanner: async (variables: { scannerId: string }) =>
    graphQLClient.request(
      `
        mutation deleteScanner($scannerId: String!) {
          deleteScanner(scannerId: $scannerId)
        }
      `,
      variables
    ),

  // Defined inline so the global TopUpModal can call it without forcing
  // a yarn codegen on every developer machine. Mirror in graphql/campaign.graphql
  // exists for the next codegen run; the generated method (when it lands)
  // will simply shadow this one with no behavior change.
  verifyMarketingCreditTopUp: async (variables: {
    input: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    };
  }) =>
    graphQLClient.request(
      `
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
      `,
      variables
    ),

  // Host-level defaults for Ticketing Terms & Conditions + Refund Policy.
  // Used by EventJourney to prefill the last step on event create.
  // Codegen ops live in graphql/host-content-defaults.graphql — the
  // generated SDK methods will shadow these once codegen is re-run.
  getMyHostContentDefaults: async () =>
    graphQLClient.request<{
      getMyHostContentDefaults: {
        _id: string;
        hostId: string;
        ticketingTerms?: string | null;
        refundPolicy?: string | null;
      } | null;
    }>(
      `
        query getMyHostContentDefaults {
          getMyHostContentDefaults {
            _id
            hostId
            ticketingTerms
            refundPolicy
          }
        }
      `
    ),
  saveMyHostContentDefaults: async (variables: {
    input: { ticketingTerms?: string; refundPolicy?: string };
  }) =>
    graphQLClient.request<{
      saveMyHostContentDefaults: {
        _id: string;
        hostId: string;
        ticketingTerms?: string | null;
        refundPolicy?: string | null;
      };
    }>(
      `
        mutation saveMyHostContentDefaults($input: SaveHostContentDefaultsInput!) {
          saveMyHostContentDefaults(input: $input) {
            _id
            hostId
            ticketingTerms
            refundPolicy
          }
        }
      `,
      variables
    ),

  // Events the current host has been added to as a collaborator. The
  // events listing merges these with getMyEvents and marks them
  // read-only. Codegen ops live in graphql/events.graphql (to be added
  // when the next codegen run lands).
  getMyCollaboratedEvents: async () =>
    graphQLClient.request<{
      getMyCollaboratedEvents: Array<{
        _id: string;
        hostId?: string;
        title?: string;
        status?: string;
        eventType?: string[];
        eventFlyer?: string;
        startDate?: string;
        endDate?: string;
        city?: string;
        eventCollaborationBusiness?: Array<{
          businessLinkId?: string;
          name?: string;
          logo?: string;
          collaborationStatus?: string;
          canSeeMetrics?: boolean;
          canRunCampaigns?: boolean;
          canCreateOffers?: boolean;
          requestCustomerListAccess?: boolean;
        }>;
      }>;
    }>(
      `
        query getMyCollaboratedEvents {
          getMyCollaboratedEvents {
            _id
            title
            status
            eventType
            eventFlyer
            startDate
            endDate
            city
            eventCollaborationBusiness {
              businessLinkId
              name
              logo
              collaborationStatus
              canSeeMetrics
              canRunCampaigns
              canCreateOffers
              requestCustomerListAccess
            }
          }
        }
      `
    ),
  respondToEventCollaboration: async (variables: { eventId: string; accept: boolean }) =>
    graphQLClient.request<{ respondToEventCollaboration: { _id: string } }>(
      `
        mutation respondToEventCollaboration($eventId: String!, $accept: Boolean!) {
          respondToEventCollaboration(eventId: $eventId, accept: $accept) {
            _id
          }
        }
      `,
      variables
    ),
});
