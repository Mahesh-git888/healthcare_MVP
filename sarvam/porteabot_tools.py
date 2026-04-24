"""
Sarvam Agents tool pack for Portea WhatsApp bot.

This file is meant to be used inside Sarvam Agents as "Custom Tools" using the
Sarvam Conv AI SDK.
"""

import os
import re
from typing import List, Optional

import httpx
from pydantic import Field

from sarvam_conv_ai_sdk import (
    SarvamOnStartTool,
    SarvamOnStartToolContext,
    SarvamTool,
    SarvamToolContext,
    SarvamToolLanguageName,
    SarvamToolOutput,
)


BACKEND_URL = os.getenv("PORTEA_BACKEND_URL", "https://healthcare-mvp.onrender.com").rstrip(
    "/"
)
FRONTEND_URL = os.getenv("PORTEA_FRONTEND_URL", "https://healthcare-mvp-frontend.vercel.app").rstrip(
    "/"
)

ALLOWED_ROLES = {
    "nurse": "Nurse",
    "paramedic": "Paramedic",
    "physiotherapist": "Physiotherapist",
}

ALLOWED_SERVICES = {
    "nurse attendant": "Nurse attendant",
    "physio therapist": "Physio therapist",
    "physiotherapist": "Physio therapist",
    "nurse resident": "Nurse resident",
    "visiting nurse": "Visiting nurse",
    "equipment sale": "Equipment sale",
    "equipment rental": "Equipment rental",
    "skip": "Skip",
}

STATE_ORDER = [
    "Karnataka",
    "Maharashtra",
    "Tamil Nadu",
    "Delhi NCR",
    "Telangana",
    "West Bengal",
    "Gujarat",
    "Rajasthan",
    "Uttar Pradesh",
    "Kerala",
    "Punjab",
    "Madhya Pradesh",
    "Andhra Pradesh",
    "Chandigarh",
    "Goa",
    "Odisha",
    "Assam",
    "Jharkhand",
    "Uttarakhand",
    "Puducherry",
    "Chhattisgarh",
    "Malaysia",
    "Other",
]

STATE_CITY_TO_AREA_ID = {
    "Karnataka": {
        "bangalore": 1,
        "mysore": 33,
        "mangalore": 46,
        "hubli": 61,
        "belgaum": 62,
    },
    "Maharashtra": {
        "mumbai": 3,
        "pune": 18,
        "nagpur": 37,
        "solapur": 50,
        "nashik": 55,
    },
    "Tamil Nadu": {
        "chennai": 4,
        "coimbatore": 24,
        "madurai": 32,
        "salem": 60,
        "vellore": 67,
    },
    "Delhi NCR": {
        "ncr": 9,
        "noida": 8,
        "delhi": 12,
        "gurgaon": 17,
        "faridabad": 27,
        "ghaziabad": 28,
        "meerut": 72,
    },
    "Telangana": {
        "hyderabad": 19,
        "warangal": 58,
    },
    "West Bengal": {
        "kolkata": 20,
        "durgapur": 47,
        "asansol": 48,
        "siliguri": 57,
    },
    "Gujarat": {
        "ahmedabad": 21,
        "baroda": 36,
        "surat": 53,
        "vadodara": 54,
    },
    "Rajasthan": {
        "jaipur": 22,
    },
    "Uttar Pradesh": {
        "lucknow": 23,
        "agra": 65,
        "varanasi": 71,
    },
    "Kerala": {
        "cochin": 35,
        "calicut": 49,
        "thiruvalla": 73,
    },
    "Punjab": {
        "ludhiana": 39,
        "amritsar": 42,
    },
    "Madhya Pradesh": {
        "indore": 38,
        "bhopal": 56,
        "jabalpur": 70,
    },
    "Andhra Pradesh": {
        "visakhapatnam": 30,
        "vijayawada": 41,
    },
    "Chandigarh": {
        "chandigarh": 29,
    },
    "Goa": {
        "goa": 31,
    },
    "Odisha": {
        "bhubaneswar": 51,
    },
    "Assam": {
        "guwahati": 52,
    },
    "Jharkhand": {
        "ranchi": 59,
        "jamshedpur": 68,
    },
    "Uttarakhand": {
        "dehradun": 63,
    },
    "Puducherry": {
        "pondicherry": 64,
    },
    "Chhattisgarh": {
        "raipur": 66,
    },
    "Malaysia": {
        "kuala lumpur": 40,
    },
    "Other": {
        "unknown": 26,
        "default": 43,
    },
}


