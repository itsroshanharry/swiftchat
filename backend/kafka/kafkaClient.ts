import { Kafka } from 'kafkajs';
import fs from 'fs';
import path from 'path';

const kafkaUsername = process.env.KAFKA_USERNAME || '';
const kafkaPassword = process.env.KAFKA_PASSWORD || '';

if (!kafkaUsername || !kafkaPassword) {
  throw new Error('Kafka username or password is not set in environment variables.');
}

// Construct the absolute path to ca-cert.pem based on the current file location
const certPath = path.resolve(__dirname, '/../../ca-cert.pem');

const kafka = new Kafka({
  brokers: [process.env.KAFKA_HOST || 'localhost:9092'],
  ssl: {
    ca: [fs.readFileSync(certPath, 'utf-8')],
    rejectUnauthorized: true,
  },
  sasl: {
    mechanism: 'plain',
    username: kafkaUsername,
    password: kafkaPassword,
  },
});

export default kafka;
