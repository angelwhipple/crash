import { Schema, model, Document } from "mongoose";

const ListingSchema = new Schema({
  creator: String,
  date: String,
  photos: [String], // array of image URLs, TODO: find DB for storing pictures
  details: String,
});

export interface User extends Document {
  creator: String;
  date: String;
  photos: [String]; // array of image URLs, TODO: find DB for storing pictures
  details: String;
  _id: string;
}

const ListingModel = model<User>("User", ListingSchema);

export default ListingModel;
