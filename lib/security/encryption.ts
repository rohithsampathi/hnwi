import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from "crypto";

interface EncryptedData {
  encryptedData: string;
  iv: string;
  salt: string;
  authTag: string;
  version: number;
}

interface HashOptions {
  algorithm?: "sha256" | "sha512" | "sha3-512";
  encoding?: "hex" | "base64";
}

export class AES256Encryption {
  private static ALGORITHM = "aes-256-gcm";
  private static KEY_LENGTH = 32;
  private static IV_LENGTH = 16;
  private static SALT_LENGTH = 64;
  private static TAG_LENGTH = 16;
  private static CURRENT_VERSION = 1;

  private static deriveKey(password: string, salt: Buffer): Buffer {
    return scryptSync(password, salt, AES256Encryption.KEY_LENGTH);
  }

  static encrypt(text: string, masterKey: string): EncryptedData {
    const salt = randomBytes(AES256Encryption.SALT_LENGTH);
    const key = AES256Encryption.deriveKey(masterKey, salt);
    const iv = randomBytes(AES256Encryption.IV_LENGTH);
    
    const cipher = createCipheriv(AES256Encryption.ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      iv: iv.toString("hex"),
      salt: salt.toString("hex"),
      authTag: authTag.toString("hex"),
      version: AES256Encryption.CURRENT_VERSION
    };
  }

  static decrypt(encryptedData: EncryptedData, masterKey: string): string {
    if (encryptedData.version !== AES256Encryption.CURRENT_VERSION) {
      throw new Error("Unsupported encryption version");
    }

    const salt = Buffer.from(encryptedData.salt, "hex");
    const key = AES256Encryption.deriveKey(masterKey, salt);
    const iv = Buffer.from(encryptedData.iv, "hex");
    const authTag = Buffer.from(encryptedData.authTag, "hex");
    
    const decipher = createDecipheriv(AES256Encryption.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  }

  static hash(data: string, options: HashOptions = {}): string {
    const { algorithm = "sha512", encoding = "hex" } = options;
    return createHash(algorithm).update(data).digest(encoding);
  }

  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString("hex");
  }

  static encryptObject<T extends object>(obj: T, masterKey: string): EncryptedData {
    return AES256Encryption.encrypt(JSON.stringify(obj), masterKey);
  }

  static decryptObject<T extends object>(encryptedData: EncryptedData, masterKey: string): T {
    const decrypted = AES256Encryption.decrypt(encryptedData, masterKey);
    return JSON.parse(decrypted) as T;
  }
}

export class SecureStorage {
  private static STORAGE_PREFIX = "hnwi_secure_";
  private static masterKey: string;

  static initialize(masterKey: string): void {
    SecureStorage.masterKey = masterKey;
  }

  static setItem(key: string, value: any): void {
    if (!SecureStorage.masterKey) {
      throw new Error("SecureStorage not initialized");
    }

    const encrypted = AES256Encryption.encryptObject(
      { value, timestamp: Date.now() },
      SecureStorage.masterKey
    );
    
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `${SecureStorage.STORAGE_PREFIX}${key}`,
        JSON.stringify(encrypted)
      );
    }
  }

  static getItem<T>(key: string): T | null {
    if (!SecureStorage.masterKey) {
      throw new Error("SecureStorage not initialized");
    }

    if (typeof window === "undefined") {
      return null;
    }

    const storedData = localStorage.getItem(`${SecureStorage.STORAGE_PREFIX}${key}`);
    if (!storedData) {
      return null;
    }

    try {
      const encrypted: EncryptedData = JSON.parse(storedData);
      const decrypted = AES256Encryption.decryptObject<{ value: T; timestamp: number }>(
        encrypted,
        SecureStorage.masterKey
      );
      return decrypted.value;
    } catch (error) {
      console.error("Failed to decrypt data:", error);
      return null;
    }
  }

  static removeItem(key: string): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`${SecureStorage.STORAGE_PREFIX}${key}`);
    }
  }

  static clear(): void {
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(SecureStorage.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}

export class DataMasking {
  static maskEmail(email: string): string {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domain}`;
  }

  static maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) return "***-***-****";
    return `***-***-${cleaned.slice(-4)}`;
  }

  static maskCreditCard(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, "");
    if (cleaned.length < 12) return "****-****-****-****";
    return `****-****-****-${cleaned.slice(-4)}`;
  }

  static maskSSN(ssn: string): string {
    const cleaned = ssn.replace(/\D/g, "");
    if (cleaned.length !== 9) return "***-**-****";
    return `***-**-${cleaned.slice(-4)}`;
  }

  static redactPII(text: string): string {
    text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL REDACTED]");
    text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE REDACTED]");
    text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN REDACTED]");
    text = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[CARD REDACTED]");
    return text;
  }
}