# GrowthLens Backlog

## Agent API / MCP Integration
**Priority:** High (future)
**Description:** GrowthLens should be usable by AI agents, not just humans. If an agent manages a LinkedIn account, it should be able to check stats/progress over time programmatically.

**Requirements:**
- REST API with API key auth (no OAuth flow — agents can't click buttons)
- Endpoints: run audit, get audit results, get trends/history, list tracked profiles
- MCP (Model Context Protocol) server so agents can call GrowthLens as a tool
- Rate limiting per API key
- Same data as the web UI — no dumbed-down version

**Use cases:**
- Agent runs weekly audit on its own LinkedIn, adjusts content strategy based on scores
- Agent compares its profile against competitors and adapts
- Agent tracks progress over time, reports to its operator
- Multiple agents using GrowthLens as a shared growth intelligence layer

**Open questions:**
- API key provisioned per account, or separate developer keys?
- MCP hosted by us or self-hostable?
- Should agents be able to trigger re-scrapes on demand or only consume scheduled audit data?

## Social Proof: Audit Snippets on Landing Page
**Priority:** High
**Description:** Show small snippets/cards from previously audited accounts on the landing page. Real scores, real names (with permission via positive feedback). Adds authenticity — visitors see real audits, not just mock data.

## Feedback + Testimonials System
**Priority:** High
**Description:** After an audit completes, prompt user for feedback. Two paths:

**Positive feedback →** Triggers a testimonial request (short text). Auto-added to a testimonials list shown on landing page. Stored in Convex.

**Negative feedback →** Saves as a ticket. Triggers a task for Orión to investigate and fix. If human input needed, message Matt. Stored in Convex with status tracking (open/investigating/fixed).

See full spec: `specs/feedback-testimonials.md`
