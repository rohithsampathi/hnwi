import { AES256Encryption } from "./encryption";
import { AuditLogger, SecurityEventType, SeverityLevel } from "./audit-logger";

interface TrustScore {
  score: number; // 0-100
  factors: {
    deviceTrust: number;
    behaviorAnalysis: number;
    locationTrust: number;
    timeBasedTrust: number;
    authenticationStrength: number;
  };
  timestamp: number;
}

interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  touchSupport: boolean;
  webGLFingerprint?: string;
  canvasFingerprint?: string;
  audioFingerprint?: string;
}

interface AccessContext {
  userId: string;
  resource: string;
  action: string;
  deviceFingerprint: DeviceFingerprint;
  ipAddress?: string;
  location?: { lat: number; lng: number };
  timestamp: number;
}

export class ZeroTrustEngine {
  private static trustScores = new Map<string, TrustScore>();
  private static deviceFingerprints = new Map<string, DeviceFingerprint[]>();
  private static accessPatterns = new Map<string, AccessContext[]>();
  private static readonly TRUST_THRESHOLD = 70; // Minimum trust score for access
  private static readonly HIGH_RISK_THRESHOLD = 50; // Below this requires additional verification

  static async evaluateAccess(context: AccessContext): Promise<{
    allowed: boolean;
    trustScore: number;
    requiresMFA: boolean;
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    recommendations: string[];
  }> {
    const trustScore = await ZeroTrustEngine.calculateTrustScore(context);
    const riskLevel = ZeroTrustEngine.assessRiskLevel(trustScore.score);
    const recommendations = ZeroTrustEngine.generateRecommendations(trustScore, context);

    // Store trust score
    ZeroTrustEngine.trustScores.set(context.userId, trustScore);

    // Log access evaluation
    AuditLogger.log({
      type: SecurityEventType.DATA_ACCESS,
      severity: trustScore.score < ZeroTrustEngine.HIGH_RISK_THRESHOLD ? SeverityLevel.WARNING : SeverityLevel.INFO,
      userId: context.userId,
      action: `Zero-trust evaluation for ${context.resource}`,
      details: {
        trustScore: trustScore.score,
        riskLevel,
        resource: context.resource,
        action: context.action
      },
      success: trustScore.score >= ZeroTrustEngine.TRUST_THRESHOLD
    });

    // Record access pattern
    ZeroTrustEngine.recordAccessPattern(context);

    return {
      allowed: trustScore.score >= ZeroTrustEngine.TRUST_THRESHOLD,
      trustScore: trustScore.score,
      requiresMFA: trustScore.score < ZeroTrustEngine.HIGH_RISK_THRESHOLD || 
                   ZeroTrustEngine.isHighValueResource(context.resource),
      riskLevel,
      recommendations
    };
  }

  private static async calculateTrustScore(context: AccessContext): Promise<TrustScore> {
    const deviceTrust = await ZeroTrustEngine.evaluateDeviceTrust(context);
    const behaviorAnalysis = await ZeroTrustEngine.analyzeBehavior(context);
    const locationTrust = await ZeroTrustEngine.evaluateLocationTrust(context);
    const timeBasedTrust = ZeroTrustEngine.evaluateTimeBasedTrust(context);
    const authenticationStrength = ZeroTrustEngine.evaluateAuthenticationStrength(context);

    // Weighted average of trust factors
    const weights = {
      deviceTrust: 0.25,
      behaviorAnalysis: 0.3,
      locationTrust: 0.15,
      timeBasedTrust: 0.1,
      authenticationStrength: 0.2
    };

    const score = Math.round(
      deviceTrust * weights.deviceTrust +
      behaviorAnalysis * weights.behaviorAnalysis +
      locationTrust * weights.locationTrust +
      timeBasedTrust * weights.timeBasedTrust +
      authenticationStrength * weights.authenticationStrength
    );

    return {
      score: Math.min(100, Math.max(0, score)),
      factors: {
        deviceTrust,
        behaviorAnalysis,
        locationTrust,
        timeBasedTrust,
        authenticationStrength
      },
      timestamp: Date.now()
    };
  }

