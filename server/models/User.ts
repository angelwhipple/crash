import { Schema, model, Document } from "mongoose";

const UserSchema = new Schema({
  name: String,
  username: String,
  googleid: String,
  linkedinid: String,
  originid: String,
  email: String,
  password: String,
  dob: String,
  // communities: [String], // array of community IDs/names?
  // likes: [String], // array of post/listing IDs
  // lists: [String], // array of user created list IDs
});

export interface User extends Document {
  name: String;
  username: String;
  googleid: string;
  linkedinid: string;
  originid: string;
  _id: string;
  email: String;
  password: String;
  dob: String;
  // communities: [String];
  // likes: [String];
  // lists: [String];
}

const UserModel = model<User>("User", UserSchema);

export default UserModel;
