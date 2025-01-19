// src/encryption/csfle-schema.ts

export const KEY_VAULT_NAMESPACE = 'encryption.__keyVault';

/**
 * We'll assume your DB name is "myDatabase".
 * Each key is "<dbName>.<collectionName>".
 *
 * For example, if you used `@Schema({ collection: 'answers' })`,
 * the namespace is "myDatabase.answers".
 */
export const schemaMap = {
  // USERS
  'myDatabase.users': {
    bsonType: 'object',
    encryptMetadata: {
      keyId: [{ keyAltName: 'myLocalDataKey' }],
    },
    properties: {
      first_name: {
        bsonType: 'string',
        encrypt: {
          bsonType: 'string',
          // Deterministic => can do equality queries on first_name
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
        },
      },
      last_name: {
        bsonType: 'string',
        encrypt: {
          bsonType: 'string',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
        },
      },
      password: {
        bsonType: 'string',
        encrypt: {
          bsonType: 'string',
          // If you store raw password (not typical—usually hashed):
          // We set random for better security (no queries)
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
        },
      },
      medicare_code: {
        bsonType: 'string',
        encrypt: {
          bsonType: 'string',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
        },
      },
      mobile_no: {
        bsonType: 'int', // or "long" if large phone numbers
        encrypt: {
          bsonType: 'int',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
        },
      },
      date_of_birth: {
        bsonType: 'date',
        encrypt: {
          bsonType: 'date',
          // random => can't do range queries
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
        },
      },
      // ... add any other sensitive user fields
    },
  },

  // VISITS
  'myDatabase.visits': {
    bsonType: 'object',
    encryptMetadata: {
      keyId: [{ keyAltName: 'myLocalDataKey' }],
    },
    properties: {
      summary: {
        bsonType: 'object',
        encrypt: {
          bsonType: 'object',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
        },
      },
      // skip encrypting "visitId" if it's used for queries or unique index
    },
  },

  // ANSWERS
  'myDatabase.answers': {
    bsonType: 'object',
    encryptMetadata: {
      keyId: [{ keyAltName: 'myLocalDataKey' }],
    },
    properties: {
      // The "answer" field is an array of objects
      // We'll treat it as array<objects> => must specify "bsonType": "array"
      answer: {
        bsonType: 'array',
        encrypt: {
          // The sub-schema is more complex if you want full encryption of each sub-field,
          // but for simplicity, we treat the entire "answer" array as random data.
          bsonType: 'array',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
        },
      },
    },
  },

  // CONSULTATIONS
  'myDatabase.consultations': {
    bsonType: 'object',
    encryptMetadata: {
      keyId: [{ keyAltName: 'myLocalDataKey' }],
    },
    properties: {
      consultationSummary: {
        bsonType: 'string',
        encrypt: {
          bsonType: 'string',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
        },
      },
      conversation: {
        bsonType: 'string',
        encrypt: {
          bsonType: 'string',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
        },
      },
    },
  },

  // DOCTOR-PATIENT ASSIGNMENT (maybe no sensitive data to encrypt)
  // We'll skip or only add if you consider "assignedDate" to be sensitive
  'myDatabase.doctorpatientassignments': {
    bsonType: 'object',
    encryptMetadata: {
      keyId: [{ keyAltName: 'myLocalDataKey' }],
    },
    properties: {
      assignedDate: {
        bsonType: 'date',
        encrypt: {
          bsonType: 'date',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
        },
      },
    },
  },

  // QUESTION CATEGORIES (question-categories)
  'myDatabase.question-categories': {
    bsonType: 'object',
    encryptMetadata: {
      keyId: [{ keyAltName: 'myLocalDataKey' }],
    },
    properties: {
      name: {
        bsonType: 'string',
        encrypt: {
          bsonType: 'string',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
        },
      },
      // Typically "questions" field is just an array of ObjectIds => no encryption needed
    },
  },

  // QUESTIONS (collection name: "questions")
  'myDatabase.questions': {
    bsonType: 'object',
    encryptMetadata: {
      keyId: [{ keyAltName: 'myLocalDataKey' }],
    },
    properties: {
      text: {
        bsonType: 'string',
        encrypt: {
          bsonType: 'string',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
        },
      },
      description: {
        bsonType: 'string',
        encrypt: {
          bsonType: 'string',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
        },
      },
      // If you want to encrypt "placeholder", "scale.description", "subQuestions", etc.,
      // you'd have to carefully structure them. For nested arrays/objects, you may need
      // a more advanced approach or "Queryable Encryption" in MongoDB 6.0+.
    },
  },
};
