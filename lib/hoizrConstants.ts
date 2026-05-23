// Hoizr business / host enum constants — mirrors hoizr-shared/src/enums/business.enum.ts.
// Defined locally because @hoizr-technology/shared is not a frontend dependency.

export enum HoizrBusinessType {
  PrivateLimited = "PrivateLimited",
  PublicLimited = "PublicLimited",
  LLP = "LLP",
  Partnership = "Partnership",
  SoleProprietorship = "SoleProprietorship",
  NGO = "NGO",
  Trust = "Trust",
}

const businessTypeGraphqlMap: Record<string, string> = {
  [HoizrBusinessType.PrivateLimited]: "PRIVATE_LIMITED",
  [HoizrBusinessType.PublicLimited]: "PUBLIC_LIMITED",
  [HoizrBusinessType.LLP]: "LLP",
  [HoizrBusinessType.Partnership]: "PARTNERSHIP",
  [HoizrBusinessType.SoleProprietorship]: "SOLE_PROPRIETORSHIP",
  [HoizrBusinessType.NGO]: "NGO",
  [HoizrBusinessType.Trust]: "TRUST",
};

const businessTypeFormMap = Object.fromEntries(
  Object.entries(businessTypeGraphqlMap).map(([formValue, graphqlValue]) => [
    graphqlValue,
    formValue,
  ])
);

export const normalizeHoizrBusinessType = (value: string): string =>
  businessTypeFormMap[value] ?? value;

export const toBusinessTypeGraphqlInput = (value: string): string =>
  businessTypeGraphqlMap[value] ?? value;

export const formatHoizrBusinessType = (value: string): string => {
  switch (normalizeHoizrBusinessType(value)) {
    case HoizrBusinessType.PrivateLimited:
      return "Private Limited";
    case HoizrBusinessType.PublicLimited:
      return "Public Limited";
    case HoizrBusinessType.LLP:
      return "LLP";
    case HoizrBusinessType.Partnership:
      return "Partnership";
    case HoizrBusinessType.SoleProprietorship:
      return "Sole Proprietorship";
    case HoizrBusinessType.NGO:
      return "NGO";
    case HoizrBusinessType.Trust:
      return "Trust";
    default:
      return "";
  }
};

export enum HoizrHostType {
  Venue = "VENUE",
  EventOrg = "EVENT_ORG",
}

export const formatHoizrHostType = (value: string): string => {
  switch (value) {
    case HoizrHostType.Venue:
      return "Venue";
    case HoizrHostType.EventOrg:
      return "Event Organizer";
    default:
      return "";
  }
};

export enum HoizrVenueType {
  Bar = "Bar",
  Club = "Club",
  ConcertHall = "ConcertHall",
  Festival = "Festival",
  Outdoor = "Outdoor",
  PrivateEvents = "PrivateEvents",
  Restaurant = "Restaurant",
  Lounge = "Lounge",
  Hotel = "Hotel",
}

export const formatHoizrVenueType = (value: string): string => {
  switch (value) {
    case HoizrVenueType.Bar:
      return "Bar";
    case HoizrVenueType.Club:
      return "Club";
    case HoizrVenueType.ConcertHall:
      return "Concert Hall";
    case HoizrVenueType.Festival:
      return "Festival";
    case HoizrVenueType.Outdoor:
      return "Outdoor";
    case HoizrVenueType.PrivateEvents:
      return "Private Events";
    case HoizrVenueType.Restaurant:
      return "Restaurant";
    case HoizrVenueType.Lounge:
      return "Lounge";
    case HoizrVenueType.Hotel:
      return "Hotel";
    default:
      return "";
  }
};

export enum HoizrGstRegistrationType {
  Regular = "regular",
  Composition = "composition",
  Casual = "casual",
  NonResident = "non_resident",
  InputServiceDistributor = "input_service_distributor",
  TdsTcs = "tds_tcs",
}

export const formatHoizrGstRegistrationType = (value: string): string => {
  switch (value) {
    case HoizrGstRegistrationType.Regular:
      return "Regular";
    case HoizrGstRegistrationType.Composition:
      return "Composition";
    case HoizrGstRegistrationType.Casual:
      return "Casual";
    case HoizrGstRegistrationType.NonResident:
      return "Non-Resident";
    case HoizrGstRegistrationType.InputServiceDistributor:
      return "Input Service Distributor";
    case HoizrGstRegistrationType.TdsTcs:
      return "TDS/TCS";
    default:
      return "";
  }
};
