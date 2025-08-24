import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import MessageCard from "@/components/message-card";
import { type Message } from "@shared/schema";

interface MessageFeedProps {
  onReport: (message: Message) => void;
}

interface MessagesResponse {
  messages: Message[];
  total: number;
}

export default function MessageFeed({ onReport }: MessageFeedProps) {
  const [limit, setLimit] = useState(20);

  const { data, isLoading, error } = useQuery<MessagesResponse>({
    queryKey: ['/api/messages', { limit }],
    queryFn: async () => {
      const response = await fetch(`/api/messages?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
  });

  const loadMore = () => {
    setLimit(prev => prev + 20);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600" data-testid="text-error">
          Failed to load messages. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Message count */}
      <div className="text-center mb-4">
        <div className="inline-block bg-white/80 px-4 py-2 rounded-full shadow-sm">
          <span className="text-sm font-medium text-gray-800" data-testid="text-message-count">
            {data?.total || 0} messages on the wall
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-48 h-40 bg-yellow-200 animate-pulse sticky-note p-4">
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-300 rounded" />
                <div className="w-4/5 h-3 bg-gray-300 rounded" />
                <div className="w-3/5 h-3 bg-gray-300 rounded" />
              </div>
              <div className="mt-4">
                <div className="w-16 h-2 bg-gray-300 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white/80 inline-block px-8 py-6 rounded-lg shadow-sm">
            <p className="text-gray-700 text-lg mb-2 font-medium" data-testid="text-empty-state">
              The wall is waiting for your voice
            </p>
            <p className="text-gray-500">Be the first to post a message!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Wall of sticky notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">
            {data?.messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onReport={() => onReport(message)}
              />
            ))}
          </div>

          {data && data.messages.length < data.total && (
            <div className="text-center py-8">
              <Button
                onClick={loadMore}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                data-testid="button-load-more"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More Messages
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
