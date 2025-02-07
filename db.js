import mongoose from "mongoose";


export default async function connectDB() {
    try {
        let conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
    }
}