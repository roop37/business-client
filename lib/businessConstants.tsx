import { BusinessTypeEnum } from "@/generated/graphql";

export const formatBusinessTypeEnum = (value: BusinessTypeEnum) => {
  switch (value) {
    case BusinessTypeEnum.CCorp:
      return "C Corporation";
    case BusinessTypeEnum.Llc:
      return "LLC";
    case BusinessTypeEnum.Partnership:
      return "Partnership";
    case BusinessTypeEnum.SCorp:
      return "S Corporation";
    case BusinessTypeEnum.SolePartnership:
      return "Sole Partnership";
    default:
      return "";
  }
};
