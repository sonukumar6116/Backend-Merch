import { Router } from "express";
import { verifyJwt } from "../middlewares/authenticate.middleware.js";
import {
      addAddress,
      deleteAddress,
      getUserAddress,
      updateAddress
} from "../controllers/address.controllers.js";

const router = Router();

router.use(verifyJwt);

router.route("/addaddress").post(addAddress);
router.route("/updateaddress/:addressId").post(updateAddress);
router.route("/deleteaddress/:addressId").delete(deleteAddress);
router.route("/getaddress").get(getUserAddress);

export default router;