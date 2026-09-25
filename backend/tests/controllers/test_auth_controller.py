import json

import pytest

from app.extensions import db
from app.models import AuditLog, CandidateAccount
from app.services import captcha_service

CNIC = "00000-0000000-1"
MOBILE = "0300-0000000"


def _otp(client, purpose, **overrides):
    payload = {"cnic": CNIC, "mobile": MOBILE, **overrides}
    return client.post(f"/api/auth/{purpose}/otp", json=payload)


def _verify(client, purpose, otp, **overrides):
    payload = {"cnic": CNIC, "mobile": MOBILE, "otp": otp, **overrides}
    return client.post(f"/api/auth/{purpose}/verify", json=payload)


def _sign_up(client, last_otp):
    assert _otp(client, "signup").status_code == 200
    return _verify(client, "signup", last_otp())


def test_signup_creates_account_and_permanent_profile(client, sms_outbox, last_otp):
    response = _otp(client, "signup")
    assert response.get_json() == {"expiresInSeconds": 300}
    assert sms_outbox[-1][0] == "03000000000"  # dash removed

    response = _verify(client, "signup", last_otp())
    assert response.status_code == 201
    body = response.get_json()
    assert body["candidate"] == {"id": "1", "cnic": CNIC, "name": ""}

    account = db.session.query(CandidateAccount).one()
    assert account.mobile == "03000000000" and account.profile is not None
    assert account.last_login_at is not None
    assert db.session.query(AuditLog).filter_by(action="candidate.signed_up").count() == 1

    # The token works on M4's candidate endpoints.
    headers = {"Authorization": f"Bearer {body['token']}"}
    assert client.get("/api/profile", headers=headers).status_code == 200


def test_signup_rejects_duplicate_cnic(client, make_candidate, sms_outbox):
    make_candidate(cnic=CNIC)
    response = _otp(client, "signup")
    assert response.status_code == 409
    assert response.get_json()["code"] == "cnic_taken"
    assert sms_outbox == []


def test_signup_validates_input(client):
    response = _otp(client, "signup", cnic="1234512345671", mobile="12345")
    assert response.status_code == 422
    assert set(response.get_json()["fields"]) == {"cnic", "mobile"}
    assert _otp(client, "reset").status_code == 404


def test_wrong_code_is_rejected(client, sms_outbox, last_otp):
    _otp(client, "signup")
    wrong = "000000" if last_otp() != "000000" else "111111"
    response = _verify(client, "signup", wrong)
    assert response.status_code == 400
    assert response.get_json()["code"] == "invalid_otp"
    assert db.session.query(CandidateAccount).count() == 0


def test_login_with_registered_cnic_and_mobile(client, make_candidate, sms_outbox, last_otp):
    make_candidate(cnic=CNIC, mobile="03000000000")
    assert _otp(client, "login").status_code == 200
    response = _verify(client, "login", last_otp())
    assert response.status_code == 200
    assert response.get_json()["candidate"]["cnic"] == CNIC


@pytest.mark.parametrize("has_account", [True, False])
def test_login_needs_matching_account(client, make_candidate, sms_outbox, has_account):
    if has_account:
        make_candidate(cnic=CNIC, mobile="03001111111")  # registered with another number
    response = _otp(client, "login")
    assert response.status_code == 404
    assert response.get_json()["code"] == "account_not_found"
    assert sms_outbox == []


def test_session_and_logout(client, sms_outbox, last_otp):
    token = _sign_up(client, last_otp).get_json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/auth/session", headers=headers).get_json()["candidate"]["id"] == "1"

    assert client.post("/api/auth/logout", headers=headers).status_code == 204
    response = client.get("/api/auth/session", headers=headers)
    assert response.status_code == 401
    assert response.get_json()["code"] == "unauthorized"


def test_staff_token_is_not_a_candidate_token(client, make_staff, staff_headers):
    response = client.get("/api/auth/session", headers=staff_headers(make_staff()))
    assert response.status_code == 403


class _FakeResponse:
    def __init__(self, body):
        self.body = json.dumps(body).encode()

    def read(self, *args):
        return self.body

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


def test_signup_checks_captcha_when_configured(app, client, monkeypatch, sms_outbox):
    app.config["CAPTCHA_SECRET_KEY"] = "test-secret"
    sent = {}

    def fake_urlopen(url, data, timeout):
        sent["data"] = data.decode()
        return _FakeResponse({"success": "good-token" in sent["data"]})

    monkeypatch.setattr(captcha_service, "urlopen", fake_urlopen)
    try:
        assert _otp(client, "signup").get_json()["code"] == "captcha_failed"
        assert _otp(client, "signup", captchaToken="bad").get_json()["code"] == "captcha_failed"
        assert _otp(client, "signup", captchaToken="good-token").status_code == 200
    finally:
        app.config["CAPTCHA_SECRET_KEY"] = None
    assert "secret=test-secret" in sent["data"]
