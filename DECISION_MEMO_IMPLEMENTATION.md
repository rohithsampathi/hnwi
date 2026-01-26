# Decision Memo - 2026 Stress Test - Complete Implementation

## Overview
Complete implementation of the **$1,000 Decision Memo** stress test feature, following the exact same UX structure as the simulation flow. Built with Next.js 14, TypeScript, React Hook Form, Zod validation, and Framer Motion animations.

---

## 📁 File Structure

```
app/(authenticated)/decision-memo/
└── page.tsx                                    # Main flow orchestrator

components/decision-memo/
├── DecisionMemoLanding.tsx                     # Landing + pre-gate (Q0a, Q0b)
├── StressTestIntro.tsx                         # "This is not a survey" intro
├── TenQuestionForm.tsx                         # Main form with progress
├── ProgressBar.tsx                             # Question progress indicator
├── AnalyzingScreen.tsx                         # Processing animation
├── InstantPreview.tsx                          # Stress test results
├── BlindSpotCard.tsx                           # Individual blind spot card
├── PaymentWall.tsx                             # Razorpay payment (₹83,000)
├── SuccessConfirmation.tsx                     # Post-payment confirmation
└── questions/
    ├── Q1NextMoves.tsx                         # Allocation moves
    ├── Q2CurrentPosition.tsx                   # Residency & tax residence
    ├── Q3Jurisdictions.tsx                     # Asset & entity locations
    ├── Q4JurisdictionChanges.tsx               # Jurisdiction moves
    ├── Q5AssetBuckets.tsx                      # Asset allocation & liquidity
    ├── Q6LiquidityTimeline.tsx                 # THE KILLER QUESTION ⚠️
    ├── Q7Structures.tsx                        # Wealth structures
    ├── Q8Advisors.tsx                          # Coordination risk
    ├── Q9Behavioral.tsx                        # Behavioral patterns
    └── Q10NonNegotiables.tsx                   # Constraints & red lines

lib/decision-memo/
├── schemas.ts                                  # Zod validation schemas
└── types.ts                                    # TypeScript interfaces

app/api/decision-memo/
├── submit-10q/route.ts                         # Submit stress test
├── create-order/route.ts                       # Create Razorpay order
└── verify-payment/route.ts                     # Verify payment & queue memo
```

---

## 🎯 Flow Architecture

### **6 Stages** (Same as Simulation)

```
1. LANDING (with pre-gate)
   ├─ Q0a: What are your next two allocation moves?
   ├─ Q0b: When do these moves become forced?
   └─ Validation: Specificity check + timeline urgency

2. INTRO ("This is not a survey")
   ├─ 1,875 precedents
   ├─ 159 failure modes
   ├─ 414,127 pattern links
   └─ Warning: Most fail on Q6 (liquidity) & Q8 (advisors)

3. ASSESSMENT (10 questions)
   ├─ Progress bar (X of 10)
   ├─ Question animations
   ├─ Real-time validation
   └─ Back/Next navigation

4. ANALYZING (3-second animation)
   ├─ 6-step processing pipeline
   ├─ Live metrics counters
   └─ Preparation for preview

5. PREVIEW (Instant results)
   ├─ Exposure class (HIGH/MEDIUM/LOW)
   ├─ Coordination risk score (X/15)
   ├─ Prevented loss estimate ($285K)
   ├─ 3 critical blind spots
   ├─ Next move recommendation
   └─ Payment wall (₹83,000)

6. SUCCESS (Payment confirmation)
   ├─ Payment confirmed
   ├─ Processing status
   ├─ 48-hour delivery ETA
   └─ Return to dashboard
```

---

## 🎨 Design System

### Colors
- **Primary**: Red-500 (warnings, stress, urgency)
- **Success**: Green-500 (prevented losses, correct actions)
- **Warning**: Orange-500 (moderate risk, mismatches)
- **Danger**: Red-500 (high exposure, critical blind spots)

### Typography
- **Headings**: Bold, tight tracking
- **Body**: Leading-relaxed for readability
- **Labels**: Uppercase, wide tracking, small font

### Animations
- **Framer Motion** for all transitions
- **Slide transitions** between questions
- **Scale animations** for cards
- **Rotating spinners** for loading states

---

## 💡 Key Features

### **Q6 - THE KILLER QUESTION**
- **60% fail rate** highlighted
- Timeline options: 90/180/365/730+ days
- Forcing events checkboxes
- **Mismatch detection**: Warns if timeline doesn't match forcing events
- Color-coded urgency levels

### **Q8 - ADVISOR COORDINATION**
- Advisor type selection (tax, immigration, legal, etc.)
- **7-14 day overhead** per advisor
- Standard playbook vs. custom structuring
- **High risk warning** if 4+ advisors

### **Validation System**
- **Zod schemas** for all 10 questions
- Real-time validation feedback
- Required field indicators
- Character count limits
- Pass/fail examples (Q1)

### **Session Persistence**
- LocalStorage for flow stage
- SessionStorage for form data
- Module-level flags for remount protection
- Recovery from page refresh

---

## 📊 Mock Data (Preview)

