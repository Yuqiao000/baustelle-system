from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from app.database import get_supabase
from app.models import Baustelle, BaustelleCreate, BaustelleUpdate
from typing import List, Optional

router = APIRouter(prefix="/baustellen", tags=["Baustellen"])


@router.get("/", response_model=List[Baustelle])
async def get_baustellen(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    supabase: Client = Depends(get_supabase)
):
    """获取所有工地列表"""
    try:
        query = supabase.table("baustellen").select("*").order("created_at", desc=True)

        if is_active is not None:
            query = query.eq("is_active", is_active)

        result = query.execute()
        return result.data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{baustelle_id}", response_model=Baustelle)
async def get_baustelle(
    baustelle_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取指定工地详情"""
    try:
        result = supabase.table("baustellen").select("*").eq("id", baustelle_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Baustelle not found"
            )

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/", response_model=Baustelle, status_code=status.HTTP_201_CREATED)
async def create_baustelle(
    baustelle: BaustelleCreate,
    supabase: Client = Depends(get_supabase)
):
    """创建新工地（仅限仓库和管理员）"""
    try:
        baustelle_data = baustelle.model_dump()
        result = supabase.table("baustellen").insert(baustelle_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create baustelle"
            )

        return result.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/{baustelle_id}", response_model=Baustelle)
async def update_baustelle(
    baustelle_id: str,
    baustelle: BaustelleUpdate,
    supabase: Client = Depends(get_supabase)
):
    """更新工地信息（仅限仓库和管理员）"""
    try:
        update_data = baustelle.model_dump(exclude_unset=True)

        result = supabase.table("baustellen").update(update_data).eq("id", baustelle_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Baustelle not found"
            )

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{baustelle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_baustelle(
    baustelle_id: str,
    supabase: Client = Depends(get_supabase)
):
    """删除工地（仅限管理员）"""
    try:
        result = supabase.table("baustellen").delete().eq("id", baustelle_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Baustelle not found"
            )

        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
