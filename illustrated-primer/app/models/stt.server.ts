import axios, { AxiosError, AxiosRequestHeaders } from 'axios';
import { config } from 'dotenv';
import { SpeechConfig, SpeechRecognizer, AudioConfig, ResultReason, AudioOutputStream} from 'microsoft-cognitiveservices-speech-sdk';
import Cookie from 'universal-cookie';
import pino from 'pino';
import invariant from 'tiny-invariant';
import { prisma } from "~/db.server";
import { sttQuestion } from '@prisma/client';

const logger = pino(process.env.NODE_ENV === 'production' ? { level: 'info' } : { level: 'debug' });
config();

export async function upsertS2TQuestion(question: string, answer: string) {
  await prisma.sttQuestion.create({
    data: {
      question,
      answer,
    },
  });
}

export async function getLastS2TQuestion(): Promise<sttQuestion> {
  return (await prisma.sttQuestion.findMany({orderBy: { id: 'desc'}, take: 1}))[0]
}