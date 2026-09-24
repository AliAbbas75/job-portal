"""Date helpers."""

from datetime import date, datetime


def age_on(dob, on):
    """Whole years between `dob` and `on` (dates or datetimes). A birthday on `on` counts.

    Age is never stored; eligibility calculates it on the job's cutoff or closing date.
    """
    dob = dob.date() if isinstance(dob, datetime) else dob
    on = on.date() if isinstance(on, datetime) else on
    had_birthday = (on.month, on.day) >= (dob.month, dob.day)
    return on.year - dob.year - (0 if had_birthday else 1)


def is_future(value, today=None):
    return value > (today or date.today())
