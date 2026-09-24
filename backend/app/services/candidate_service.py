from app.extensions import db
from app.models import CandidateAccount, CandidateProfile


def get_active_account(account_id):
    """The active candidate account for a login token's identity, or None."""
    account = db.session.get(CandidateAccount, account_id)
    return account if account is not None and account.is_active else None


def profile_of(account):
    """The candidate's permanent profile (created at signup; created here if somehow missing)."""
    if account.profile is None:
        account.profile = CandidateProfile()
        db.session.commit()
    return account.profile