def normalize_phone(raw: str) -> str:
    """
    Normalize WhatsApp/Sarvam user identifier into the phone format your backend expects.

    Current backend stores partner phones as the value they used during registration
    (often 10 digits). This helper extracts digits and converts:
    - +91XXXXXXXXXX / 91XXXXXXXXXX -> XXXXXXXXXX
    - otherwise returns digits-only if length >= 10, keeping last 10 for India.
    """
    digits = re.sub(r"\D+", "", raw or "")
    if len(digits) >= 12 and digits.startswith("91"):
        return digits[-10:]
    if len(digits) > 10:
        return digits[-10:]
    return digits


def try_set_agent_var(context, key: str, value: str, missing: List[str]) -> None:
    """
    Sarvam will error if you try to set a variable that doesn't exist in the agent,
    or if it's not marked as updateable. We capture that so the bot can respond with
    a helpful configuration message instead of crashing.
    """
    try:
        context.set_agent_variable(key, value)
    except Exception:
        missing.append(key)


def try_set_optional_agent_var(context, key: str, value: str) -> None:
    try:
        context.set_agent_variable(key, value)
    except Exception:
        pass


def get_optional_agent_var(context, key: str, default: str = "") -> str:
    try:
        value = context.get_agent_variable(key)
    except Exception:
        return default

    if value is None:
        return default

    return str(value)


def normalize_choice(value: Optional[str]) -> str:
    return re.sub(r"\s+", " ", (value or "").strip()).lower()


def normalize_role(value: Optional[str]) -> Optional[str]:
    return ALLOWED_ROLES.get(normalize_choice(value))


def normalize_service(value: Optional[str]) -> Optional[str]:
    return ALLOWED_SERVICES.get(normalize_choice(value))


def normalize_state(value: Optional[str]) -> Optional[str]:
    normalized = normalize_choice(value)
    if not normalized:
        return None

    for state_name in STATE_CITY_TO_AREA_ID:
        if normalize_choice(state_name) == normalized:
            return state_name

    if normalized.isdigit():
        index = int(normalized) - 1
        if 0 <= index < len(STATE_ORDER):
            return STATE_ORDER[index]

    return None


def resolve_state_city(state: Optional[str], city: Optional[str]):
    normalized_state_name = normalize_state(state)
    if not normalized_state_name or not city:
        return None

    normalized_city = normalize_choice(city)

    cities = STATE_CITY_TO_AREA_ID.get(normalized_state_name) or {}
    ordered_cities = list(cities.items())

    if normalized_city.isdigit():
        index = int(normalized_city) - 1
        if 0 <= index < len(ordered_cities):
            city_name, area_id = ordered_cities[index]
            return {
                "state": normalized_state_name,
                "city": city_name.title(),
                "area_id": area_id,
            }

    for city_name, area_id in ordered_cities:
        if normalize_choice(city_name) == normalized_city:
            return {
                "state": normalized_state_name,
                "city": city_name.title(),
                "area_id": area_id,
            }

    return None


def build_numbered_menu(options: List[str], heading: str) -> str:
    lines = [heading]
    for index, option in enumerate(options, start=1):
        lines.append(f"{index}) {option}")
    return "\n".join(lines)


def normalize_referral_code(value: Optional[str]) -> Optional[str]:
    cleaned = re.sub(r"\s+", "", (value or "").strip()).upper()
    if re.fullmatch(r"[A-Z][A-Z0-9]{3,63}", cleaned):
        return cleaned
    return None


