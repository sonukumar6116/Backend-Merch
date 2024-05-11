import mongoose, { isValidObjectId } from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/order.model.js";

const addOrder = asyncHandler(async (req, res) => {
      const { productId, addressId, itemCount, phoneNo } = req.body;

      if (!isValidObjectId(productId) || !isValidObjectId(addressId)) {
            throw new ApiError(400, "invalid Id")
      }

      const userOrder = await Order.create({
            owner: req.user?._id,
            product: productId,
            itemCount,
            address: addressId,
            phoneNo
      })

      if (!userOrder) {
            throw new ApiError(500, "wrong during order creation")
      }

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  userOrder,
                  "order created successfully"
            ))
})

const getUserOrder = asyncHandler(async (req, res) => {

      const userId = new mongoose.Types.ObjectId(req.user?._id)

      const userOrders = await Order.aggregate([
            {
                  $match: {
                        $and: [{ owner: userId }, { isRecieved: false }]
                  }
            },
            {
                  $lookup: {
                        from: "products",
                        localField: "product",
                        foreignField: "_id",
                        as: "userOrderProduct",
                  }
            },
            {
                  $lookup: {
                        from: "addresses",
                        localField: "address",
                        foreignField: "_id",
                        as: "orderaddress",
                  }
            },
            {
                  $addFields: {
                        address: {
                              $first: "$orderaddress"
                        },
                        product: {
                              $first: "$userOrderProduct"
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
                        itemCount: 1,
                        address: 1,
                        product: 1,
                        createdAt: 1,
                        phoneNo: 1
                  }
            }
      ])

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  userOrders,
                  "user orders fetched successfully"
            ))
})

const getUserRecievedOrders = asyncHandler(async (req, res) => {

      const userId = new mongoose.Types.ObjectId(req.user?._id);

      const receivedOrders = await Order.aggregate([
            {
                  $match: {
                        $and: [{ owner: userId }, { isRecieved: true }]
                  }
            },
            {
                  $lookup: {
                        from: "products",
                        localField: "product",
                        foreignField: "_id",
                        as: "userOrderProduct",
                  }
            },
            {
                  $lookup: {
                        from: "addresses",
                        localField: "address",
                        foreignField: "_id",
                        as: "orderaddress",
                  }
            },
            {
                  $addFields: {
                        address: {
                              $first: "$orderaddress"
                        }
                        , product: {
                              $first: "$userOrderProduct"
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
                        itemCount: 1,
                        address: 1,
                        product: 1,
                        createdAt: 1,
                        phoneNo: 1
                  }
            }
      ])

      return res.status(200)
            .json(new ApiResponce(
                  200,
                  receivedOrders,
                  "received order fetched successfully"
            ))
})

const deleteOrder = asyncHandler(async (req, res) => {

})

export {
      addOrder,
      getUserOrder,
      deleteOrder,
      getUserRecievedOrders
}