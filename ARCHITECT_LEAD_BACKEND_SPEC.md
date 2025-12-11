# Architect Tier Lead Capture - Backend Implementation Specification

## Overview
When a user is classified as "Architect" tier in the Strategic DNA Simulation, they need to provide their email and WhatsApp number for personalized outreach. This document specifies the backend implementation required.

## Email Routing
- **Lead Notifications**: `rohith@montaigne.co` (Architect tier leads only)
- **General Support/Contact**: `hnwi@montaigne.co` (All other inquiries)

## API Endpoint
`POST /api/assessment/architect-inquiry`

## Request Payload
```json
{
  "session_id": "sess_xxx",
  "email": "user@example.com",
  "whatsapp": "+919876543210",
  "tier": "architect",
  "submitted_at": "2024-01-20T10:30:00Z",
  "source_ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "source": "assessment_results",
    "page_url": "https://app.hnwichronicles.com/assessment/results/sess_xxx"
  }
}
```

## Backend Implementation Requirements

### 1. Database Storage
Store the lead in MongoDB collection `architect_leads`:
```python
lead_document = {
    "session_id": request.session_id,
    "email": request.email,
    "whatsapp": request.whatsapp,
    "tier": "architect",
    "submitted_at": datetime.utcnow(),
    "source_ip": request.source_ip,
    "user_agent": request.user_agent,
    "metadata": request.metadata,
    "status": "new",  # new, contacted, converted
    "follow_up_date": None,
    "notes": "",
    # Link to assessment results
    "assessment_data": {
        "tier_confidence": 0.95,  # Get from session
        "simulation_outcome": "SURVIVED",  # Get from session
        "completed_at": session.completed_at
    }
}
```

### 2. Email Notifications

#### Email to Lead (User)
```python
def send_architect_welcome_email(email: str, session_id: str):
    """Send welcome email to Architect tier lead"""

    subject = "Welcome to HNWI Chronicles Architect Tier - Exclusive Access Awaits"

    html_content = """
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">HNWI Chronicles</h1>
            <p style="color: white; margin: 10px 0 0 0;">Strategic DNA Simulation - Architect Classification</p>
        </div>

        <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #DAA520;">Congratulations on Your Architect Classification!</h2>

            <p>Dear Strategic Thinker,</p>

            <p>Your simulation results reveal exceptional pattern recognition and strategic thinking capabilities that place you in our most exclusive tier: <strong>Architect</strong>.</p>

            <h3 style="color: #333;">What This Means for You:</h3>
            <ul>
                <li><strong>Privé Exchange Access:</strong> Opportunities starting at $500K+ unavailable to other tiers</li>
                <li><strong>Personal Strategy Session:</strong> 1-on-1 consultation with our wealth strategist</li>
                <li><strong>Custom Intelligence Blueprint:</strong> Tailored to your specific wealth profile</li>
                <li><strong>Founding Member Benefits:</strong> Lock in exclusive pricing and perks</li>
            </ul>

            <h3 style="color: #333;">Next Steps:</h3>
            <p>Within the next 24 hours, you'll receive:</p>
            <ol>
                <li>A WhatsApp message to schedule your personal onboarding call</li>
                <li>Your preliminary intelligence report based on your simulation</li>
                <li>Access credentials to preview Architect-tier features</li>
            </ol>

            <div style="background: #fff; padding: 20px; border-left: 4px solid #DAA520; margin: 20px 0;">
                <p style="margin: 0;"><em>"In the architecture of wealth, the Architect sees not just the structure, but the blueprint of possibility."</em></p>
            </div>

            <p>If you have immediate questions, feel free to reply to this email or WhatsApp us directly.</p>

            <p>Looking forward to building your wealth intelligence architecture together.</p>

            <p>Best regards,<br>
            <strong>Rohith Kumar</strong><br>
            Founder, HNWI Chronicles<br>
            <a href="mailto:hnwi@montaigne.co">hnwi@montaigne.co</a></p>
        </div>

        <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            <p>Session ID: {session_id}</p>
            <p>© 2024 HNWI Chronicles. Confidential and Proprietary.</p>
        </div>
    </body>
    </html>
    """.format(session_id=session_id)

    # Send using your email service (SendGrid, AWS SES, etc.)
    send_email(to=email, subject=subject, html=html_content)
```

