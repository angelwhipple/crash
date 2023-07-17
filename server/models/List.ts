import { Schema, model, Document } from "mongoose";

const ListSchema = new Schema({
  creator: String,
  name: String,
  description: String,
  listings: [String], // array of listing IDs
});

export interface User extends Document {
  creator: String;
  name: String;
  description: String;
  listings: [String]; // array of listing IDs
  _id: string;
}

const ListModel = model<User>("User", ListSchema);

export default ListModel;
