import { Schema, model, Document } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  googleid: { type: String, required: false },
  linkedinid: { type: String, required: false },
  originid: { type: String, required: false },
  email: { type: String, required: true },
  hashed_pw: { type: String, required: false },
  pw_salt: { type: String, required: false },
  dob: { type: String, required: false },
  bio: { type: String, required: false },
  verified: String,
  communities: [String], // array of community IDs
  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  aws_img_key: { type: String, required: false },
});

export interface User extends Document {
  _id: string;
  name: string;
  username: string;
  googleid?: string;
  linkedinid?: string;
  originid?: string;
  email: string;
  hashed_pw?: string;
  pw_salt?: string;
  dob?: string;
  bio?: string;
  verified?: Boolean;
  communities: string[];
  followers?: string[];
  following?: string[];
  aws_img_key?: String;
}

const UserModel = model<User>("User", UserSchema);

export default UserModel;
