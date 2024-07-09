'use client'

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/models/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  }

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch('acceptMessages');

  //to fetch the current message acceptance status
  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitching(true);
    try {
      const res = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', res.data.isAcceptingMessages);

    } catch (error) {
      const err = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: err.response?.data.message ?? "Error fetching message acceptance status",
        variant: 'destructive'
      });
    } finally {
      setIsSwitching(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    setIsSwitching(true);

    try {
      const res = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(res.data.messages || []);
      if (refresh) {
        toast({
          title: 'Messages refreshed',
        });
      }

    } catch (error) {
      const err = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: err.response?.data.message ?? "Error fetching messages",
        variant: 'destructive'
      });

    } finally {
      setIsLoading(false);
      setIsSwitching(false);
    }
  }, [setIsLoading, setMessages, toast]);

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessage();
  }, [session, setValue, fetchAcceptMessage, fetchMessages, toast]);

  const handleSwitchChange = async () => {
    try {
      const res = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: 'Success',
        description: res.data.message
      });
    } catch (error) {
      const err = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: err.response?.data.message ?? "Error fetching messages",
        variant: 'destructive'
      });
    }
  };

  if (!session || !session.user) return <div>Please Login</div>;

  const { username } = session?.user as User;
  //explore other ideas for extracting the base url
  const baseURL = `${window.location.protocol}//${window.location.host}`
  const profileURL = `${baseURL}/u/${username}`;

  function copyToClipboard() {
    navigator.clipboard.writeText(profileURL);
    toast({
      title: 'Copied URL',
    });
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">
          Copy your profile URL
        </h2>
        <div className="flex items-center">
          <input type="text" value={profileURL} disabled className="input input-bordered w-full p-2 mr-2" />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitching}
        />
        <span className="ml-2">{acceptMessages ? "You are accepting messages" : "You are not accepting any messages"}</span>
      </div>

      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}>
        {isLoading ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => {
            return <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          })
        ) : (
          <p> No Messages to Display</p>
        )}
      </div>

    </div>
  )
}
