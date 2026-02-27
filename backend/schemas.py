from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ServiceBase(BaseModel):
    name: str
    category: str
    rating: Optional[float] = None

class ServiceCreate(ServiceBase):
    lat: float
    lng: float

class ServiceUpdate(ServiceBase):
    lat: Optional[float] = None
    lng: Optional[float] = None

class ServiceResponse(ServiceBase):
    id: int
    lat: float
    lng: float
    created_at: datetime
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str
