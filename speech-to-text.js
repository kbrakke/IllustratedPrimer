import { SpeechConfig, AudioConfig, SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";
import { readFileSync } from "fs";

// This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
console.log(process.env.AZURE_STT_ACCESS_KEY);
const speechConfig = SpeechConfig.fromSubscription( process.env.AZURE_STT_ACCESS_KEY,'eastus');
speechConfig.speechRecognitionLanguage = "en-US";

function fromFile() {
  console.log("In fromFile");
  const audioConfig = AudioConfig.fromWavFileInput(readFileSync("test.wav"));
  const speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);
  console.log("Recognizing first result...");
  speechRecognizer.recognizeOnceAsync(result => {
    console.log("Waiting");
    console.log(result);
    switch (result.reason) {
      case ResultReason.RecognizedSpeech:
        console.log(`RECOGNIZED: Text=${result.text}`);
        break;
      case ResultReason.NoMatch:
        console.log("NOMATCH: Speech could not be recognized.");
        break;
      case ResultReason.Canceled:
        const cancellation = CancellationDetails.fromResult(result);
        console.log(`CANCELED: Reason=${cancellation.reason}`);

        if (cancellation.reason == CancellationReason.Error) {
          console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
          console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
          console.log("CANCELED: Did you set the speech resource key and region values?");
        }
        break;
    }
    speechRecognizer.close();
  });
}
fromFile();