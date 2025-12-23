import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
//This adds pagination support to MongoDB aggregation pipelines for the videoSchema


const videoSchema=new Schema(
    {
        videoFile:{
            type:String, //cloudnary
            required:true,

        },
        thumbnil:{
            type:String, //cloudnary
            required:true,
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        duration:{
            type:String,
            required:true,
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }


    },
     {timestamps:true})


     

export const Video=mongoose.mode("Video",videoSchema)