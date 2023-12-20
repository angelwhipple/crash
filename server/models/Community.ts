import { Schema, model, Document } from "mongoose";

const CommunitySchema = new Schema({
  name: String,
  owner: String,
  admin: [String],
  members: [String],
  type: String,
  code: String, // join code
  aws_img_key: { type: String, required: false },
});

export interface Community extends Document {
  _id: string;
  name: string;
  owner: string;
  admin: string[];
  members: string[];
  type: String;
  code: String;
  aws_img_key?: String;
}

const CommunityModel = model<Community>("Community", CommunitySchema);

export default CommunityModel;
