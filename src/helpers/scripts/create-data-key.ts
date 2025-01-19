// scripts/create-data-key.ts

import { MongoClient, ClientEncryption } from 'mongodb';
// import { ClientEncryption } from 'mongodb-client-encryption';
import * as dotenv from 'dotenv';

dotenv.config();

async function createDataKey() {
  const MONGODB_URI =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/myDatabase';
  const keyVaultNamespace = 'encryption.__keyVault';

  const kmsProviders = {
    local: {
      key: Buffer.from(process.env.ENCRYPTION_MASTER_KEY, 'base64'),
    },
  };

  // Normal MongoClient (no autoEncryption)
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  // Create a ClientEncryption object
  const encryption = new ClientEncryption(client, {
    keyVaultNamespace,
    kmsProviders,
  });

  // Actually create the data key in the key vault
  const dataKeyId = await encryption.createDataKey('local', {
    keyAltNames: ['myLocalDataKey'], // optional "alias"
  });

  console.log('Created data key with _id:', dataKeyId);
  await client.close();
}

createDataKey().catch(console.error);
