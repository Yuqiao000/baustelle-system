from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from app.database import get_supabase
from app.models import Item, ItemCreate, ItemUpdate, Category
from typing import List, Optional

router = APIRouter(prefix="/items", tags=["Items"])
# Updated to include baustelle_id in Item model


@router.get("/", response_model=List[Item])
async def get_items(
    type: Optional[str] = Query(None, description="Filter by type: material or maschine"),
    category_id: Optional[str] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    low_stock: Optional[bool] = Query(None, description="Show only low stock items"),
    supabase: Client = Depends(get_supabase)
):
    """获取材料/设备列表"""
    try:
        query = supabase.table("items").select("*").order("name")

        if type:
            query = query.eq("type", type)

        if category_id:
            query = query.eq("category_id", category_id)

        if is_active is not None:
            query = query.eq("is_active", is_active)

        result = query.execute()
        items = result.data

        # 过滤低库存项目
        if low_stock:
            items = [item for item in items if float(item["stock_quantity"]) <= float(item["min_stock_level"])]

        return items

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{item_id}", response_model=Item)
async def get_item(
    item_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取指定材料/设备详情"""
    try:
        result = supabase.table("items").select("*").eq("id", item_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: ItemCreate,
    supabase: Client = Depends(get_supabase)
):
    """创建新材料/设备（仅限仓库和管理员）"""
    try:
        item_data = item.model_dump()
        # 转换 Decimal 为字符串以便存储
        item_data["stock_quantity"] = str(item_data["stock_quantity"])
        item_data["min_stock_level"] = str(item_data["min_stock_level"])

        result = supabase.table("items").insert(item_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create item"
            )

        return result.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/{item_id}", response_model=Item)
async def update_item(
    item_id: str,
    item: ItemUpdate,
    supabase: Client = Depends(get_supabase)
):
    """更新材料/设备信息（仅限仓库和管理员）"""
    try:
        update_data = item.model_dump(exclude_unset=True)

        # 转换 Decimal 为字符串
        if "stock_quantity" in update_data:
            update_data["stock_quantity"] = str(update_data["stock_quantity"])
        if "min_stock_level" in update_data:
            update_data["min_stock_level"] = str(update_data["min_stock_level"])

        result = supabase.table("items").update(update_data).eq("id", item_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )

        return result.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: str,
    supabase: Client = Depends(get_supabase)
):
    """删除材料/设备（仅限管理员）"""
    try:
        result = supabase.table("items").delete().eq("id", item_id).execute()

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


# ============================================
# Categories
# ============================================

@router.get("/categories/", response_model=List[Category], tags=["Categories"])
async def get_categories(
    type: Optional[str] = Query(None, description="Filter by type: material or maschine"),
    supabase: Client = Depends(get_supabase)
):
    """获取分类列表"""
    try:
        query = supabase.table("categories").select("*").order("name")

        if type:
            query = query.eq("type", type)

        result = query.execute()
        return result.data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
