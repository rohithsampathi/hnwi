// components/gdpr-compliance-toggle.tsx
"use client"

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { secureApi } from '@/lib/secure-api'
import { Shield, Info, ExternalLink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface ConsentData {
  consent_granted: boolean
  consent_date: string
  explanation: string
}

interface PrivacyInfo {
  policy: {
    version: string
    last_updated: string
    effective_date: string
    summary: string
  }
  compliance: {
    gdpr_compliant: boolean
    data_controller: string
    contact_email: string
    data_retention_period: string
  }
  user_rights: string[]
}

export function GDPRComplianceToggle() {
  const [consent, setConsent] = useState<ConsentData | null>(null)
  const [privacyInfo, setPrivacyInfo] = useState<PrivacyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  // Fetch consent status and privacy info
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch both consent status and privacy info in parallel
        const [consentResponse, privacyResponse] = await Promise.all([
          secureApi.get('/api/profile/privacy/consent', true).catch(() => null),
          secureApi.get('/api/profile/privacy/info', false).catch(() => null) // Public endpoint
        ])

        if (consentResponse?.success) {
          setConsent(consentResponse.data)
        } else {
          // Default consent for existing users
          setConsent({
            consent_granted: true,
            consent_date: new Date().toISOString(),
            explanation: "GDPR consent for data processing and communication"
          })
        }

        if (privacyResponse?.success) {
          setPrivacyInfo(privacyResponse.data)
        }

      } catch (error) {
        // Set default values on error
        setConsent({
          consent_granted: true,
          consent_date: new Date().toISOString(),
          explanation: "GDPR consent for data processing and communication"
        })

        toast({
          title: "Info",
          description: "Using default privacy settings.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleConsentToggle = async (newConsent: boolean) => {
    if (!consent) return

    try {
      setUpdating(true)

      const response = await secureApi.post('/api/profile/privacy/consent', {
        consent_granted: newConsent
      }, true)

      if (response?.success) {
        setConsent({
          ...consent,
          consent_granted: newConsent,
          consent_date: new Date().toISOString()
        })

        toast({
          title: "Privacy Settings Updated",
          description: `Data processing consent has been ${newConsent ? 'granted' : 'withdrawn'}.`,
        })
      } else {
        throw new Error('Failed to update consent')
      }

    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span>Loading privacy settings...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="text-xl font-semibold">GDPR Data Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Control how we process your personal data in compliance with GDPR
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Consent Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">Data Processing Consent</h4>
              <Badge variant={consent?.consent_granted ? "default" : "destructive"} className="text-xs">
                {consent?.consent_granted ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Granted
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Withdrawn
                  </>
                )}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {consent?.explanation || "Allow HNWI Chronicles to process your personal data for service provision and communication."}
            </p>
            {consent?.consent_date && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(consent.consent_date).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {updating && <Loader2 className="w-4 h-4 animate-spin" />}
            <Switch
              checked={consent?.consent_granted || false}
              onCheckedChange={handleConsentToggle}
              disabled={updating}
              aria-label="Toggle GDPR consent"
            />
          </div>
        </div>

        {/* Privacy Information */}
        {privacyInfo && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium">Your Privacy Rights</h4>
            </div>

            {/* Compliance Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Data Controller</p>
                <p className="text-muted-foreground">{privacyInfo.compliance.data_controller}</p>
              </div>
              <div>
                <p className="font-medium mb-1">Contact</p>
                <a
                  href={`mailto:${privacyInfo.compliance.contact_email}`}
                  className="text-blue-500 hover:underline"
                >
                  {privacyInfo.compliance.contact_email}
                </a>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium mb-1">Data Retention</p>
                <p className="text-muted-foreground">{privacyInfo.compliance.data_retention_period}</p>
              </div>
            </div>

            {/* User Rights */}
            <div>
              <p className="font-medium mb-2">Under GDPR, you have the right to:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {privacyInfo.user_rights.map((right, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {right}
                  </li>
                ))}
              </ul>
            </div>

            {/* Privacy Policy Link */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/privacy-policy', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`mailto:${privacyInfo.compliance.contact_email}?subject=GDPR Data Request`, '_blank')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Exercise Rights
              </Button>
            </div>
          </div>
        )}

        {/* Warning for withdrawn consent */}
        {consent && !consent.consent_granted && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Consent Withdrawn
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Some features may be limited without data processing consent. You can re-enable consent at any time.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}