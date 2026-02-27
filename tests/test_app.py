from fastapi.testclient import TestClient

from src.app import app, activities

client = TestClient(app)


def test_root_redirect():
    # avoid following the redirect so we can assert status code
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/static/index.html"


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_and_unregister_flow():
    name = "Chess Club"
    email = "new@mergington.edu"

    # sign up succeeds
    resp = client.post(f"/activities/{name}/signup", params={"email": email})
    assert resp.status_code == 200
    assert "Signed up" in resp.json()["message"]
    # look up participants from the source module directly so we always
    # inspect the current state
    from src import app as app_module
    assert email in app_module.activities[name]["participants"]

    # signing up again triggers 400
    resp = client.post(f"/activities/{name}/signup", params={"email": email})
    assert resp.status_code == 400

    # unregister succeeds
    resp = client.delete(f"/activities/{name}/signup", params={"email": email})
    assert resp.status_code == 200
    assert email not in activities[name]["participants"]

    # unregistering again returns 404
    resp = client.delete(f"/activities/{name}/signup", params={"email": email})
    assert resp.status_code == 404


def test_invalid_activity_handling():
    resp = client.post("/activities/DoesNotExist/signup", params={"email": "x@y.com"})
    assert resp.status_code == 404

    resp = client.delete("/activities/DoesNotExist/signup", params={"email": "x@y.com"})
    assert resp.status_code == 404
