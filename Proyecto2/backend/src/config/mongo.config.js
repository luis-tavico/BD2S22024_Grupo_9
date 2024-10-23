import mongoose from "mongoose";
const mongoURI = "mongodb://localhost:27017/biblioteca";

const DBConnect = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to database");
    } catch (error) {
        console.log("Error connecting to database");
    }
}

export default DBConnect;