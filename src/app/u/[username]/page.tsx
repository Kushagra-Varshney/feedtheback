'use client'

import { Button } from "@/components/ui/button";
import { toast, useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import * as z from 'zod';
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { messageSchema } from "@/schemas/messageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function MessagePage() {
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { username } = useParams();

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema)
  });

  async function generateSuggestions() {
    try {
      setIsGeneratingSuggestions(true);
      const response = await axios.post<ApiResponse>("/api/suggest-messages");
      const suggestions = response.data.message.split("||");
      setSuggestions(suggestions);
      toast({
        title: "Suggestions generated successfully!"
      })
    } catch (error) {
      toast({
        title: "There was an error generating suggestions",
        variant: "destructive",
      })

    } finally {
      setIsGeneratingSuggestions(false);
    }
  }

  function handleFillSuggestions(suggestion: string) {
    form.setValue("content", suggestion);
  }

  async function onSubmit(data: z.infer<typeof messageSchema>) {
    setIsSubmitting(true);

    try {
      const res = await axios.post<ApiResponse>(`/api/send-message`, {
        username,
        content: data.content,
      });

      toast({
        title: res.data.message
      });

    } catch (error) {
      toast({
        title: "Failed to send message",
        description: (error as AxiosError<ApiResponse>).response?.data.message ?? "An error occurred",
        variant: "destructive",
      });

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl" >
      <h1 className="text-4xl font-bold mb-4">Anonymously tell <span className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">{username}</span> what's on your mind</h1>

      <div className="mb-4 mt-5">
        <h2 className="text-lg font-semibold mb-2">
          Write your message
        </h2>
        <div>
          <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2 w-full mr-2'>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input className='text-black w-full' placeholder="Write any Message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                {isSubmitting ?
                  <>
                    <span className="mr-2">Sending</span>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  </>
                  : "Send Message"
                }
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <div className="mb-4 mt-14">
        <h2 className="text-lg font-semibold mb-2">
          Or choose from suggestions
        </h2>
        <div className="flex items-center">
          <Button onClick={generateSuggestions} disabled={isGeneratingSuggestions}>
            {isGeneratingSuggestions ?
              <>
                <span className="mr-2">Generating</span><Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
              : suggestions.length > 0 ? "Regenerate suggestions" : "Generate suggestions"
            }
          </Button>
        </div>
        <div className="mt-6 mx-auto text-center grid grid-rows-3">
          {suggestions.map((suggestion, index) => (
            <Button onClick={() => handleFillSuggestions(suggestion)} variant={"outline"} key={index} className="p-2 bg-gray-100 rounded mt-2">
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
