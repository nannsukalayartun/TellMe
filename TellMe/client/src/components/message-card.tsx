import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Flag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { getUserFingerprint } from "@/lib/firebase";
import { type Message } from "@shared/schema";

interface MessageCardProps {
  message: Message;
  onReport: () => void;
}

export default function MessageCard({ message, onReport }: MessageCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(message.likeCount);
  const [hasViewed, setHasViewed] = useState(false);
  const queryClient = useQueryClient();

  // Track view on mount (simulate view tracking)
  useEffect(() => {
    if (!hasViewed) {
      const timer = setTimeout(() => {
        apiRequest("POST", `/api/messages/${message.id}/view`, {});
        setHasViewed(true);
      }, 2000); // Track view after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [message.id, hasViewed]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/messages/${message.id}/like`, {
        userFingerprint: getUserFingerprint()
      });
      return response.json();
    },
    onSuccess: (data: { liked: boolean; newCount: number }) => {
      setIsLiked(data.liked);
      setLikeCount(data.newCount);
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Just now";
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const getInitial = (name?: string | null) => {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  };

  const getStickyColor = () => {
    const colors = [
      "bg-pink-300",
      "bg-yellow-300", 
      "bg-green-300",
      "bg-blue-300",
      "bg-purple-300",
      "bg-orange-300",
      "bg-red-300",
      "bg-cyan-300",
      "bg-indigo-300",
      "bg-teal-300",
      "bg-lime-300",
      "bg-emerald-300"
    ];
    
    // Use message ID to consistently assign color
    const index = message.id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`sticky-note ${getStickyColor()} p-4 w-48 h-40 relative cursor-pointer`}>
      {/* Corner fold effect */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[15px] border-l-transparent border-t-[15px] border-t-black/10" />
      
      {/* Report button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 w-6 h-6 p-0 text-gray-600 hover:text-red-600 transition-colors duration-200"
        onClick={onReport}
        data-testid={`button-report-${message.id}`}
      >
        <Flag className="w-3 h-3" />
      </Button>

      {/* Message content */}
      <div className="h-full flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-gray-800 text-sm leading-tight font-medium break-words" data-testid={`text-content-${message.id}`}>
            {message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-2 pt-2 border-t border-black/10">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              <span className="font-semibold" data-testid={`text-author-name-${message.id}`}>
                {message.authorName || "Anonymous"}
              </span>
              {message.location && (
                <div data-testid={`text-location-${message.id}`} className="truncate max-w-20">
                  {message.location}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-black/10 transition-colors duration-200"
              onClick={handleLike}
              disabled={likeMutation.isPending}
              data-testid={`button-like-${message.id}`}
            >
              <div className="flex items-center space-x-1">
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                <span className="text-xs font-bold" data-testid={`text-like-count-${message.id}`}>
                  {likeCount}
                </span>
              </div>
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            <time data-testid={`text-timestamp-${message.id}`}>
              {formatTimeAgo(message.createdAt)}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}
