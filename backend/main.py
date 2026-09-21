from fastapi import FastAPI, HTTPException, Header, Request, status
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(
    title="Protected Target API",
    description="Target API service protected by the Agentic Security Gateway",
    version="1.0.0"
)

# Request schema for login
class LoginRequest(BaseModel):
    username: str
    password: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "protected-backend"}

@app.get("/api/users")
def get_users():
    return {
        "status": "success",
        "data": [
            {"id": 1, "name": "Alice Smith", "email": "alice@example.com", "role": "admin"},
            {"id": 2, "name": "Bob Jones", "email": "bob@example.com", "role": "user"},
            {"id": 3, "name": "Charlie Brown", "email": "charlie@example.com", "role": "user"}
        ]
    }

@app.get("/api/products")
def get_products():
    return {
        "status": "success",
        "data": [
            {"id": 101, "name": "Quantum Laptop", "price": 1299.99, "stock": 45},
            {"id": 102, "name": "Cyber Phone", "price": 899.99, "stock": 120},
            {"id": 103, "name": "Noise Cancelling Headphones", "price": 249.99, "stock": 80}
        ]
    }

@app.get("/api/orders")
def get_orders():
    return {
        "status": "success",
        "data": [
            {"order_id": "ORD-9081", "user_id": 2, "amount": 249.99, "status": "shipped"},
            {"order_id": "ORD-9082", "user_id": 1, "amount": 1299.99, "status": "processing"}
        ]
    }

@app.post("/api/login")
def login(credentials: LoginRequest):
    # Mock authentication rule
    if credentials.username == "admin" and credentials.password == "secret123":
        return {
            "status": "success",
            "message": "Authentication successful",
            "token": "mock-jwt-token-xyz-789"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

@app.get("/api/profile")
def get_profile(authorization: Optional[str] = Header(None)):
    if not authorization or "mock-jwt-token" not in authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization token"
        )
    return {
        "status": "success",
        "profile": {
            "id": 1,
            "username": "admin",
            "email": "admin@security-demo.org",
            "mfa_enabled": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
