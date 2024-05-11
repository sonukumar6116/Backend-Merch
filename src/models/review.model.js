import mongoose ,{Schema} from "mongoose";

const reviewSchema = new Schema({
      stars:{
            type:Number,
            default:0
      },
      title:{
            type:String,
            required:true
      },
      content:{
            type:String,
            required:true
      },
      photos:[
            {
                  type:{
                        public_Id:String,
                        url:String
                  }
            }
      ],
      owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
      },
      product:{
            type:Schema.Types.ObjectId,
            ref:"Product"
      }
},{timestamps:true})

export const Review = mongoose.model("Review",reviewSchema);