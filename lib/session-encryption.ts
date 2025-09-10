import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.MFA_SESSION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-gcm'

export class SessionEncryption {
  static encrypt(data: any): string {
    try {
      const text = JSON.stringify(data)
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
      
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const authTag = cipher.getAuthTag()
      
      // Combine iv, authTag, and encrypted data
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
    } catch (error) {
      throw new Error('Failed to encrypt session data')
    }
  }

  static decrypt(encryptedData: string): any {
    try {
      const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
      
      if (!ivHex || !authTagHex || !encrypted) {
        throw new Error('Invalid encrypted data format')
      }
      
      const iv = Buffer.from(ivHex, 'hex')
      const authTag = Buffer.from(authTagHex, 'hex')
      
      const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
      decipher.setAuthTag(authTag)
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return JSON.parse(decrypted)
    } catch (error) {
      throw new Error('Failed to decrypt session data')
    }
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }
}