import User from "@/app/db/models/User";
import dbConnect from "@/app/db/mongoConnection";

export const checkExists = async (email: string) => {
  try {
    await dbConnect();
    const user = await User.findOne({ email }).lean();
    if (!user) return false;
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
