import User from "@/app/db/models/User";
import dbConnect from "@/app/db/mongoConnection";
import { auth } from "@/app/utils/auth/auth";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface IUSer {
  id: mongoose.Types.ObjectId;
  email: string;
  image: string;
  name: string;
  role: string;
}

export const GET = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.redirect("/login");
    await dbConnect();
    const userInfo: IUSer = await User.findById({
      _id: session.user.id,
    }).lean();
    return NextResponse.json(userInfo, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};
 
// update user info
export const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const session = await auth();
    if (!session?.user?.id) return NextResponse.redirect("/login");
    await dbConnect();
    const userInfo = await User.findByIdAndUpdate(
      { _id: session.user.id },
      body,
      { new: true, runValidators: true },
    );
    return NextResponse.json(userInfo, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};
