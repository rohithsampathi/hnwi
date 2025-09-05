// lib/device-trust.ts - Device Trust Management for HNWI Chronicles

interface DeviceTrust {
  deviceId: string;
  userId: string;
  trustExpiry: number; // 7 days from creation
  created: number;
  lastUsed: number;
  userAgent: string;
  deviceFingerprint: string;
}

interface TrustedDevice {
  deviceId: string;
  name: string;
  lastUsed: Date;
  created: Date;
}

const DEVICE_TRUST_KEY = 'hnwi_device_trust';
const TRUSTED_DEVICES_KEY = 'hnwi_trusted_devices';
const TRUST_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export class DeviceTrustManager {
  
  // Generate a unique device fingerprint
  private static generateDeviceFingerprint(): string {
    if (typeof window === 'undefined') return '';
    
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.cookieEnabled ? '1' : '0'
    ];
    
    // Create a simple hash from device characteristics
    const fingerprint = components.join('|');
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  // Generate a unique device ID
  private static generateDeviceId(): string {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get or create device trust record
  static getDeviceTrust(userId: string): DeviceTrust | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(DEVICE_TRUST_KEY);
      if (!stored) return null;
      
      const trust: DeviceTrust = JSON.parse(stored);
      
      // Check if trust is expired
      if (Date.now() > trust.trustExpiry) {
        localStorage.removeItem(DEVICE_TRUST_KEY);
        return null;
      }
      
      // Check if it's for the current user
      if (trust.userId !== userId) {
        return null;
      }
      
      // Verify device fingerprint hasn't changed significantly
      const currentFingerprint = this.generateDeviceFingerprint();
      if (trust.deviceFingerprint !== currentFingerprint) {
        console.warn('Device fingerprint mismatch - device may have changed');
        // Don't remove trust immediately, but flag it
      }
      
      return trust;
    } catch (error) {
      console.error('Error reading device trust:', error);
      localStorage.removeItem(DEVICE_TRUST_KEY);
      return null;
    }
  }

  // Check if current device is trusted
  static isDeviceTrusted(userId: string): boolean {
    const trust = this.getDeviceTrust(userId);
    return trust !== null;
  }

  // Establish device trust
  static trustDevice(userId: string): DeviceTrust {
    if (typeof window === 'undefined') {
      throw new Error('Device trust can only be established in browser');
    }

    const deviceTrust: DeviceTrust = {
      deviceId: this.generateDeviceId(),
      userId,
      trustExpiry: Date.now() + TRUST_DURATION,
      created: Date.now(),
      lastUsed: Date.now(),
      userAgent: navigator.userAgent,
      deviceFingerprint: this.generateDeviceFingerprint()
    };

    localStorage.setItem(DEVICE_TRUST_KEY, JSON.stringify(deviceTrust));
    
    // Also store in trusted devices list for user management
    this.addToTrustedDevicesList(deviceTrust);
    
    return deviceTrust;
  }

  // Update last used timestamp
  static updateLastUsed(userId: string): void {
    const trust = this.getDeviceTrust(userId);
    if (trust) {
      trust.lastUsed = Date.now();
      localStorage.setItem(DEVICE_TRUST_KEY, JSON.stringify(trust));
    }
  }

  // Remove device trust
  static removeTrust(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DEVICE_TRUST_KEY);
  }

  // Get time remaining for device trust
  static getTrustTimeRemaining(userId: string): number {
    const trust = this.getDeviceTrust(userId);
    if (!trust) return 0;
    
    return Math.max(0, trust.trustExpiry - Date.now());
  }

  // Get human readable time remaining
  static getTrustTimeRemainingText(userId: string): string {
    const remaining = this.getTrustTimeRemaining(userId);
    if (remaining === 0) return 'Device not trusted';
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    } else {
      return 'Less than 1 hour remaining';
    }
  }

  // Add device to trusted devices list (for user management UI)
  private static addToTrustedDevicesList(trust: DeviceTrust): void {
    try {
      const existing = localStorage.getItem(TRUSTED_DEVICES_KEY);
      let devices: TrustedDevice[] = existing ? JSON.parse(existing) : [];
      
      // Generate a friendly device name
      const deviceName = this.generateDeviceName(trust.userAgent);
      
      const newDevice: TrustedDevice = {
        deviceId: trust.deviceId,
        name: deviceName,
        created: new Date(trust.created),
        lastUsed: new Date(trust.lastUsed)
      };
      
      // Remove any existing device with same ID and add the new one
      devices = devices.filter(d => d.deviceId !== trust.deviceId);
      devices.push(newDevice);
      
      // Keep only last 10 devices
      devices = devices.sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime()).slice(0, 10);
      
      localStorage.setItem(TRUSTED_DEVICES_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error('Error updating trusted devices list:', error);
    }
  }

  // Generate friendly device name from user agent
  private static generateDeviceName(userAgent: string): string {
    // Simple device name extraction
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    
    return 'Unknown Device';
  }

  // Get list of trusted devices for user management
  static getTrustedDevices(): TrustedDevice[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(TRUSTED_DEVICES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading trusted devices:', error);
      return [];
    }
  }

  // Remove specific trusted device
  static removeTrustedDevice(deviceId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const devices = this.getTrustedDevices();
      const filtered = devices.filter(d => d.deviceId !== deviceId);
      localStorage.setItem(TRUSTED_DEVICES_KEY, JSON.stringify(filtered));
      
      // If removing current device, also remove trust
      const currentTrust = JSON.parse(localStorage.getItem(DEVICE_TRUST_KEY) || '{}');
      if (currentTrust.deviceId === deviceId) {
        this.removeTrust();
      }
    } catch (error) {
      console.error('Error removing trusted device:', error);
    }
  }

  // Clear all trusted devices
  static clearAllTrustedDevices(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(TRUSTED_DEVICES_KEY);
    localStorage.removeItem(DEVICE_TRUST_KEY);
  }

  // Check if 2FA should be skipped based on device trust
  static shouldSkip2FA(userId: string): boolean {
    return this.isDeviceTrusted(userId);
  }

  // Get device info for display
  static getCurrentDeviceInfo(): { name: string; fingerprint: string } | null {
    if (typeof window === 'undefined') return null;
    
    return {
      name: this.generateDeviceName(navigator.userAgent),
      fingerprint: this.generateDeviceFingerprint()
    };
  }
}

export default DeviceTrustManager;