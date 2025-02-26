import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class HelperService {
  private s3: AWS.S3;
  private readonly bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME; // Define your bucket name in environment variables
  }
  generateUniqueCode(isPatient:boolean, isDoctor:boolean): string {
    let prefix:string = '';
    if (isDoctor == true) {
      prefix = 'DT';
    } 
    if (isPatient === true) {
      prefix = 'PT';
    }
    // Generate a random 2-digit number (e.g., 01)
    const randomDigits = Math.floor(10 + Math.random() * 90).toString(); // Always 2 digits

    // Get the last 2 digits of the current timestamp in milliseconds
    const timestamp = Date.now().toString().slice(-2); // Ensures 2 digits from timestamp

    // Combine prefix, random digits, and timestamp to make a 6-character unique code
    const uniqueCode = `${prefix}${randomDigits}${timestamp}`;

    return uniqueCode;
  }

  async uploadFile(file: any, name: string = null): Promise<string> {
    try {
      const fileKey = `${Date.now()}-${name}.${file.originalname.split('.').pop()}`;
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read', // Make the file publicly readable (optional)
      };

      const result = await this.s3.upload(params).promise();
      return result.Location; // Return the file URL
    } catch (error) {
      console.error('File upload error:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }
}
