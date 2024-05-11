import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
      fullName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
      },
      userName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
      },
      email: {
            type: String,
      },
      phoneNo: {
            type: String,
            required: true,
      },
      password: {
            type: String,
            required: true,
      },
      refreshToken: {
            type: String,
            default: "",
      },
      avatar: {
            type: {
                  public_id: String,
                  url: String
            },
            required: true
      }
}, { timestamps: true })

// use for bcrypt the pass before saving in DB
userSchema.pre("save", async function (next) {
      if (!this.isModified('password'))
            return next();

      this.password = await bcrypt.hash(this.password, 10);
      next();
})

userSchema.methods.generateRefreshToken = function () {
      return jwt.sign(
            {
                  _id: this._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                  expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
      )
}

userSchema.methods.generateAccessToken = function () {
      return jwt.sign(
            {
                  _id: this._id
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                  expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
      )
}

userSchema.methods.isPasswordCorrect = async function (password) {
      return await bcrypt.compare(password, this.password);
}


export const User = mongoose.model("User", userSchema);