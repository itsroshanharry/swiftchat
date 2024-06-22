import kafka from './kafkaClient.cjs'
const producer = kafka.producer();
const connectProducer = async () => {
    await producer.connect();
};
connectProducer().catch((err) => {
    console.error('Failed to connect Kafka producer:', err);
});
export default producer;
