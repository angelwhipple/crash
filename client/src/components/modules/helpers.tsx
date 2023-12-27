import { THIS_YEAR, VALID_DOMAINS } from "./types";
import { type Crop } from "react-image-crop";

/**
 * HELPERS
 */

// PASSWORD CONSTRAINTS: len <= 8 chars, <= 1 special char, <= 1 letter, <= 1 number
const validatePassword = (pass: String): { ind: boolean; message: string } => {
  let invalid = false;
  if (pass.length < 8) {
    invalid = true;
    return { ind: invalid, message: "Password must be atleast 8 characters" };
  }
  if (pass.search(/[a-zA-Z]/g) === -1) {
    console.log(`Password missing letters`);
    invalid = true;
    return { ind: invalid, message: "Password must contain letter(s)" };
  }
  if (pass.search(/[0-9]/g) === -1) {
    console.log(`Password missing numbers`);
    invalid = true;
    return { ind: invalid, message: "Password must contain number(s)" };
  }
  if (pass.search(/[^a-zA-Z0-9]/g) === -1) {
    console.log(`Password missing special characters`);
    invalid = true;
    return { ind: invalid, message: "Password must contain special character(s)" };
  }
  return { ind: invalid, message: "" };
};
// AGE CONSTRAINT: age >= 16
const validateAge = (birthDate: string) => {
  const birthYear = parseInt(birthDate.substring(0, 4));
  const valid = THIS_YEAR - birthYear >= 16;
  return valid;
};
// USERNAME CONSTRAINTS: len >= 3, 0 special characters (REVISE)
const validateUsername = (user: string) => {
  // let alnumRegex = new RegExp(/^[a-z0-9]+$/, "i")
  let match = /^[a-z0-9]+$/i.test(user);
  return match && user.length >= 3;
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
  validateUsername,
  validatePassword,
  validateAge,
  validateEmail,
  drawCropCanvas,
  fileFromURL,
  URLFromFile,
};
