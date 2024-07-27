import kafka from './kafkaClient.js';
import { Partitioners } from 'kafkajs';

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (err) {
    console.error('Failed to connect Kafka producer:', err);
  }
};

connectProducer();

export default producer;

export const sendNotification = async (notification: any) => {
  try {
    const notificationPayload = JSON.stringify(notification);
    await producer.send({
      topic: process.env.KAFKA_NOTIFICATION_TOPIC || 'notifications',
      messages: [{ value: notificationPayload }],
    });
    console.log('Notification sent to Kafka:', notificationPayload);
  } catch (err) {
    console.error('Failed to send notification to Kafka:', err);
  }
};
