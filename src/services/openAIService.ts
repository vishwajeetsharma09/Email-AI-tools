import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_APIKEY,
});

const openai = new OpenAIApi(configuration);

export const getEmailLabel = async (emailContent: string): Promise<string> => {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Based on the following email content, assign a label: "Interested", "Not Interested", or "More Information". Email content: ${emailContent}`,
    max_tokens: 10,
  });
  return response.data.choices[0].text.trim();
};

export const getEmailReply = async (emailContent: string, label: string): Promise<string> => {
  const prompt = `The email content is: ${emailContent}. The label is: ${label}. Generate an appropriate reply.`;
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt,
    max_tokens: 150,
  });
  return response.data.choices[0].text.trim();
};
