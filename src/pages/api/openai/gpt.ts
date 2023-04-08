/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type ChatCompletionRequestMessage,
  type ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "@/env.mjs";
import { type Prompt } from "@prisma/client";

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const GPT = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }
  const allMessages: ChatCompletionRequestMessage[] = [];
  req.body.messages.forEach((msg: Prompt) => {
    allMessages.push({
      role: msg.type as ChatCompletionRequestMessageRoleEnum,
      content: msg.prompt,
    });
  });
  allMessages.push({ role: "user", content: req.body.prompt });

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: allMessages,
  });
  return res.status(200).json(completion.data.choices[0]);
};

export default GPT;
