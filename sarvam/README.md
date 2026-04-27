# Portea WhatsApp Bot (Sarvam Agents) Setup

This bot reuses the NestJS backend for:
- partner lookup/login
- partner onboarding
- patient lead submission
- wallet lookup

## Backend contract

These backend endpoints must be reachable from Sarvam:
- `POST /auth/login` with `{ phone }`
- `POST /auth/register` with `{ name, phone, role, city, organizationName?, bdoId? }`
- `POST /leads` with Bearer JWT and `{ patientName, phone, serviceType?, city? }`
- `GET /partner/earnings` with Bearer JWT

## Agent variables

Create these variables in Sarvam with `Agent Updatable = ON`:
- `partner_phone`
- `partner_name`
- `partner_jwt`
- `partner_city`
- `partner_role`
- `referral_bdo_id`
- `needs_onboarding`
- `partner_state` (optional helper)

## Tools

Paste `sarvam/porteabot_tools.py` into Custom Tools.

Enable these tools in the `Main` state:
- `CaptureReferralCode`
- `GetLanguageOptions`
- `SwitchLanguage`
- `GetStates`
- `GetCitiesForState`
- `RegisterPartner`
- `SubmitLead`
- `GetWallet`

Enable `OnStart` as the startup tool.

## Prompt files

- Put `sarvam/GLOBAL_INSTRUCTIONS.md` into Global Instructions
- Put `sarvam/MAIN_STATE_SINGLE.md` into the `Main` state
- Keep `Main` as the initial state

## WhatsApp flow

- If the sender phone is available in `OnStart`, the bot should use it directly
- If the partner already exists, greet them by name and show the menu
- If the partner does not exist, start onboarding with name -> role -> organization optional -> city
- Do not ask for address or area
- Lead capture should ask only for patient name, patient phone, and optional service type

## BDO deep links

Deep links follow this shape:
- `https://wa.me/919345884291?text=F101243`

The first inbound message can be captured with `CaptureReferralCode` and reused during onboarding.

## Language setup

Enable language switching in Sarvam settings and allow the languages you want to support.
The bot tools include a language menu plus a language switch tool for runtime changes.

## Playground note

In Sarvam playground/sandbox mode, `OnStart` may not always receive a real WhatsApp sender number.
In that case, the bot may ask for the partner phone as a fallback.
