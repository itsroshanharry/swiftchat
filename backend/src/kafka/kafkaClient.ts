import { Kafka } from 'kafkajs';
import fs from 'fs';
import path from 'path';

// Import environment variables
const kafkaUsername = process.env.KAFKA_USERNAME || '';
const kafkaPassword = process.env.KAFKA_PASSWORD || '';

if (!kafkaUsername || !kafkaPassword) {
  throw new Error('Kafka username or password is not set in environment variables.');
}

// Construct the absolute path to ca-cert.pem
const certPath = path.resolve('./ca-cert.pem');

// Kafka client configuration
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [process.env.KAFKA_HOST || 'localhost:9092'],
  ssl: {
    ca: [fs.readFileSync(certPath, 'utf-8')],
    rejectUnauthorized: true,
  },
  sasl: {
    mechanism: 'plain',
    username: kafkaUsername,
    password: kafkaPassword,
  }
});

export default kafka;
