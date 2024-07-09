'use client'
import { useToast } from "@/components/ui/use-toast";
import { verifySchema } from "@/schemas/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function page() {
    const router = useRouter();
    const param = useParams<{ username: string }>();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
    });

    async function onSubmit(data: z.infer<typeof verifySchema>) {
        try {
            const res = await axios.post(`/api/verify-code`, {
                username: param.username,
                code: data.code,
            });
            toast({
                title: "Success",
                description: res.data.message,
            });
            router.replace("/sign-in");
        } catch (error) {
            const err = error as AxiosError<ApiResponse>;
            const errorMessage = err.response?.data.message ?? "Error verifying code";
            toast({
                title: "Error",
                description: errorMessage,
                variant: 'destructive'
            });
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-zinc-950">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Verify Your Account</h1>
                    <p className="m-4">Enter the code sent to your email</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="987654" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">{"Verify ->"}</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
