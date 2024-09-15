import mongoose from "mongoose";

const url = process.env.mongo_URI;

export const connectDB = async () => {
  try {
    console.log("db connecting...");
    const res = await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`mongodb connected with server ${res.connection.host}`);
  } catch (error) {
    console.log("mongodb connection failed!");
    console.log(error);
  }
};
