// socket.ts
import dotenv from 'dotenv';
dotenv.config();

import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import kafka from '../src/kafka/kafkaClient.js'; // Adjust path as needed
import express from 'express';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
		origin: ["http://localhost:5173"],
		methods: ["GET", "POST"],
	},
});

const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'default_topic';
const consumer = kafka.consumer({ groupId: 'chat-group' });

const userSocketMap: { [key: string]: string } = {}; // {userId: socketId}

export const getReceiverSocketId = (receiverId: string) => {
  return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    if (userId && userSocketMap[userId]) {
      console.log(`User disconnected: ${userId}`);
      delete userSocketMap[userId];
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    }
  });
});

const runConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });

    await consumer.run({
      autoCommit: true,
      eachMessage: async ({ message }) => {
        if (message.value) {
          const newMessage = JSON.parse(message.value.toString());
          console.log('Received chat message:', newMessage);
          const receiverSocketId = getReceiverSocketId(newMessage.receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
            console.log('Message emitted to receiver:', receiverSocketId);
          } else {
            console.log('Receiver not connected:', newMessage.receiverId);
          }
        }
      },
    });
  } catch (err) {
    console.error('Kafka Consumer error:', err);
  }
};

runConsumer();

export { io, server, app };
