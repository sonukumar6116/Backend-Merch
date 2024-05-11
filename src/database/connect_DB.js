import mongoose from "mongoose";

const connectDb = async () => {
      try {
            await mongoose.connect(`${process.env.MONGO_DB_URL}/onlinestore`)
      } catch (error) {
            console.error("ERROR on Connecting DB --->", error);
            process.exit(1);
      }
}

export default connectDb;