class OnStart(SarvamOnStartTool):  # name must be OnStart
    async def run(self, context: SarvamOnStartToolContext):
        user_identifier = context.get_user_identifier()
        phone = normalize_phone(user_identifier)
        context.set_initial_state_name("Main")

        missing: List[str] = []

        # Seed basics (these variables should exist on the agent).
        try_set_agent_var(context, "partner_phone", phone, missing)
        if missing:
            context.set_initial_bot_message(
                "Bot setup issue: please create these agent variables (Agent Updatable = ON):\n"
                + ", ".join(missing),
            )
            return context

        # In some sandbox/test environments the identifier may not be a phone number.
        if not phone or len(phone) < 8:
            try_set_agent_var(context, "needs_onboarding", "unknown", missing)
            context.set_initial_bot_message(
                "Hello! Welcome to Portea. Please enter your 10-digit registered phone number to get started.",
            )
            return context

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.post(
                    f"{BACKEND_URL}/auth/login",
                    json={"phone": phone},
                )
        except Exception as error:
            try_set_agent_var(context, "needs_onboarding", "unknown", missing)
            context.set_initial_bot_message(
                f"I couldn't reach the backend at {BACKEND_URL}. Error: {error}",
            )
            return context

        if response.status_code == 404:
            # Partner not onboarded in DB yet; start low-friction WhatsApp onboarding.
            try_set_agent_var(context, "needs_onboarding", "true", missing)
            context.set_initial_bot_message(
                "Hi! Welcome to Portea.\n"
                "Let's register you quickly so you can start sending referrals.\n"
                "What's your full name?",
            )
            return context

        # Some NestJS POST routes return 201 by default even for login-like flows.
        if response.status_code not in (200, 201):
            try_set_agent_var(context, "needs_onboarding", "unknown", missing)
            context.set_initial_bot_message(
                f"Login failed (status {response.status_code}). "
                "Please type your registered phone number (10 digits) to continue.",
            )
            return context

        payload = response.json()

        # Store token for future tool calls.
        try_set_agent_var(context, "partner_jwt", payload.get("accessToken") or "", missing)
        try_set_agent_var(context, "needs_onboarding", "false", missing)

        partner = payload.get("partner") or {}
        partner_name = partner.get("name") or "there"
        try_set_agent_var(context, "partner_name", partner_name, missing)
        try_set_agent_var(context, "partner_city", partner.get("city") or "", missing)
        try_set_agent_var(context, "partner_area", partner.get("area") or "", missing)

        # partner_role is optional; only set it if you created the variable in Sarvam.
        try_set_agent_var(context, "partner_role", partner.get("role") or "", missing)

        if missing:
            context.set_initial_bot_message(
                "Bot setup issue: please create these agent variables (Agent Updatable = ON):\n"
                + ", ".join(sorted(set(missing))),
            )
            return context

        context.set_initial_bot_message(
            f"Hi {partner_name}! What would you like to do?\n"
            "1) Submit a patient lead\n"
            "2) Wallet (referral earnings)\n"
            "Reply with 1 or 2.",
        )
        return context


