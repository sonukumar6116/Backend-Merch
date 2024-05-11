import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema({
      ownername:{
            type: String,
            required: true,
            trim: true,
            lowercase: true
      },
      address: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
      },
      state: {
            type: String,
            required: true,
            lowercase: true
      },
      pincode: {
            type: String,
            required: true,
      },
      district: {
            type: String,
            required: true,
            lowercase: true
      },
      contury: {
            type: String,
            default:"india",
            required: true,
            lowercase: true
      },
      owner : {
            type:Schema.Types.ObjectId,
            ref:"User"
      }
},{timestamps:true})

export const Address = mongoose.model("Address",addressSchema)