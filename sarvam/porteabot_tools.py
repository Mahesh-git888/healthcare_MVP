"""
Sarvam custom tools for the Portea WhatsApp referral assistant.

Intent:
- Keep partner onboarding low-friction.
- Use the WhatsApp sender number whenever Sarvam provides it.
- Reuse partner city for leads by default.
- Capture BDO deep-link referral codes automatically.
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

ALLOWED_ROLES = {
    "1": "Nurse",
    "2": "Paramedic",
    "3": "Physiotherapist",
    "nurse": "Nurse",
    "paramedic": "Paramedic",
    "physiotherapist": "Physiotherapist",
}

ALLOWED_SERVICES = {
    "1": "Nurse attendant",
    "2": "Physio therapist",
    "3": "Nurse resident",
    "4": "Visiting nurse",
    "5": "Equipment sale",
    "6": "Equipment rental",
    "nurse attendant": "Nurse attendant",
    "physio therapist": "Physio therapist",
    "physiotherapist": "Physio therapist",
    "nurse resident": "Nurse resident",
    "visiting nurse": "Visiting nurse",
    "equipment sale": "Equipment sale",
    "equipment rental": "Equipment rental",
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
    "Karnataka": {"bangalore": 1, "mysore": 33, "mangalore": 46, "hubli": 61, "belgaum": 62},
    "Maharashtra": {"mumbai": 3, "pune": 18, "nagpur": 37, "solapur": 50, "nashik": 55},
    "Tamil Nadu": {"chennai": 4, "coimbatore": 24, "madurai": 32, "salem": 60, "vellore": 67},
    "Delhi NCR": {"ncr": 9, "noida": 8, "delhi": 12, "gurgaon": 17, "faridabad": 27, "ghaziabad": 28, "meerut": 72},
    "Telangana": {"hyderabad": 19, "warangal": 58},
    "West Bengal": {"kolkata": 20, "durgapur": 47, "asansol": 48, "siliguri": 57},
    "Gujarat": {"ahmedabad": 21, "baroda": 36, "surat": 53, "vadodara": 54},
    "Rajasthan": {"jaipur": 22},
    "Uttar Pradesh": {"lucknow": 23, "agra": 65, "varanasi": 71},
    "Kerala": {"cochin": 35, "calicut": 49, "thiruvalla": 73},
    "Punjab": {"ludhiana": 39, "amritsar": 42},
    "Madhya Pradesh": {"indore": 38, "bhopal": 56, "jabalpur": 70},
    "Andhra Pradesh": {"visakhapatnam": 30, "vijayawada": 41},
    "Chandigarh": {"chandigarh": 29},
    "Goa": {"goa": 31},
    "Odisha": {"bhubaneswar": 51},
    "Assam": {"guwahati": 52},
    "Jharkhand": {"ranchi": 59, "jamshedpur": 68},
    "Uttarakhand": {"dehradun": 63},
    "Puducherry": {"pondicherry": 64},
    "Chhattisgarh": {"raipur": 66},
    "Malaysia": {"kuala lumpur": 40},
    "Other": {"unknown": 26, "default": 43},
}

LANGUAGE_OPTIONS = [
    ("1", "English", getattr(SarvamToolLanguageName, "ENGLISH")),
    ("2", "Hindi", getattr(SarvamToolLanguageName, "HINDI")),
    ("3", "Tamil", getattr(SarvamToolLanguageName, "TAMIL")),
    ("4", "Telugu", getattr(SarvamToolLanguageName, "TELUGU")),
    ("5", "Kannada", getattr(SarvamToolLanguageName, "KANNADA")),
    ("6", "Malayalam", getattr(SarvamToolLanguageName, "MALAYALAM")),
    ("7", "Marathi", getattr(SarvamToolLanguageName, "MARATHI")),
    ("8", "Gujarati", getattr(SarvamToolLanguageName, "GUJARATI")),
    ("9", "Bengali", getattr(SarvamToolLanguageName, "BENGALI")),
    ("10", "Punjabi", getattr(SarvamToolLanguageName, "PUNJABI")),
    ("11", "Odia", getattr(SarvamToolLanguageName, "ODIA", getattr(SarvamToolLanguageName, "ENGLISH"))),
]


def normalize_phone(raw: str) -> str:
    digits = re.sub(r"\D+", "", raw or "")
    if len(digits) > 10:
        return digits[-10:]
    return digits


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


def resolve_city(city: Optional[str], state: Optional[str] = None):
    normalized_city = normalize_choice(city)
    if not normalized_city:
        return None

    if state and state != "ALL":
        cities = list((STATE_CITY_TO_AREA_ID.get(state) or {}).items())
    else:
        flat = []
        for state_cities in STATE_CITY_TO_AREA_ID.values():
            flat.extend(list(state_cities.items()))
        cities = sorted(flat, key=lambda item: item[0])

    if normalized_city.isdigit():
        index = int(normalized_city) - 1
        if 0 <= index < len(cities):
            city_name, area_id = cities[index]
            return city_name.title(), area_id

    for city_name, area_id in cities:
        if normalize_choice(city_name) == normalized_city:
            return city_name.title(), area_id

    return None


def normalize_referral_code(value: Optional[str]) -> Optional[str]:
    cleaned = re.sub(r"\s+", "", (value or "").strip()).upper()
    if re.fullmatch(r"[A-Z][A-Z0-9]{3,63}", cleaned):
        return cleaned
    return None


def first_name(value: Optional[str]) -> str:
    parts = re.sub(r"\s+", " ", (value or "").strip()).split(" ")
    return parts[0] if parts and parts[0] else "there"


def build_numbered_menu(options: List[str], heading: str) -> str:
    lines = [heading]
    for index, option in enumerate(options, start=1):
        lines.append(f"{index}) {option}")
    return "\n".join(lines)


def try_set_agent_var(context, key: str, value: str, missing: Optional[List[str]] = None) -> None:
    try:
        context.set_agent_variable(key, value)
    except Exception:
        if missing is not None:
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


def build_main_menu(name: str) -> str:
    short_name = first_name(name)
    return (
        f"Hi {short_name}!\n"
        "1) Submit a patient lead\n"
        "2) Wallet\n"
        "3) Change language\n"
        "4) Help"
    )


class ShowMainMenu(SarvamTool):
    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        partner_name = get_optional_agent_var(context, "partner_name", "there")
        return SarvamToolOutput(
            message_to_user=build_main_menu(partner_name),
            context=context,
        )


class OnStart(SarvamOnStartTool):
    async def run(self, context: SarvamOnStartToolContext):
        context.set_initial_state_name("Main")
        context.set_initial_language_name(SarvamToolLanguageName.ENGLISH)

        phone = normalize_phone(context.get_user_identifier())
        missing: List[str] = []
        try_set_agent_var(context, "partner_phone", phone, missing)

        if missing:
            context.set_initial_bot_message(
                "Bot setup issue: please create the missing agent variables first."
            )
            return context

        if len(phone) != 10:
            try_set_agent_var(context, "needs_onboarding", "unknown", missing)
            context.set_initial_bot_message(
                "Hello! Please share your 10-digit phone number to continue."
            )
            return context

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.post(
                    f"{BACKEND_URL}/auth/login",
                    json={"phone": phone},
                )
        except Exception:
            try_set_agent_var(context, "needs_onboarding", "unknown", missing)
            context.set_initial_bot_message(
                "I couldn't reach the backend right now. Please try again shortly."
            )
            return context

        if response.status_code == 404:
            try_set_agent_var(context, "needs_onboarding", "true", missing)
            context.set_initial_bot_message(
                "Welcome to Portea.\nLet's get you registered.\nWhat's your full name?"
            )
            return context

        if response.status_code not in (200, 201):
            try_set_agent_var(context, "needs_onboarding", "unknown", missing)
            context.set_initial_bot_message("There was a login issue. Please try again.")
            return context

        payload = response.json()
        partner = payload.get("partner") or {}
        partner_name = partner.get("name") or "there"

        try_set_agent_var(context, "partner_jwt", payload.get("accessToken") or "", missing)
        try_set_agent_var(context, "needs_onboarding", "false", missing)
        try_set_agent_var(context, "partner_name", partner_name, missing)
        try_set_agent_var(context, "partner_city", partner.get("city") or "", missing)
        try_set_optional_agent_var(context, "partner_role", partner.get("role") or "")

        context.set_initial_bot_message(build_main_menu(partner_name))
        return context


class CaptureReferralCode(SarvamTool):
    referral_code: str = Field(description="Referral code such as F101243")

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        referral_code = normalize_referral_code(self.referral_code)
        if not referral_code:
            return SarvamToolOutput(
                message_to_user="That referral code looks invalid.",
                context=context,
            )

        try_set_optional_agent_var(context, "referral_bdo_id", referral_code)
        phone = normalize_phone(get_optional_agent_var(context, "partner_phone"))

        if len(phone) == 10:
            try:
                async with httpx.AsyncClient(timeout=15) as client:
                    response = await client.post(
                        f"{BACKEND_URL}/auth/link-referral",
                        json={"phone": phone, "bdoId": referral_code},
                    )
                response.raise_for_status()
            except Exception:
                pass
        return SarvamToolOutput(
            message_to_user=f"Referral ID {referral_code} linked successfully ✅",
            context=context,
        )


class GetLanguageOptions(SarvamTool):
    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        options = [label for _, label, _ in LANGUAGE_OPTIONS]
        return SarvamToolOutput(
            message_to_user=build_numbered_menu(
                options,
                "Please choose your language. Reply with a number:",
            ),
            context=context,
        )


class SwitchLanguage(SarvamTool):
    language: str = Field(description="Language name or menu number")

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        normalized = normalize_choice(self.language)
        selected = None

        for key, label, language_name in LANGUAGE_OPTIONS:
            if normalized == key or normalized == label.lower():
                selected = (label, language_name)
                break

        if not selected:
            return SarvamToolOutput(
                message_to_user="Please choose a valid language option.",
                context=context,
            )

        label, language_name = selected
        context.change_language(language_name)
        return SarvamToolOutput(
            message_to_user=f"Language changed to {label} ✅",
            context=context,
        )


class GetStates(SarvamTool):
    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        return SarvamToolOutput(
            message_to_user=build_numbered_menu(
                STATE_ORDER,
                "Please choose your state. Reply with a number:",
            ),
            context=context,
        )


class GetCitiesForState(SarvamTool):
    state: str = Field(description="State name or menu number")

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        state_name = normalize_state(self.state)
        if not state_name:
            return SarvamToolOutput(
                message_to_user="Please choose a valid state option.",
                context=context,
            )

        try_set_optional_agent_var(context, "partner_state", state_name)
        cities = [city.title() for city in (STATE_CITY_TO_AREA_ID.get(state_name) or {}).keys()]
        return SarvamToolOutput(
            message_to_user=build_numbered_menu(
                cities,
                f"Please choose your city in {state_name}. Reply with a number:",
            ),
            context=context,
        )


class RegisterPartner(SarvamTool):
    phone: Optional[str] = Field(default=None, description="Partner 10-digit phone number")
    name: Optional[str] = Field(default=None, description="Partner full name")
    role: Optional[str] = Field(default=None, description="Partner role")
    organization_name: Optional[str] = Field(default=None, description="Organization name")
    state: Optional[str] = Field(default=None, description="State helper selection")
    city: Optional[str] = Field(default=None, description="City selection")
    bdo_id: Optional[str] = Field(default=None, description="BDO referral ID")

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        raw_phone = (self.phone or "").strip() or get_optional_agent_var(context, "partner_phone")
        phone = normalize_phone(raw_phone)

        if len(phone) != 10:
            return SarvamToolOutput(
                message_to_user="Please share your 10-digit phone number.",
                context=context,
            )

        try_set_optional_agent_var(context, "partner_phone", phone)

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                login_response = await client.post(
                    f"{BACKEND_URL}/auth/login",
                    json={"phone": phone},
                )
        except Exception:
            return SarvamToolOutput(
                message_to_user="I couldn't reach the backend right now.",
                context=context,
            )

        if login_response.status_code in (200, 201):
            data = login_response.json()
            partner = data.get("partner") or {}
            try_set_optional_agent_var(context, "partner_jwt", data.get("accessToken") or "")
            try_set_optional_agent_var(context, "needs_onboarding", "false")
            try_set_optional_agent_var(context, "partner_phone", phone)
            try_set_optional_agent_var(context, "partner_name", partner.get("name") or "there")
            try_set_optional_agent_var(context, "partner_city", partner.get("city") or "")
            try_set_optional_agent_var(context, "partner_role", partner.get("role") or "")

            referral_bdo_id = normalize_referral_code(self.bdo_id) or normalize_referral_code(
                get_optional_agent_var(context, "referral_bdo_id")
            )
            if referral_bdo_id:
                try:
                    async with httpx.AsyncClient(timeout=15) as client:
                        response = await client.post(
                            f"{BACKEND_URL}/auth/link-referral",
                            json={"phone": phone, "bdoId": referral_bdo_id},
                        )
                    response.raise_for_status()
                except Exception:
                    pass

            return SarvamToolOutput(
                message_to_user=build_main_menu(partner.get("name") or "there"),
                context=context,
            )

        if login_response.status_code != 404:
            return SarvamToolOutput(
                message_to_user="There was a login issue. Please try again in a moment.",
                context=context,
            )

        if not self.name:
            return SarvamToolOutput(
                message_to_user="What's your full name?",
                context=context,
            )

        normalized_role = normalize_role(self.role)
        if not normalized_role:
            return SarvamToolOutput(
                message_to_user="Please choose your role:\n1) Nurse\n2) Paramedic\n3) Physiotherapist",
                context=context,
            )

        state_name = normalize_state(self.state) if self.state else None
        if not state_name:
            return SarvamToolOutput(
                message_to_user="Please choose your state first from the numbered menu.",
                context=context,
            )

        resolved_city = resolve_city(self.city, state_name)

        if not resolved_city:
            return SarvamToolOutput(
                message_to_user="Please choose a valid city from the menu.",
                context=context,
            )

        final_city, _ = resolved_city
        referral_bdo_id = normalize_referral_code(self.bdo_id) or normalize_referral_code(
            get_optional_agent_var(context, "referral_bdo_id")
        )

        payload = {
            "name": self.name.strip(),
            "phone": phone,
            "role": normalized_role,
            "city": final_city,
        }

        if self.organization_name and self.organization_name.strip():
            payload["organizationName"] = self.organization_name.strip()

        if referral_bdo_id:
            payload["bdoId"] = referral_bdo_id

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(f"{BACKEND_URL}/auth/register", json=payload)

        if response.status_code == 409:
            async with httpx.AsyncClient(timeout=15) as client:
                login_response = await client.post(
                    f"{BACKEND_URL}/auth/login",
                    json={"phone": phone},
                )
            login_response.raise_for_status()
            data = login_response.json()
        else:
            response.raise_for_status()
            data = response.json()

        partner = data.get("partner") or {}
        try_set_optional_agent_var(context, "partner_jwt", data.get("accessToken") or "")
        try_set_optional_agent_var(context, "needs_onboarding", "false")
        try_set_optional_agent_var(context, "partner_phone", phone)
        try_set_optional_agent_var(context, "partner_name", partner.get("name") or self.name.strip())
        try_set_optional_agent_var(context, "partner_city", partner.get("city") or final_city)
        try_set_optional_agent_var(context, "partner_role", partner.get("role") or normalized_role)

        if referral_bdo_id:
            try_set_optional_agent_var(context, "referral_bdo_id", referral_bdo_id)

        return SarvamToolOutput(
            message_to_user=(
                "Registration completed successfully.\n"
                + build_main_menu(partner.get("name") or self.name.strip())
            ),
            context=context,
        )


class SubmitLead(SarvamTool):
    patient_name: str = Field(description="Patient full name")
    patient_phone: str = Field(description="Patient 10-digit phone number")
    service_type: Optional[str] = Field(default=None, description="Service type")

    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        token = get_optional_agent_var(context, "partner_jwt")
        if not token:
            return SarvamToolOutput(
                message_to_user="Session expired. Please message again to restart.",
                context=context,
            )

        patient_phone = normalize_phone(self.patient_phone)
        if len(patient_phone) != 10:
            return SarvamToolOutput(
                message_to_user="Please share a valid 10-digit patient phone number.",
                context=context,
            )

        normalized_service = normalize_service(self.service_type) if self.service_type else None

        payload = {
            "patientName": self.patient_name.strip(),
            "phone": patient_phone,
            "serviceType": normalized_service,
            "city": get_optional_agent_var(context, "partner_city"),
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
                + (f"\nLead ID: {lead_id}" if lead_id else "")
            ),
            context=context,
        )


class GetWallet(SarvamTool):
    async def run(self, context: SarvamToolContext) -> SarvamToolOutput:
        token = get_optional_agent_var(context, "partner_jwt")
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
                message_to_user=data.get("message", "Wallet is coming soon."),
                context=context,
            )

        summary = data.get("summary") or {}
        return SarvamToolOutput(
            message_to_user=(
                "Wallet 💰\n"
                f"Total: {summary.get('total_earned')}\n"
                f"Pending: {summary.get('pending')}\n"
                f"Paid: {summary.get('paid')}"
            ),
            context=context,
        )


CaptureReferralCode.model_rebuild()
GetLanguageOptions.model_rebuild()
SwitchLanguage.model_rebuild()
GetStates.model_rebuild()
GetCitiesForState.model_rebuild()
RegisterPartner.model_rebuild()
SubmitLead.model_rebuild()
GetWallet.model_rebuild()
ShowMainMenu.model_rebuild()
