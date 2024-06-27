import axios from 'axios';
import { redisConnection } from '../services/redisService';

export const getOutlookMessages = async (userEmail: string) => {
  const accessToken = await redisConnection.get(userEmail);
  const res = await axios.get('https://graph.microsoft.com/v1.0/me/messages', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      '$filter': 'isRead eq false',
    },
  });
  return res.data.value;
};

export const getOutlookMessageContent = async (messageId: string, userEmail: string) => {
  const accessToken = await redisConnection.get(userEmail);
  const res = await axios.get(`https://graph.microsoft.com/v1.0/me/messages/${messageId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data.body.content;
};
