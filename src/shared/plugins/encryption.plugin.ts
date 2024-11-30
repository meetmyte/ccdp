import * as crypto from 'crypto';
import { Schema } from 'mongoose';
import * as dotEnv from 'dotenv';
dotEnv.config();

// Ensure environment variable is loaded
if (!process.env.ENCRYPTION_KEY) {
  throw new Error(
    'ENCRYPTION_KEY is not defined in the environment variables.',
  );
}

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); // Decode Base64 key
const IV_LENGTH = 16; // AES requires a 16-byte IV

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be a 32-byte Base64-encoded string.');
}

export function encrypt(value: any): string | null {
  if (value === null || value === undefined) return value;

  const iv = crypto.randomBytes(IV_LENGTH); // Generate a random IV
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(JSON.stringify(value), 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`; // Return IV and encrypted data
}

export function decrypt(value: string): any {
  if (value === null || value === undefined) return value;

  try {
    const [iv, encryptedData] = value.split(':');

    // Validate IV and encrypted data
    if (!iv || !encryptedData) {
      throw new Error(
        'Malformed encrypted data: IV or encrypted payload is missing.',
      );
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      ENCRYPTION_KEY,
      Buffer.from(iv, 'hex'),
    );
    let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null; // Return null if decryption fails
  }
}

export function encryptionPlugin(
  schema: Schema,
  options: { fields: string[] },
) {
  const fieldsToEncrypt = options.fields;

  // Encrypt fields before saving
  schema.pre('save', function (next) {
    fieldsToEncrypt.forEach((field) => {
      if (this[field] !== undefined && this[field] !== null) {
        this[field] = encrypt(this[field]);
      }
    });
    next();
  });

  // Decrypt fields after finding documents
  schema.post('init', function (doc) {
    fieldsToEncrypt.forEach((field) => {
      if (doc[field] !== undefined && doc[field] !== null) {
        const fieldValue = doc[field];
        if (typeof fieldValue === 'string') {
          doc[field] = decrypt(fieldValue); // Decrypt if it's a string
        }
      }
    });
  });

  // Decrypt fields when converting to JSON or Object
  schema.set('toJSON', {
    transform: (doc, ret) => {
      fieldsToEncrypt.forEach((field) => {
        const fieldValue = ret[field];
        if (
          fieldValue !== undefined &&
          fieldValue !== null &&
          typeof fieldValue === 'string'
        ) {
          ret[field] = decrypt(fieldValue);
        }
      });
      return ret;
    },
  });

  schema.set('toObject', {
    transform: (doc, ret) => {
      fieldsToEncrypt.forEach((field) => {
        const fieldValue = ret[field];
        if (
          fieldValue !== undefined &&
          fieldValue !== null &&
          typeof fieldValue === 'string'
        ) {
          ret[field] = decrypt(fieldValue);
        }
      });
      return ret;
    },
  });
}
