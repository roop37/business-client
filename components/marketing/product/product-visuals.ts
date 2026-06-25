import { ProductContent } from "../data/product-content";

export const getProductBackdropSrc = (pillarId: ProductContent["pillarId"]) => {
  switch (pillarId) {
    case "own":
      return "/marketing/brand/hoizr-product-discovery-network.png";
    case "sell":
      return "/marketing/brand/hoizr-product-growth-control.png";
    case "grow":
    case "artists":
      return "/marketing/brand/hoizr-product-repeat-fans.png";
    case "ops":
    case "decide":
    default:
      return "/marketing/brand/hoizr-product-operations-door.png";
  }
};
