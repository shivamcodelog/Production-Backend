import {asyncHandler} from "../utils/asyncHandler.js"

import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadCloudnary} from "../utils/cloudnary.js"
import {apiResponse} from "../utils/apiResponse.js"
const registerUser=asyncHandler(async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exist : username ,email
    // check for images , check for Avatar
    // upload them to cloudnary , Avatar
    // create user object - create entry in DB
    // remove password and refreah token field from response
    // create for user creation 
    // return response

    const {fullname,email,username,password }=req.body
    // console.log("email:",email )
    // console.log("password:",password )

    // if (fullname===""){
    //     throw new apiError(400,"fullname is required ")
    // }

    // OR

    if (
        [fullname,email,username,password].some((field)=>field?.trim()=="")
    ){
        throw new apiError(400,"All fields are required")
    }

    const exitedUser =await User.findOne({
        $or:[{username}, {email}]
    })

    if (exitedUser){
        throw new apiError(409,"User with email or username already exist ")
    }

    // console.log(req.files)
    
     
    //?--> optional
    const avatarLoacalPath=req.files?.avatar[0]?.path;
    // const coverImagePath=req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght >0){
        coverImageLocalPath=req.files.coverImage[0].path 
    }

    if (!avatarLoacalPath){
        throw new apiError(400,"Avatar file is Required")
    }

   const avatar= await uploadCloudnary(avatarLoacalPath)
   const coverImage=await uploadCloudnary(coverImageLocalPath)

   if(!avatar){
    throw new apiError(400,"Avatar file is Required")
   }

   const user =await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "" ,
    email,
    password,
    username:username.toLowerCase()
   })

   const createdUser=await User.findById(user._id).select("-password -refreshToken")

   /* .select() controls which fields are included or excluded in the result.

   1.Prefix with - → exclude
   2.Prefix without - → include */

   if(!createdUser){
    throw new apiError(500,"Something went Wrog while registering the user")
   }

   return res.status(201).json(
    new apiResponse(200,createdUser,"User registered successfully !")
   )
})




export {registerUser}