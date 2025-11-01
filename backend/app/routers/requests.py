from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from app.database import get_supabase
from app.models import (
    Request, RequestCreate, RequestUpdate, RequestWithDetails,
    RequestHistory, RequestItem
)
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/requests", tags=["Requests"])


@router.get("/", response_model=List[Request])
async def get_requests(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    baustelle_id: Optional[str] = Query(None, description="Filter by baustelle"),
    worker_id: Optional[str] = Query(None, description="Filter by worker"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    limit: int = Query(100, description="Limit number of results"),
    offset: int = Query(0, description="Offset for pagination"),
    supabase: Client = Depends(get_supabase)
):
    """获取申请单列表"""
    try:
        query = supabase.table("requests").select("*").order("created_at", desc=True)

        if status_filter:
            query = query.eq("status", status_filter)

        if baustelle_id:
            query = query.eq("baustelle_id", baustelle_id)

        if worker_id:
            query = query.eq("worker_id", worker_id)

        if priority:
            query = query.eq("priority", priority)

        query = query.range(offset, offset + limit - 1)

        result = query.execute()
        return result.data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{request_id}", response_model=RequestWithDetails)
async def get_request(
    request_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取申请单详情（包含明细、工人、工地信息）"""
    try:
        # 获取申请单基本信息
        request_result = supabase.table("requests").select("*").eq("id", request_id).execute()

        if not request_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found"
            )

        request_data = request_result.data[0]

        # 获取申请单明细
        items_result = supabase.table("request_items").select(
            "*, items(*)"
        ).eq("request_id", request_id).execute()

        # 获取工人信息
        worker_result = supabase.table("profiles").select("*").eq("id", request_data["worker_id"]).execute()

        # 获取工地信息
        baustelle_result = supabase.table("baustellen").select("*").eq("id", request_data["baustelle_id"]).execute()

        # 组装数据
        request_data["items"] = items_result.data if items_result.data else []
        request_data["worker"] = worker_result.data[0] if worker_result.data else None
        request_data["baustelle"] = baustelle_result.data[0] if baustelle_result.data else None

        return request_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/", response_model=Request, status_code=status.HTTP_201_CREATED)
async def create_request(
    request: RequestCreate,
    worker_id: str = Query(..., description="Worker ID creating the request"),
    supabase: Client = Depends(get_supabase)
):
    """创建新申请单"""
    try:
        # 创建申请单主记录
        request_data = request.model_dump(exclude={"items"})
        request_data["worker_id"] = worker_id

        # 转换日期为字符串
        if request_data.get("needed_date"):
            request_data["needed_date"] = str(request_data["needed_date"])

        result = supabase.table("requests").insert(request_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create request"
            )

        request_id = result.data[0]["id"]

        # 创建申请单明细
        items_data = []
        for item in request.items:
            item_dict = item.model_dump()
            item_dict["request_id"] = request_id
            item_dict["quantity"] = str(item_dict["quantity"])
            items_data.append(item_dict)

        if items_data:
            supabase.table("request_items").insert(items_data).execute()

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/{request_id}", response_model=Request)
async def update_request(
    request_id: str,
    request: RequestUpdate,
    confirmed_by: Optional[str] = Query(None, description="User ID confirming the request"),
    supabase: Client = Depends(get_supabase)
):
    """更新申请单状态（仅限仓库和管理员）"""
    try:
        update_data = request.model_dump(exclude_unset=True)

        # 如果状态变更为已确认，记录确认时间和确认人
        if update_data.get("status") == "confirmed" and confirmed_by:
            update_data["confirmed_at"] = datetime.now().isoformat()
            update_data["confirmed_by"] = confirmed_by

        # 如果状态变更为已完成，记录完成时间
        if update_data.get("status") == "completed":
            update_data["completed_at"] = datetime.now().isoformat()

        # 转换日期
        if "needed_date" in update_data and update_data["needed_date"]:
            update_data["needed_date"] = str(update_data["needed_date"])

        result = supabase.table("requests").update(update_data).eq("id", request_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found"
            )

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_request(
    request_id: str,
    supabase: Client = Depends(get_supabase)
):
    """取消申请单"""
    try:
        result = supabase.table("requests").update({
            "status": "cancelled"
        }).eq("id", request_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found"
            )

        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{request_id}/history", response_model=List[RequestHistory])
async def get_request_history(
    request_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取申请单状态变更历史"""
    try:
        result = supabase.table("request_history").select(
            "*"
        ).eq("request_id", request_id).order("created_at", desc=True).execute()

        return result.data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{request_id}/items", response_model=RequestItem, status_code=status.HTTP_201_CREATED)
async def add_request_item(
    request_id: str,
    item: dict,
    supabase: Client = Depends(get_supabase)
):
    """向申请单添加物品"""
    try:
        item["request_id"] = request_id
        item["quantity"] = str(item["quantity"])

        result = supabase.table("request_items").insert(item).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add item"
            )

        return result.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{request_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_request_item(
    request_id: str,
    item_id: str,
    supabase: Client = Depends(get_supabase)
):
    """从申请单移除物品"""
    try:
        result = supabase.table("request_items").delete().eq("id", item_id).eq("request_id", request_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )

        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
