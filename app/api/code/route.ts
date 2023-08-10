import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import {checkApiLimit, increaseApiLimit} from "@/lib/api-limit";
import {checkSubscription} from "@/lib/subscription";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

const instructionMessage: ChatCompletionRequestMessage = {
  role: 'system',
  content:
    'You are a code generator. You must answer only in markdown code snippets. Use code comments for explanation.'
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    if (!configuration.apiKey)
      return new NextResponse('OpenAI API key not configured', { status: 500 });
    if (!messages) return new NextResponse('Messages are required', { status: 400 });

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) return new NextResponse('Free Trial has expired.', { status: 403 });

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [instructionMessage, ...messages]
    });

    if (!isPro) {
      await increaseApiLimit();
    }


    return NextResponse.json(response.data.choices[0].message);
  } catch (e) {
    console.log('[CODE_POST]', e);
    return new NextResponse('Internal error', { status: 500 });
  }
}