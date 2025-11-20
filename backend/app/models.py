from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime, date
from decimal import Decimal


# ============================================
# Profile Models
# ============================================
class ProfileBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: Literal["worker", "lager", "admin"] = "worker"
    phone: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class Profile(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Baustelle Models
# ============================================
class BaustelleBase(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: bool = True


class BaustelleCreate(BaustelleBase):
    pass


class BaustelleUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: Optional[bool] = None


class Baustelle(BaustelleBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Category Models
# ============================================
class CategoryBase(BaseModel):
    name: str
    type: Literal["material", "maschine"]
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Item Models
# ============================================
class ItemBase(BaseModel):
    category_id: Optional[str] = None
    name: str
    type: Literal["material", "maschine"]
    unit: str
    description: Optional[str] = None
    stock_quantity: Decimal = Decimal("0")
    min_stock_level: Decimal = Decimal("0")
    image_url: Optional[str] = None
    is_active: bool = True
    barcode: Optional[str] = None
    current_stock: Optional[Decimal] = None
    min_stock: Optional[Decimal] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    category_id: Optional[str] = None
    name: Optional[str] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    stock_quantity: Optional[Decimal] = None
    min_stock_level: Optional[Decimal] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class Item(ItemBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Request Item Models
# ============================================
class RequestItemBase(BaseModel):
    item_id: str
    quantity: Decimal
    unit: str
    notes: Optional[str] = None


class RequestItemCreate(RequestItemBase):
    pass


class RequestItem(RequestItemBase):
    id: str
    request_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RequestItemWithDetails(RequestItem):
    item: Optional[Item] = None


# ============================================
# Request Models
# ============================================
class RequestBase(BaseModel):
    baustelle_id: str
    priority: Literal["low", "normal", "high", "urgent"] = "normal"
    needed_date: Optional[date] = None
    delivery_time: Optional[str] = None
    notes: Optional[str] = None


class RequestCreate(RequestBase):
    items: List[RequestItemCreate]


class RequestUpdate(BaseModel):
    status: Optional[Literal["pending", "confirmed", "preparing", "ready", "shipped", "completed", "cancelled"]] = None
    priority: Optional[Literal["low", "normal", "high", "urgent"]] = None
    needed_date: Optional[date] = None
    delivery_time: Optional[str] = None
    notes: Optional[str] = None


class Request(RequestBase):
    id: str
    request_number: str
    worker_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    confirmed_at: Optional[datetime] = None
    confirmed_by: Optional[str] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Request Image Models
# ============================================
class RequestImage(BaseModel):
    id: Optional[str] = None
    request_id: Optional[str] = None
    image_url: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_by: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RequestWithDetails(Request):
    items: List[RequestItemWithDetails] = []
    worker: Optional[Profile] = None
    baustelle: Optional[Baustelle] = None
    images: List[RequestImage] = []


# ============================================
# Request History Models
# ============================================
class RequestHistory(BaseModel):
    id: str
    request_id: str
    status: str
    changed_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Notification Models
# ============================================
class NotificationBase(BaseModel):
    title: str
    message: str
    type: Literal["request", "status_change", "system"]
    related_request_id: Optional[str] = None


class NotificationCreate(NotificationBase):
    user_id: str


class Notification(NotificationBase):
    id: str
    user_id: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# Statistics Models
# ============================================
class MaterialUsageStats(BaseModel):
    item_id: str
    item_name: str
    total_quantity: Decimal
    unit: str
    request_count: int


class MonthlyStats(BaseModel):
    total_requests: int
    pending_requests: int
    completed_requests: int
    material_usage: List[MaterialUsageStats]


class DashboardStats(BaseModel):
    total_requests: int
    pending_requests: int
    in_progress_requests: int
    completed_today: int
    low_stock_items: List[Item]