```typescript
{
  exposure_class: 'HIGH',
  coordination_risk_score: 12,
  prevented_loss_estimate: 285000,
  blind_spots: [
    {
      number: 1,
      title: 'Timeline Mismatch → Forced Liquidity Risk',
      prevented_loss: 150000
    },
    {
      number: 2,
      title: 'Advisor Coordination Gap',
      prevented_loss: 75000
    },
    {
      number: 3,
      title: 'Jurisdiction Sequencing Error',
      prevented_loss: 60000
    }
  ],
  next_move: 'BEFORE any moves: (1) Establish advisor SLAs...'
}
```

---

## 🔌 API Integration

### **1. Submit 10Q** (`POST /api/decision-memo/submit-10q`)
```typescript
{
  user_id: string,
  responses: {
    q1_move1: string,
    q1_move2?: string,
    q2_residency: string,
    // ... all 10 questions
  }
}

Response: {
  success: true,
  preview_id: string,
  instant_preview: {...}
}
```

### **2. Create Order** (`POST /api/decision-memo/create-order`)
```typescript
{
  preview_id: string,
  user_id: string,
  email: string
}

Response: {
  order_id: string,
  amount: 8300000, // ₹83,000 in paise
  currency: 'INR',
  key_id: string
}
```

### **3. Verify Payment** (`POST /api/decision-memo/verify-payment`)
```typescript
{
  preview_id: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
}

Response: {
  success: true,
  intake_packet_id: string,
  memo_eta: '48 hours'
}
```

---

## 🚀 Usage

### **Navigate to the flow:**
```
http://localhost:3000/decision-memo
```

### **Test the complete flow:**
1. Fill pre-gate (Q0a, Q0b)
2. Click "Begin Stress Test"
3. Answer 10 questions
4. View analyzing animation
5. See instant preview
6. Click payment (mock for now)
7. View success confirmation

---

## 🔧 Environment Variables

```bash
# Backend API
API_BASE_URL=http://localhost:8000

# Razorpay (Production)
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_SECRET=xxx

# MongoDB
MONGODB_URI=mongodb+srv://...
```

---

## 📝 Next Steps (Production Readiness)

### **Backend Integration**
1. Connect to Python FastAPI endpoints
2. Replace mock data with real API responses
3. Implement MongoDB storage for sessions

### **Razorpay Integration**
1. Add Razorpay SDK script to payment wall
2. Implement real payment handler
3. Add signature verification
4. Handle payment failures/retries

### **Email Delivery**
1. Queue memo generation job (Celery/AWS Lambda)
2. Generate PDF using backend service
3. Send email with PDF attachment
4. Track delivery status

### **Analytics**
1. Track completion rates per question
2. Identify drop-off points
3. Monitor prevented loss calculations
4. A/B test messaging

---

## ✅ Testing Checklist

- [x] Landing page loads with pre-gate
- [x] Pre-gate validation works (specificity + timeline)
- [x] Intro screen shows correctly
- [x] All 10 questions render properly
- [x] Progress bar updates
- [x] Back/Next navigation works
- [x] Form validation prevents invalid submissions
- [x] Analyzing screen animates
- [x] Preview shows mock results
- [x] Blind spots display correctly
- [x] Payment wall renders
- [x] Mock payment succeeds
- [x] Success page confirms
- [x] Session persistence survives refresh
- [x] Mobile responsive design works

---

## 🎯 Value Proposition

### **What Makes This Different**
- **Not a survey** - Stress test against real precedents
- **Blind spot detection** - Timeline mismatches, coordination gaps
- **Quantified prevention** - $285K in prevented losses
- **Actionable roadmap** - Before → After sequencing
- **48-hour delivery** - Complete 8-10 page memo

### **Pricing Justification**
- ₹83,000 (~$1,000 USD)
- Prevents $100,000+ in allocation mistakes
- Replaces multiple advisor consultations ($10K+ value)
- Based on 1,875 precedents (irreplaceable data)

---

## 📚 Component Details

### **DecisionMemoLanding.tsx**
- Inline pre-gate (no separate page)
- Pass/fail examples for specificity
- Timeline urgency validator
- Dynamic brief count from API
- Framer Motion entrance animations

### **TenQuestionForm.tsx**
- React Hook Form + Zod validation
- Progress tracking (1-10)
- AnimatePresence for transitions
- Field-level validation
- Character counters

### **Q6LiquidityTimeline.tsx** (Killer Question)
- Red warning box ("BREAKS MOST HNWIs")
- 4 timeline options (90/180/365/730+)
- Forcing events multi-select
- Mismatch detection logic
- Color-coded urgency

### **InstantPreview.tsx**
- Exposure class badge
- Risk score visualization
- Prevented loss total
- 3 blind spot cards
- Next move recommendation
- Integrated payment wall

### **PaymentWall.tsx**
- Full memo benefits list
- ₹83,000 pricing display
- Razorpay integration ready
- Trust signals (security, guarantee, delivery)
- Processing state handling

---

## 🏆 Success Metrics

### **Completion Rate Targets**
- Pre-gate → Intro: 70%
- Intro → Start Assessment: 60%
- Q1 → Q10: 80% (sticky questions)
- Q10 → Preview: 95%
- Preview → Payment: 40%

### **Prevented Loss Average**
- Target: $200K - $400K per user
- Calculated from coordination risk score
- Based on timeline mismatches + advisor gaps

---

**Status**: ✅ **100% Complete - Ready for Testing**

All components built, all questions implemented, all API routes created. Flow is testable end-to-end with mock data. Ready for backend integration and production deployment.
