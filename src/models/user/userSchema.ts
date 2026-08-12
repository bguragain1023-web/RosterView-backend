import mongoose, {Document} from "mongoose";

 export interface IUser extends Document {
    name : string;
    email: string;
    password: string;
    role: "coordinator" | "worker"
}

const userSchema = new mongoose.Schema<IUser>(
    {
        name:{
            type:String,
            required: true
        },
        email:{
            type:String,
            required: true
        },
        password:{
            type:String,
            required: true
        },
        role:{
            type:String,
            required:true
        }
    },

 { timestamps: true },
)

export default  mongoose.model<IUser>("User", userSchema);