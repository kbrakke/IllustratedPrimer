import * as dotenv from 'dotenv'
dotenv.config();
import pino from 'pino'

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

function getEnvString(varName: string, fallback: string, invariant = false): string {
  const envGet = process.env[varName];
  if (!envGet) {
    if (invariant) {
      logger.error(`Missing value for ${varName}, this cannot be recovered from. Please add a value for ${varName} in your .env file`);
    }
    return fallback;
  }
  return envGet;
}

export type primerConfig = {
  databaseUrl: string;
  sessionSecret: string;
  azureSpeechEndpoint: string;
  azureSpeechKey: string;
  azureSpeechRegion: string;
  openAPIOrg: string;
  openAPIKey: string;
  port: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const config: primerConfig = {
  databaseUrl: getEnvString('DATABASE_URL', 'file:./data.db?connection_limit=1'),
  sessionSecret: getEnvString('SESSION_SECRET', ''),
  azureSpeechEndpoint: getEnvString('SPEECH_ENDPOINT', ''),
  azureSpeechKey: getEnvString('SPEECH_KEY', ''),
  azureSpeechRegion: getEnvString('SPEECH_REGION', ''),
  openAPIOrg: getEnvString('OPENAPI_ORG', ''),
  openAPIKey: getEnvString('OPENAI_API_KEY', ''),
  port: parseInt(getEnvString('PORT', '3001')),
  logLevel: 'info',
}
