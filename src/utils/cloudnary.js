import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



cloudinary.config({ 
    cloud_name:process.env.CLOUDNARY_CLOUD_NAME, 
    api_key: process.env.CLOUDNARY_API_KEY, 
    api_secret:process.env.CLOUDNARY_API_SECRET
});


const uploadCloudnary=async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        //upload the file on cloudnary
        const response=await cloudinary.uploader.upload(localFilePath,
            {
                resource_type:"auto"
            })
            //file has been uploaded successfully
            // console.log("file is on cloudinary",response.url);
            fs.unlinkSync(localFilePath)
            return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporeary file as the upload failed
        return null;
        
    }
}

export {uploadCloudnary}