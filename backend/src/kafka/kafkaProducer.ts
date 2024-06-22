import kafka from './kafkaClient.js';
import { Partitioners } from 'kafkajs';

// Create a producer with the legacy partitioner
const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
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
