# Gemini Imagen MCP Server

A TypeScript-based MCP server that provides image generation capabilities using Google's Gemini Imagen API. This server allows you to generate high-quality images with customizable parameters through the Model Context Protocol.

## Features

### Tools
- `generate_image` - Generate images using Google Gemini Imagen
  - **prompt** (required): Text description for image generation
  - **numberOfImages** (optional): Number of images to generate (1-4, default: 1)
  - **aspectRatio** (optional): Image aspect ratio (default: "9:16")
  - **sampleImageSize** (optional): Image resolution (default: "2K")
  - **personGeneration** (optional): Control person generation (default: "allow_adult")

## Parameter Options

### aspectRatio
Controls the aspect ratio of generated images:
- `"1:1"` - Square format
- `"3:4"` - Portrait format
- `"4:3"` - Landscape format  
- `"9:16"` - Vertical format (default)
- `"16:9"` - Horizontal format

### sampleImageSize
Controls the resolution of generated images (Standard and Ultra models only):
- `"1K"` - Lower resolution
- `"2K"` - Higher resolution (default)

### personGeneration
Controls whether the model can generate images of people:
- `"dont_allow"` - Block generation of people
- `"allow_adult"` - Generate adults only (default)
- `"allow_all"` - Generate adults and children

## Usage Examples

### Basic Usage (Default Settings)
```json
{
  "prompt": "A beautiful sunset over mountains"
}
```
This will use default settings:
- aspectRatio: "9:16"
- sampleImageSize: "2K"
- personGeneration: "allow_adult"

### Custom Parameters
```json
{
  "prompt": "A cute cat playing with a ball",
  "aspectRatio": "1:1",
  "sampleImageSize": "1K",
  "personGeneration": "dont_allow",
  "numberOfImages": 2
}
```

### Portrait Photography
```json
{
  "prompt": "Professional headshot of a business person",
  "aspectRatio": "3:4",
  "sampleImageSize": "2K",
  "personGeneration": "allow_adult"
}
```

### Landscape Photography
```json
{
  "prompt": "Panoramic view of a mountain range at dawn",
  "aspectRatio": "16:9",
  "sampleImageSize": "2K"
}
```

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

### Method 1: Using npx (Recommended)

Add the server config to your MCP client:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "npx",
      "args": ["/path/to/gemini-imagen-server/build/index.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY"
      }
    }
  }
}
```

### Method 2: Using node directly

```json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "node",
      "args": ["/path/to/gemini-imagen-server/build/index.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY"
      }
    }
  }
}
```

## Configuration

### API Key Setup

The `GEMINI_API_KEY` can be provided in two ways:

1. **Environment variable in MCP config** (recommended):
```json
{
  "mcpServers": {
    "gemini-imagen": {
      "command": "npx",
      "args": ["/path/to/gemini-imagen-server/build/index.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY"
      }
    }
  }
}
```

2. **System environment variable**:
```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key
5. Copy the key and use it in your configuration

## Output

Generated images are saved to `/tmp/` with timestamped filenames:
- Format: `generated_image_[timestamp]_[index].png`
- Example: `generated_image_1758733788860_0.png`

## Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

## Error Handling

The server includes comprehensive error handling:
- Invalid parameters are validated and rejected
- API errors are caught and reported with helpful messages
- Missing API keys are detected and reported clearly
- Network issues are handled gracefully

## License

This project is licensed under the MIT License.
