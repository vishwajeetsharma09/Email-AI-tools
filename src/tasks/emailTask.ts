import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../services/redisService';
import { getEmailLabel, getEmailReply } from '../services/openAIService';
import { sendEmail } from '../services/emailService';

const emailQueue = new Queue('emailQueue', { connection: redisConnection });

const emailWorker = new Worker('emailQueue', async job => {
  const { emailContent, userEmail, accessToken } = job.data;
  const label = await getEmailLabel(emailContent);
  const reply = await getEmailReply(emailContent, label);
  await sendEmail(userEmail, accessToken, reply);
}, { connection: redisConnection });

emailWorker.on('completed', job => {
  console.log(`Job ${job.id} completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

export const addEmailToQueue = async (emailContent: string, userEmail: string, accessToken: string) => {
  await emailQueue.add('processEmail', { emailContent, userEmail, accessToken });
};
