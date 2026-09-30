def test_register_and_login_flow(client):
    # 1. Register analyst user
    reg_payload = {
        "email": "analyst1@enterprise.lan",
        "password": "SecurePassword123!",
        "full_name": "SOC Analyst One",
        "role_name": "SECURITY_ANALYST"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["success"] is True
    assert reg_data["data"]["email"] == "analyst1@enterprise.lan"
    assert reg_data["data"]["role"]["name"] == "SECURITY_ANALYST"

    # 2. Login with valid credentials
    login_payload = {
        "email": "analyst1@enterprise.lan",
        "password": "SecurePassword123!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()["data"]
    assert "access_token" in token_data
    access_token = token_data["access_token"]

    # 3. Get /me user profile using JWT token
    headers = {"Authorization": f"Bearer {access_token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()["data"]
    assert me_data["email"] == "analyst1@enterprise.lan"

def test_invalid_login_audit_log(client):
    login_payload = {
        "email": "unknown@enterprise.lan",
        "password": "WrongPassword!"
    }
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 401
    err = res.json()
    assert err["success"] is False
    assert err["error"]["code"] == "INVALID_CREDENTIALS"

def test_permission_authorization(client):
    # 1. Register ADMIN user
    admin_payload = {
        "email": "admin@enterprise.lan",
        "password": "AdminPassword123!",
        "full_name": "Security Admin",
        "role_name": "ADMIN"
    }
    client.post("/api/v1/auth/register", json=admin_payload)
    
    # Login as admin
    login_admin = client.post("/api/v1/auth/login", json={"email": "admin@enterprise.lan", "password": "AdminPassword123!"})
    assert login_admin.status_code == 200
    admin_token = login_admin.json()["data"]["access_token"]
    
    # Admin can access /users list
    headers = {"Authorization": f"Bearer {admin_token}"}
    users_res = client.get("/api/v1/users/", headers=headers)
    assert users_res.status_code == 200
    assert len(users_res.json()["data"]) >= 1

    # 2. Register ANALYST user
    analyst_payload = {
        "email": "analyst2@enterprise.lan",
        "password": "AnalystPassword123!",
        "full_name": "SOC Analyst Two",
        "role_name": "SECURITY_ANALYST"
    }
    client.post("/api/v1/auth/register", json=analyst_payload)

    # Login as analyst
    login_analyst = client.post("/api/v1/auth/login", json={"email": "analyst2@enterprise.lan", "password": "AnalystPassword123!"})
    assert login_analyst.status_code == 200
    analyst_token = login_analyst.json()["data"]["access_token"]
    
    # Analyst cannot access /users list (requires system:admin)
    analyst_headers = {"Authorization": f"Bearer {analyst_token}"}
    forbidden_res = client.get("/api/v1/users/", headers=analyst_headers)
    assert forbidden_res.status_code == 403
