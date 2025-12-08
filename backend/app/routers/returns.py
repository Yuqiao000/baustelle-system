from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/returns", tags=["returns"])

class ReturnItemBase(BaseModel):
    item_id: str
    quantity: float
    condition: Optional[str] = None
    notes: Optional[str] = None

class ReturnRequestCreate(BaseModel):
    project_id: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    items: List[ReturnItemBase]

class ReturnRequest(BaseModel):
    id: str
    request_number: str
    worker_id: str
    worker_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    status: str
    reason: Optional[str] = None
    approved_by: Optional[str] = None
    approved_by_name: Optional[str] = None
    approved_at: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str
    items: Optional[List[dict]] = None

@router.get("/", response_model=List[ReturnRequest])
async def get_returns(
    worker_id: Optional[str] = None,
    status: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    """获取退货申请列表"""
    query = supabase.table("return_requests").select("""
        *,
        worker:profiles!return_requests_worker_id_fkey(full_name),
        project:projects(name),
        approver:profiles!return_requests_approved_by_fkey(full_name)
    """)

    if worker_id:
        query = query.eq("worker_id", worker_id)
    if status:
        query = query.eq("status", status)

    result = query.order("created_at", desc=True).execute()

    returns = []
    for item in result.data:
        returns.append({
            **item,
            "worker_name": item.get("worker", {}).get("full_name"),
            "project_name": item.get("project", {}).get("name"),
            "approved_by_name": item.get("approver", {}).get("full_name")
        })

    return returns

@router.get("/{return_id}", response_model=ReturnRequest)
async def get_return(
    return_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取退货申请详情"""
    # 获取退货申请
    result = supabase.table("return_requests").select("""
        *,
        worker:profiles!return_requests_worker_id_fkey(full_name),
        project:projects(name),
        approver:profiles!return_requests_approved_by_fkey(full_name)
    """).eq("id", return_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Return request not found")

    # 获取退货明细
    items_result = supabase.table("return_items").select("""
        *,
        item:items(id, name, unit, barcode)
    """).eq("return_request_id", return_id).execute()

    return_request = result.data
    return {
        **return_request,
        "worker_name": return_request.get("worker", {}).get("full_name"),
        "project_name": return_request.get("project", {}).get("name"),
        "approved_by_name": return_request.get("approver", {}).get("full_name"),
        "items": items_result.data
    }

@router.post("/", response_model=ReturnRequest, status_code=201)
async def create_return(
    return_request: ReturnRequestCreate,
    worker_id: str,
    supabase: Client = Depends(get_supabase)
):
    """创建退货申请"""
    # 生成退货单号
    number_result = supabase.rpc("generate_return_number").execute()
    request_number = number_result.data

    # 创建退货申请
    request_data = {
        "request_number": request_number,
        "worker_id": worker_id,
        "project_id": return_request.project_id,
        "reason": return_request.reason,
        "notes": return_request.notes,
        "status": "pending"
    }

    result = supabase.table("return_requests").insert(request_data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create return request")

    return_id = result.data[0]["id"]

    # 添加退货明细
    items_data = [
        {
            "return_request_id": return_id,
            **item.model_dump()
        }
        for item in return_request.items
    ]

    supabase.table("return_items").insert(items_data).execute()

    return await get_return(return_id, supabase)

@router.patch("/{return_id}/approve")
async def approve_return(
    return_id: str,
    approved_by: str,
    supabase: Client = Depends(get_supabase)
):
    """批准退货申请"""
    update_data = {
        "status": "approved",
        "approved_by": approved_by,
        "approved_at": datetime.now().isoformat()
    }

    result = supabase.table("return_requests").update(update_data).eq("id", return_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Return request not found")

    # TODO: 创建库存交易记录，更新库存

    return {"message": "Return request approved successfully"}

@router.patch("/{return_id}/reject")
async def reject_return(
    return_id: str,
    approved_by: str,
    notes: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    """拒绝退货申请"""
    update_data = {
        "status": "rejected",
        "approved_by": approved_by,
        "approved_at": datetime.now().isoformat()
    }

    if notes:
        update_data["notes"] = notes

    result = supabase.table("return_requests").update(update_data).eq("id", return_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Return request not found")

    return {"message": "Return request rejected"}
