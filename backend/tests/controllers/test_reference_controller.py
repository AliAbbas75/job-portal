def test_reference_lists(client):
    body = client.get("/api/reference").get_json()
    assert {"code": "TRF", "name": "Traffic & Operations"} in body["departments"]
    punjab = next(p for p in body["provinces"] if p["code"] == "PB")
    assert "Lahore" in punjab["districts"]
    assert body["qualificationLevels"][0] == {"code": "matric", "name": "Matric / SSC", "rank": 1}
    assert {"code": "photo", "name": "Passport-size photograph"} in body["documentTypes"]
    assert body["employmentTypes"] == [
        {"code": "permanent", "name": "Permanent"},
        {"code": "contract", "name": "Contract"},
    ]
    assert body["bpsRanges"][0] == {"code": "1-4", "name": "BPS 1–4", "min": 1, "max": 4}
    assert [g["code"] for g in body["genders"]] == ["male", "female", "transgender"]
