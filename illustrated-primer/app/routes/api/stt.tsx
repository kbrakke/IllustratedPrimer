import { Form, useLoaderData, useRevalidator} from "@remix-run/react";
import { AudioConfig, ResultReason, SpeechConfig, SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";
import pino from 'pino';
import { useEffect, useState } from "react";
import { FaMicrophone } from "react-icons/fa";
import { GiSoundWaves } from "react-icons/gi";
import { loader } from "..";

const logger = pino();

const addAudioElement = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const audio = document.createElement("audio");
  audio.src = url;
  audio.controls = true;
  document.body.appendChild(audio);
};

export function Stt() {
  let data = useLoaderData<typeof loader>();
  let revalidator = useRevalidator();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  useEffect(() => {
    logger.info(`Recording State: ${recording}`)
    if (!recording) {
      return;
    } else {
      revalidator.revalidate();
      logger.info(data.sttToken.authToken);
      const speechConfig = SpeechConfig.fromAuthorizationToken(data.sttToken.authToken, data.sttToken.region || 'eastus');
      const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
      speechConfig.speechRecognitionLanguage = 'en-US';
      const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
      recognizer.recognizeOnceAsync(result => {
        logger.info(result);
        if (result.reason === ResultReason.RecognizedSpeech) {
          setRecording(false);
          return result;
        } else {
          logger.error(result.reason);
          setRecording(false);
          return;
        }
      });
    }
  }, [recording]);
  return (
    <div>
      <Form method="post">
        <button onClick={ () => setRecording(!recording)}>{
          recording ? 
          <GiSoundWaves className="text-red-500"/> :
          <FaMicrophone/>
        }
        </button>
      </Form>
    </div>
  )
}