import { gateway } from '@ai-sdk/gateway';

/**
 * Modern AI Gateway using @ai-sdk/gateway
 * Unified access to multiple AI providers including x.ai Grok and OpenAI
 * 
 * @see https://ai-sdk.dev/docs for documentation
 */

/**
 * Get the default model based on available API keys
 */
export function getDefaultModel(): string {
  if (process.env.XAI_API_KEY) {
    return 'xai/grok-beta';
  }
  return 'openai/gpt-4-turbo';
}

/**
 * Get language model from AI SDK Gateway
 * 
 * Examples:
 * - getModel('xai/grok-beta')
 * - getModel('openai/gpt-4-turbo')
 * - getModel() // uses default
 */
export function getModel(modelId: string = getDefaultModel()) {
  return gateway(modelId);
}
