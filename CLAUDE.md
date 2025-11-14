# Conversion Helper - Voice Assistant Project

## Project Overview
Building a voice-enabled AI assistant widget that helps visitors find answers to frequently asked questions through natural conversation. The widget appears as a small button on the page that opens a modal with voice interaction capabilities.

## Supabase Configuration
**Project ID**: `fwimhxkkszdaogugslar` (conversionhelper project)
Always use this project_id when interacting with Supabase MCP tools.

## Testing Voice Locally

To test the voice widget on localhost with Layercode webhooks:

1. **Start the Layercode tunnel** (in a separate terminal):
   ```bash
   npx @layercode/cli tunnel --path=/api/layercode/webhook --port=3000 --tail
   ```
   This automatically updates the webhook URL in your Layercode agent dashboard.

2. **Start the dev server** (in another terminal):
   ```bash
   npm run dev
   ```

3. Test the voice widget on any page with the widget installed.

4. Stop the tunnel with `Ctrl-C` when done testing.

