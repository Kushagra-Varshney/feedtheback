import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrpyt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import UserModel from "@/models/User";

export async function POST(request: Request) {
    //connect database
    await dbConnect();

    try {
        const {username, email, password} = await request.json();
        
        //if user already exists and is verified
        const existingUserVerifiedByUsername = await UserModel.findOne({username, isVerified: true});
        
        if(existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists",
                },
                {
                    status: 400,
                }
            )
        }

        //find existing user by email
        const existingUserByEmail = await UserModel.findOne({email});

        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        //if user with this email exists
        if(existingUserByEmail) {
            //user exists and is verified
            if(existingUserByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "User already exists with this email",
                    },
                    {
                        status: 400,
                    }
                )
            } else {
                //user exists but is not verified
                const hashedPassword = await bcrpyt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        } else {
            //create new user if user does not exist
            const hashedPassword = await bcrpyt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: [],
            }) 

            await newUser.save();
        }
        
        //send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if(!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message,
                },
                {
                    status: 500,
                }
            )
        } 

        return Response.json(
            {
                success: true,
                message: "User registered successfully. Please verify your email address to login.",
            },
            {
                status: 201,
            }
        )

    } catch (error) {
        console.error("Error signing up", error);
        return Response.json(
            {
                success: false,
                message: "Error signing up",
            },
            {
                status: 500,
            }
        )
    }
}