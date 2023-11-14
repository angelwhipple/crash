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
  communities: Array<String>, // array of community IDs
  _id: String,
  // likes: [String], // array of liked listing IDs
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
  communities: Array<string>;
  // likes: string[];
}

const UserModel = model<User>("User", UserSchema);

export default UserModel;
