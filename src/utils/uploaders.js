import {
      deleteInCloudinary,
      uploadOnCloudinary
} from "./cloudinary.js";

const multiUploder = async (photos) => {
      const uploadedphotos = []
      for (const file of photos) {
            const responce = await uploadOnCloudinary(file?.path);
            if (responce) {
                  uploadedphotos.push({
                        public_id: responce.public_id,
                        url: responce.secure_url
                  })
            }
      }
      return uploadedphotos
}

const multiDeleter = async (photos) => {
      for (const file of photos) {
            await deleteInCloudinary(file?.public_id)
      }
}

export {
      multiUploder,
      multiDeleter
};