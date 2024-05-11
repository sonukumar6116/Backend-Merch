import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/authenticate.middleware.js";
import {
      addProduct,
      deleteProduct,
      getAllProduct,
      getProduct,
      updateProduct
} from "../controllers/product.controllers.js";

const router = Router();

router.use(verifyJwt);

router.route("/addproduct").post(
      upload.fields(
            [
                  {
                        name: "proImage",
                        maxCount: 1
                  }, {
                        name: "photos",
                        maxCount: 5
                  }
            ]
      ),
      addProduct
)

router.route("/updateproduct/:productId").post(updateProduct);
router.route("/deleteproduct/:productId").delete(deleteProduct);
router.route("/getproduct/:productId").get(getProduct)
router.route("/getallproduct").get(getAllProduct);

export default router