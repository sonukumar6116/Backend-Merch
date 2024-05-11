import { Router } from "express";
import { verifyJwt } from "../middlewares/authenticate.middleware.js";
import {
      addOrder,
      getUserOrder,
      getUserRecievedOrders
} from "../controllers/order.controllers.js";

const router = Router();

router.use(verifyJwt);

router.route("/addorder").post(addOrder);
router.route("/getuserorder").get(getUserOrder);
router.route("/getuserreceivedorder").get(getUserRecievedOrders);


export default router