import mongoose,{Schema} from "mongoose";

const tokenSchema = new Schema({
    _id :{type:mongoose.Types.ObjectId,ref:'user',required:true},
    token:{type:String,required:true},
    token_expire:{type:Date,default:Date.now}
})

tokenSchema.index({token_expire:1},{expireAfterSeconds:60})
export default mongoose.model('token',tokenSchema)