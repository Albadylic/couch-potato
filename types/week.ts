export type WeekType = {
  id: number;
  days: DayType[];
};

export type DayType = {
  id: number;
  day: string;
  distance: number;
  "jogging-interval-time": number;
  "walking-intervals-time": number;
  "number-of-intervals": number;
  instructions: string[];
};

export type Plan = {
  weeks: WeekType[];
};
