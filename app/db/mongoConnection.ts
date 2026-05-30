import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const getMongoUri = () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing.");
  }

  return mongoUri;
};

const dbConnect = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }

    await mongoose.connect(getMongoUri(), {
      bufferCommands: false,
    });

    return true;
  } catch {
    return false;
  }
};

export default dbConnect;
