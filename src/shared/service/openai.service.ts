import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';
import fetch from 'node-fetch';

@Injectable()
export class OpenAiService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is loaded from the environment
    });
  }

  getClient(): OpenAI {
    return this.openai;
  }
async transcribeVoiceToText(audioFilePath: string): Promise<string> {
  try {
    console.log("Processing audio file:", audioFilePath);

    // Check file size
    const stats = fs.statSync(audioFilePath);
    const fileSizeInBytes = stats.size;

    if (fileSizeInBytes < 100) { // Skip very small files
      console.warn(`Skipping chunk: ${audioFilePath} (too short: ${fileSizeInBytes} bytes)`);
      return "";
    }

    // Read file as Buffer.
    const fileData = fs.readFileSync(audioFilePath);

    // Determine MIME type and filename based on file extension.
    const ext = path.extname(audioFilePath).toLowerCase();
    let filename: string, contentType: string;

    if (ext === ".mp4") {
      filename = "audio.mp4";
      contentType = "audio/mp4";
    } else {
      filename = "audio.webm";
      contentType = "audio/webm";
    }

    // Create a new FormData instance.
    const formData = new FormData();
    formData.append("file", fileData, { filename, contentType });
    formData.append("model", "whisper-1");

    // Send the request to OpenAI's transcription endpoint.
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData as any, // Casting to any to satisfy TypeScript
    });

    if (!response.ok) {
      const errorBody = await response.json();
      if (errorBody?.code === "audio_too_short") {
        console.warn(`Skipping chunk ${audioFilePath} due to short length.`);
        return ""; // Skip this chunk instead of throwing an error
      }
      throw new Error(`Whisper transcription failed: ${JSON.stringify(errorBody)}`);
    }

    const result = await response.json();
    const transcript = result.text || "";
    console.log("API Response:", transcript);

    // Delete the chunk after processing
    fs.unlinkSync(audioFilePath);
    console.log(`Deleted processed chunk: ${audioFilePath}`);

    return transcript;
  } catch (err) {
    console.error("Error in transcribeVoiceToText:", err);
    throw err;
  }
}
  
}
