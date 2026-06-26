import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const TASK_MENU_WIDTH = SCREEN_WIDTH * 0.90;
export const TASK_MENU_PEEK = 10;
export const TASK_MENU_CLOSED_X = -TASK_MENU_WIDTH + TASK_MENU_PEEK;
export const MAINTENANCE_CALORIES = 2000;
export const DAILY_WATER_GOAL_ML = 2000;
export const WATER_SERVING_ML = 250;

export type ActiveTab = "tasks" | "shop" | "items";
export type CareAction = "water" | "feed" | "rest" | "clean";
export type ActivityType =
  | "Walking"
  | "Running"
  | "Cycling"
  | "Weight training"
  | "Swimming"
  | "Yoga"
  | "Hiking"
  | "Sports";

export const tabs: {
  id: ActiveTab;
  label: string;
  color: string;
  top: number;
  zIndex: number;
}[] = [
  { id: "tasks", label: "Tasks", color: "#ffedc7", top: 36, zIndex: 10 },
  { id: "shop", label: "Shop", color: "#c1f1ff", top: 36 + 120 - 20, zIndex: 9 },
  { id: "items", label: "Items", color: "#ffba95", top: 36 + 240 - 40, zIndex: 8 },
];

export const challenges: {
  id: string;
  title: string;
  icon: string;
  action: CareAction;
  habitatPrompt: string;
}[] = [
  {
    id: "sleep",
    title: "Sleep Routine",
    icon: "REST",
    action: "rest",
    habitatPrompt: "Tuck in your pet",
  },
  {
    id: "cleaning",
    title: "Clean Space",
    icon: "CLEAN",
    action: "clean",
    habitatPrompt: "Clean your pet",
  },
];

export const careActionLabels: Record<CareAction, string> = {
  water: "Water",
  feed: "Food",
  rest: "Rest",
  clean: "Clean",
};

export const activityOptions: ActivityType[] = [
  "Walking",
  "Running",
  "Cycling",
  "Weight training",
  "Swimming",
  "Yoga",
  "Hiking",
  "Sports",
];

export const activityEnergyLossPerHour: Record<ActivityType, number> = {
  Walking: 6,
  Running: 18,
  Cycling: 14,
  "Weight training": 16,
  Swimming: 20,
  Yoga: 5,
  Hiking: 12,
  Sports: 17,
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
