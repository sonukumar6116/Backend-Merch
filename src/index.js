import dotenv from "dotenv";
import connectDb from "./database/connect_DB.js";
import { app } from "./app.js";

dotenv.config({
      path:'./.env'
})

connectDb()
.then(()=>{
      app.listen(process.env.PORT  , ()=>{
            console.log(`server running on port ${process.env.PORT}`);
      })
})
.catch(err=>{
      console.log("DB connecction fail " ,err);
})