import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localfilepath) => {
      try {
            if(!localfilepath){
                  return null;
            }
            const responce = await cloudinary.uploader.upload(localfilepath,{
                  resource_type:"auto"
            });
            fs.unlinkSync(localfilepath);
            return responce
      } catch (error) {
            fs.unlinkSync(localfilepath);
            console.log("not upload on cloudinary")
            return null;
      }
}

const deleteInCloudinary = async (public_id) => {
      try {
            if(!public_id){
                  return null;
            }
            await cloudinary.uploader.destroy(public_id,{
                  resource_type:"auto"
            }); 
      } catch (error) {
            return null;
      }
}

export {
      uploadOnCloudinary,
      deleteInCloudinary
}