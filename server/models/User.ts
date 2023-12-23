import { Schema, model, Document } from "mongoose";

const UserSchema = new Schema({
  name: String,
  username: { type: String, required: false },
  googleid: String,
  linkedinid: String,
  originid: String,
  email: String,
  password: String,
  dob: String,
  bio: { type: String, required: false },
  verified: Boolean,
  communities: [String], // array of community IDs
  // likes: [String], // array of liked listing IDs
  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  aws_img_key: { type: String, required: false },
});

export interface User extends Document {
  _id: string;
  name: string;
  username?: string;
  googleid: string;
  linkedinid: string;
  originid: string;
  email: string;
  password: string;
  dob: string;
  bio: string;
  verified: Boolean;
  communities: string[];
  // likes: string[];
  followers?: string[];
  following?: string[];
  aws_img_key?: String;
}

const UserModel = model<User>("User", UserSchema);

export default UserModel;
