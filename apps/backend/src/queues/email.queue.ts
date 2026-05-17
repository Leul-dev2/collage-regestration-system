import { Queue, Worker, Job } from 'bullmq';
import { getRedisConnection, isRedisAvailable } from '../config/redis';

let emailQueue: Queue | null = null;
let emailWorker: Worker | null = null;

export const getEmailQueue = (): Queue | null => {
  if (!isRedisAvailable()) return null;
  
  if (!emailQueue) {
    emailQueue = new Queue('email-notifications', {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    });
  }
  return emailQueue;
};

export const startEmailWorker = () => {
  if (!isRedisAvailable()) {
    console.warn('⚠️  Email worker not started — Redis unavailable');
    return;
  }

  emailWorker = new Worker(
    'email-notifications',
    async (job: Job) => {
      const { to, subject, body } = job.data;
      console.log(`📧 Sending email to ${to}: [${subject}]`);
      // Production: integrate SES, SendGrid, or Mailgun here
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(`✅ Email sent to ${to}`);
    },
    { connection: getRedisConnection() }
  );

  emailWorker.on('completed', (job) => {
    console.log(`✨ Job ${job.id} completed`);
  });

  emailWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed: ${err.message}`);
  });
};

export const enqueueEmail = async (to: string, subject: string, body: string) => {
  const queue = getEmailQueue();
  if (!queue) {
    console.log(`📧 [Fallback] Would send email to ${to}: ${subject}`);
    return;
  }
  await queue.add('send-email', { to, subject, body });
};
