import { Injectable } from '@nestjs/common';

@Injectable()
export class HelperService {
  generateUniqueCode(): string {
    const prefix = 'PT'; // Static or configurable prefix

    // Get the current timestamp in milliseconds
    const timestamp = Date.now().toString().slice(-6); // Extract last 6 digits of timestamp

    // Generate a random 3-digit number (e.g., 019)
    const randomDigits = Math.floor(100 + Math.random() * 900).toString(); // Ensures it's always 3 digits

    // Combine prefix, random digits, and timestamp
    const uniqueCode = `${prefix}${randomDigits}${timestamp}`;

    return uniqueCode;
  }
}
