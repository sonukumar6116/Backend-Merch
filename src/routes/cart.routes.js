import Router from 'express'
import { verifyJwt } from '../middlewares/authenticate.middleware.js';
import {
      addInCart,
      decrementInCart,
      getUserCart,
      incrementCartItem,
      removeInCart
} from '../controllers/cart.controllers.js';

const router = Router();
router.use(verifyJwt);

router.route("/addincart/:productId").post(addInCart)
router.route("/decrementincart/:productId").put(decrementInCart)
router.route("/incrementincart/:productId").put(incrementCartItem)
router.route("/removeincart/:productId").delete(removeInCart);
router.route("/getcart").get(getUserCart);

export default router;