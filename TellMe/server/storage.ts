import { type Message, type InsertMessage, type InsertLike, type InsertReport } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getMessages(limit?: number, offset?: number): Promise<Message[]>;
  getMessage(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  incrementLike(messageId: string): Promise<void>;
  decrementLike(messageId: string): Promise<void>;
  checkUserLiked(messageId: string, userFingerprint: string): Promise<boolean>;
  toggleLike(messageId: string, userFingerprint: string): Promise<{ liked: boolean; newCount: number }>;
  incrementView(messageId: string): Promise<void>;
  reportMessage(report: InsertReport): Promise<void>;
  getMessageCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private messages: Map<string, Message>;
  private likes: Map<string, { messageId: string; userFingerprint: string; createdAt: Date }>;
  private reports: Map<string, { messageId: string; reason: string; details?: string; userFingerprint: string; createdAt: Date }>;

  constructor() {
    this.messages = new Map();
    this.likes = new Map();
    this.reports = new Map();
  }

  async getMessages(limit = 20, offset = 0): Promise<Message[]> {
    const allMessages = Array.from(this.messages.values())
      .filter(message => !message.isReported)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
    
    return allMessages;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      content: insertMessage.content,
      authorName: insertMessage.authorName || null,
      location: insertMessage.location || null,
      likeCount: 0,
      viewCount: 0,
      isReported: false,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async incrementLike(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.likeCount++;
      this.messages.set(messageId, message);
    }
  }

  async decrementLike(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message && message.likeCount > 0) {
      message.likeCount--;
      this.messages.set(messageId, message);
    }
  }

  async checkUserLiked(messageId: string, userFingerprint: string): Promise<boolean> {
    return Array.from(this.likes.values()).some(
      like => like.messageId === messageId && like.userFingerprint === userFingerprint
    );
  }

  async toggleLike(messageId: string, userFingerprint: string): Promise<{ liked: boolean; newCount: number }> {
    const existingLike = Array.from(this.likes.entries()).find(
      ([_, like]) => like.messageId === messageId && like.userFingerprint === userFingerprint
    );

    if (existingLike) {
      // Unlike
      this.likes.delete(existingLike[0]);
      await this.decrementLike(messageId);
      const message = await this.getMessage(messageId);
      return { liked: false, newCount: message?.likeCount || 0 };
    } else {
      // Like
      const likeId = randomUUID();
      this.likes.set(likeId, {
        messageId,
        userFingerprint,
        createdAt: new Date()
      });
      await this.incrementLike(messageId);
      const message = await this.getMessage(messageId);
      return { liked: true, newCount: message?.likeCount || 0 };
    }
  }

  async incrementView(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.viewCount++;
      this.messages.set(messageId, message);
    }
  }

  async reportMessage(report: InsertReport): Promise<void> {
    const reportId = randomUUID();
    this.reports.set(reportId, {
      messageId: report.messageId,
      reason: report.reason,
      details: report.details || undefined,
      userFingerprint: report.userFingerprint,
      createdAt: new Date()
    });

    // Mark message as reported after 3 reports
    const messageReports = Array.from(this.reports.values()).filter(
      r => r.messageId === report.messageId
    );
    
    if (messageReports.length >= 3) {
      const message = this.messages.get(report.messageId);
      if (message) {
        message.isReported = true;
        this.messages.set(report.messageId, message);
      }
    }
  }

  async getMessageCount(): Promise<number> {
    return Array.from(this.messages.values()).filter(message => !message.isReported).length;
  }
}

export const storage = new MemStorage();
