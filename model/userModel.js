import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    email:{type:String,required :true},
    password: {type:String ,required:true},
    isVerified :{type:Boolean,default:false}
})

export default mongoose.model('user',userSchema)