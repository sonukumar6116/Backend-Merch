import mongoose, { isValidObjectId, mongo } from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Review } from "../models/review.model.js";
import { multiDeleter, multiUploder } from "../utils/uploaders.js";

const addReview = asyncHandler(async (req, res) => {
      const { productId } = req.params;
      const { stars, content, title } = req.body;

      if (content.trim() === "" || title.trim() === "") {
            throw new ApiError(400, "all feild req")
      }

      if (!isValidObjectId(productId)) {
            throw new ApiError(400, "invalid productId")
      }

      const userReview = await Review.findOne({
            $and: [{ product: productId }, { owner: req.user?._id }]
      })

      if (userReview) {
            throw new ApiError(400, "already exists")
      }

      const uploadedphotos = await multiUploder(req.files.photos)

      const newReview = await Review.create({
            stars,
            title,
            content,
            photos: uploadedphotos,
            owner: req.user?._id,
            product: productId
      })

      if (!newReview) {
            throw new ApiError(500, "Something went wrong while creating review")
      }

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  newReview,
                  "review submitted successfully"
            ))

})

const deleteReview = asyncHandler(async (req, res) => {
      const { reviewId } = req.params

      if (!isValidObjectId(reviewId)) {
            throw new ApiError(400, "invalid reviewId")
      }

      const review = await Review.findById(reviewId);

      if (!review) {
            throw new ApiError(400, "review not found")
      }

      if (review?.owner?.toString() !== req.user?._id.toString()) {
            throw new ApiError(400, "only owner can delete review")
      }

      await multiDeleter(review.photos);

      await Review.findByIdAndDelete(reviewId);

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  {},
                  "review deleted successfully"
            ))
})

const updateReview = asyncHandler(async (req, res) => {
      const { reviewId } = req.params
      const { stars, content, title } = req.body;

      if (content.trim() === "" || title.trim() === "") {
            throw new ApiError(400, "all feild req")
      }

      if (!isValidObjectId(reviewId)) {
            throw new ApiError(400, "invalid reviewId")
      }

      const review = await Review.findById(reviewId);

      if (!review) {
            throw new ApiError(400, "review not found")
      }

      if (review?.owner?.toString() !== req.user?._id.toString()) {
            throw new ApiError(400, "only owner can update review")
      }

      const updatedReview = await Review.findByIdAndUpdate(
            review._id,
            {
                  $set: {
                        stars,
                        title,
                        content
                  }
            },
            {
                  new: true
            }
      )

      if (!updatedReview) {
            throw new ApiError(500, "went wrong while updating review")
      }

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  updateReview,
                  "review updated successfully"
            ))
})

const getUserReviews = asyncHandler(async (req, res) => {

      const userId = new mongoose.Types.ObjectId(req.user?._id);

      const userReviews = await Review.aggregate([
            {
                  $match: {
                        owner: userId
                  }
            },
            {
                  $lookup: {
                        from: "products",
                        localField: "product",
                        foreignField: "_id",
                        as: "product"
                  }
            },
            {
                  $addFields: {
                        product: {
                              $first: "$product"
                        }
                  }
            },
            {
                  $sort: {
                        createdAt: -1
                  }
            },
            {
                  $project: {
                        title: 1,
                        content: 1,
                        stars: 1,
                        photos: 1,
                        product:1
                  }
            }
      ])

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  userReviews,
                  "all reviews fetched successfully"
            ))
})

const getProductReviews = asyncHandler(async (req, res) => {
      const { productId } = req.params;
      const userId = new mongoose.Types.ObjectId(req?.user?._id)

      const productreviews = await Review.aggregate([
            {
                  $match: {
                        product: new mongoose.Types.ObjectId(productId)
                  }
            },
            {
                  $addFields: {
                        isMineReview: {
                              $cond: {
                                    if: { $eq: ["$owner", req.user._id] },
                                    then: true,
                                    else: false
                              }
                        }
                  }
            },
            {
                  $project: {
                        isMineReview: 1,
                        title: 1,
                        content: 1,
                        stars: 1,
                  }
            }
      ])

      const starsGraph = await Review.aggregate([
            {
                  $match: {
                        product: new mongoose.Types.ObjectId(productId)
                  }
            },
            {
                  $group: {
                        _id: "$stars",
                        Count: {
                              $sum: 1
                        }
                  }
            },
            {
                  $sort: {
                        _id: -1
                  }
            }
      ])

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  { productreviews, starsGraph },
                  "review submitted successfully"
            ))
})

export {
      addReview,
      deleteReview,
      updateReview,
      getUserReviews,
      getProductReviews
}
