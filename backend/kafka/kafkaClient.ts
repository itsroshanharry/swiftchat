import { Kafka } from 'kafkajs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const kafkaUsername = process.env.KAFKA_USERNAME || '';
const kafkaPassword = process.env.KAFKA_PASSWORD || '';

if (!kafkaUsername || !kafkaPassword) {
  throw new Error('Kafka username or password is not set in environment variables.');
}

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the absolute path to ca-cert.pem
const certPath = path.resolve(__dirname, '../../ca-cert.pem');

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
