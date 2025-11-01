from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from app.database import get_supabase
from app.models import Notification, NotificationCreate
from typing import List, Optional

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[Notification])
async def get_notifications(
    user_id: str = Query(..., description="User ID to get notifications for"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    limit: int = Query(50, description="Limit number of results"),
    supabase: Client = Depends(get_supabase)
):
    """获取用户通知列表"""
    try:
        query = supabase.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True)

        if is_read is not None:
            query = query.eq("is_read", is_read)

        query = query.limit(limit)

        result = query.execute()
        return result.data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/unread-count")
async def get_unread_count(
    user_id: str = Query(..., description="User ID"),
    supabase: Client = Depends(get_supabase)
):
    """获取未读通知数量"""
    try:
        result = supabase.table("notifications").select(
            "id", count="exact"
        ).eq("user_id", user_id).eq("is_read", False).execute()

        return {"count": result.count if result.count else 0}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/{notification_id}/read", response_model=Notification)
async def mark_notification_read(
    notification_id: str,
    supabase: Client = Depends(get_supabase)
):
    """标记通知为已读"""
    try:
        result = supabase.table("notifications").update({
            "is_read": True
        }).eq("id", notification_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/mark-all-read")
async def mark_all_notifications_read(
    user_id: str = Query(..., description="User ID"),
    supabase: Client = Depends(get_supabase)
):
    """标记所有通知为已读"""
    try:
        result = supabase.table("notifications").update({
            "is_read": True
        }).eq("user_id", user_id).eq("is_read", False).execute()

        return {"message": "All notifications marked as read", "count": len(result.data) if result.data else 0}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    supabase: Client = Depends(get_supabase)
):
    """删除通知"""
    try:
        result = supabase.table("notifications").delete().eq("id", notification_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )

        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/", response_model=Notification, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: NotificationCreate,
    supabase: Client = Depends(get_supabase)
):
    """创建新通知（系统内部使用）"""
    try:
        notification_data = notification.model_dump()
        result = supabase.table("notifications").insert(notification_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create notification"
            )

        return result.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
