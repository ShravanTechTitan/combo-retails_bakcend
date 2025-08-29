import mongoose from "mongoose";

let isConnected = null; // cache the connection across function calls

const connectDB = async () => {
  if (isConnected) {
    return; // already connected
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection failed ❌", err);
    throw err;
  }
};

export default connectDB;
