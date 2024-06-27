import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import dotenv from 'dotenv';
import { redisConnection } from '../services/redisService';

dotenv.config();

const GoogleRouter = express.Router();

const oAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENTID,
  clientSecret: process.env.GOOGLE_CLIENTSECRET,
  redirectUri: process.env.GOOGLE_REDIRECTURI,
});

const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

GoogleRouter.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(authUrl);
});

GoogleRouter.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    const userInfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );
    const userEmail = userInfoResponse.data.email;
    await redisConnection.set(userEmail, JSON.stringify(tokens));
    res.status(200).json({ message: `${userEmail} authenticated` });
  } catch (error) {
    res.status(500).send('Error during authentication');
  }
});

export { GoogleRouter };
