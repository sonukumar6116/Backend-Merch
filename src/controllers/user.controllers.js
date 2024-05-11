import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteInCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
      const user = await User.findById(userId);
      const refreshToken = user.generateRefreshToken();
      const accessToken = user.generateAccessToken();
      user.refreshToken = refreshToken;
      //for only update in refreshtoken , not all feilds in user
      await user.save({ validateBeforeSave: false });
      return { refreshToken, accessToken };
}

const options = {
      httpOnly: true,
}

const registerUser = asyncHandler(async (req, res) => {
      try {
            const { userName, fullName, phoneNo, password } = req.body;

            if ([userName, phoneNo, password].some(feild => {
                  return feild.trim() === "";
            })) {
                  throw new ApiError(400, "need all feild")
            }

            const existeduser = await User.findOne({ phoneNo });

            // console.log("existeduser",existeduser);

            if (existeduser) {
                  throw new ApiError(400, "user already existed")
            }

            const avatarLocalPath = req.file?.path;

            // console.log(avatarLocalPath);

            if (!avatarLocalPath) {
                  throw new ApiError(400, "avattar path not found")
            }

            const avatar = await uploadOnCloudinary(avatarLocalPath);

            // console.log("avatar--->",avatar);

            if (!avatar.url) {
                  throw new ApiError(400, "failed on upload clodinary")
            }

            const user = await User.create({
                  userName,
                  fullName,
                  password,
                  phoneNo,
                  avatar: {
                        public_id: avatar.public_id,
                        url: avatar.secure_url
                  },
            })

            const createdUser = await User.findById(user._id).select("-password -phoneNo -email")

            if (!createdUser) {
                  throw new ApiError(500, "something went during registering user")
            }

            return res
                  .status(200)
                  .json(
                        new ApiResponce(
                              200,
                              createdUser,
                              "user Created Successfully"
                        ))

      } catch (error) {
            throw new ApiError(400, "error during registration")
      }
})

const loginUser = asyncHandler(async (req, res) => {
      const { phoneNo, password } = req.body

      if (!phoneNo || !password) {
            throw new ApiError(400, "all credential req")
      }

      const user = await User.findOne({ phoneNo });
      // console.log("user---->", user);
      if (!user) {
            throw new ApiError(400, "wrong credentials")
      }

      const isCorrect = await user.isPasswordCorrect(password);
      // console.log("isCorrect---->", isCorrect);
      if (!isCorrect) {
            throw new ApiError(400, "Wrong credentials")
      }

      const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id)

      const tokenUser = await User.findById(user._id);
      // console.log("tokenUser---->", tokenUser);

      return res.
            status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponce(
                  200,
                  {tokenUser,accessToken},
                  "User login SuccessFully"
            ))
})

const logoutUser = asyncHandler(async (req, res) => {
      const user =  await User.findByIdAndUpdate(
            req.user._id,
            {
                  $unset: {
                        refreshToken: 1
                  }
            }, {
            new: true
      })

      return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponce(200, user, "Logged Out SuccessFully"))
})

const updateUserProfile = asyncHandler(async (req, res) => {
      const { userName, fullName } = req.body;

      if (!userName && !fullName) {
            throw new ApiError(400, "all credential need")
      }

      const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                  $set: {
                        userName,
                        fullName
                  }
            }, {
            new: true
      })

      if (!updatedUser) {
            throw new ApiError(500, "something wrong during updating user")
      }

      return res
            .status(200)
            .json(new ApiResponce(
                  200,
                  updatedUser,
                  "profile updated successfully"
            ))
})

const updateUserPassword = asyncHandler(async (req, res) => {
      const { oldpassword, newpassword } = req.body;

      // if (!password && !oldpassword) {
      //       throw new ApiError(400,"all credentials req ")
      // }

      const user = await User.findById(req.user?._id);

      const isCorrect = await user.isPasswordCorrect(oldpassword);
      if (!isCorrect) {
            throw new ApiError(400,"password is incorrect ")
      }

      // const updateduser = await User.findByIdAndUpdate(
      //       req.user?._id,
      //       {
      //             $set: {
      //                   password: newpassword
      //             }
      //       }, { new: true })

      user.password = newpassword;
      await user.save({validateBeforeSave:true})

      if (!user) {
            throw new ApiError(500,"something wnt wrong during upgrading password")
      }

      return res
            .status(200)
            .json(new ApiResponce(
                  200,
                  user,
                  "Password updated SucsessFully"
            ))

})

const updateUserAvatar = asyncHandler(async (req, res) => {
      const localfilepath = req.file?.path;

      if (!localfilepath) {
            throw new ApiError(400,"file not found")
      }

      const avatar = await uploadOnCloudinary(localfilepath);

      if (!avatar) {
            throw new ApiError(400,"error during uploaded on cloudinary")
      }

      const toBeDeleteAvatar = await User.findById(req.user._id).select("avatar")

      const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                  $set: {
                        avatar: {
                              public_id: avatar.public_id,
                              url: avatar.secure_url
                        }
                  }
            }, { new: true });


      if (updatedUser.avatar.public_id && toBeDeleteAvatar) {
            await deleteInCloudinary(toBeDeleteAvatar.public_id)
      }

      return res.status(200)
            .json(new ApiResponce(200,
                  updatedUser,
                  "Avatar updated SuccessFully"
            ))

})

const getUserProfile = asyncHandler(async (req, res) => {
      return res
            .status(200)
            .json(new ApiResponce(
                  200,
                  req.user,
                  "User fetched SuccessFully"
            ))
})

export {
      registerUser,
      loginUser,
      logoutUser,
      updateUserProfile,
      updateUserPassword,
      updateUserAvatar,
      getUserProfile
}