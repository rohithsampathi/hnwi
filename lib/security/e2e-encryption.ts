import { AES256Encryption } from "./encryption";

interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

interface EncryptedMessage {
  encryptedContent: string;
  encryptedKey: string;
  iv: string;
  signature: string;
  senderPublicKey: string;
  timestamp: number;
}

export class E2EEncryption {
  private static keyPairs = new Map<string, KeyPair>();
  private static publicKeys = new Map<string, CryptoKey>();

  // Generate RSA key pair for asymmetric encryption
  static async generateKeyPair(userId: string): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
      true,
      ["encrypt", "decrypt"]
    );

    // Store key pair
    E2EEncryption.keyPairs.set(userId, keyPair);

    // Export keys
    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: E2EEncryption.arrayBufferToBase64(publicKey),
      privateKey: E2EEncryption.arrayBufferToBase64(privateKey)
    };
  }

  // Generate ECDSA key pair for digital signatures
  static async generateSigningKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-384"
      },
      true,
      ["sign", "verify"]
    );

    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: E2EEncryption.arrayBufferToBase64(publicKey),
      privateKey: E2EEncryption.arrayBufferToBase64(privateKey)
    };
  }

  // Encrypt message for specific recipient
  static async encryptMessage(
    content: string,
    recipientPublicKey: string,
    senderPrivateKey: string
  ): Promise<EncryptedMessage> {
    // Generate AES key for content encryption
    const aesKey = await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt content with AES
    const encoder = new TextEncoder();
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      aesKey,
      encoder.encode(content)
    );

    // Import recipient's public key
    const recipientKey = await E2EEncryption.importPublicKey(recipientPublicKey, "RSA-OAEP");

    // Encrypt AES key with recipient's public key
    const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);
    const encryptedKey = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      recipientKey,
      exportedAesKey
    );

    // Sign the message
    const messageToSign = new Uint8Array([
      ...new Uint8Array(encryptedContent),
      ...new Uint8Array(encryptedKey),
      ...iv
    ]);

    const signingKey = await E2EEncryption.importPrivateKey(senderPrivateKey, "ECDSA");
    const signature = await crypto.subtle.sign(
      {
        name: "ECDSA",
        hash: "SHA-384"
      },
      signingKey,
      messageToSign
    );

    // Get sender's public key for verification
    const senderKeyPair = await E2EEncryption.generateSigningKeyPair();

    return {
      encryptedContent: E2EEncryption.arrayBufferToBase64(encryptedContent),
      encryptedKey: E2EEncryption.arrayBufferToBase64(encryptedKey),
      iv: E2EEncryption.arrayBufferToBase64(iv),
      signature: E2EEncryption.arrayBufferToBase64(signature),
      senderPublicKey: senderKeyPair.publicKey,
      timestamp: Date.now()
    };
  }

  // Decrypt message
  static async decryptMessage(
    encryptedMessage: EncryptedMessage,
    recipientPrivateKey: string
  ): Promise<{ content: string; verified: boolean }> {
    try {
      // Import recipient's private key
      const privateKey = await E2EEncryption.importPrivateKey(recipientPrivateKey, "RSA-OAEP");

      // Decrypt AES key
      const encryptedKey = E2EEncryption.base64ToArrayBuffer(encryptedMessage.encryptedKey);
      const aesKeyBuffer = await crypto.subtle.decrypt(
        {
          name: "RSA-OAEP"
        },
        privateKey,
        encryptedKey
      );

      // Import AES key
      const aesKey = await crypto.subtle.importKey(
        "raw",
        aesKeyBuffer,
        {
          name: "AES-GCM",
          length: 256
        },
        false,
        ["decrypt"]
      );

      // Decrypt content
      const encryptedContent = E2EEncryption.base64ToArrayBuffer(encryptedMessage.encryptedContent);
      const iv = E2EEncryption.base64ToArrayBuffer(encryptedMessage.iv);
      
      const decryptedContent = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array(iv)
        },
        aesKey,
        encryptedContent
      );

      // Verify signature
      const senderPublicKey = await E2EEncryption.importPublicKey(encryptedMessage.senderPublicKey, "ECDSA");
      const messageToVerify = new Uint8Array([
        ...new Uint8Array(encryptedContent),
        ...new Uint8Array(encryptedKey),
        ...new Uint8Array(iv)
      ]);

      const signature = E2EEncryption.base64ToArrayBuffer(encryptedMessage.signature);
      const verified = await crypto.subtle.verify(
        {
          name: "ECDSA",
          hash: "SHA-384"
        },
        senderPublicKey,
        signature,
        messageToVerify
      );

      const decoder = new TextDecoder();
      return {
        content: decoder.decode(decryptedContent),
        verified
      };
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Failed to decrypt message");
    }
  }

  // Secure channel establishment using Diffie-Hellman
  static async establishSecureChannel(
    userId: string,
    peerId: string
  ): Promise<{ sharedSecret: string }> {
    // Generate ECDH key pair
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-384"
      },
      true,
      ["deriveBits"]
    );

    // Exchange public keys (in production, this would be done via secure server)
    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    
    // Simulate receiving peer's public key (in production, from server)
    const peerKeyPair = await crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-384"
      },
      true,
      ["deriveBits"]
    );
    const peerPublicKey = await crypto.subtle.exportKey("spki", peerKeyPair.publicKey);

    // Import peer's public key
    const importedPeerKey = await crypto.subtle.importKey(
      "spki",
      peerPublicKey,
      {
        name: "ECDH",
        namedCurve: "P-384"
      },
      false,
      []
    );

    // Derive shared secret
    const sharedSecret = await crypto.subtle.deriveBits(
      {
        name: "ECDH",
        public: importedPeerKey
      },
      keyPair.privateKey,
      384
    );

    return {
      sharedSecret: E2EEncryption.arrayBufferToBase64(sharedSecret)
    };
  }

  // Perfect Forward Secrecy - Generate ephemeral keys for each session
  static async generateEphemeralKeys(): Promise<{
    publicKey: string;
    privateKey: string;
    expiresAt: number;
  }> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-521"
      },
      true,
      ["deriveBits", "deriveKey"]
    );

    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: E2EEncryption.arrayBufferToBase64(publicKey),
      privateKey: E2EEncryption.arrayBufferToBase64(privateKey),
      expiresAt: Date.now() + 3600000 // 1 hour expiry
    };
  }

  // Secure file encryption
  static async encryptFile(
    file: File,
    recipientPublicKey: string
  ): Promise<{ encryptedFile: Blob; encryptedKey: string; metadata: any }> {
    // Read file
    const arrayBuffer = await file.arrayBuffer();
    
    // Generate AES key
    const aesKey = await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt file content
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      aesKey,
      arrayBuffer
    );

    // Import recipient's public key
    const recipientKey = await E2EEncryption.importPublicKey(recipientPublicKey, "RSA-OAEP");

    // Encrypt AES key
    const exportedAesKey = await crypto.subtle.exportKey("raw", aesKey);
    const encryptedKey = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      recipientKey,
      exportedAesKey
    );

    // Create metadata
    const metadata = {
      originalName: file.name,
      originalSize: file.size,
      mimeType: file.type,
      iv: E2EEncryption.arrayBufferToBase64(iv),
      encryptedAt: Date.now(),
      checksum: await E2EEncryption.calculateChecksum(arrayBuffer)
    };

    // Create encrypted blob
    const encryptedFile = new Blob([encryptedContent], { type: "application/octet-stream" });

    return {
      encryptedFile,
      encryptedKey: E2EEncryption.arrayBufferToBase64(encryptedKey),
      metadata
    };
  }

  // Helper functions
  private static async importPublicKey(keyData: string, algorithm: string): Promise<CryptoKey> {
    const keyBuffer = E2EEncryption.base64ToArrayBuffer(keyData);
    
    if (algorithm === "RSA-OAEP") {
      return crypto.subtle.importKey(
        "spki",
        keyBuffer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
        false,
        ["encrypt"]
      );
    } else if (algorithm === "ECDSA") {
      return crypto.subtle.importKey(
        "spki",
        keyBuffer,
        {
          name: "ECDSA",
          namedCurve: "P-384"
        },
        false,
        ["verify"]
      );
    }
    
    throw new Error("Unsupported algorithm");
  }

  private static async importPrivateKey(keyData: string, algorithm: string): Promise<CryptoKey> {
    const keyBuffer = E2EEncryption.base64ToArrayBuffer(keyData);
    
    if (algorithm === "RSA-OAEP") {
      return crypto.subtle.importKey(
        "pkcs8",
        keyBuffer,
        {
          name: "RSA-OAEP",
          hash: "SHA-256"
        },
        false,
        ["decrypt"]
      );
    } else if (algorithm === "ECDSA") {
      return crypto.subtle.importKey(
        "pkcs8",
        keyBuffer,
        {
          name: "ECDSA",
          namedCurve: "P-384"
        },
        false,
        ["sign"]
      );
    }
    
    throw new Error("Unsupported algorithm");
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private static async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return E2EEncryption.arrayBufferToBase64(hashBuffer);
  }
}