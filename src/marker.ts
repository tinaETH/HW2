import { map } from "./webpack.config";

/** Represents a location on the map. */
export type Location = {x: number, y: number};


/** Determines if loc1 is northwest of loc2. */
export const isNW = (loc1: Location, loc2: Location): boolean => {
  return loc1.x <= loc2.x && loc1.y <= loc2.y;
}

/** Determines if loc1 is northeast of loc2. */
export const isNE = (loc1: Location, loc2: Location): boolean => {
  return loc1.x > loc2.x && loc1.y <= loc2.y;
}

/** Determines if loc1 is southeast of loc2. */
export const isSE = (loc1: Location, loc2: Location): boolean => {
  return loc1.x > loc2.x && loc1.y > loc2.y;
}

/** Determines if loc1 is southwest of loc2. */
export const isSW = (loc1: Location, loc2: Location): boolean => {
  return loc1.x <= loc2.x && loc1.y > loc2.y;
}


/** Special location marked on the map. */
export type Marker = {
  name: string;
  color: string;
  location: Location;
};

/** List of colors that can be used for markers. */
export const COLORS: Array<string> = [
    "red", "orange", "yellow", "green", "blue", "indigo", "violet"
  ];

  /**Create a map for colors */
  /*function call back function to display those colors in editio*/ 

