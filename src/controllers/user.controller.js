import {asyncHandler} from "../utils/asyncHandler.js"

import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadCloudnary} from "../utils/cloudnary.js"
import {apiResponse} from "../utils/apiResponse.js"

import jwt  from "jsonwebtoken"


const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)

          if (!user) {
            throw new apiError(404, "User not found")
          }

        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
         
        
    } catch (error) {
        console.log("Error:",error)
        throw new apiError(500,"Something went wrong while generating refresh and access token")
        
    }
}

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
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
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
    throw new apiError(500,"Something went Wrong while registering the user")
   }

   return res.status(201).json(
    new apiResponse(200,createdUser,"User registered successfully !")
   )
})

// -->Login Functionality

const loginUser= asyncHandler(async(req,res)=>{
    //req body -->data
    // username or email
    // find the user
    // access and refresh token
    // send cookie

    const {email,username,password}=req.body
    if(!(username || email)){
        throw new apiError(400,"username or email is required")
    }
    
    // $or --> find username OR email

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new apiError(404," User doesn't exist")
    }

    const isPasswordValid =await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)



    const loggedInUser= await User.findById(user._id).
    select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in successfully"
        )
    )

})

// --->Logout Functionality

const logoutUser=asyncHandler(async(req,res)=>{
     await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
            
        },
        {
                new:true
        }
     )
        const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"User logged Out"))
})


// --> Refreshing Access Token

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken 

    if(!incomingRefreshToken){
        throw new apiError(401,"Unathourized Request")
    }

    try {
        const decodedToken=jwt.verify(incomingRefreshToken.process.env.REFRESH_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id)
    
        if(!user){
            throw new apiError(401,"Invalid Refresh Token")
        }
    
        if (incomingRefreshToken!==user?.refreshToken){
            throw new apiError(401,"Refresh token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
        
    
        const {accessToken, newRefreshToken}=await generateAccessAndRefreshToken(user._id)
        
        return res
        .status(200)
        .cookies("accessToken",accessToken,options)
        .cookies("newRefreshToken",refreshToken,options)
        .json(
            new apiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access Token refreshed successfully"
            )
        )
    } catch (error) {
        throw new apiError(401,error?.message || "Invalid Refresh token") 
        
    }

})



export {registerUser,loginUser,logoutUser,refreshAccessToken }