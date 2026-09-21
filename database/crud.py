from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from .models import RequestLog, ClientBehavior, SecurityEvent, FeedbackLog

def log_request(db: Session, client_id: str, ip: str, endpoint: str, method: str, status_code: int, request_size: int = 0, response_size: int = 0, latency_ms: float = 0.0):
    log = RequestLog(
        client_id=client_id,
        ip=ip,
        endpoint=endpoint,
        method=method,
        status_code=status_code,
        request_size=request_size,
        response_size=response_size,
        latency_ms=latency_ms
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def upsert_client_behavior(db: Session, client_id: str, ip: str, req_count: int, rpm: float, login_failures: int, risk: float, risk_level: str, action: str):
    behavior = db.query(ClientBehavior).filter(ClientBehavior.client_id == client_id).first()
    if not behavior:
        behavior = ClientBehavior(
            client_id=client_id,
            ip=ip,
            request_count=req_count,
            requests_per_minute=rpm,
            login_failures=login_failures,
            current_risk=risk,
            risk_level=risk_level,
            current_action=action
        )
        db.add(behavior)
    else:
        behavior.ip = ip
        behavior.request_count = req_count
        behavior.requests_per_minute = rpm
        behavior.login_failures = login_failures
        behavior.current_risk = risk
        behavior.risk_level = risk_level
        behavior.current_action = action
        behavior.last_seen = datetime.utcnow()
    
    db.commit()
    db.refresh(behavior)
    return behavior

def log_security_event(db: Session, client_id: str, endpoint: str, risk_score: float, decision: str, reason: str, action: str, result: int):
    event = SecurityEvent(
        client_id=client_id,
        endpoint=endpoint,
        risk_score=risk_score,
        decision=decision,
        reason=reason,
        action=action,
        result=result
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def log_feedback(db: Session, client_id: str, previous_action: str, traffic_before: float, traffic_after: float, result: str, policy_update: str, event_id: int = None):
    fb = FeedbackLog(
        event_id=event_id,
        client_id=client_id,
        previous_action=previous_action,
        traffic_before=traffic_before,
        traffic_after=traffic_after,
        result=result,
        policy_update=policy_update
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

def get_top_stats(db: Session):
    total_requests = db.query(RequestLog).count()
    
    # Requests in last 60 seconds
    one_min_ago = datetime.utcnow() - timedelta(seconds=60)
    reqs_last_min = db.query(RequestLog).filter(RequestLog.timestamp >= one_min_ago).count()
    rps = round(reqs_last_min / 60.0, 2)
    
    active_clients = db.query(ClientBehavior).count()
    suspicious_clients = db.query(ClientBehavior).filter(ClientBehavior.risk_level.in_(["SUSPICIOUS", "HIGH_RISK", "CRITICAL"])).count()
    blocked_requests = db.query(SecurityEvent).filter(SecurityEvent.action == "BLOCK").count()
    
    return {
        "total_requests": total_requests,
        "requests_per_sec": rps,
        "active_clients": active_clients,
        "suspicious_clients": suspicious_clients,
        "blocked_requests": blocked_requests
    }

def get_recent_requests(db: Session, limit: int = 50):
    return db.query(RequestLog).order_by(RequestLog.id.desc()).limit(limit).all()

def get_recent_events(db: Session, limit: int = 50):
    return db.query(SecurityEvent).order_by(SecurityEvent.id.desc()).limit(limit).all()

def get_all_client_behaviors(db: Session):
    return db.query(ClientBehavior).order_by(ClientBehavior.current_risk.desc()).all()

def reset_db_data(db: Session):
    db.query(RequestLog).delete()
    db.query(ClientBehavior).delete()
    db.query(SecurityEvent).delete()
    db.query(FeedbackLog).delete()
    db.commit()