  private static async evaluateDeviceTrust(context: AccessContext): Promise<number> {
    const knownDevices = ZeroTrustEngine.deviceFingerprints.get(context.userId) || [];
    
    // Check if device is known
    const isKnownDevice = knownDevices.some(device => 
      ZeroTrustEngine.compareFingerprints(device, context.deviceFingerprint)
    );

    if (isKnownDevice) {
      return 90; // High trust for known devices
    }

    // Check for suspicious device characteristics
    let trustScore = 50; // Base score for unknown device

    // Check for automated tools
    if (context.deviceFingerprint.hardwareConcurrency === 0) {
      trustScore -= 20; // Possible headless browser
    }

    // Check for touch support consistency
    const isMobile = /mobile|android|iphone/i.test(context.deviceFingerprint.userAgent);
    if (isMobile && !context.deviceFingerprint.touchSupport) {
      trustScore -= 15; // Inconsistent mobile detection
    }

    // Check for common spoofing patterns
    if (context.deviceFingerprint.platform === "Win32" && 
        context.deviceFingerprint.userAgent.includes("Mac")) {
      trustScore -= 25; // Platform mismatch
    }

    return Math.max(0, trustScore);
  }

  private static async analyzeBehavior(context: AccessContext): Promise<number> {
    const patterns = ZeroTrustEngine.accessPatterns.get(context.userId) || [];
    
    if (patterns.length < 5) {
      return 60; // Not enough data for behavior analysis
    }

    let trustScore = 80;

    // Analyze access frequency
    const recentAccess = patterns.filter(p => 
      context.timestamp - p.timestamp < 3600000 // Last hour
    );

    if (recentAccess.length > 50) {
      trustScore -= 30; // Unusual high frequency
    }

    // Check for resource access patterns
    const resourceAccess = patterns.filter(p => p.resource === context.resource);
    if (resourceAccess.length === 0 && ZeroTrustEngine.isHighValueResource(context.resource)) {
      trustScore -= 20; // First time accessing high-value resource
    }

    // Check for action patterns
    const unusualActions = ["DELETE", "EXPORT", "MODIFY_PERMISSIONS"];
    if (unusualActions.includes(context.action)) {
      const previousActions = patterns.filter(p => p.action === context.action);
      if (previousActions.length === 0) {
        trustScore -= 15; // First time performing sensitive action
      }
    }

    return Math.max(0, trustScore);
  }

  private static async evaluateLocationTrust(context: AccessContext): Promise<number> {
    if (!context.location) {
      return 50; // Unknown location
    }

    let trustScore = 70;

    // Check for impossible travel
    const patterns = ZeroTrustEngine.accessPatterns.get(context.userId) || [];
    const recentPattern = patterns[patterns.length - 1];

    if (recentPattern?.location) {
      const distance = ZeroTrustEngine.calculateDistance(
        recentPattern.location,
        context.location
      );
      const timeDiff = (context.timestamp - recentPattern.timestamp) / 1000 / 60; // Minutes

      // Check for impossible travel (>500km/h)
      if (distance > (timeDiff * 8.33)) {
        trustScore -= 40; // Impossible travel detected
      }
    }

    // Check for known risky locations
    const riskyCountries = ["KP", "IR", "SY"]; // Example high-risk countries
    // In production, would use IP geolocation to determine country
    // For now, this is a placeholder

    return Math.max(0, trustScore);
  }

  private static evaluateTimeBasedTrust(context: AccessContext): Promise<number> {
    const hour = new Date(context.timestamp).getHours();
    const dayOfWeek = new Date(context.timestamp).getDay();

    let trustScore = 80;

    // Check for unusual access times
    if (hour >= 2 && hour <= 5) {
      trustScore -= 20; // Late night access
    }

    // Check weekend access for business resources
    if ((dayOfWeek === 0 || dayOfWeek === 6) && 
        ZeroTrustEngine.isBusinessResource(context.resource)) {
      trustScore -= 10; // Weekend access to business resources
    }

    return Math.max(0, trustScore);
  }

  private static evaluateAuthenticationStrength(context: AccessContext): number {
    // In production, would check actual authentication methods used
    // For now, return a base score
    return 70;
  }

  private static compareFingerprints(fp1: DeviceFingerprint, fp2: DeviceFingerprint): boolean {
    const hash1 = AES256Encryption.hash(JSON.stringify(fp1));
    const hash2 = AES256Encryption.hash(JSON.stringify(fp2));
    return hash1 === hash2;
  }

