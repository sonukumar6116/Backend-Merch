import mongoose, { isValidObjectId } from "mongoose";
import { Product } from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteInCloudinary } from "../utils/cloudinary.js";
import { multiDeleter, multiUploder } from "../utils/uploaders.js";
import { Review } from "../models/review.model.js";

const addProduct = asyncHandler(async (req, res) => {
      const { name, brand, category, description, price, proCount } = req.body;

      if ([name, brand, category, description, price, proCount]
            .some(feild => feild.trim() === "")) {
            throw new ApiError(400, "all feilds req")
      }

      const product = await Product.findOne({ name });

      if (product) {
            console.log(product);
            throw new ApiError(400, "product already exists")
      }

      const proImagepath = req.files?.proImage[0]?.path
      if (!proImagepath) {
            throw new ApiError(408, "proImage file req")
      }

      const proimage = await uploadOnCloudinary(proImagepath);
      if (!proimage) {
            throw new ApiError(400, "wrong during uploading proImage")
      }

      const photos = req.files?.photos

      const uploadedphotos = await multiUploder(photos);

      // console.log("uploadedphotos--->",uploadedphotos);

      const createdProduct = await Product.create({
            name,
            brand,
            category,
            description,
            photos: uploadedphotos,
            proImage: {
                  public_id: proimage.public_id,
                  url: proimage.secure_url
            },
            price,
            proCount,
            owner: req.user?._id
      })

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  createdProduct,
                  "product created SuccessFully"
            ))
})

const updateProduct = asyncHandler(async (req, res) => {
      const { name, description, proCount } = req.body;
      const { productId } = req.params;

      if ([name, description].some(feild => {
            return feild.trim() === "";
      })) {
            throw new ApiError(400, "need all feild")
      }

      if (!isValidObjectId(productId)) {
            throw new ApiError(400, "invalid productId")
      }

      const product = await Product.findById(productId)

      if (!product) {
            throw new ApiError(400, "product not found")
      }

      if (product.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(400, "only owner can update inn product")
      }

      const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                  $set: {
                        name,
                        description,
                        proCount
                  }
            },
            {
                  new: true
            }
      )

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  updatedProduct,
                  "product updated SuccessFully"
            ))
})

const deleteProduct = asyncHandler(async (req, res) => {
      const { productId } = req.params

      if (!isValidObjectId(productId)) {
            throw new ApiError(400, "invalid productID")
      }

      const product = await Product.findById(productId);

      if (!product) {
            throw new ApiError(400, "product not found")
      }

      if (product.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(400, "only owner can delete product")
      }

      await deleteInCloudinary(product.proImage.public_id);

      await multiDeleter(product.photos);

      await Review.deleteMany({ product: productId })

      await Product.findByIdAndDelete(productId);

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  {},
                  "product deleted SuccessFully"
            ))
})

const getProduct = asyncHandler(async (req, res) => {
      const { productId } = req.params;

      if (!isValidObjectId(productId)) {
            throw new ApiError(400, "invalid productID")
      }

      const product = await Product.findById(productId);

      if (!product) {
            throw new ApiError(500, "something went wrong on fetching product")
      }

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  product,
                  "product fetched SuccessFully"
            ))
})

const getAllProduct = asyncHandler(async (req, res) => {
      const { page = 1, limit = 10, category, brand, userId, query } = req.query

      const pipeline = [];

      if (userId) {
            if (!isValidObjectId(userId)) {
                  throw new ApiError(400, "Invalid userId");
            }
            pipeline.push({
                  $match: {
                        owner: new mongoose.Types.ObjectId(userId)
                  }
            })
      }

      if (query) {

      }

      if (category) {
            pipeline.push({
                  $match: {
                        category: category
                  }
            })
      }

      if (brand) {
            pipeline.push({
                  $match: {
                        brand: brand
                  }
            })
      }

      pipeline.push({
            $lookup: {
                  from: "users",
                  localField: "owner",
                  foreignField: "_id",
                  as: "owner"
            }
      }, {
            $addFields: {
                  owner: {
                        $first: "$owner"
                  }
            }
      }, {
            $project: {
                  owner: {
                        fullName: 1,
                        avatar: 1,
                        userName: 1
                  },
                  name:1,
                  brand:1,
                  category:1,
                  // description:1,
                  // price:1,
                  // photos:1,
                  // proImage:1,
                  // proCount:1
            }
      })

      const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
      }

      const filterproduct = await Product.aggregatePaginate(Product.aggregate(pipeline), options);

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  filterproduct,
                  "get All product Successfully"
            ))

})

export {
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      getAllProduct
}

