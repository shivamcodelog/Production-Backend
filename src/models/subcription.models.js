import mongoose,{Schema} from "mongoose";

const subscriptionSchema=new mongoose.Schema(
    {
        subscriber:{
            types:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        channel:{
            types:mongoose.Schema.Types.ObjectId,
            ref:"User"           
        }
    },
    {timestamps:true})

 export const Suscription=mongoose.model("Suscription",subscriptionSchema)