  private static calculateDistance(loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static assessRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (score >= 80) return "LOW";
    if (score >= 60) return "MEDIUM";
    if (score >= 40) return "HIGH";
    return "CRITICAL";
  }

  private static generateRecommendations(trustScore: TrustScore, context: AccessContext): string[] {
    const recommendations: string[] = [];

    if (trustScore.factors.deviceTrust < 50) {
      recommendations.push("Enable device registration for trusted access");
    }

    if (trustScore.factors.behaviorAnalysis < 60) {
      recommendations.push("Unusual behavior detected - verify user identity");
    }

    if (trustScore.factors.locationTrust < 50) {
      recommendations.push("Access from unusual location - additional verification required");
    }

    if (trustScore.factors.authenticationStrength < 70) {
      recommendations.push("Enable multi-factor authentication for enhanced security");
    }

    if (trustScore.score < ZeroTrustEngine.HIGH_RISK_THRESHOLD) {
      recommendations.push("High-risk access attempt - manual review recommended");
    }

    return recommendations;
  }

  private static isHighValueResource(resource: string): boolean {
    const highValueResources = [
      "crown-vault",
      "investment-portfolio",
      "transaction-history",
      "personal-data",
      "financial-statements"
    ];
    return highValueResources.some(hvr => resource.includes(hvr));
  }

  private static isBusinessResource(resource: string): boolean {
    const businessResources = [
      "financial",
      "investment",
      "portfolio",
      "transaction",
      "report"
    ];
    return businessResources.some(br => resource.includes(br));
  }

  private static recordAccessPattern(context: AccessContext): void {
    const patterns = ZeroTrustEngine.accessPatterns.get(context.userId) || [];
    patterns.push(context);
    
    // Keep only last 100 patterns
    if (patterns.length > 100) {
      patterns.shift();
    }
    
    ZeroTrustEngine.accessPatterns.set(context.userId, patterns);
  }

  static registerDevice(userId: string, fingerprint: DeviceFingerprint): void {
    const devices = ZeroTrustEngine.deviceFingerprints.get(userId) || [];
    
    // Check if device already registered
    if (!devices.some(d => ZeroTrustEngine.compareFingerprints(d, fingerprint))) {
      devices.push(fingerprint);
      ZeroTrustEngine.deviceFingerprints.set(userId, devices);

      AuditLogger.log({
        type: SecurityEventType.DATA_MODIFICATION,
        severity: SeverityLevel.INFO,
        userId,
        action: "Device registered for zero-trust",
        details: { deviceHash: AES256Encryption.hash(JSON.stringify(fingerprint)).substring(0, 8) },
        success: true
      });
    }
  }

  static async getDeviceFingerprint(): Promise<DeviceFingerprint> {
    const fingerprint: DeviceFingerprint = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory,
      touchSupport: "ontouchstart" in window,
      webGLFingerprint: await ZeroTrustEngine.getWebGLFingerprint(),
      canvasFingerprint: ZeroTrustEngine.getCanvasFingerprint(),
      audioFingerprint: await ZeroTrustEngine.getAudioFingerprint()
    };

    return fingerprint;
  }

  private static async getWebGLFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "";

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) return "";

      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      return AES256Encryption.hash(`${vendor}:${renderer}`).substring(0, 16);
    } catch {
      return "";
    }
  }

  private static getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";

      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Canvas fingerprint", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("Canvas fingerprint", 4, 17);

      return AES256Encryption.hash(canvas.toDataURL()).substring(0, 16);
    } catch {
      return "";
    }
  }

  private static async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0; // Mute
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(0);
      
      return new Promise((resolve) => {
        scriptProcessor.onaudioprocess = (event) => {
          const output = event.inputBuffer.getChannelData(0);
          oscillator.stop();
          scriptProcessor.disconnect();
          analyser.disconnect();
          gainNode.disconnect();
          
          const hash = AES256Encryption.hash(output.slice(0, 100).toString()).substring(0, 16);
          resolve(hash);
        };

        setTimeout(() => resolve(""), 100); // Timeout fallback
      });
    } catch {
      return "";
    }
  }
}