'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import { Trash2, X } from "lucide-react"
import { Message } from "@/models/User"
import { useToast } from "./ui/use-toast"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"

type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void;
}

export default function MessageCard({ message, onMessageDelete }: MessageCardProps) {
    const { toast } = useToast();
    const handleDeleteConfirm = async () => {
        try {
            const res = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`);
            toast({
                title: res.data.message,
            })
            // Call the parent component function to remove the message from the list from the frontend
            onMessageDelete(message._id);

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description: axiosError.response?.data.message ?? 'Failed to delete the message',
                variant: 'destructive'
            });
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{message.content}</CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="p-3" variant="destructive"><Trash2 className="w-5 h-5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this message and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <CardDescription>{new Date(message.createdAt).toLocaleDateString("en-GB")}</CardDescription>
            </CardHeader>
        </Card>

    )
}
