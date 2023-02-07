import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { getTokenOrRefresh } from './token_util';
import './custom.css'
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { askAI } from './ai_util';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk')


export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            displayText: 'INITIALIZED: ready to test speech...',
            haveTextResponse: false,
            textResponse: '',
            AIOutput: 'WAITING FOR INPUT: waiting for user input...',
            AIStatus: 'Waiting for input...',
            debug: true,
        }
    }

    async componentDidMount() {
        // check for valid speech key/region
        const tokenRes = await getTokenOrRefresh();
        if (tokenRes.authToken === null) {
            this.setState({
                displayText: 'FATAL_ERROR: ' + tokenRes.error
            });
        }
    }

    async sttFromMic() {
        const tokenObj = await getTokenOrRefresh();
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        speechConfig.speechRecognitionLanguage = 'en-US';

        const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        this.setState({
            displayText: 'speak into your microphone...'
        });

        recognizer.recognizeOnceAsync(result => {
            let displayText;
            if (result.reason === ResultReason.RecognizedSpeech) {
                displayText = `RECOGNIZED: Text=${result.text}`
                this.setState({
                    receivedText: result.text,
                    haveTextResponse: true,
                });
            } else {
                displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
                this.setState({
                    haveTextResponse: false,
                });
            }

            this.setState({
                displayText: displayText
            });
        });
    }

    async fileChange(event) {
        const audioFile = event.target.files[0];
        console.log(audioFile);
        const fileInfo = audioFile.name + ` size=${audioFile.size} bytes `;

        this.setState({
            displayText: fileInfo
        });

        const tokenObj = await getTokenOrRefresh();
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
        speechConfig.speechRecognitionLanguage = 'en-US';

        const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync(result => {
            let displayText;
            if (result.reason === ResultReason.RecognizedSpeech) {
                displayText = `RECOGNIZED: Text=${result.text}`
            } else {
                displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
            }

            this.setState({
                displayText: fileInfo + displayText
            });
        });
    }

    async sttToAI() {
        if(this.state.debug) {
            const response = await askAI("I'm testing a speech to ai response app. How cool is that?");
            this.setState({
                AIOutput: JSON.stringify(response, null, 2),
                AIStatus: 'SUCCESS: AI responded.'
            });
        } else if(this.state.haveTextResponse) {
            const response = await askAI(this.state.receivedText);
            this.setState({
                AIOutput: JSON.stringify(response, null, 2),
                AIStatus: 'SUCCESS: AI responded.'
            });
        } else {
            this.setState({
                AIStatus: 'ERROR: No text to send to AI.'
            });
        }
    }
    render() {
        return (
            <Container className="app-container">
                <h1 className="display-4 mb-3">Speech sample app</h1>

                <div className="row main-container">
                    <div className="col-6">
                        <i className="fas fa-microphone fa-lg mr-2" onClick={() => this.sttFromMic()}></i>
                        Convert speech to text from your mic.
                    </div>
                    <div className="col-6 output-display rounded">
                        <code>{this.state.displayText}</code>
                    </div>
                </div>
                <div className="row main-container">
                    <div className='col-6'>
                        <i className="fas fa-file-audio fa-lg mr-2" onClick={() => this.sttToAI()}></i>
                        {this.state.AIStatus}
                    </div>
                    <div className="col-6 output-display rounded">
                        <code>{this.state.AIOutput}</code>
                    </div>
                </div>
            </Container>
        );
    }
}