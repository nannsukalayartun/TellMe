import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { getUserFingerprint } from "@/lib/firebase";
import { type Message, type InsertReport } from "@shared/schema";

interface ReportModalProps {
  message: Message;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportModal({ message, onClose, onSuccess }: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const reportMutation = useMutation({
    mutationFn: async (data: Omit<InsertReport, 'messageId' | 'userFingerprint'>) => {
      const response = await apiRequest("POST", `/api/messages/${message.id}/report`, {
        ...data,
        userFingerprint: getUserFingerprint()
      });
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) return;
    
    reportMutation.mutate({
      reason,
      details: details.trim() || undefined,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Report Message</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reporting
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger data-testid="select-report-reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam or misleading content</SelectItem>
                <SelectItem value="inappropriate">Inappropriate language</SelectItem>
                <SelectItem value="harassment">Harassment or hate speech</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </Label>
            <Textarea
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              placeholder="Please provide any additional context..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              data-testid="textarea-report-details"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-testid="button-cancel-report"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-rose-600 text-white"
              disabled={!reason || reportMutation.isPending}
              data-testid="button-submit-report"
            >
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
