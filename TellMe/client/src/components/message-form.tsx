import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { type InsertMessage } from "@shared/schema";

interface MessageFormProps {
  onSuccess: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function MessageForm({ onSuccess, isExpanded, onToggle }: MessageFormProps) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [location, setLocation] = useState("");

  const createMessageMutation = useMutation({
    mutationFn: async (data: InsertMessage) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      setContent("");
      setAuthorName("");
      setLocation("");
      onSuccess();
      onToggle(); // Collapse after posting
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    createMessageMutation.mutate({
      content: content.trim(),
      authorName: authorName.trim() || undefined,
      location: location.trim() || undefined,
    });
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 500;

  if (!isExpanded) {
    return (
      <Button
        onClick={onToggle}
        className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        data-testid="button-fab-post"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
      </Button>
    );
  }

  return (
    <Card
      className="bg-yellow-200 shadow-xl border-2 border-yellow-400 w-80 animate-in slide-in-from-bottom-4 duration-300"
      id="message-form"
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Add to Wall</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0 hover:bg-black/10 rounded-full"
          >
            <span className="text-xl leading-none">&times;</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Your message..."
              className="w-full p-4 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none bg-white shadow-sm"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              data-testid="input-message-content"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-600 font-medium">Burmese/English</span>
              <span
                className={`text-xs font-bold ${isOverLimit ? "text-red-600" : "text-gray-500"}`}
                data-testid="text-character-count"
              >
                {characterCount}/500
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="Name (optional)"
              className="text-sm p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white shadow-sm"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              data-testid="input-author-name"
            />
            <Input
              type="text"
              placeholder="Location"
              className="text-sm p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white shadow-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              data-testid="input-location"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            disabled={
              !content.trim() || isOverLimit || createMessageMutation.isPending
            }
            data-testid="button-post-message"
          >
            <Send className="w-4 h-4 mr-2" />
            {createMessageMutation.isPending ? "Posting..." : "Post Note"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
