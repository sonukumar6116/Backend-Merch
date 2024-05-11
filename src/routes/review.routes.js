import { Router } from "express";
import { verifyJwt } from "../middlewares/authenticate.middleware.js";
import {
      addReview,
      deleteReview,
      getProductReviews,
      getUserReviews,
      updateReview
} from "../controllers/review.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJwt);

router.route("/addreview/:productId").post(
      upload.fields([
            {
                  name: "photos",
                  maxCount: 3
            }
      ]),
      addReview
)


router.route("/deletereview/:reviewId").delete(deleteReview)
router.route("/updatereview/:reviewId").patch(updateReview)
router.route("/getproductreview/:productId").get(getProductReviews)
router.route("/getuserreview").get(getUserReviews)


export default router;