#### Email to Rohith (Internal Lead Notification)
```python
def send_lead_notification_email(lead_data: dict):
    """Send lead notification to rohith@montaigne.co"""

    subject = f"🎯 New Architect Lead: {lead_data['email']}"

    # Get assessment results from database
    session = db.c10_assessments.find_one({"session_id": lead_data['session_id']})

    html_content = """
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>New Architect Tier Lead</h2>

        <h3>Contact Information:</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>WhatsApp:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{whatsapp}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Submitted At:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{submitted_at}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Session ID:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{session_id}</td></tr>
        </table>

        <h3>Simulation Results:</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Tier:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">Architect</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Confidence:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{confidence}%</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Simulation Outcome:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{outcome}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Completion Time:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{completion_time}s</td></tr>
        </table>

        <h3>Source Information:</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>IP Address:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{source_ip}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Page URL:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{page_url}</td></tr>
        </table>

        <h3>Key Answers:</h3>
        <ul>
            {answers_summary}
        </ul>

        <h3>Quick Actions:</h3>
        <p>
            <a href="https://wa.me/{whatsapp_clean}" style="background: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">WhatsApp Lead</a>
            <a href="mailto:{email}" style="background: #007BFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">Email Lead</a>
        </p>

        <p style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
            <strong>Follow-up Protocol:</strong><br>
            1. Send WhatsApp within 2 hours (business hours)<br>
            2. Schedule onboarding call within 24-48 hours<br>
            3. Prepare custom proposal based on simulation patterns<br>
            4. Close within 7 days
        </p>
    </body>
    </html>
    """

    # Format data
    formatted_html = html_content.format(
        email=lead_data['email'],
        whatsapp=lead_data['whatsapp'],
        whatsapp_clean=lead_data['whatsapp'].replace('+', '').replace(' ', ''),
        submitted_at=lead_data['submitted_at'],
        session_id=lead_data['session_id'],
        confidence=round(session.get('tier_confidence', 0.95) * 100, 1),
        outcome=session.get('simulation_outcome', 'SURVIVED'),
        completion_time=session.get('total_time', 0),
        source_ip=lead_data.get('source_ip', 'Unknown'),
        page_url=lead_data.get('metadata', {}).get('page_url', 'Unknown'),
        answers_summary=format_key_answers(session.get('answers', []))
    )

    # Send to Rohith
    send_email(
        to='rohith@montaigne.co',
        subject=subject,
        html=formatted_html,
        priority='high'
    )
```

### 3. Response Format
```python
@router.post("/api/assessment/architect-inquiry")
async def handle_architect_inquiry(request: ArchitectInquiryRequest):
    try:
        # 1. Validate input
        if not all([request.email, request.whatsapp, request.session_id]):
            raise HTTPException(400, "Missing required fields")

        # 2. Get session data
        session = await db.c10_assessments.find_one({"session_id": request.session_id})
        if not session:
            raise HTTPException(404, "Session not found")

        # 3. Check for duplicate submissions
        existing = await db.architect_leads.find_one({
            "email": request.email,
            "session_id": request.session_id
        })

        if existing:
            return {
                "success": True,
                "message": "Lead already submitted",
                "lead_id": str(existing["_id"]),
                "duplicate": True
            }

        # 4. Store lead in database
        lead_data = {
            **request.dict(),
            "assessment_data": {
                "tier": session.get("tier"),
                "tier_confidence": session.get("tier_confidence"),
                "simulation_outcome": session.get("simulation_outcome"),
                "completed_at": session.get("completed_at")
            },
            "created_at": datetime.utcnow(),
            "status": "new"
        }

        result = await db.architect_leads.insert_one(lead_data)
        lead_id = str(result.inserted_id)

        # 5. Send emails asynchronously
        background_tasks.add_task(send_architect_welcome_email, request.email, request.session_id)
        background_tasks.add_task(send_lead_notification_email, lead_data)

        # 6. Log for analytics
        await db.analytics_events.insert_one({
            "event": "architect_lead_captured",
            "session_id": request.session_id,
            "lead_id": lead_id,
            "timestamp": datetime.utcnow()
        })

        return {
            "success": True,
            "message": "Thank you for your interest! Check your email for next steps.",
            "lead_id": lead_id,
            "next_steps": [
                "Check your email for welcome message",
                "Expect WhatsApp contact within 24 hours",
                "Prepare for strategy discussion"
            ]
        }

    except Exception as e:
        # Log error but don't lose the lead
        logger.error(f"Error processing architect inquiry: {e}")

        # Store in fallback collection
        await db.failed_leads.insert_one({
            "data": request.dict(),
            "error": str(e),
            "timestamp": datetime.utcnow()
        })

        # Still return success to user
        return {
            "success": True,
            "message": "Thank you! We'll be in touch within 24 hours.",
            "fallback": True
        }
```

