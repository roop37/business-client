import { ProductContent } from "../data/product-content";

export const getProductBackdropSrc = (pillarId: ProductContent["pillarId"]) => {
  switch (pillarId) {
    case "discovery":
      return "/marketing/brand/hoizr-product-discovery-network.png";
    case "sales":
      return "/marketing/brand/hoizr-product-growth-control.png";
    case "repeat":
      return "/marketing/brand/hoizr-product-repeat-fans.png";
    case "ops":
    default:
      return "/marketing/brand/hoizr-product-operations-door.png";
  }
};
