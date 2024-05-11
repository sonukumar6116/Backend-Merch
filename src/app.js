import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js"
import addressRouter from "./routes/address.routes.js"
import productRouter from "./routes/product.routes.js"
import cartRouter from "./routes/cart.routes.js"
import reviewRouter from "./routes/review.routes.js"
import orderRouter from "./routes/order.routes.js"

const app = express();

app.use(cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/users",userRouter);
app.use("/api/v1/address",addressRouter);
app.use("/api/v1/product",productRouter);
app.use("/api/v1/cart",cartRouter);
app.use("/api/v1/review",reviewRouter);
app.use("/api/v1/order",orderRouter);


export { app };