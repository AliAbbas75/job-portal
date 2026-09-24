"""Fixed value sets shared by services and schemas (not stored in tables)."""

from datetime import timedelta

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
