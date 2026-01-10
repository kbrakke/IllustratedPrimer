# AI Module

## Purpose
This module handles all AI/LLM interactions for the Illustrated Primer application. It provides a clean interface to OpenAI's API for generating educational story content and managing conversation context. The module uses GPT-4 Turbo to create warm, educational narratives tailored for children aged 2-8.

## Architecture
The module is organized around a client pattern with configurable prompts:
- **Client Layer**: Manages API connections and request/response handling
- **Prompt Layer**: Defines system prompts and message templates
- **Streaming Support**: Includes both blocking and streaming response modes

## Key Features
- Non-blocking and streaming chat completions
- Conversation history management
- Educational storytelling prompt engineering
- Error handling with anyhow::Result

## Files

### mod.rs
Exports the public API of the ai module, exposing OpenAIClient and prompt utilities.

### openai.rs
Implements the OpenAIClient struct that wraps async-openai, providing methods for generating story responses both synchronously and as streams with proper conversation history formatting.

### prompt.rs
Defines the PromptTemplate struct containing static methods that return system prompts and message templates optimized for educational storytelling with children.
