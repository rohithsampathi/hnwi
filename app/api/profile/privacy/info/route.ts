import { NextRequest, NextResponse } from 'next/server';

// Public endpoint - no authentication required
export async function GET(request: NextRequest) {
  try {
    const privacyInfo = {
      policy: {
        version: "1.0",
        last_updated: "2024-12-01",
        effective_date: "2024-12-01",
        summary: "HNWI Chronicles follows GDPR compliance standards to protect your privacy and data."
      },
      compliance: {
        gdpr_compliant: true,
        data_controller: "HNWI Chronicles Ltd.",
        contact_email: "privacy@hnwichronicles.com",
        data_retention_period: "As long as your account is active, plus 3 years for compliance"
      },
      user_rights: [
        "Right to access your personal data",
        "Right to correct inaccurate data",
        "Right to delete your personal data",
        "Right to restrict data processing",
        "Right to data portability",
        "Right to object to processing",
        "Right to withdraw consent"
      ]
    };

    return NextResponse.json({
      success: true,
      data: privacyInfo
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch privacy information'
    }, { status: 500 });
  }
}