import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Flag, Eye, Send, Plus } from "lucide-react";
import MessageForm from "@/components/message-form";
import MessageFeed from "@/components/message-feed";
import ReportModal from "@/components/report-modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Message } from "@shared/schema";

export default function LennonWall() {
  const [reportingMessage, setReportingMessage] = useState<Message | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Live");
  const [formExpanded, setFormExpanded] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simulate connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses = ["Live", "Connecting...", "Live"];
      setConnectionStatus(prev => {
        const currentIndex = statuses.indexOf(prev);
        return statuses[(currentIndex + 1) % statuses.length];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh messages every 10 seconds for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    }, 10000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const scrollToForm = () => {
    document.getElementById('message-form')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  return (
    <div className="mountain-bg min-h-screen relative">
      {/* Title Banner */}
      <div className="relative z-10 pt-8 pb-4">
        <div className="text-center">
          <div className="inline-block bg-yellow-400 px-8 py-4 transform -rotate-1 shadow-lg mb-2">
            <h1 className="text-2xl md:text-4xl font-bold text-black" data-testid="app-title">
              ရင်ဖွင့်ရာ
            </h1>
          </div>
          <div className="inline-block bg-yellow-300 px-6 py-2 transform rotate-1 shadow-lg">
            <h2 className="text-lg md:text-2xl font-bold text-black">
              You Can Say Anything Here
            </h2>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2 text-sm bg-white/80 px-3 py-1 rounded-full">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Live' ? 'bg-green-500 animate-pulse-slow' : 'bg-gray-400'}`} />
            <span data-testid="connection-status" className="text-gray-800">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Message Form - Floating */}
      <div className="fixed bottom-6 right-6 z-50">
        <MessageForm 
          isExpanded={formExpanded}
          onToggle={() => setFormExpanded(!formExpanded)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
            toast({
              title: "Message posted successfully!",
              description: "Your message has been shared with the community.",
            });
          }} 
        />
      </div>

      {/* Wall of Messages */}
      <main className="px-4 py-4 relative z-10">
        <MessageFeed onReport={setReportingMessage} />
      </main>


      {/* Report Modal */}
      {reportingMessage && (
        <ReportModal
          message={reportingMessage}
          onClose={() => setReportingMessage(null)}
          onSuccess={() => {
            toast({
              title: "Report submitted",
              description: "Thank you for helping keep our community safe.",
            });
          }}
        />
      )}
    </div>
  );
}
