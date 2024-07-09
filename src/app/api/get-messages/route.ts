import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";
import { log } from "console";

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "You must be Authenticated to get messages"
            },
            { status: 401 }
        );
    }

    //it is important to get user id in this manner as in aggregation pipeline we need userID 
    //as mongodb object id and not as string, so keep in mind whenever dealing with userid as string
    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: "$messages" },
            { $sort: { "messages.createdAt": -1 } },
            { $group: { _id: "$_id", messages: { $push: "$messages" } } }
        ]).exec();

        console.log(user)

        if (!user || user.length === 0) {
            console.log("idhar hu")
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 401 }
            );
        }

        return Response.json(
            {
                success: true,
                messages: user[0].messages
            },
            { status: 200 }
        );
    } catch (error) {
        console.log("Failed to get messages");
        return Response.json(
            {
                success: false,
                message: "Failed to get messages"
            },
            { status: 500 }
        );
    }
}