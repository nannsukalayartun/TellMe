import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get messages with pagination
  app.get("/api/messages", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const messages = await storage.getMessages(limit, offset);
      const total = await storage.getMessageCount();
      
      res.json({ messages, total });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Create a new message
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid message data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create message" });
      }
    }
  });

  // Toggle like on a message
  app.post("/api/messages/:id/like", async (req, res) => {
    try {
      const messageId = req.params.id;
      const userFingerprint = req.body.userFingerprint || req.ip;
      
      const result = await storage.toggleLike(messageId, userFingerprint);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  // Increment view count
  app.post("/api/messages/:id/view", async (req, res) => {
    try {
      const messageId = req.params.id;
      await storage.incrementView(messageId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to increment view" });
    }
  });

  // Report a message
  app.post("/api/messages/:id/report", async (req, res) => {
    try {
      const messageId = req.params.id;
      const userFingerprint = req.body.userFingerprint || req.ip;
      
      const reportData = {
        ...req.body,
        messageId,
        userFingerprint
      };
      
      const validatedReport = insertReportSchema.parse(reportData);
      await storage.reportMessage(validatedReport);
      
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid report data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to report message" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
