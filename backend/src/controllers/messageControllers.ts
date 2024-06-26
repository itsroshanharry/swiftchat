
import { Request, Response } from 'express';
import prisma from '../db/prisma.js'; // Adjust path as needed
import producer, { sendNotification } from '../kafka/kafkaProducer.js';
import redisClient from "../redis/redisClient.js";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);

    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    console.log('Sender ID:', senderId);
    console.log('Receiver ID:', receiverId);

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'Sender ID or Receiver ID missing' });
    }

    let conversation;

    try {
      // Fetch sender's full name
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { fullName: true },
      });

      if (!sender) {
        throw new Error(`Sender with ID ${senderId} not found.`);
      }

      conversation = await prisma.conversation.findFirst({
        where: {
          participantIds: {
            hasEvery: [senderId, receiverId],
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participantIds: {
              set: [senderId, receiverId],
            },
          },
        });
      }

      const newMessage = await prisma.message.create({
        data: {
          senderId,
          body: message,
          conversationId: conversation.id,
        },
      });

      const messagePayload = JSON.stringify({ ...newMessage, receiverId });
      await producer.send({
        topic: process.env.KAFKA_TOPIC || 'default_topic',
        messages: [{ value: messagePayload }],
      });

      // Send notification with sender's full name
      const notification = {
        type: 'newMessage',
        senderId,
        message: `New message received from ${sender.fullName}`, // Include sender's full name
        receiverId,
      };
      await sendNotification(notification);

      // Update cache for both users
      const cacheKey1 = `messages:${senderId}:${receiverId}`;
      const cacheKey2 = `messages:${receiverId}:${senderId}`;

      const updateCache = async (key: string) => {
        const cachedMessages = await redisClient.get(key);
        if (cachedMessages) {
          const messages = JSON.parse(cachedMessages);
          messages.push(newMessage);
          await redisClient.set(key, JSON.stringify(messages), { EX: 3600 });
        }
      };

      await updateCache(cacheKey1);
      await updateCache(cacheKey2);

      res.status(201).json(newMessage);
    } catch (error: any) {
      console.error('Error in Prisma or Kafka operation:', error.message);
      res.status(500).json({ error: 'Failed to send message' });
    }
  } catch (error: any) {
    console.error('Error in sendMessageController:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get messages for a specific user conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user.id;
    const cacheKey = `messages:${senderId}:${userToChatId}`;

    console.log(`Attempting to retrieve messages for key: ${cacheKey}`);

    // Try to get messages from cache
    const cachedMessages = await redisClient.get(cacheKey);
    if (cachedMessages) {
      console.log('Messages found in Redis cache');
      return res.status(200).json(JSON.parse(cachedMessages));
    }

    console.log('Messages not found in cache, querying database');

    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, userToChatId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      console.log('No conversation found in database');
      return res.status(200).json([]);
    }

    console.log('Conversation found in database, caching messages');

    await redisClient.set(cacheKey, JSON.stringify(conversation.messages), {
      EX: 3600 // expire after 1 hour
    });
    res.status(200).json(conversation.messages);
  } catch (error: any) {
    console.error("Error in getMessages: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get users for sidebar, excluding authenticated user
export const getUsersForSidebar = async (req: Request, res: Response) => {
  try {
    const authUserId = req.user.id;

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: authUserId
        }
      },
      select: {
        id: true,
        fullName: true,
        profilePic: true
      }
    });

    res.status(200).json(users);
  } catch (error: any) {
    console.error('Error in getUsersForSidebar Controller', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};