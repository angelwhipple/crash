/**
 * TYPES
 */

import React from "react";

export enum SearchFilters {
  "ALL",
  "USERS",
  "COMMUNITIES",
  "HOUSING",
}

export type Policy = {
  show: boolean;
  header?: string;
  text?: string;
};

export type Crop = {
  show: boolean;
  input?: File;
  previewSrc?: string;
};

export type CustomError = {
  valid: boolean;
  message?: string;
};

export const THIS_YEAR = new Date().getFullYear();
export const VALID_DOMAINS = [".edu", ".com", ".gov"];
export const FILTERS_TO_IDS = {
  [SearchFilters.ALL]: "all",
  [SearchFilters.USERS]: "users",
  [SearchFilters.COMMUNITIES]: "communities",
};

export const USERNAME_INFO = `<div>
    <p>1. New username must be atleast 3 characters long.</p>
    <p>2. Can include a mix of letters, numbers, and underscores.</p>
    <p>3. Usernames may only be changed twice every 30 days.</p>
    <p>4. Your old username will be reserved for up to 5 days after the change.</p>
  </div>`;

export const PASSWORD_INFO = `<div>
    <p>1. Your password must be atleast 8 characters long.</p>
    <p>2. Must include a mix of letters, numbers, and special characters.</p>
    <p>3. Avoid common passwords and consider using passphrases for added security.</p>
  </div>`;
