"""Resume text → suggested profile values (T-050, master flow §4.5).

Rule-based, no external service. Every value comes with a confidence between 0 and 1; values under
LOW_CONFIDENCE are shown highlighted for the candidate to check. Nothing here is saved: the
candidate confirms each section, which saves it through the normal profile endpoints, so
eligibility keeps running on structured data only.
"""

import re
from datetime import date

LOW_CONFIDENCE = 0.6

MONTHS = {m: i for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], start=1
)}  # fmt: skip

# Headings that start a section (lower-case, without trailing colon).
HEADINGS = {
    "education": ("education", "academic qualification", "academic qualifications",
                  "qualifications"),
    "experience": ("experience", "work experience", "professional experience", "employment history",
                   "employment"),
    "skills": ("skills", "technical skills", "key skills", "core competencies"),
    "publications": ("publications", "research", "research publications"),
    "references": ("references", "referees"),
    "registrations": ("professional registration", "professional registrations", "registrations",
                      "memberships", "licenses", "certifications and registrations"),
    "statement": ("objective", "career objective", "summary", "profile", "statement of purpose",
                  "about me"),
}  # fmt: skip

# Qualification level codes (qualification_levels seed), most specific first.
LEVEL_PATTERNS = [
    ("phd", r"\bph\.?\s?d\b|\bdoctorate\b"),
    ("mphil", r"\bm\.?\s?phil\b|\bm\.?s\.?\b(?!\s*office)"),
    ("master", r"\bmaster'?s?\b|\bm\.?sc\b|\bm\.?a\b|\bmba\b|\bm\.?com\b"),
    ("bachelor16", r"\bb\.?e\b|\bb\.?s\.?\b|\bbs\s|\bbsc\s*\(?hons|\bb\.?tech\b|\bbba\b|\bmbbs\b|"
                   r"\bb\.?\s?sc\.?\s+(?:\w+\s+)?engineering\b|"
                   r"\bbachelor of (engineering|science in)\b|\bbs[a-z]{2}\b"),
    ("bachelor14", r"\bb\.?a\b|\bb\.?sc\b|\bb\.?com\b|\bbachelor\b|\bgraduat"),
    ("dae", r"\bd\.?a\.?e\b|\bdiploma of associate engineer"),
    ("intermediate", r"\bintermediate\b|\bhssc\b|\bf\.?sc\b|\bi\.?cs\b|\bf\.?a\b|"
                     r"\bi\.?com\b|\bhsc\b"),
    ("matric", r"\bmatric\b|\bssc\b|\bo[- ]?level"),
]  # fmt: skip

EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
MOBILE = re.compile(r"(?:\+92[\s-]?|0)3\d{2}[\s-]?\d{7}")
YEAR = re.compile(r"\b(19[5-9]\d|20\d\d)\b")
PERCENT = re.compile(r"(\d{2,3}(?:\.\d+)?)\s*%")
DATE_NUMERIC = re.compile(r"\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\b")
DATE_WORDS = re.compile(r"\b(\d{1,2})\s+([a-z]{3})[a-z]*,?\s+(\d{4})\b", re.I)
MONTH_YEAR = r"(?:([a-z]{3})[a-z]*\.?\s+)?(19[5-9]\d|20\d\d)"
RANGE = re.compile(
    MONTH_YEAR + r"\s*(?:-|–|—|to)\s*(?:" + MONTH_YEAR + r"|(present|current|date|now))", re.I
)
REGISTRATION = re.compile(
    # The number must contain a digit, so words like "Registration" aren't taken for it.
    r"\b(PEC|PMDC|PMC|PNC|PBC|ICAP|ICMAP)\b[^\n]*?(?:no\.?|number|#)?\s*[:\-]?\s*"
    r"([A-Z0-9/-]*\d[A-Z0-9/-]*)",
    re.I,
)


def _item(value, confidence):
    return {"value": value, "confidence": round(confidence, 2)}


def _lines(text):
    return [re.sub(r"\s+", " ", line).strip(" \t•·-*") for line in text.splitlines()]


