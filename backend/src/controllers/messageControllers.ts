// messageControllers.ts
import { Request, Response } from 'express';
import prisma from '../db/prisma.js';
import producer from '../../kafka/kafkaProducer.js';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, receiverId]
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: {
            set: [senderId, receiverId]
          }
        }
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        body: message,
        conversationId: conversation.id
      }
    });

    const messagePayload = JSON.stringify({ ...newMessage, receiverId });
    await producer.send({
      topic: process.env.KAFKA_TOPIC || 'default_topic',
      messages: [{ value: messagePayload }],
    });

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.log('Error in sendMessageController', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const senderId = req.user.id;

    const conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          hasEvery: [senderId, userId]
        }
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    res.status(200).json(conversation.messages);
  } catch (error: any) {
    console.error('Error in getMessages Controller', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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
