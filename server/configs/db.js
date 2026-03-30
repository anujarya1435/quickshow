import mongoose from "mongoose";

let isConnected =false;

const connectdb = async () => {
  if (isConnected) {
    return; // ✅ already connected
  }

  try {
    const db = await mongoose.connect(`${process.env.MONGO_URI}/quickshow`);

    isConnected = db.connections[0].readyState;
    console.log("✅ Database connected");

  } catch (err) {
    console.log("❌ DB Error:", err);
  }
};

export default connectdb;