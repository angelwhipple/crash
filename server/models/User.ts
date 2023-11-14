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
  // communities: [string], // array of community IDs
  // likes: [string], // array of liked listing IDs
});

export interface User extends Document {
  name: string;
  username: string;
  googleid: string;
  linkedinid: string;
  originid: string;
  _id: string;
  email: string;
  password: string;
  dob: string;
  // communities: [String];
  // likes: [String];
}

const UserModel = model<User>("User", UserSchema);

export default UserModel;
