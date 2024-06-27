import express from 'express';
import axios from 'axios';
import { ConfidentialClientApplication } from '@azure/msal-node';
import dotenv from 'dotenv';
import { redisConnection } from '../services/redisService';

dotenv.config();

const OutlookRouter = express.Router();

const msalConfig = {
  auth: {
    clientId: process.env.OUTLOOK_CLIENTID,
    authority: 'https://login.microsoftonline.com/common',
    clientSecret: process.env.OUTLOOK_CLIENTSECRET,
  },
};

const msalClient = new ConfidentialClientApplication(msalConfig);

OutlookRouter.get('/auth', (req, res) => {
  const authUrl = msalClient.getAuthCodeUrl({
    scopes: ['https://graph.microsoft.com/.default'],
    redirectUri: process.env.OUTLOOK_REDIRECTURI,
  });
  res.redirect(authUrl);
});

OutlookRouter.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokenResponse = await msalClient.acquireTokenByCode({
      code: code as string,
      scopes: ['https://graph.microsoft.com/.default'],
      redirectUri: process.env.OUTLOOK_REDIRECTURI,
    });
    const accessToken = tokenResponse.accessToken;
    const userInfoResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const userEmail = userInfoResponse.data.userPrincipalName;
    await redisConnection.set(userEmail, accessToken);
    res.status(200).json({ message: `${userEmail} authenticated` });
  } catch (error) {
    res.status(500).send('Error during authentication');
  }
});

export { OutlookRouter };
