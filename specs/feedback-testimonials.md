# Feedback & Testimonials Spec

## Problem
No way to collect user sentiment. No social proof on the landing page. We can't tell if the product is good or bad except by guessing.

## Solution Overview
After every audit, prompt for feedback. Route positive → testimonials (public, on landing page). Route negative → fix tickets (private, actioned by Orión).

## Detailed Requirements

### Feedback Collection
- After audit results load, show a subtle feedback bar at the bottom:
  - "How was this audit?" → 👍 (positive) / 👎 (negative)
  - Clicking either opens a short text input: "Tell us more (optional)" + Submit
- Don't block the audit results — feedback is non-intrusive

### Positive Path (Testimonials)
1. User clicks 👍, optionally writes text
2. If text provided, show: "Can we feature your feedback on our site?" → Yes / No
3. If yes → store as testimonial with:
   - Name (from LinkedIn auth, or "Anonymous")
   - Text
   - Score from their audit
   - Profile photo (if LinkedIn auth)
   - Approved: true (auto-approved since they consented)
4. Testimonials show on landing page in a carousel/grid
5. If no text → just store as positive signal (for metrics)

### Negative Path (Fix Tickets)
1. User clicks 👎, optionally writes text
2. Store as ticket:
   - Text (feedback)
   - Audit ID (link to the audit that triggered it)
   - Profile URL audited
   - Status: open
   - Created at
3. Orión reviews tickets during 6 AM daily check:
   - Can fix independently → fix it, mark as "fixed"
   - Needs Matt → message Matt with context, mark as "needs-input"
   - Won't fix → mark as "wontfix" with reason

### Audit Snippets on Landing Page
- Show 6-8 cards from real audits (most recent with consent)
- Each card: profile initial/photo, name, score ring, one-line quote if testimonial exists
- Pull from Convex: audits with associated testimonial, or just high-scoring audits
- Rotate/randomize on each page load

### Convex Schema
```
feedback: {
  auditId: string,
  profileUrl: string,
  sentiment: "positive" | "negative",
  text: optional string,
  isTestimonial: boolean, // user consented to public display
  userName: optional string,
  userPicture: optional string,
  auditScore: number,
  status: "open" | "investigating" | "fixed" | "wontfix" | "testimonial",
  createdAt: number,
}
```

## Technical Approach
- FeedbackBar component rendered on audit result pages
- Convex mutations for storing feedback
- Landing page queries Convex for approved testimonials
- Orión's 6 AM cron checks for new negative feedback

## Out of Scope
- Email follow-up on feedback
- Public response to feedback
- Star ratings (keep it simple: thumbs up/down)

## Success Criteria
- 10%+ of audits get feedback
- At least 3 testimonials on landing page within first month
- Negative tickets resolved within 24 hours
