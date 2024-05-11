import { isValidObjectId } from "mongoose";
import { Address } from "../models/address.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addAddress = asyncHandler(async (req, res) => {
      const { ownername, address, state, pincode, district, contury } = req.body;

      if ([ownername, address, state, district, pincode]
            .some(field => field.trim() === "")) {
            throw new ApiError(400, "all feilds req in address")
      }

      const userAddress = await Address.create({
            ownername,
            address,
            state,
            pincode,
            district,
            contury,
            owner: req.user?._id
      })

      if (!userAddress) {
            throw new ApiError(500, "went wrong during adding address")
      }

      return res
            .status(200)
            .json(new ApiResponce(
                  200,
                  userAddress,
                  "new address added successfully"
            ))
})

const updateAddress = asyncHandler(async (req, res) => {
      const { addressId } = req.params;
      const { ownername, address, state, pincode, district, contury } = req.body;

      if ([ownername, address, state, district, pincode]
            .some(field => field.trim() === "")) {
            throw new ApiError(400, "all feilds req in address")
      }

      if (!isValidObjectId(addressId)) {
            throw new ApiError(400, "unvalid addressId")
      }

      const userAddress = await Address.findById(addressId)

      if (!userAddress) {
            throw new ApiError(400, "address not found")
      }

      if (userAddress?.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(400, "only owner can uppdate thier address");
      }

      const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            {
                  $set: {
                        ownername,
                        address,
                        state,
                        pincode,
                        district,
                        contury
                  }
            }, { new: true }
      )

      if (!updatedAddress) {
            throw new ApiError(500, "went wrong during updating address")
      }

      return res
            .status(200)
            .json(new ApiResponce(
                  200,
                  updatedAddress,
                  "address updated successfully"
            ))
})

const deleteAddress = asyncHandler(async (req, res) => {
      const { addressId } = req.params

      if (!isValidObjectId(addressId)) {
            throw new ApiError(400, "unvalid addressId")
      }

      const userAddress = await Address.findById(addressId)

      if (!userAddress) {
            throw new ApiError(400, "address not found")
      }

      if (userAddress?.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(400, "only owner can delete thier address");
      }

      await Address.findByIdAndDelete(addressId);

      return res
            .status(200)
            .json(new ApiResponce(
                  200,
                  {},
                  "address deleted successfully"
            ))
})

const getUserAddress = asyncHandler(async(req,res)=>{

      const userAddresses = await Address.find({owner:req.user?._id});

      if(!userAddresses){
            throw new ApiError(400,"something went wrong while fething address");
      }

      return res
      .status(200)
      .json(new ApiResponce(
            200,
            userAddresses,
            "address fetced successfully"
      ))
})

export {
      addAddress,
      updateAddress,
      deleteAddress,
      getUserAddress
}