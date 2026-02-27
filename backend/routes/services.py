from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from geoalchemy2 import functions as geo_func
from geoalchemy2.shape import to_shape, from_shape
from shapely.geometry import Point
from typing import List, Optional
from database import get_db
from models import Service, User
from schemas import ServiceCreate, ServiceResponse, ServiceUpdate
from auth import SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/services", tags=["services"])
admin_router = APIRouter(prefix="/admin", tags=["admin"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def format_service_response(service, distance_km=None):
    # Convert WKBElement to shapely Point to get lat/lng
    point = to_shape(service.location)
    return {
        "id": service.id,
        "name": service.name,
        "category": service.category,
        "rating": service.rating,
        "lat": point.y,
        "lng": point.x,
        "created_at": service.created_at,
        "distance_km": round(distance_km, 2) if distance_km is not None else None
    }

# --- Public APIs ---

@router.get("/", response_model=List[ServiceResponse])
def get_services(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Service)
    if category and category != "All":
        query = query.filter(Service.category == category)
    
    services = query.all()
    return [format_service_response(s) for s in services]

@router.get("/nearby", response_model=List[ServiceResponse])
def get_nearby_services(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(..., description="Radius in KM"),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # ST_DWithin uses meters for Geography
    center_point = f'POINT({lng} {lat})'
    
    # query services within radius and calculate distance
    # func.ST_Distance returns distance in meters for Geography
    query = db.query(
        Service,
        func.ST_Distance(Service.location, func.ST_GeogFromText(center_point)).label("distance")
    ).filter(
        func.ST_DWithin(Service.location, func.ST_GeogFromText(center_point), radius * 1000)
    )

    if category and category != "All":
        query = query.filter(Service.category == category)

    services_with_distance = query.order_by(text("distance")).all()

    return [format_service_response(s, dist / 1000) for s, dist in services_with_distance]

# --- Admin APIs (JWT Protected) ---

@router.post("/", response_model=ServiceResponse)
def create_service(service: ServiceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    point = f'POINT({service.lng} {service.lat})'
    db_service = Service(
        name=service.name,
        category=service.category,
        rating=service.rating,
        location=func.ST_GeogFromText(point)
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return format_service_response(db_service)

@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int, 
    service_update: ServiceUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service_update.model_dump(exclude_unset=True)
    
    if "lat" in update_data and "lng" in update_data:
        lat = update_data.pop("lat")
        lng = update_data.pop("lng")
        db_service.location = func.ST_GeogFromText(f'POINT({lng} {lat})')
    elif "lat" in update_data or "lng" in update_data:
         # To update partially we would need the other coordinate, for simplicity if either is provided we expect both or use old
         point = to_shape(db_service.location)
         lat = update_data.pop("lat", point.y)
         lng = update_data.pop("lng", point.x)
         db_service.location = func.ST_GeogFromText(f'POINT({lng} {lat})')

    for key, value in update_data.items():
        setattr(db_service, key, value)
    
    db.commit()
    db.refresh(db_service)
    return format_service_response(db_service)

@router.delete("/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db.delete(db_service)
    db.commit()
    return {"message": "Service deleted successfully"}

@admin_router.get("/services", response_model=List[ServiceResponse])
def get_admin_services(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    services = db.query(Service).all()
    return [format_service_response(s) for s in services]