class SubmitLead(SarvamTool):
    """Submit a patient lead to Portea backend."""

    patient_name: str = Field(description="Patient full name")
    patient_phone: str = Field(description="Patient phone number")
    service_type: Optional[str] = Field(default=None, description="Service type (optional)")
    shift_type: Optional[str] = Field(default=None, description="Shift type (optional)")
    state: Optional[str] = Field(default=None, description="State/region for the selected city (optional)")
    city: Optional[str] = Field(default=None, description="City (optional)")
    area: Optional[str] = Field(default=None, description="Area/locality (optional)")

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        token = context.get_agent_variable("partner_jwt")
        if not token:
            return SarvamToolOutput(
                message_to_user="Session expired. Please message again to restart.",
                context=context,
            )

        patient_phone = normalize_phone(self.patient_phone)
        if len(patient_phone) < 10:
            return SarvamToolOutput(
                message_to_user="Please share a valid 10-digit patient phone number.",
                context=context,
            )

        normalized_service = normalize_service(self.service_type or "skip")
        if not normalized_service:
            return SarvamToolOutput(
                message_to_user=(
                    "Please choose a valid service: Nurse attendant, Physio therapist, "
                    "Nurse resident, Visiting nurse, Equipment sale, Equipment rental, or Skip."
                ),
                context=context,
            )

        city = self.city or context.get_agent_variable("partner_city") or "NA"
        area = self.area or context.get_agent_variable("partner_area") or "NA"
        resolved_location = resolve_state_city(self.state, city) if self.state and city else None

        if self.state and city and not resolved_location:
            return SarvamToolOutput(
                message_to_user="Please choose a valid city from the selected state and try again.",
                context=context,
            )

        if resolved_location:
            city = resolved_location["city"]
            try_set_optional_agent_var(context, "lead_state", resolved_location["state"])
            try_set_optional_agent_var(context, "lead_city_area_id", str(resolved_location["area_id"]))

        payload = {
            "patientName": self.patient_name,
            "phone": patient_phone,
            "city": city,
            "area": area,
            "serviceType": normalized_service,
            "shiftType": self.shift_type or None,
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{BACKEND_URL}/leads",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )

        response.raise_for_status()
        result = response.json()
        lead_id = result.get("leadId")

        return SarvamToolOutput(
            message_to_user=(
                "Lead submitted successfully ✅"
                + (f" Lead ID: {lead_id}" if lead_id else "")
            ),
            context=context,
        )


class CaptureReferralCode(SarvamTool):
    """Capture a BDO / referral code from the user's first WhatsApp message."""

    referral_code: str = Field(description="Referral code sent by the user, such as F101243")

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        normalized_code = normalize_referral_code(self.referral_code)
        if not normalized_code:
            return SarvamToolOutput(
                message_to_user=(
                    "That referral code doesn't look valid. Please share the code exactly as received."
                ),
                context=context,
            )

        try_set_optional_agent_var(context, "referral_bdo_id", normalized_code)
        token = get_optional_agent_var(context, "partner_jwt")

        if token:
            return SarvamToolOutput(
                message_to_user=f"Referral code {normalized_code} linked successfully.",
                context=context,
            )

        return SarvamToolOutput(
            message_to_user=(
                f"Referral code {normalized_code} linked successfully.\n"
                "Please share your 10-digit registered phone number to continue."
            ),
            context=context,
        )


class GetStates(SarvamTool):
    """Return the supported states as a numbered menu."""

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        return SarvamToolOutput(
            message_to_user=build_numbered_menu(
                STATE_ORDER,
                "Please choose the partner's state:",
            ),
            context=context,
        )


class GetCitiesForState(SarvamTool):
    """Return the supported cities for a selected state as a numbered menu."""

    state: str = Field(description="State name or the numbered menu option selected by the user")

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        state_name = normalize_state(self.state)
        if not state_name:
            return SarvamToolOutput(
                message_to_user="Please choose a valid state from the menu first.",
                context=context,
            )

        try_set_optional_agent_var(context, "partner_state", state_name)
        cities = list((STATE_CITY_TO_AREA_ID.get(state_name) or {}).keys())
        city_names = [city.title() for city in cities]
        return SarvamToolOutput(
            message_to_user=build_numbered_menu(
                city_names,
                f"Please choose the city in {state_name}:",
            ),
            context=context,
        )


class RegisterPartner(SarvamTool):
    """
    Create a partner if not found, otherwise log them in.

    This keeps the tool surface area small:
    - Production WhatsApp: OnStart logs in automatically
    - Sandbox/edge case: user can type phone; this tool logs in if already registered
    """

    phone: Optional[str] = Field(
        default=None,
        description="Partner phone number (10 digits). If omitted, uses partner_phone variable.",
    )
    name: Optional[str] = Field(default=None, description="Partner full name (required for new registration)")
    role: Optional[str] = Field(
        default=None,
        description="Partner role: Nurse / Paramedic / Physiotherapist (required for new registration)",
    )
    organization_name: Optional[str] = Field(
        default=None, description="Organization / clinic / agency name (required for new registration)"
    )
    address: Optional[str] = Field(default=None, description="Full address (required for new registration)")
    state: Optional[str] = Field(default=None, description="State/region for the selected city (optional)")
    city: Optional[str] = Field(default=None, description="City (required for new registration)")
    area: Optional[str] = Field(default=None, description="Area / locality (required for new registration)")
    bdo_id: Optional[str] = Field(default=None, description="Referrer BDO id (optional)")

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        missing_vars: List[str] = []

        # Resolve phone from explicit input first, then from OnStart variable.
        raw_phone = (self.phone or "").strip() or (context.get_agent_variable("partner_phone") or "")
        phone = normalize_phone(raw_phone)
        if len(phone) < 10:
            return SarvamToolOutput(
                message_to_user="Please send your phone number (10 digits) to continue.",
                context=context,
            )

        # Always store phone variable so later tools can reuse it.
        try_set_agent_var(context, "partner_phone", phone, missing_vars)

        # First try to login. If the partner exists, we can greet and continue without re-onboarding.
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                login_response = await client.post(
                    f"{BACKEND_URL}/auth/login",
                    json={"phone": phone},
                )
        except Exception as error:
            try_set_agent_var(context, "needs_onboarding", "unknown", missing_vars)
            return SarvamToolOutput(
                message_to_user=(
                    f"I couldn't reach the backend at {BACKEND_URL}. Error: {error}"
                ),
                context=context,
            )

        # Some NestJS POST routes return 201 by default even for login-like flows.
        if login_response.status_code in (200, 201):
            data = login_response.json()
            try_set_agent_var(context, "partner_jwt", data.get("accessToken") or "", missing_vars)
            try_set_agent_var(context, "needs_onboarding", "false", missing_vars)
            partner = data.get("partner") or {}
            try_set_agent_var(context, "partner_name", partner.get("name") or "there", missing_vars)
            try_set_agent_var(context, "partner_city", partner.get("city") or "", missing_vars)
            try_set_agent_var(context, "partner_area", partner.get("area") or "", missing_vars)
            try_set_optional_agent_var(context, "partner_role", partner.get("role") or "")
            try_set_optional_agent_var(context, "partner_state", "")
            try_set_optional_agent_var(context, "partner_city_area_id", "")

            if missing_vars:
                return SarvamToolOutput(
                    message_to_user=(
                        "Bot setup issue: please create these agent variables (Agent Updatable = ON): "
                        + ", ".join(sorted(set(missing_vars)))
                    ),
                    context=context,
                )

            return SarvamToolOutput(
                message_to_user=(
                    f"Hi {context.get_agent_variable('partner_name')}! 👋 What would you like to do?\n"
                    "1) Submit a patient lead 🩺\n"
                    "2) Wallet (referral earnings) 💰\n"
                    "Reply with 1 or 2."
                ),
                context=context,
            )

        if login_response.status_code not in (404,):
            # Something else went wrong; avoid crashing the agent.
            return SarvamToolOutput(
                message_to_user=(
                    f"Login failed (status {login_response.status_code}): {login_response.text}. "
                    "Please try again in a minute."
                ),
                context=context,
            )

        # Not found -> proceed with registration (requires all fields).
        required_missing: List[str] = []
        if not self.name:
            required_missing.append("name")
        normalized_role = normalize_role(self.role)
        if not normalized_role:
            required_missing.append("role")
        if not self.organization_name:
            required_missing.append("organization_name")
        if not self.city:
            required_missing.append("city")
        if not self.area:
            required_missing.append("area")
        if not self.address:
            required_missing.append("address")

        if required_missing:
            try_set_agent_var(context, "needs_onboarding", "true", missing_vars)
            return SarvamToolOutput(
                message_to_user=(
                    "You're not registered yet. Let's onboard you ✨\n"
                    "Please share your full name to start."
                ),
                context=context,
            )

        resolved_location = resolve_state_city(self.state, self.city)
        if self.state and not resolved_location:
            return SarvamToolOutput(
                message_to_user="Please choose a valid city from the selected state and try again.",
                context=context,
            )

        final_city = resolved_location["city"] if resolved_location else self.city
        if resolved_location:
            try_set_optional_agent_var(context, "partner_state", resolved_location["state"])
            try_set_optional_agent_var(context, "partner_city_area_id", str(resolved_location["area_id"]))

        captured_bdo_id = normalize_referral_code(self.bdo_id) or normalize_referral_code(
            get_optional_agent_var(context, "referral_bdo_id")
        )

        register_payload = {
            "name": self.name,
            "phone": phone,
            "role": normalized_role,
            "city": final_city,
            "area": self.area,
            "organizationName": self.organization_name,
            "address": self.address,
        }
        if captured_bdo_id:
            register_payload["bdoId"] = captured_bdo_id

        async with httpx.AsyncClient(timeout=20) as client:
            register_response = await client.post(
                f"{BACKEND_URL}/auth/register",
                json=register_payload,
            )

        # If phone already exists (race / already onboarded), fall back to login.
        if register_response.status_code in (409,):
            async with httpx.AsyncClient(timeout=15) as client:
                login_response = await client.post(
                    f"{BACKEND_URL}/auth/login",
                    json={"phone": phone},
                )
            login_response.raise_for_status()
            data = login_response.json()
        else:
            register_response.raise_for_status()
            data = register_response.json()

        try_set_agent_var(context, "partner_jwt", data.get("accessToken") or "", missing_vars)
        try_set_agent_var(context, "needs_onboarding", "false", missing_vars)
        partner = data.get("partner") or {}
        try_set_agent_var(context, "partner_name", partner.get("name") or (self.name or "there"), missing_vars)
        try_set_agent_var(context, "partner_city", partner.get("city") or (final_city or ""), missing_vars)
        try_set_agent_var(context, "partner_area", partner.get("area") or (self.area or ""), missing_vars)
        try_set_optional_agent_var(context, "partner_role", partner.get("role") or normalized_role or "")
        if captured_bdo_id:
            try_set_optional_agent_var(context, "referral_bdo_id", captured_bdo_id)

        if missing_vars:
            return SarvamToolOutput(
                message_to_user=(
                    "Bot setup issue: please create these agent variables (Agent Updatable = ON): "
                    + ", ".join(sorted(set(missing_vars)))
                ),
                context=context,
            )

        return SarvamToolOutput(
            message_to_user=(
                "Registration successful ✅\n"
                "1) Submit a patient lead 🩺\n"
                "2) Wallet (referral earnings) 💰\n"
                "Reply with 1 or 2."
            ),
            context=context,
        )


class GetWallet(SarvamTool):
    """Fetch referral earnings summary for the partner."""

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        token = context.get_agent_variable("partner_jwt")
        if not token:
            return SarvamToolOutput(
                message_to_user="Session expired. Please message again to restart.",
                context=context,
            )

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(
                f"{BACKEND_URL}/partner/earnings",
                headers={"Authorization": f"Bearer {token}"},
            )

        response.raise_for_status()
        data = response.json()

        if data.get("coming_soon"):
            return SarvamToolOutput(
                message_to_user=data.get("message", "Referral earnings tracking is coming soon."),
                context=context,
            )

        summary = data.get("summary") or {}
        total = summary.get("total_earned")
        pending = summary.get("pending")
        paid = summary.get("paid")
        return SarvamToolOutput(
            message_to_user=(
                "Referral Earnings 💰\n"
                f"Total: {total}\n"
                f"Pending: {pending}\n"
                f"Paid: {paid}"
            ),
            context=context,
        )


# Sarvam executes tools in a sandbox; ensure pydantic models are fully built.
SubmitLead.model_rebuild()
CaptureReferralCode.model_rebuild()
GetStates.model_rebuild()
GetCitiesForState.model_rebuild()
RegisterPartner.model_rebuild()
GetWallet.model_rebuild()
