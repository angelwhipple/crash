import { Schema, model, Document } from "mongoose";

const PropertyListingSchema = new Schema({
  title: String,
  date_posted: String,
  category: { type: String, default: "LEASE" },
  availability: {
    type: {
      start: { type: String, required: true },
      end: { type: String, required: false },
      flexible: { type: Boolean, required: true },
    },
  },
  lease_term: { type: String, required: true },
  details: {
    type: {
      location: String,
      rent: Number,
      bed: Number,
      bath: Number,
      footage: Number, // square ft
      furnished: Boolean,
      aws_img_keys: [String],
    },
    required: true,
  },
  sublease_details: {
    type: {
      group: { type: Boolean, default: false },
      members: [String],
      crash_property_id: { type: String, required: false }, // for special support when subleasing Crash verified properties/listings
      external_property_details: {
        type: { name: String, email: String, phone: String, website_url: String },
        required: false,
      },
    },
    required: false,
  },
});

export interface PropertyListing extends Document {
  _id: string;
  title: string;
  date_posted: string;
  category?: string;
  availability: { start: string; end?: string; flexible: Boolean };
  lease_term: string;
  details: {
    location: string;
    rent: Number;
    bed: Number;
    bath: Number;
    footage: Number;
    furnished: Boolean;
    aws_img_keys: string[];
  };
  sublease_details?: {
    group: Boolean;
    members: string[];
    crash_property_id?: String; // Crash listing ID of originally leased property
    external_property_details?: { name: string; email: string; phone: string; website_url: string };
  };
}

const PropertyListingModel = model<PropertyListing>("PropertyListing", PropertyListingSchema);

export default PropertyListingModel;
