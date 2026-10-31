# LLM Skill

## Purpose

Guide large language model integration.

## Guidelines

- Follow `docs/LLMIntegration.md`.
- Access providers through an internal gateway.

## Do

- Track model, prompt version, cost, token usage, latency, and outcome.
- Support provider switching.

## Don't

- Call vendor SDKs directly from domain services.
- Log sensitive prompts without controls.

## Examples

- Route resume summarization through the LLM gateway and record prompt version.

## Checklist

- [ ] Gateway used
- [ ] Provider abstraction preserved
- [ ] Cost tracked
- [ ] Sensitive data handled

