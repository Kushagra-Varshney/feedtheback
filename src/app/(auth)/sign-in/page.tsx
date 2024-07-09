'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { signInSchema } from '@/schemas/signInSchema'
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
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function page() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { toast } = useToast();

    const router = useRouter();

    //zod setup
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: '',
        }
    });

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        setIsSubmitting(true);

        const result = await signIn('credentials', {
            identifier: data.identifier,
            password: data.password,
            redirect: false,
        });

        setIsSubmitting(false);

        if(result?.error) {
            toast({
                title: "Login Error",
                description: "Incorrect Username or Password",
                variant: 'destructive'
            });
        }
        
        if(result?.url) {
            router.replace('/dashboard');
        }
    };

    return (
        <div className='flex justify-center items-center min-h-screen bg-zinc-950'>
            <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
                <div className="text-center">
                    <h1 className="text-3xl  font-extrabold tracking-tight lg:text-5xl mb-6">Sign In</h1>
                    <p className="mb-4">Log in to your existing account</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email or Username</FormLabel>
                                    <FormControl>
                                        <Input className='text-black' placeholder="john@example.com / John123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input className='text-black' type='password' placeholder="Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type='submit' className='w-full' disabled={isSubmitting}>
                            {isSubmitting ? <> <Loader2 className='mr-4 h-4 w-4 animate-spin' /> Logging you In </> : ("SignIn ->")}
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                        New User?{' '}
                        <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
                            Create An Account
                        </Link>
                </div>
            </div>
        </div>
    )
}
