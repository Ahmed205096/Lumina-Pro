import Email from "@/app/db/models/Email";
import dbConnect from "@/app/db/mongoConnection";
import { NextRequest, NextResponse } from "next/server";

// GET: set all invetaions for the inviter
export const GET = async () => {
  try {
    await dbConnect();
    const email = await Email.find({ active: true }).lean();
    return NextResponse.json(email, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    await dbConnect();
    const { email } = await request.json();
    const updatedEmail = await Email.findOneAndUpdate(
      { to: email },
      { $set: { active: false } },
      { new: true, runValidators: true },
    ).lean();
    return NextResponse.json({ success: true, updatedEmail });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
};
