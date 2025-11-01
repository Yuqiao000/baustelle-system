from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from app.database import get_supabase
from app.models import DashboardStats, MonthlyStats, MaterialUsageStats, Item
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal

router = APIRouter(prefix="/statistics", tags=["Statistics"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    supabase: Client = Depends(get_supabase)
):
    """获取仪表板统计数据"""
    try:
        today = datetime.now().date()

        # 总申请数
        total_requests = supabase.table("requests").select("id", count="exact").execute()

        # 待处理申请
        pending_requests = supabase.table("requests").select(
            "id", count="exact"
        ).eq("status", "pending").execute()

        # 进行中的申请（已确认、准备中、已准备完成、已发货）
        in_progress_requests = supabase.table("requests").select(
            "id", count="exact"
        ).in_("status", ["confirmed", "preparing", "ready", "shipped"]).execute()

        # 今日完成
        completed_today = supabase.table("requests").select(
            "id", count="exact"
        ).eq("status", "completed").gte("completed_at", str(today)).execute()

        # 低库存物品
        items_result = supabase.table("items").select("*").eq("is_active", True).execute()
        low_stock_items = []
        if items_result.data:
            for item in items_result.data:
                stock = float(item.get("stock_quantity", 0))
                min_level = float(item.get("min_stock_level", 0))
                if stock <= min_level:
                    low_stock_items.append(item)

        return {
            "total_requests": total_requests.count or 0,
            "pending_requests": pending_requests.count or 0,
            "in_progress_requests": in_progress_requests.count or 0,
            "completed_today": completed_today.count or 0,
            "low_stock_items": low_stock_items
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/monthly", response_model=MonthlyStats)
async def get_monthly_stats(
    year: int = Query(..., description="Year"),
    month: int = Query(..., description="Month (1-12)"),
    supabase: Client = Depends(get_supabase)
):
    """获取月度统计数据"""
    try:
        # 计算月份的开始和结束日期
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)

        # 总申请数
        total_requests = supabase.table("requests").select(
            "id", count="exact"
        ).gte("created_at", start_date.isoformat()).lt("created_at", end_date.isoformat()).execute()

        # 待处理申请
        pending_requests = supabase.table("requests").select(
            "id", count="exact"
        ).eq("status", "pending").gte("created_at", start_date.isoformat()).lt("created_at", end_date.isoformat()).execute()

        # 已完成申请
        completed_requests = supabase.table("requests").select(
            "id", count="exact"
        ).eq("status", "completed").gte("created_at", start_date.isoformat()).lt("created_at", end_date.isoformat()).execute()

        # 材料使用统计
        # 获取该月份所有已完成的申请
        requests_result = supabase.table("requests").select(
            "id"
        ).eq("status", "completed").gte("created_at", start_date.isoformat()).lt("created_at", end_date.isoformat()).execute()

        material_usage = []
        if requests_result.data:
            request_ids = [req["id"] for req in requests_result.data]

            # 获取这些申请的所有物品
            items_result = supabase.table("request_items").select(
                "item_id, quantity, unit, items(name)"
            ).in_("request_id", request_ids).execute()

            # 按物品汇总
            usage_dict = {}
            if items_result.data:
                for item in items_result.data:
                    item_id = item["item_id"]
                    item_name = item["items"]["name"] if item.get("items") else "Unknown"
                    quantity = float(item["quantity"])
                    unit = item["unit"]

                    if item_id in usage_dict:
                        usage_dict[item_id]["total_quantity"] += quantity
                        usage_dict[item_id]["request_count"] += 1
                    else:
                        usage_dict[item_id] = {
                            "item_id": item_id,
                            "item_name": item_name,
                            "total_quantity": quantity,
                            "unit": unit,
                            "request_count": 1
                        }

            material_usage = list(usage_dict.values())

        return {
            "total_requests": total_requests.count or 0,
            "pending_requests": pending_requests.count or 0,
            "completed_requests": completed_requests.count or 0,
            "material_usage": material_usage
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/material-usage")
async def get_material_usage(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    item_type: Optional[str] = Query(None, description="Filter by type: material or maschine"),
    supabase: Client = Depends(get_supabase)
):
    """获取材料/设备使用统计"""
    try:
        # 构建查询
        query = supabase.table("requests").select("id").eq("status", "completed")

        if start_date:
            query = query.gte("created_at", start_date)
        if end_date:
            query = query.lte("created_at", end_date)

        requests_result = query.execute()

        if not requests_result.data:
            return {"material_usage": []}

        request_ids = [req["id"] for req in requests_result.data]

        # 获取申请单物品
        items_query = supabase.table("request_items").select(
            "item_id, quantity, unit, items(name, type)"
        ).in_("request_id", request_ids)

        items_result = items_query.execute()

        # 按物品汇总
        usage_dict = {}
        if items_result.data:
            for item in items_result.data:
                item_id = item["item_id"]
                item_data = item.get("items", {})
                item_name = item_data.get("name", "Unknown")
                item_type_value = item_data.get("type", "")

                # 类型过滤
                if item_type and item_type_value != item_type:
                    continue

                quantity = float(item["quantity"])
                unit = item["unit"]

                if item_id in usage_dict:
                    usage_dict[item_id]["total_quantity"] += quantity
                    usage_dict[item_id]["request_count"] += 1
                else:
                    usage_dict[item_id] = {
                        "item_id": item_id,
                        "item_name": item_name,
                        "total_quantity": quantity,
                        "unit": unit,
                        "request_count": 1
                    }

        material_usage = sorted(
            usage_dict.values(),
            key=lambda x: x["total_quantity"],
            reverse=True
        )

        return {"material_usage": material_usage}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/baustelle-stats")
async def get_baustelle_stats(
    baustelle_id: str = Query(..., description="Baustelle ID"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    supabase: Client = Depends(get_supabase)
):
    """获取指定工地的统计数据"""
    try:
        query = supabase.table("requests").select("*").eq("baustelle_id", baustelle_id)

        if start_date:
            query = query.gte("created_at", start_date)
        if end_date:
            query = query.lte("created_at", end_date)

        result = query.execute()

        if not result.data:
            return {
                "total_requests": 0,
                "by_status": {},
                "by_priority": {}
            }

        requests = result.data

        # 按状态统计
        by_status = {}
        for req in requests:
            status = req["status"]
            by_status[status] = by_status.get(status, 0) + 1

        # 按优先级统计
        by_priority = {}
        for req in requests:
            priority = req["priority"]
            by_priority[priority] = by_priority.get(priority, 0) + 1

        return {
            "total_requests": len(requests),
            "by_status": by_status,
            "by_priority": by_priority
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
