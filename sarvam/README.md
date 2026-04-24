# Portea WhatsApp Bot (Sarvam Agents) Setup

This setup reuses your existing NestJS backend for:
- Partner lookup/login
- Partner onboarding (registration)
- Lead submission
- Wallet/earnings lookup

## Files in this repo

- `SARVAM_WHATSAPP_AGENT_TEMPLATE.md` (agent flow template, multi-state + single-state)
- `sarvam/GLOBAL_INSTRUCTIONS.md` (recommended global instructions for strict phone-first flow)
- `sarvam/MAIN_STATE_SINGLE.md` (recommended single-state prompt)
- `sarvam/porteabot_tools.py` (Sarvam tools: `OnStart`, `CaptureReferralCode`, `GetStates`, `GetCitiesForState`, `RegisterPartner`, `SubmitLead`, `GetWallet`)

## Backend prerequisites

Your backend must be deployed and reachable from Sarvam Agents, and these endpoints must work:
- `POST /auth/login` with `{ phone }`
- `POST /auth/register` with `{ name, phone, role, city, area, organizationName, address, bdoId? }`
- `POST /leads` (Bearer JWT) with `{ patientName, phone, city, area, serviceType, shiftType? }`
- `GET /partner/earnings` (Bearer JWT)

## Sarvam Agent Setup (Single-State, WhatsApp-first)

1. Create a new agent in Sarvam and choose channel `WhatsApp`.
2. Add these agent variables and keep `Agent Updatable = ON`:
   - `partner_phone` (string)
   - `partner_name` (string)
   - `partner_jwt` (string)
   - `partner_city` (string)
   - `partner_area` (string)
   - `partner_role` (string)
   - `referral_bdo_id` (string)
   - `needs_onboarding` (string)
3. Add Custom Tools:
   - Paste the contents of `sarvam/porteabot_tools.py`.
4. Configure tool env vars in Sarvam if needed:
   - `PORTEA_BACKEND_URL` = your backend base URL
   - `PORTEA_FRONTEND_URL` = your frontend base URL (fallback only)
5. Enable tool `OnStart`.
6. Set Greeting Message to:
   - `Hello! Please enter your 10-digit registered phone number to continue.`
7. Paste `sarvam/GLOBAL_INSTRUCTIONS.md` into Global Instructions.
8. Create 1 state called `Main` and set it as initial.
9. Paste `sarvam/MAIN_STATE_SINGLE.md` into the `Main` state.
10. In the `Main` state, make sure these normal tools are available:
   - `CaptureReferralCode`
   - `GetStates`
   - `GetCitiesForState`
   - `RegisterPartner`
   - `SubmitLead`
   - `GetWallet`
11. Enable multilingual in Sarvam settings:
   - Add all languages you want to support.
   - Tell the agent to reply in the user's language and keep messages short.
12. Deploy:
   - Whitelist your number for testing.
   - Test with a known partner phone first, then a new phone.

## Menu-first UX (no typing where possible)

Use buttons/list menus if Sarvam supports them; otherwise use numbered options.

Recommended menu steps:
- Main menu: Lead / Wallet / Help
- Role: Nurse / Paramedic / Physiotherapist
- Service: 6 service choices + Skip
- Shift: 12 hours / 24 hours (only for nurse services)

## Notes

- We do not redirect partners to a website for onboarding in the default flow.
- We do not collect gender in this MVP.
- Lead city/area default to partner city/area if the user does not type them.
- In the Sarvam playground, `OnStart` may not receive a real WhatsApp phone number. Test by typing a 10-digit phone number directly.
- For BDO deep links such as `https://wa.me/<number>?text=F101243`, the first inbound message can be captured with `CaptureReferralCode` and reused automatically during registration.
