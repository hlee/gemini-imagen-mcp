#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const GEMINI_API_KEY: string = process.env.GEMINI_API_KEY!;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const isValidGenerateImageArgs = (
  args: any
): args is { prompt: string; numberOfImages?: number } =>
  typeof args === "object" &&
  args !== null &&
  typeof args.prompt === "string" &&
  (args.numberOfImages === undefined || typeof args.numberOfImages === "number");

class GeminiImagenServer {
  private server: Server;
  private genAI: GoogleGenAI;

  constructor() {
    this.server = new Server(
      {
        name: "gemini-imagen-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "generate_image",
          description: "Generate images using Google Gemini Imagen",
          inputSchema: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "The prompt for image generation",
              },
              numberOfImages: {
                type: "number",
                description: "Number of images to generate (1-4)",
                minimum: 1,
                maximum: 4,
              },
            },
            required: ["prompt"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== "generate_image") {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      if (!isValidGenerateImageArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "Invalid generate_image arguments"
        );
      }

      const prompt = request.params.arguments.prompt;
      const numberOfImages = request.params.arguments.numberOfImages || 1;

      try {
        const response = await this.genAI.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: numberOfImages,
          },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
          throw new McpError(ErrorCode.InternalError, "No images generated.");
        }

        const generatedImages = response.generatedImages.map(
          (generatedImage: any) => generatedImage.image.imageBytes
        );

        const imageBuffers = generatedImages.map((imageData: string) => Buffer.from(imageData, "base64"));
        const filePaths: string[] = [];

        for (let i = 0; i < imageBuffers.length; i++) {
          const filePath = `/tmp/generated_image_${Date.now()}_${i}.png`;
          fs.writeFileSync(filePath, imageBuffers[i]);
          filePaths.push(filePath);
        }

        return {
          content: [{
            type: "text",
            text: `Generated images saved to: ${filePaths.join(", ")}`
          }],
        };
      } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Image generation failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Gemini Imagen MCP server running on stdio");
  }
}

const server = new GeminiImagenServer();
server.run().catch(console.error);
