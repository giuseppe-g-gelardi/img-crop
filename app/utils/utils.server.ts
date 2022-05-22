import cloudinary from "cloudinary";
import { writeAsyncIterableToWritable } from "@remix-run/node";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

async function uploadImage(data: AsyncIterable<Uint8Array>) { // AsyncIterable<Uint8Array>
  const uploadPromise = new Promise(async (resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream({ 
      folder: "randy-demo", 
    },
      (error, result) => {
        if (error) { 
          reject(error); return; 
        } resolve(result);
      }); 
      await writeAsyncIterableToWritable(data, uploadStream);
  });

  return uploadPromise as Promise<{ secure_url: string }>
}

// console.log("configs", cloudinary.v2.config());
export { uploadImage };
