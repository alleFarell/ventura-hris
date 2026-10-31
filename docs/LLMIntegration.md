# LLM Integration

## Provider Strategy

Support provider abstraction for OpenAI, Claude, Gemini, and local LLMs.

## Gateway Responsibilities

- Provider routing
- Model selection
- Token accounting
- Cost tracking
- Request and response logging with sensitive data controls
- Timeout and retry policy
- Safety and policy checks
- Evaluation hooks

## Business Logic Boundary

Domain services must not directly call vendor SDKs. They should call an internal AI application service or gateway.

## Observability

Every AI request must be traceable by feature, user, model, prompt version, token usage, cost, latency, and outcome.

