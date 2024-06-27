import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { redisConnection } from '../services/redisService';

const oAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENTID,
  clientSecret: process.env.GOOGLE_CLIENTSECRET,
  redirectUri: process.env.GOOGLE_REDIRECTURI,
});

export const getGmailMessages = async (userEmail: string) => {
  const tokens = await redisConnection.get(userEmail);
  oAuth2Client.setCredentials(JSON.parse(tokens));
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
  });
  const messages = res.data.messages || [];
  return messages;
};

export const getMessageContent = async (messageId: string) => {
  const tokens = await redisConnection.get(userEmail);
  oAuth2Client.setCredentials(JSON.parse(tokens));
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });
  const message = res.data;
  return message.snippet;
};
