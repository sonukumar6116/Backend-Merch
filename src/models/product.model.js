import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const productSchema = new Schema({
      name: {
            type: String,
            required: true,
            lowercase: true
      },
      brand: {
            type: String,
            required: true,
            lowercase: true
      },
      category: {
            type: String,
            required: true,
            lowercase: true
      },
      description: {
            type: String,
            required: true
      },
      price: {
            type: Number,
            required: true,
      },
      photos: [
            {
                  type: {
                        public_id: String,
                        url: String
                  }
            }
      ],
      proImage: {
            type: {
                  public_id: String,
                  url: String
            }
      },
      proCount: {
            type: Number,
            default: 0
      },
      owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
      }
}, { timestamps: true })

productSchema.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model("Product", productSchema)