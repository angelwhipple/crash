import { Schema, model, Document } from "mongoose";

const UserSchema = new Schema({
  name: String,
  googleid: String,
  // email: String,
  // communities: [String], // array of community IDs/names?
  // likes: [String], // array of post/listing IDs
  // lists: [String], // array of user created list IDs
});

export interface User extends Document {
  name: string;
  googleid: string;
  _id: string;
  // email: String;
  // communities: [String];
  // likes: [String];
  // lists: [String];
}

const UserModel = model<User>("User", UserSchema);

export default UserModel;
