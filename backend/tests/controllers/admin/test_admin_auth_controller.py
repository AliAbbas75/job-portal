import pytest
from flask import g

from app.controllers.auth_guard import staff_required
from app.extensions import db
from app.models import AuditLog
from app.models.enums import StaffRole
from app.utils.errors import AppError
from tests.conftest import STAFF_PASSWORD


def _login(client, email, password=STAFF_PASSWORD):
    return client.post("/api/admin/auth/login", json={"email": email, "password": password})


def test_staff_login_returns_token_and_profile(client, make_staff):
    user = make_staff(role=StaffRole.APPROVER, email="approver@example.com")
    response = _login(client, "Approver@Example.com")  # email is case-insensitive
    assert response.status_code == 200
    body = response.get_json()
    assert body["staff"] == {
        "id": str(user.id),
        "name": "Test Staff",
        "email": "approver@example.com",
        "role": "approver",
        "department": None,
    }
    headers = {"Authorization": f"Bearer {body['token']}"}
    session = client.get("/api/admin/auth/session", headers=headers).get_json()
    assert session["staff"]["role"] == "approver"
    assert db.session.query(AuditLog).filter_by(action="staff.logged_in").count() == 1


@pytest.mark.parametrize(
    ("email", "password"),
    [("admin@example.com", "wrong-password-123"), ("nobody@example.com", STAFF_PASSWORD)],
)
def test_bad_credentials_get_one_error(client, make_staff, email, password):
    make_staff()
    response = _login(client, email, password)
    assert response.status_code == 401
    assert response.get_json()["code"] == "invalid_credentials"


def test_inactive_staff_cannot_log_in_or_use_old_token(client, make_staff, staff_headers):
    user = make_staff()
    headers = staff_headers(user)
    user.is_active = False
    db.session.commit()
    assert _login(client, user.email).status_code == 401
    assert client.get("/api/admin/auth/session", headers=headers).status_code == 401


def test_logout_ends_the_token(client, make_staff, staff_headers):
    headers = staff_headers(make_staff())
    assert client.post("/api/admin/auth/logout", headers=headers).status_code == 204
    assert client.get("/api/admin/auth/session", headers=headers).status_code == 401


def test_candidate_token_is_not_a_staff_token(client, make_candidate, auth_headers):
    response = client.get("/api/admin/auth/session", headers=auth_headers(make_candidate()))
    assert response.status_code == 403


def test_staff_required_checks_role(app, make_staff, staff_headers):
    @staff_required(StaffRole.APPROVER, StaffRole.ADMIN)
    def approve():
        return g.staff.role.value

    for role, allowed in [
        (StaffRole.JOB_CREATOR, False),
        (StaffRole.APPROVER, True),
        (StaffRole.ADMIN, True),
    ]:
        user = make_staff(role=role, email=f"{role.value}@example.com")
        with app.test_request_context(headers=staff_headers(user)):
            if allowed:
                assert approve() == role.value
            else:
                with pytest.raises(AppError) as error:
                    approve()
                assert error.value.code == "forbidden"
