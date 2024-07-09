import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "You must be Authenticated to accept messages"
            },
            { status: 401 }
        );
    }

    const userId = user._id;
    console.log("got post request for ", userId);
    const {acceptMessages} = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {isAcceptingMessage: acceptMessages}, {new: true});
        if(!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Failed to change the message accpetance status",
                    updatedUser
                },
                { status: 401 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Message accpetance status changed successfully"
            },
            { status: 200 }
        );

    } catch (error) {
        console.log("Failed to change the message accpetance status");
        return Response.json(
            {
                success: false,
                message: "Failed to change the message accpetance status"
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "You must be Authenticated to accept messages"
            },
            { status: 401 }
        );
    }

    const userId = user._id;

    try {
        const user = await UserModel.findById(userId);
        if(!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "User found",
                isAcceptingMessages: user.isAcceptingMessage
            },
            { status: 200 }
        );

    } catch (error) {
        console.log("Failed to get the user");
        return Response.json(
            {
                success: false,
                message: "Failed to get the user"
            },
            { status: 500 }
        );
    }
}