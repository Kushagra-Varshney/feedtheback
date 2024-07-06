import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const {username, code} = await request.json();
        //sometimes when getting data from URLS it is advisable to decode the URI components before use
        const decodedUsername = decodeURIComponent(username);
        const existingUser = await UserModel.findOne({ username: decodedUsername });
        if (!existingUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            )
        }

        const isCodeValid = existingUser.verifyCode === code;
        const isCodeExpired = existingUser.verifyCodeExpiry < new Date();

        if(isCodeValid && !isCodeExpired) {
            existingUser.isVerified = true;
            await existingUser.save();
            return Response.json(
                {
                    success: true,
                    message: "Verification Successful"
                },
                {
                    status: 200
                }
            )
        }
        else if(isCodeExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification Code Expired. Please Sign Up Again to get a new code"
                },
                {
                    status: 400
                }
            )
        }
        else {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect Verification Code"
                },
                {
                    status: 400
                }
            )
        }

    } catch (error) {
        console.error("Error Checking Username", error);
        return Response.json(
            {
                success: false,
                message: "Error Verifying User"
            },
            {
                status: 500
            }
        )
    }
}