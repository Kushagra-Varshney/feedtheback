import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation,
});

export async function GET(request: Request) {

    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username")
        }

        const result = UsernameQuerySchema.safeParse(queryParam);
        console.log(result); //for knowledge purposes remove in production
        if (!result.success) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid Username try another one"
                },
                {
                    status: 400
                }
            )
        }

        const { username } = result.data;

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists"
                },
                {
                    status: 400
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Username is unique"
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.error("Error Checking Username", error);
        return Response.json(
            {
                success: false,
                message: "Error Checking Username"
            },
            {
                status: 500
            }
        )
    }
}