import express from 'express';
import dotenv from 'dotenv';
import { GoogleRouter } from './controllers/gmailController';
import { OutlookRouter } from './controllers/outlookController';
import { addEmailToQueue } from './tasks/emailTask';
import { authMiddleware } from './middlewares/authMiddleware';
import { getGmailMessages, getMessageContent as getGmailMessageContent } from './utils/gmailUtils';
import { getOutlookMessages, getOutlookMessageContent } from './utils/outlookUtils';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/google', GoogleRouter);
app.use('/outlook', OutlookRouter);

app.get('/check-emails', authMiddleware, async (req, res) => {
  const userEmail = req.query.userEmail as string;
  const service = req.query.service as string;

  let messages;
  if (service === 'google') {
    messages = await getGmailMessages(userEmail);
    for (const message of messages) {
      const content = await getGmailMessageContent(message.id);
      await addEmailToQueue(content, userEmail, JSON.parse(await redisConnection.get(userEmail)).access_token);
    }
  } else if (service === 'outlook') {
    messages = await getOutlookMessages(userEmail);
    for (const message of messages) {
      const content = await getOutlookMessageContent(message.id, userEmail);
      await addEmailToQueue(content, userEmail, await redisConnection.get(userEmail));
    }
  }

  res.status(200).send('Emails checked and tasks added to queue');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
