 import { v2 as cloudinary } from 'cloudinary';
 import fs from "fs";
 import dotenv from "dotenv";


 dotenv.config();


 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
  
 

 const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload the file
        console.log(localFilePath)
        const response = await cloudinary.uploader.upload(localFilePath)
        console.log("SUCCESS: File uploaded on Cloudinary", response.url);
        fs.unlinkSync(localFilePath) 

        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) 
        console.log("uploadOnCloudinary failed");
        
        return null;
        //remove the locally saved temp file as the upload operation failed
    }
 }

 export {uploadOnCloudinary}
    