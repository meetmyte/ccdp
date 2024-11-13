import { Injectable } from '@nestjs/common';

@Injectable()
export class HelperService {
  generateUniqueCode(): string {
    const prefix = 'PT';

    // Generate a random 2-digit number (e.g., 01)
    const randomDigits = Math.floor(10 + Math.random() * 90).toString(); // Always 2 digits

    // Get the last 2 digits of the current timestamp in milliseconds
    const timestamp = Date.now().toString().slice(-2); // Ensures 2 digits from timestamp

    // Combine prefix, random digits, and timestamp to make a 6-character unique code
    const uniqueCode = `${prefix}${randomDigits}${timestamp}`;

    return uniqueCode;
  }
}
