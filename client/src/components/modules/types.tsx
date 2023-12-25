/**
 * TYPES
 */

export enum SearchFilters {
  "ALL",
  "USERS",
  "COMMUNITIES",
  "HOUSING",
}

export const THIS_YEAR = new Date().getFullYear();
export const VALID_DOMAINS = [".edu", ".com", ".gov"];

export const FILTERS_TO_IDS = {
  [SearchFilters.ALL]: "all",
  [SearchFilters.USERS]: "users",
  [SearchFilters.COMMUNITIES]: "communities",
};
