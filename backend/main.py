from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI(title="Protected Target API", version="2.0.0")

class LoginRequest(BaseModel):
    username: str
    password: str

class PaymentRequest(BaseModel):
    student_id: str
    amount: float
    semester: int

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/users")
def get_users():
    return {"status": "success", "data": [
        {"id": 1, "name": "Alice Smith", "email": "alice@example.com", "role": "admin"},
        {"id": 2, "name": "Bob Jones", "email": "bob@example.com", "role": "user"}
    ]}

@app.get("/api/products")
def get_products():
    return {"status": "success", "data": [
        {"id": 101, "name": "Quantum Laptop", "price": 1299.99},
        {"id": 102, "name": "Cyber Phone", "price": 899.99}
    ]}

@app.get("/api/orders")
def get_orders():
    return {"status": "success", "data": [{"order_id": "ORD-9081", "amount": 249.99}]}

@app.post("/api/login")
def login(credentials: LoginRequest):
    if credentials.username == "admin" and credentials.password == "secret123":
        return {"status": "success", "token": "mock-jwt-token-789"}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@app.get("/api/profile")
def get_profile():
    return {"status": "success", "profile": {"id": 1, "username": "admin"}}

@app.get("/api/jiohotstar/home")
def jiohotstar_home():
    return {"system": "JioHotstar", "page": "Homepage",
            "featured_banners": ["IPL 2026 Live Match", "Blockbuster Movie Premiere", "Trending Shows"],
            "recommended_categories": ["Sports", "Movies", "News", "TV Series"]}

@app.post("/api/jiohotstar/login")
def jiohotstar_login(credentials: LoginRequest):
    if credentials.username == "subscriber" and credentials.password == "hotstar123":
        return {"system": "JioHotstar", "status": "success", "subscription": "VIP Premium 4K"}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Hotstar credentials")

@app.get("/api/jiohotstar/livestream")
def jiohotstar_livestream():
    return {"system": "JioHotstar", "stream_title": "IND vs AUS Final T20 - 4K Ultra HD",
            "concurrent_viewers": 1420500, "status": "LIVE NOW"}

@app.get("/api/jiohotstar/movie")
def jiohotstar_movie():
    return {"system": "JioHotstar", "title": "Avenger: Secret Wars",
            "duration": "180 mins", "genre": "Sci-Fi / Action", "rating": "4.9/5"}

@app.get("/api/iiitv/home")
def iiitv_home():
    return {"system": "IIIT Vadodara", "page": "Campus Portal",
            "announcements": ["Semester Registration Open", "Placement Drive 2026", "Research Symposium"]}

@app.post("/api/iiitv/login")
def iiitv_login(credentials: LoginRequest):
    if credentials.username == "student" and credentials.password == "iiitv2026":
        return {"system": "IIIT Vadodara", "status": "success", "roll_no": "202351001"}
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid IIITV credentials")

@app.post("/api/iiitv/payment")
def iiitv_payment(req: PaymentRequest):
    return {"system": "IIIT Vadodara", "transaction_id": "TXN-IIITV-884920",
            "student_id": req.student_id, "amount_paid": req.amount, "status": "SUCCESSFUL"}

@app.get("/api/iiitv/result")
def iiitv_result(roll_no: str = "202351001"):
    return {"system": "IIIT Vadodara", "roll_no": roll_no, "cgpa": 9.25, "semester": 6,
            "grades": {"CS301": "AA", "CS302": "AB", "CS303": "AA", "CS304": "AA"}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
