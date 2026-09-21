from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class RequestLog(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    client_id = Column(String, index=True)
    ip = Column(String)
    endpoint = Column(String, index=True)
    method = Column(String)
    status_code = Column(Integer)
    request_size = Column(Integer, default=0)
    response_size = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)

class ClientBehavior(Base):
    __tablename__ = "client_behavior"

    client_id = Column(String, primary_key=True, index=True)
    ip = Column(String)
    request_count = Column(Integer, default=0)
    requests_per_minute = Column(Float, default=0.0)
    login_failures = Column(Integer, default=0)
    current_risk = Column(Float, default=0.0)
    risk_level = Column(String, default="NORMAL") # NORMAL, SUSPICIOUS, HIGH_RISK, CRITICAL
    current_action = Column(String, default="ALLOW") # ALLOW, RATE_LIMIT, STRICT_RATE_LIMIT, CHALLENGE, BLOCK
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    client_id = Column(String, index=True)
    endpoint = Column(String)
    risk_score = Column(Float)
    decision = Column(String) # ALLOW, RATE_LIMIT, STRICT_RATE_LIMIT, CHALLENGE, BLOCK
    reason = Column(Text)
    action = Column(String)
    result = Column(Integer) # HTTP status code returned to client

class FeedbackLog(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("security_events.id"), nullable=True)
    client_id = Column(String, index=True)
    previous_action = Column(String)
    traffic_before = Column(Float)
    traffic_after = Column(Float)
    result = Column(String) # IMPROVED, ESCALATED, STABLE
    policy_update = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
