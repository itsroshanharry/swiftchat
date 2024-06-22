import dotenv from 'dotenv';
dotenv.config();

import { Server } from 'socket.io';
import { createServer } from 'http';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import kafka from '../kafka/kafkaClient.js'; // Importing kafka from kafkaClient.ts
import express from 'express';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.error('Redis Connection Error', err);
  });

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'default_topic';

const consumer = kafka.consumer({ groupId: 'chat-group' });

const runConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const newMessage = JSON.parse(message.value.toString());
          console.log('Received chat message:', newMessage);
          io.to(newMessage.receiverId).emit('newMessage', newMessage);
        }
      },
    });
  } catch (err) {
    console.error('Kafka Consumer error:', err);
  }
};

runConsumer();

export { io, server, app };
