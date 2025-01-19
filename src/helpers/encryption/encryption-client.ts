// src/encryption/csfle-client.ts
import { MongoClient } from 'mongodb';
import { schemaMap, KEY_VAULT_NAMESPACE } from './encryption-schema';
import * as dotenv from 'dotenv';
dotenv.config();

export async function createEncryptedClient(uri: string) {
  const kmsProviders = {
    local: {
      key: Buffer.from(process.env.ENCRYPTION_MASTER_KEY, 'base64'),
    },
  };

  const autoEncryption = {
    keyVaultNamespace: KEY_VAULT_NAMESPACE,
    kmsProviders,
    schemaMap,
  };

  const client = new MongoClient(uri, {
    autoEncryption,
  });

  await client.connect();
  return client;
}
