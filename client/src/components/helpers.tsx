import { THIS_YEAR, VALID_DOMAINS, CustomError } from "./types";
import { type Crop } from "react-image-crop";
import { useNavigate } from "@reach/router";
import { get, post } from "../utilities";

/**
 * HELPERS
 */

const route = (path) => {
  useNavigate()(path);
};

// PASSWORD CONSTRAINTS: len <= 8 chars, <= 1 special char, <= 1 letter, <= 1 number
const validatePassword = (pass: String): CustomError => {
  let valid = true;
  if (pass.length < 8) {
    return { valid: true, message: "Password must be atleast 8 characters" };
  }
  if (pass.search(/[a-zA-Z]/g) === -1) {
    return { valid: true, message: "Password must contain letter(s)" };
  }
  if (pass.search(/[0-9]/g) === -1) {
    console.log(`Password missing numbers`);
    return { valid: true, message: "Password must contain number(s)" };
  }
  if (pass.search(/[^a-zA-Z0-9]/g) === -1) {
    console.log(`Password missing special characters`);
    return { valid: true, message: "Password must contain special character(s)" };
  }
  return { valid: false };
};
// AGE CONSTRAINT: age >= 16
const validateAge = (birthDate: string) => {
  const birthYear = parseInt(birthDate.substring(0, 4));
  const valid = THIS_YEAR - birthYear >= 16;
  return valid;
};
// USERNAME CONSTRAINTS: unique, len >= 3, 0 special characters (REVISE)
const validateUsername = async (user: string): Promise<CustomError> => {
  const match = /^[a-z0-9]+$/i.test(user);
  const length = user.length >= 3;
  if (!match || !length) return { valid: true, message: "Invalid username" };
  return await get("/api/user/unique", { username: user }).then((res) => {
    if (!res.unique) return { valid: true, message: "Username taken" };
    else return { valid: false };
  });
};
// EMAIL CONSTRAINTS:
const validateEmail = (emailAddress: string): Boolean => {
  const valid = VALID_DOMAINS.filter((domain) => emailAddress.endsWith(domain));
  return valid.length !== 0;
};

/**
 * IMAGE CROP
 */

const drawCropCanvas = (image: HTMLImageElement, canvas: HTMLCanvasElement, crop: Crop) => {
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const pixelRatio = window.devicePixelRatio;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx!.imageSmoothingQuality = "high";
    ctx.save();

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    // Move crop origin to canvas origin (0, 0)
    ctx.translate(-cropX, -cropY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    );

    ctx.restore();
  } else console.log("No 2d context");
};

/**
 * FILE MANIPULATION
 */

const fileFromURL = async (url: string, filename: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], filename, { type: blob.type });
  return file;
};

const URLFromFile = (file: File): string => {
  const reader = new FileReader();
  let url = "";
  reader.onload = (event) => {
    url = event.target?.result as string;
  };
  reader.readAsDataURL(file);
  return url;
};

export default {
  route,
  validateUsername,
  validatePassword,
  validateAge,
  validateEmail,
  drawCropCanvas,
  fileFromURL,
  URLFromFile,
};
