import { Schema, model, Document } from "mongoose";

const CommunitySchema = new Schema({
  name: String,
  owner: String,
  //   admin: [String],
  //   members: [String],
});

export interface Community extends Document {
  name: string;
  owner: string;
  //   admin: string[];
  //   members: string[];
  _id: string;
}

const CommunityModel = model<Community>("Community", CommunitySchema);

export default CommunityModel;
