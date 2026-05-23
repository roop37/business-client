import {
  BeverageCategory,
  FoodType,
  MeatType,
  RestaurantCategory,
  RestaurantType,
} from "@/generated/graphql";

export const formatRestaurantType = (value: RestaurantType) => {
  switch (value) {
    case RestaurantType.Independent:
      return "Independent";
    case RestaurantType.PartOfChain:
      return "Part of Chain";
    default:
      return "";
  }
};

export const formatRestaurantCategory = (value: RestaurantCategory) => {
  switch (value) {
    case RestaurantCategory.CloudKitchen:
      return "Cloud Kitchen";
    case RestaurantCategory.DineIn:
      return "Dine-In";
    case RestaurantCategory.PremiumDineIn:
      return "Premium Dine-In";
    case RestaurantCategory.Qsr:
      return "QSR";
    case RestaurantCategory.Takeout:
      return "Takeout";
    default:
      return "";
  }
};

export const formatMeatType = (value: MeatType | undefined) => {
  switch (value) {
    case MeatType.Halal:
      return "Halal";
    case MeatType.NonHalal:
      return "Non-Halal";
    default:
      return "Not specified";
  }
};

export const formatFoodType = (value: FoodType | undefined) => {
  switch (value) {
    case FoodType.NonVegetarian:
      return "Non-Vegetarian";
    case FoodType.Vegan:
      return "Vegan";
    case FoodType.Vegetarian:
      return "Vegetarian";
    case FoodType.Jain:
      return "Jain";
    default:
      return "Not specified";
  }
};

export const formatBeverageCategory = (value: BeverageCategory | undefined) => {
  switch (value) {
    case BeverageCategory.Alcohol:
      return "Alcohol";
    case BeverageCategory.NonAlcohol:
      return "Non-Alcohol";
    default:
      return "Not specified";
  }
};
