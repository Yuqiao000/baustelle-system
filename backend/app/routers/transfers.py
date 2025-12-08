from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/transfers", tags=["transfers"])

class TransferItemBase(BaseModel):
    item_id: str
    quantity: float
    notes: Optional[str] = None

class TransferCreate(BaseModel):
    from_project_id: str
    to_project_id: str
    notes: Optional[str] = None
    items: List[TransferItemBase]

class Transfer(BaseModel):
    id: str
    transfer_number: str
    from_project_id: str
    from_project_name: Optional[str] = None
    to_project_id: str
    to_project_name: Optional[str] = None
    bauleiter_approved: bool
    bauleiter_id: Optional[str] = None
    bauleiter_name: Optional[str] = None
    approved_at: Optional[str] = None
    operator_id: str
    operator_name: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None
    items: Optional[List[dict]] = None

@router.get("/", response_model=List[Transfer])
async def get_transfers(
    status: Optional[str] = None,
    from_project_id: Optional[str] = None,
    to_project_id: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    """获取材料转移列表"""
    query = supabase.table("material_transfers").select("""
        *,
        from_project:projects!material_transfers_from_project_id_fkey(name),
        to_project:projects!material_transfers_to_project_id_fkey(name),
        bauleiter:profiles!material_transfers_bauleiter_id_fkey(full_name),
        operator:profiles!material_transfers_operator_id_fkey(full_name)
    """)

    if status:
        query = query.eq("status", status)
    if from_project_id:
        query = query.eq("from_project_id", from_project_id)
    if to_project_id:
        query = query.eq("to_project_id", to_project_id)

    result = query.order("created_at", desc=True).execute()

    transfers = []
    for item in result.data:
        transfers.append({
            **item,
            "from_project_name": item.get("from_project", {}).get("name"),
            "to_project_name": item.get("to_project", {}).get("name"),
            "bauleiter_name": item.get("bauleiter", {}).get("full_name"),
            "operator_name": item.get("operator", {}).get("full_name")
        })

    return transfers

@router.get("/{transfer_id}", response_model=Transfer)
async def get_transfer(
    transfer_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取材料转移详情"""
    result = supabase.table("material_transfers").select("""
        *,
        from_project:projects!material_transfers_from_project_id_fkey(name),
        to_project:projects!material_transfers_to_project_id_fkey(name),
        bauleiter:profiles!material_transfers_bauleiter_id_fkey(full_name),
        operator:profiles!material_transfers_operator_id_fkey(full_name)
    """).eq("id", transfer_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Transfer not found")

    # 获取转移明细
    items_result = supabase.table("transfer_items").select("""
        *,
        item:items(id, name, unit, barcode)
    """).eq("transfer_id", transfer_id).execute()

    transfer = result.data
    return {
        **transfer,
        "from_project_name": transfer.get("from_project", {}).get("name"),
        "to_project_name": transfer.get("to_project", {}).get("name"),
        "bauleiter_name": transfer.get("bauleiter", {}).get("full_name"),
        "operator_name": transfer.get("operator", {}).get("full_name"),
        "items": items_result.data
    }

@router.post("/", response_model=Transfer, status_code=201)
async def create_transfer(
    transfer: TransferCreate,
    operator_id: str,
    supabase: Client = Depends(get_supabase)
):
    """创建材料转移"""
    # 生成转移单号
    number_result = supabase.rpc("generate_transfer_number").execute()
    transfer_number = number_result.data

    # 创建转移申请
    transfer_data = {
        "transfer_number": transfer_number,
        "from_project_id": transfer.from_project_id,
        "to_project_id": transfer.to_project_id,
        "operator_id": operator_id,
        "notes": transfer.notes,
        "status": "pending"
    }

    result = supabase.table("material_transfers").insert(transfer_data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create transfer")

    transfer_id = result.data[0]["id"]

    # 添加转移明细
    items_data = [
        {
            "transfer_id": transfer_id,
            **item.model_dump()
        }
        for item in transfer.items
    ]

    supabase.table("transfer_items").insert(items_data).execute()

    return await get_transfer(transfer_id, supabase)

@router.patch("/{transfer_id}/approve")
async def approve_transfer(
    transfer_id: str,
    bauleiter_id: str,
    supabase: Client = Depends(get_supabase)
):
    """Bauleiter批准材料转移"""
    update_data = {
        "status": "approved",
        "bauleiter_approved": True,
        "bauleiter_id": bauleiter_id,
        "approved_at": datetime.now().isoformat()
    }

    result = supabase.table("material_transfers").update(update_data).eq("id", transfer_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Transfer not found")

    return {"message": "Transfer approved successfully"}

@router.patch("/{transfer_id}/complete")
async def complete_transfer(
    transfer_id: str,
    operator_id: str,
    supabase: Client = Depends(get_supabase)
):
    """完成材料转移"""
    update_data = {
        "status": "completed",
        "completed_at": datetime.now().isoformat()
    }

    result = supabase.table("material_transfers").update(update_data).eq("id", transfer_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Transfer not found")

    # TODO: 创建库存交易记录

    return {"message": "Transfer completed successfully"}
