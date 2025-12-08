from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/subcontractors", tags=["subcontractors"])

class SubcontractorBase(BaseModel):
    name: str
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: bool = True

class SubcontractorCreate(SubcontractorBase):
    pass

class SubcontractorUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None

class Subcontractor(SubcontractorBase):
    id: str
    created_at: str
    updated_at: str

@router.get("/", response_model=List[Subcontractor])
async def get_subcontractors(
    is_active: Optional[bool] = None,
    supabase: Client = Depends(get_supabase)
):
    """获取Sub承包商列表"""
    query = supabase.table("subcontractors").select("*")

    if is_active is not None:
        query = query.eq("is_active", is_active)

    result = query.order("created_at", desc=True).execute()
    return result.data

@router.get("/{subcontractor_id}", response_model=Subcontractor)
async def get_subcontractor(
    subcontractor_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取单个Sub承包商"""
    result = supabase.table("subcontractors").select("*").eq("id", subcontractor_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Subcontractor not found")

    return result.data

@router.post("/", response_model=Subcontractor, status_code=201)
async def create_subcontractor(
    subcontractor: SubcontractorCreate,
    supabase: Client = Depends(get_supabase)
):
    """创建新Sub承包商"""
    result = supabase.table("subcontractors").insert(subcontractor.model_dump()).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create subcontractor")

    return result.data[0]

@router.patch("/{subcontractor_id}", response_model=Subcontractor)
async def update_subcontractor(
    subcontractor_id: str,
    subcontractor: SubcontractorUpdate,
    supabase: Client = Depends(get_supabase)
):
    """更新Sub承包商信息"""
    update_data = {k: v for k, v in subcontractor.model_dump().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = supabase.table("subcontractors").update(update_data).eq("id", subcontractor_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Subcontractor not found")

    return result.data[0]

@router.delete("/{subcontractor_id}")
async def delete_subcontractor(
    subcontractor_id: str,
    supabase: Client = Depends(get_supabase)
):
    """删除Sub承包商（软删除）"""
    result = supabase.table("subcontractors").update({"is_active": False}).eq("id", subcontractor_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Subcontractor not found")

    return {"message": "Subcontractor deactivated successfully"}
