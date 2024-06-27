import axios from 'axios';

export const sendEmail = async (userEmail: string, accessToken: string, replyContent: string) => {
  const rawMessage = Buffer.from(
    `To: ${userEmail}\nSubject: Re: Your Email\n\n${replyContent}`
  ).toString('base64');

  await axios.post(
    `https://gmail.googleapis.com/gmail/v1/users/${userEmail}/messages/send`,
    { raw: rawMessage },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};
