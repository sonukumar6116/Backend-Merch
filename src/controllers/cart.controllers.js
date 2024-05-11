import mongoose, { isValidObjectId } from "mongoose";
import { Cart } from "../models/cart.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import { Product } from "../models/product.model.js";

const addInCart = asyncHandler(async (req, res) => {
      const { productId } = req.params;

      if (!isValidObjectId(productId)) {
            throw new ApiError(400, "invalid id");
      }

      const cartItem = await Cart.findOne({
            $and: [{ product: productId }, { owner: req.user?._id }]
      })

      if (cartItem) {
            const product = await Product.findById(productId);
            if (!product) {
                  throw new ApiError(400, "product not found")
            }

            if (product.proCount === cartItem.count) {
                  throw new ApiError(400, "no more addition stock is full")
            }

            cartItem.count = cartItem.count + 1;
            await cartItem.save({ validateBeforeSave: false });

            return res.status(200)
                  .json(new ApiResponce(
                        200,
                        cartItem,
                        "incremet in cart successfully"
                  ))
      }

      const newCart = await Cart.create({
            owner: req.user._id,
            product: productId,
            count: 1
      })

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  newCart,
                  "new product added cart successfully"
            ))

})

const decrementInCart = asyncHandler(async (req, res) => {
      const { productId } = req.params;

      if (!isValidObjectId(productId)) {
            throw new ApiError(400, "invalid id");
      }

      const cartItem = await Cart.findOne({
            $and: [{ product: productId }, { owner: req.user?._id }]
      })

      if (!cartItem) {
            throw new ApiError(400, "Item not found");
      }

      cartItem.count = cartItem.count - 1;
      await cartItem.save({ validateBeforeSave: false });

      if (cartItem.count === 0) {
            await Cart.findByIdAndDelete(cartItem._id)
      }

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  cartItem || {},
                  "remove product in cart successfully"
            ))
})

const incrementCartItem = asyncHandler(async (req, res) => {
      const { productId } = req.params;

      if (!isValidObjectId(productId)) {
            throw new ApiError(400, "invalid product id")
      }

      const cartItem = await Cart.findOne({
            $and: [{ product: productId }, { owner: req.user?._id }]
      })

      if (!cartItem) {
            throw new ApiError(400, "cartItem not found")
      }

      const product = await Product.findById(productId);

      if (!product) {
            throw new ApiError(400, "product not found")
      }

      if (product.proCount === cartItem.count) {
            throw new ApiError(400, "no more addition stock is full")
      }

      cartItem.count = cartItem.count + 1;
      await cartItem.save({ validateBeforeSave: false })

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  cartItem || {},
                  "product increated in cart successfully"
            ))
})

const getUserCart = asyncHandler(async (req, res) => {

      const userCartItems = await Cart.aggregate([
            {
                  $match: {
                        owner: new mongoose.Types.ObjectId(req.user._id)
                  }
            },
            {
                  $lookup: {
                        from: "products",
                        localField: "product",
                        foreignField: "_id",
                        as: "cartItems"
                  }
            },
            {
                  $sort: {
                        createdAt: -1
                  }
            },
            {
                  $project: {
                        _id: 1,
                        cartItems: {
                              name: 1,
                              brand: 1,
                              category: 1,
                              description: 1,
                              price: 1,
                              proImage: 1,
                              owner: 1
                        },
                        count:1,
                        createdAt: 1
                  }
            }
      ])

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  userCartItems,
                  "cart fetched successfully"
            ))
})

const removeInCart = asyncHandler(async (req, res) => {
      const {productId} = req.params

      if(!isValidObjectId(productId)){
            throw new ApiError(400, "invalid product id")
      }

      const cartItem = await Cart.findOne({
            $and:[{owner:req.user?._id},{product:productId}]
      })

      if(!cartItem){
            throw new ApiError(400, "cartItem not found")
      }

      await Cart.findByIdAndDelete(cartItem._id);

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  {},
                  "cart product deleted successfully"
            ))
})

export {
      addInCart,
      decrementInCart,
      incrementCartItem,
      getUserCart,
      removeInCart
}