def _heading_of(line):
    key = line.lower().rstrip(":").strip()
    for section, names in HEADINGS.items():
        if key in names:
            return section
    return None


def split_sections(lines):
    """{section: [lines]}; lines before the first heading go under 'top'."""
    sections = {"top": []}
    current = "top"
    for line in lines:
        if not line:
            continue
        heading = _heading_of(line) if len(line) < 40 else None
        if heading:
            current = heading
            sections.setdefault(current, [])
        else:
            sections.setdefault(current, []).append(line)
    return sections


def _parse_date(text):
    match = DATE_NUMERIC.search(text)
    if match:
        day, month, year = (int(g) for g in match.groups())
        try:
            return date(year, month, day)
        except ValueError:
            return None
    match = DATE_WORDS.search(text)
    if match and match.group(2).lower()[:3] in MONTHS:
        try:
            return date(
                int(match.group(3)), MONTHS[match.group(2).lower()[:3]], int(match.group(1))
            )
        except ValueError:
            return None
    return None


def _labelled(lines, *labels):
    """Value after 'Label:' on any line, e.g. "Father's Name: Ali Khan"."""
    pattern = re.compile(r"^(?:" + "|".join(labels) + r")\s*[:\-]\s*(.+)$", re.I)
    for line in lines:
        match = pattern.match(line)
        if match:
            return match.group(1).strip()
    return None


def _personal(lines):
    top = [line for line in lines[:8] if line]
    name = _labelled(lines, "name", "full name")
    name_confidence = 0.9
    if not name:
        name_confidence = 0.6
        name = next(
            (
                line
                for line in top
                if re.fullmatch(r"[A-Za-z .']{3,60}", line)
                and 2 <= len(line.split()) <= 4
                and not re.search(r"resume|curriculum|vitae|cv\b", line, re.I)
            ),
            None,
        )
    father = _labelled(lines, "father'?s? name", "father name", "s/o", "son of", "d/o")
    dob_text = _labelled(lines, "date of birth", "dob", "d\\.o\\.b")
    dob = _parse_date(dob_text) if dob_text else None
    result = {}
    if name:
        result["fullName"] = _item(name.title() if name.isupper() else name, name_confidence)
    if father:
        result["fatherName"] = _item(father, 0.85)
    if dob:
        result["dob"] = _item(dob.isoformat(), 0.85)
    return result


def _contact(text, lines):
    result = {}
    email = EMAIL.search(text)
    if email:
        result["email"] = _item(email.group(0), 0.95)
    address = _labelled(lines, "address", "postal address", "residential address")
    if address:
        result["currentAddress"] = _item(address, 0.7)
    return result


def _level_of(line):
    lower = line.lower()
    for code, pattern in LEVEL_PATTERNS:
        if re.search(pattern, lower):
            return code
    return None


INSTITUTION_WORDS = r"(?:University|College|School|Institute|Board|Academy)"
INSTITUTION = re.compile(
    r"((?:[A-Z][\w&.']*\s+){0,5}" + INSTITUTION_WORDS + r"(?:\s+(?:of|and|&|[A-Z][\w&.']*))*)"
)


def _institution(line):
    """The text after "from" (up to a year or %), else a capitalised phrase around a word like
    University or Board."""
    after_from = re.search(
        r"\bfrom\s+([^,|%]+?)(?=\s+(?:19|20)\d\d\b|\s+\d+(?:\.\d+)?\s*%|,|\||$)", line
    )
    if after_from:
        return after_from.group(1).strip()
    match = INSTITUTION.search(line)
    return match.group(1).strip() if match else ""


