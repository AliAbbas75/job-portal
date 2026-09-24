from datetime import UTC, date, datetime

import pytest

from app.utils.dates import age_on


@pytest.mark.parametrize(
    ("dob", "on", "expected"),
    [
        (date(2000, 10, 15), date(2026, 10, 15), 26),  # birthday on the day counts
        (date(2000, 10, 16), date(2026, 10, 15), 25),  # day before birthday
        (date(2000, 1, 1), date(2026, 12, 31), 26),
        (date(2004, 2, 29), date(2026, 2, 28), 21),  # leap-day birthday, non-leap year
        (date(2004, 2, 29), date(2026, 3, 1), 22),
    ],
)
def test_age_on(dob, on, expected):
    assert age_on(dob, on) == expected


def test_age_on_accepts_datetimes():
    closing = datetime(2026, 10, 15, 23, 59, tzinfo=UTC)
    assert age_on(date(2000, 10, 15), closing) == 26
