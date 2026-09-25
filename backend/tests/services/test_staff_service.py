import pytest

from app.models.enums import StaffRole
from app.services import staff_service
from app.utils.errors import AppError


def test_password_is_hashed_with_argon2id(make_staff):
    user = make_staff()
    assert user.password_hash.startswith("$argon2id$")
    assert "correct-horse" not in user.password_hash


@pytest.mark.parametrize(
    ("email", "password", "code"),
    [("new@example.com", "short", "weak_password"), ("ADMIN@example.com", "x" * 12, "email_taken")],
)
def test_create_staff_rules(make_staff, email, password, code):
    make_staff()
    with pytest.raises(AppError) as error:
        staff_service.create_staff("Someone", email, password, StaffRole.ADMIN)
    assert error.value.code == code