def _education(lines):
    records = []
    for line in lines:
        level = _level_of(line)
        if not level:
            continue
        years = YEAR.findall(line)
        marks = PERCENT.search(line)
        discipline = re.search(r"\(([^)]{2,60})\)|\bin ([A-Za-z &]{3,60})", line)
        found = {
            "level": level,
            "discipline": (
                (discipline.group(1) or discipline.group(2)).strip() if discipline else ""
            ),
            "institution": _institution(line),
            "year": int(years[-1]) if years else None,
            "marksPercent": (
                float(marks.group(1)) if marks and float(marks.group(1)) <= 100 else None
            ),
        }
        filled = sum(
            1 for key in ("discipline", "institution", "year", "marksPercent") if found[key]
        )
        records.append({**found, "confidence": round(0.4 + 0.12 * filled, 2)})
    return records


def _month(name):
    return MONTHS.get((name or "jan").lower()[:3], 1)


def _experience(lines):
    records = []
    for index, line in enumerate(lines):
        match = RANGE.search(line)
        if not match:
            continue
        start_month, start_year, end_month, end_year, ongoing = match.groups()
        start = date(int(start_year), _month(start_month), 1)
        current = bool(ongoing)
        end = None if current else date(int(end_year), _month(end_month), 1)
        title = (line[: match.start()] + line[match.end() :]).strip(" ,|–-()")
        if not title and index + 1 < len(lines):
            title = lines[index + 1]
        parts = [
            p.strip() for p in re.split(r"\s+at\s+|,|\||–| - ", title, maxsplit=1) if p.strip()
        ]
        designation = parts[0] if parts else ""
        organization = parts[1] if len(parts) > 1 else ""
        confidence = 0.55 + (0.15 if designation else 0) + (0.15 if organization else 0)
        records.append(
            {
                "designation": designation,
                "organization": organization,
                "startDate": start.isoformat(),
                "endDate": end.isoformat() if end else None,
                "current": current,
                "confidence": round(min(confidence, 0.85), 2),
            }
        )
    return records


def _list_items(lines):
    items = []
    for line in lines:
        items.extend(part.strip() for part in re.split(r"[,;]", line) if part.strip())
    return items


def _registrations(text):
    records = []
    for match in REGISTRATION.finditer(text):
        records.append(
            {"body": match.group(1).upper(), "registrationNo": match.group(2), "confidence": 0.75}
        )
    return records


def _references(lines):
    records = []
    for line in lines:
        if re.search(r"available on request", line, re.I):
            return []
        parts = [p.strip() for p in re.split(r",|\|", line) if p.strip()]
        if not parts or not re.match(
            r"^(?:mr|ms|mrs|dr|prof|engr)?\.?\s*[A-Za-z .]{3,60}$", parts[0], re.I
        ):
            continue
        email = EMAIL.search(line)
        phone = MOBILE.search(line)
        records.append(
            {
                "name": parts[0],
                "designation": parts[1] if len(parts) > 1 and not EMAIL.search(parts[1]) else None,
                "organization": parts[2] if len(parts) > 2 and not EMAIL.search(parts[2]) else None,
                "email": email.group(0) if email else None,
                "phone": phone.group(0) if phone else None,
                "confidence": 0.5,
            }
        )
    return records


def parse_resume_text(text):
    """Suggested profile sections from resume text. `parsed` is False when nothing useful was
    found (e.g. a scanned image), so the UI can open the builder instead."""
    lines = _lines(text or "")
    sections = split_sections(lines)
    top = sections.get("top", [])
    result = {
        "personal": _personal(lines),
        "contact": _contact(text or "", lines),
        "education": _education(sections.get("education", []) or lines),
        "experience": _experience(sections.get("experience", [])),
        "skills": _list_items(sections.get("skills", [])),
        "registrations": _registrations(text or ""),
        "publications": [
            {"title": line, "year": int(y[-1]) if (y := YEAR.findall(line)) else None,
             "confidence": 0.5}
            for line in sections.get("publications", [])
        ],  # fmt: skip
        "references": _references(sections.get("references", [])),
    }
    statement = " ".join(sections.get("statement", []))
    if statement:
        result["statementOfPurpose"] = _item(statement[:4000], 0.6)
    found = any(result[key] for key in result) and len(" ".join(top + lines)) > 40
    return {"parsed": bool(found), "lowConfidence": LOW_CONFIDENCE, "sections": result}
