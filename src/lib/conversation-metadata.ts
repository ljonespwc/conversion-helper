// Store conversation metadata (conversation_id -> metadata)
// Workaround since Layercode doesn't forward metadata to webhooks
export const conversationMetadata = new Map<string, any>()
