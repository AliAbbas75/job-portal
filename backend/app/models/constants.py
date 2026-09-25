"""Fixed value sets shared by services and schemas (not stored in tables)."""

from datetime import timedelta

from app.models.enums import ApplicationStatus

# (code, name, min BPS, max BPS): job search filter ranges.
BPS_RANGES = [
    ("1-4", "BPS 1–4", 1, 4),
    ("5-10", "BPS 5–10", 5, 10),
    ("11-14", "BPS 11–14", 11, 14),
    ("15-16", "BPS 15–16", 15, 16),
    ("17-22", "BPS 17 and above", 17, 22),
]

# Job search "closing within" filter.
CLOSING_WINDOWS = {"week": timedelta(days=7), "month": timedelta(days=30)}

EMPLOYMENT_TYPE_NAMES = [("permanent", "Permanent"), ("contract", "Contract")]
GENDER_NAMES = [("male", "Male"), ("female", "Female"), ("transgender", "Transgender")]
QUOTA_CLAIM_NAMES = [
    ("open_merit", "Open merit"),
    ("railway_employee_child", "Railway employee child"),
    ("minority", "Minority"),
    ("disability", "Person with disability"),
    ("ex_serviceman", "Ex-serviceman"),
    ("orphan", "Orphan"),
]
AGE_RELAXATION_NAMES = [
    ("none", "None"),
    ("railway_employee_child", "Railway employee child"),
    ("government_servant", "Government servant"),
]
TRADE_CERTIFICATE_NAMES = [
    ("none", "None"),
    ("carpenter", "Carpenter certificate"),
    ("electrician", "Electrician certificate"),
    ("fitter", "Fitter certificate"),
    ("welder", "Welder certificate"),
]


def next_application_statuses(status):
    """Statuses staff can move an application to (§4.9): any later step, or rejected.
    Rejected and the last step (offer) are final."""
    flow = [s for s in ApplicationStatus if s != ApplicationStatus.REJECTED]
    if status == ApplicationStatus.REJECTED or status == flow[-1]:
        return []
    return flow[flow.index(status) + 1 :] + [ApplicationStatus.REJECTED]