### 4. Email Service Configuration

Add to your backend configuration:
```python
# config.py
EMAIL_CONFIG = {
    "SENDER_EMAIL": "noreply@hnwichronicles.com",
    "SENDER_NAME": "HNWI Chronicles",
    "LEAD_NOTIFICATION_EMAIL": "rohith@montaigne.co",  # For Architect lead notifications only
    "SUPPORT_EMAIL": "hnwi@montaigne.co",  # General support and inquiries

    # SendGrid or AWS SES configuration
    "SENDGRID_API_KEY": os.getenv("SENDGRID_API_KEY"),
    # OR
    "AWS_SES_REGION": "us-east-1",
    "AWS_SES_ACCESS_KEY": os.getenv("AWS_SES_ACCESS_KEY"),
    "AWS_SES_SECRET_KEY": os.getenv("AWS_SES_SECRET_KEY"),
}
```

### 5. Follow-up Automation (Optional)

Create a scheduled task to check for leads without follow-up:
```python
@scheduler.scheduled_job('cron', hour=9, minute=0)  # Daily at 9 AM
async def check_pending_architect_leads():
    """Check for Architect leads pending follow-up"""

    # Find leads older than 24 hours with status 'new'
    cutoff = datetime.utcnow() - timedelta(hours=24)

    pending_leads = await db.architect_leads.find({
        "status": "new",
        "created_at": {"$lt": cutoff}
    }).to_list()

    if pending_leads:
        # Send reminder email to Rohith
        subject = f"⚠️ {len(pending_leads)} Architect Leads Pending Follow-up"

        html_content = f"""
        <h2>Architect Leads Requiring Follow-up</h2>
        <p>The following leads have not been contacted in 24+ hours:</p>
        <ul>
        {"".join([f"<li>{lead['email']} - {lead['whatsapp']} (submitted {lead['created_at']})</li>" for lead in pending_leads])}
        </ul>
        """

        send_email(
            to="rohith@montaigne.co",
            subject=subject,
            html=html_content,
            priority="high"
        )
```

## Testing Checklist

1. ✅ Lead submission stores in database
2. ✅ User receives welcome email
3. ✅ Rohith receives lead notification email
4. ✅ Duplicate submissions are handled gracefully
5. ✅ Failed email sends don't lose the lead
6. ✅ Analytics event is logged
7. ✅ Follow-up reminders work (if implemented)

## Security Considerations

1. **Rate Limiting**: Limit submissions to 3 per email per day
2. **Email Validation**: Validate email format and domain
3. **WhatsApp Validation**: Validate phone number format
4. **GDPR Compliance**: Include privacy policy acceptance
5. **Data Encryption**: Encrypt PII in database

## Monitoring

Track these metrics:
- Lead submission rate
- Email delivery success rate
- Time to first contact
- Conversion rate (lead to customer)
- Drop-off points in the funnel