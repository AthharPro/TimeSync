import mongoose from "mongoose"
import { MONGO_URI } from "../constants/env";

const connectDB=async ()=>{
    try {
        await mongoose.connect(MONGO_URI);
    } catch (error) {
        process.exit(1); 
    }
}
export default connectDB;

