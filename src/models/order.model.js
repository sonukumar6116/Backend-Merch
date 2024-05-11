import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
      owner : {
            type:Schema.Types.ObjectId,
            ref:"User"
      },
      product : {
            type:Schema.Types.ObjectId,
            ref:"Product"
      },
      address:{
            type:Schema.Types.ObjectId,
            ref:"Address"
      },
      itemCount:{
            type:Number,
            required:true
      },
      isRecieved:{
            type:Boolean,
            default:false
      },
      phoneNo:{
            type:Number,
            required:true
      }
},{timestamps:true})

export const Order = mongoose.model("Order",orderSchema)