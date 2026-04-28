# Portea WhatsApp Bot (Sarvam Agents) Setup

This bot reuses the NestJS backend for:
- partner lookup and login
- partner onboarding
- BDO deep-link mapping
- patient lead submission
- wallet lookup

## Backend contract

These backend endpoints must be reachable from Sarvam:
- `POST /auth/login` with `{ phone }`
- `POST /auth/register` with `{ name, phone, role, city, organizationName?, bdoId?, languagePreference? }`
- `POST /auth/link-referral` with `{ phone, bdoId }`
- `POST /leads` with Bearer JWT and `{ patientName, phone, serviceType?, city? }`
- `GET /partner/earnings` with Bearer JWT

## Database expectations

The WhatsApp flow relies on these backend records:
- `partners`
  - includes phone, role, city, organization optional, `bdo_id`, and `language_preference`
- `leads`
  - includes partner link, patient details, optional service type, and `bdo_id`
- `bdos`
  - includes BDO directory and unique `employeeId`

## Agent variables

Create these variables in Sarvam with `Agent Updatable = ON`:
- `partner_phone`
- `partner_name`
- `partner_jwt`
- `partner_city`
- `partner_role`
- `partner_language`
- `referral_bdo_id`
- `needs_onboarding`

## State setup

Use a single state only:
- `Main`

Enable `OnStart` as the startup tool.

## Widgets

Create these WhatsApp widgets in Sarvam:
- `language_preference`
- `role_selection`
- `city_selection`
- `main_menu`

### language_preference
- Type: list
- Items:
  1. English
  2. Hindi
  3. Tamil
  4. Telugu
  5. Kannada
  6. Malayalam
  7. Marathi
  8. Gujarati
  9. Bengali
  10. Punjabi

### role_selection
- Type: quick reply buttons
- Buttons:
  - Nurse
  - Paramedic
  - Physiotherapist

### city_selection
- Type: list
- Items:
  1. Bangalore
  2. Hyderabad
  3. Kolkata
  4. NCR
  5. Pune
  6. Chennai
  7. Mumbai
  8. My city is not listed

### main_menu
- Type: quick reply buttons or list, depending on what you prefer in Sarvam
- Items:
  1. Submit a Lead
  2. Check Wallet
  3. Help

## Tools

Paste `sarvam/porteabot_tools.py` into Custom Tools.

Enable these tools in `Main`:
- `CaptureReferralCode`
- `ShowMainMenu`
- `GetLanguageOptions`
- `GetPrimaryCities`
- `SwitchLanguage`
- `RegisterPartner`
- `SubmitLead`
- `GetWallet`

## Prompt files

- Put `sarvam/GLOBAL_INSTRUCTIONS.md` into Global Instructions
- Put `sarvam/MAIN_STATE_SINGLE.md` into the `Main` state

## Final WhatsApp behavior

### Scenario 1: Deep link + already registered
- First message contains the BDO referral code
- Phone comes from WhatsApp environment
- Backend finds existing partner
- BDO mapping is linked or preserved gracefully
- Greet by first name
- Show `main_menu`

### Scenario 2: Deep link + not registered
- First message contains the BDO referral code
- Phone comes from WhatsApp environment
- Backend does not find partner
- Start onboarding:
  - `language_preference`
  - name
  - `role_selection`
  - `city_selection`
  - organization optional
- Register partner with the captured `bdo_id`
- Show `main_menu`

### Scenario 3: Normal hello + already registered
- Phone comes from WhatsApp environment
- Backend finds existing partner
- Greet by first name
- Show `main_menu`

### Scenario 4: Normal hello + not registered
- Phone comes from WhatsApp environment
- Backend does not find partner
- Start onboarding:
  - `language_preference`
  - name
  - `role_selection`
  - `city_selection`
  - organization optional
- Register partner
- Show `main_menu`

## Lead flow

From `main_menu`:
- `Submit a Lead`
  - ask patient name
  - ask patient phone
  - ask service type optionally
  - submit lead
  - return to `main_menu`

Every lead should continue carrying the partner's `bdo_id`, and Google Sheets should receive that `bdo_id` for every row.

## Playground note

In Sarvam playground or sandbox mode, `OnStart` may not always receive a real WhatsApp sender number.
In that case, the bot may ask for the partner phone as a fallback.
