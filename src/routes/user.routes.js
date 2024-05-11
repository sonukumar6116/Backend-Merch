import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/authenticate.middleware.js";

import {
      getUserProfile,
      loginUser,
      logoutUser,
      registerUser,
      updateUserAvatar,
      updateUserPassword,
      updateUserProfile
} from "../controllers/user.controllers.js";


const router = Router();

router.route("/register").post(
      upload.single("avatar"),
      registerUser
);

router.route("/login").post(loginUser);

// secured Routes
router.route("/logout").post(
      verifyJwt,
      logoutUser
)

router.route("/updateprofile").post(
      verifyJwt,
      updateUserProfile
)

router.route("/updatepassword").patch(
      verifyJwt,
      updateUserPassword
)

router.route("/updateavatar").patch(
      verifyJwt,
      upload.single("avatar"),
      updateUserAvatar
)

router.route("/getprofile").get(
      verifyJwt,
      getUserProfile
)

export default router





