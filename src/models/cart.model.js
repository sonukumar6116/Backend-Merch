import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema({
      owner : {
            type:Schema.Types.ObjectId,
            ref:"User"
      },
      product : {
            type:Schema.Types.ObjectId,
            ref:"Product"
      },
      count : {
            type:Number,
            default:0
      }
},{timestamps:true})

export const Cart = mongoose.model("Cart",cartSchema)