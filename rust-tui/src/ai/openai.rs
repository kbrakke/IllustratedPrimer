use anyhow::Result;
use async_openai::{
    config::OpenAIConfig,
    types::{
        ChatCompletionRequestMessage, ChatCompletionRequestSystemMessageArgs,
        ChatCompletionRequestUserMessageArgs, CreateChatCompletionRequestArgs,
    },
    Client,
};
use futures::StreamExt;
use tokio::sync::mpsc;

use super::prompt::PromptTemplate;

pub struct OpenAIClient {
    client: Client<OpenAIConfig>,
    model: String,
}

impl OpenAIClient {
    pub fn new(api_key: String) -> Self {
        let config = OpenAIConfig::new().with_api_key(api_key);
        let client = Client::with_config(config);

        Self {
            client,
            model: "gpt-4-turbo".to_string(),
        }
    }

    pub async fn generate_story_response(
        &self,
        user_message: String,
        conversation_history: Vec<String>,
    ) -> Result<String> {
        let mut messages: Vec<ChatCompletionRequestMessage> = vec![
            ChatCompletionRequestSystemMessageArgs::default()
                .content(PromptTemplate::system_prompt())
                .build()?
                .into(),
        ];

        for (i, msg) in conversation_history.iter().enumerate() {
            let role = if i % 2 == 0 { "user" } else { "assistant" };
            let message = if role == "user" {
                ChatCompletionRequestUserMessageArgs::default()
                    .content(msg.clone())
                    .build()?
                    .into()
            } else {
                ChatCompletionRequestMessage::Assistant(
                    async_openai::types::ChatCompletionRequestAssistantMessageArgs::default()
                        .content(msg.clone())
                        .build()?,
                )
            };
            messages.push(message);
        }

        messages.push(
            ChatCompletionRequestUserMessageArgs::default()
                .content(user_message)
                .build()?
                .into(),
        );

        let request = CreateChatCompletionRequestArgs::default()
            .model(&self.model)
            .messages(messages)
            .build()?;

        let response = self.client.chat().create(request).await?;

        let content = response
            .choices
            .first()
            .and_then(|choice| choice.message.content.clone())
            .unwrap_or_default();

        Ok(content)
    }

    pub async fn generate_story_response_stream(
        &self,
        user_message: String,
        conversation_history: Vec<String>,
    ) -> Result<mpsc::Receiver<String>> {
        let mut messages: Vec<ChatCompletionRequestMessage> = vec![
            ChatCompletionRequestSystemMessageArgs::default()
                .content(PromptTemplate::system_prompt())
                .build()?
                .into(),
        ];

        for (i, msg) in conversation_history.iter().enumerate() {
            let role = if i % 2 == 0 { "user" } else { "assistant" };
            let message = if role == "user" {
                ChatCompletionRequestUserMessageArgs::default()
                    .content(msg.clone())
                    .build()?
                    .into()
            } else {
                ChatCompletionRequestMessage::Assistant(
                    async_openai::types::ChatCompletionRequestAssistantMessageArgs::default()
                        .content(msg.clone())
                        .build()?,
                )
            };
            messages.push(message);
        }

        messages.push(
            ChatCompletionRequestUserMessageArgs::default()
                .content(user_message)
                .build()?
                .into(),
        );

        let request = CreateChatCompletionRequestArgs::default()
            .model(&self.model)
            .messages(messages)
            .stream(true)
            .build()?;

        let mut stream = self.client.chat().create_stream(request).await?;

        let (tx, rx) = mpsc::channel(100);

        tokio::spawn(async move {
            while let Some(result) = stream.next().await {
                match result {
                    Ok(response) => {
                        for choice in response.choices {
                            if let Some(content) = choice.delta.content {
                                if tx.send(content).await.is_err() {
                                    return;
                                }
                            }
                        }
                    }
                    Err(_) => break,
                }
            }
        });

        Ok(rx)
    }
}
