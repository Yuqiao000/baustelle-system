"""
材料管理 API (Material Management)
支持别名、图片、智能搜索等功能
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from supabase import Client
from app.database import get_supabase
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/materials", tags=["Materials"])


# ============ Pydantic Models ============

class MaterialAlias(BaseModel):
    id: str
    item_id: str
    alias: str
    created_at: datetime


class MaterialAliasCreate(BaseModel):
    alias: str


class MaterialImage(BaseModel):
    id: str
    item_id: str
    image_url: str
    is_primary: bool
    description: Optional[str]
    created_at: datetime


class MaterialImageCreate(BaseModel):
    image_url: str
    is_primary: bool = False
    description: Optional[str] = None


class MaterialDetail(BaseModel):
    id: str
    name: str
    barcode: Optional[str]
    category_id: Optional[str]
    category_name: Optional[str]
    type: str
    unit: str
    description: Optional[str]
    current_stock: float
    min_stock: float
    is_active: bool
    aliases: List[str]
    images: List[MaterialImage]


class SearchResult(BaseModel):
    id: str
    name: str
    barcode: Optional[str]
    category_name: Optional[str]
    current_stock: float
    unit: str
    match_type: str
    similarity_score: float


# ============ 材料别名管理 ============

@router.get("/{item_id}/aliases", response_model=List[MaterialAlias])
async def get_material_aliases(
    item_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取材料的所有别名"""
    try:
        result = supabase.table("item_aliases").select("*").eq("item_id", item_id).execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{item_id}/aliases", response_model=MaterialAlias, status_code=status.HTTP_201_CREATED)
async def add_material_alias(
    item_id: str,
    alias: MaterialAliasCreate,
    supabase: Client = Depends(get_supabase)
):
    """为材料添加别名"""
    try:
        result = supabase.table("item_aliases").insert({
            "item_id": item_id,
            "alias": alias.alias
        }).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create alias"
            )

        return result.data[0]
    except Exception as e:
        # 检查是否是重复别名错误
        if "duplicate key" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dieser Alias existiert bereits"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{item_id}/aliases/{alias_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material_alias(
    item_id: str,
    alias_id: str,
    supabase: Client = Depends(get_supabase)
):
    """删除材料别名"""
    try:
        result = supabase.table("item_aliases").delete().eq("id", alias_id).eq("item_id", item_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alias not found"
            )

        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ 材料图片管理 ============

@router.get("/{item_id}/images", response_model=List[MaterialImage])
async def get_material_images(
    item_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取材料的所有图片"""
    try:
        result = supabase.table("item_images").select("*").eq("item_id", item_id).order("is_primary", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{item_id}/images", response_model=MaterialImage, status_code=status.HTTP_201_CREATED)
async def add_material_image(
    item_id: str,
    image: MaterialImageCreate,
    supabase: Client = Depends(get_supabase)
):
    """为材料添加图片"""
    try:
        # 如果设置为主图片，先取消其他主图片
        if image.is_primary:
            supabase.table("item_images").update({
                "is_primary": False
            }).eq("item_id", item_id).execute()

        image_data = image.model_dump()
        image_data["item_id"] = item_id

        result = supabase.table("item_images").insert(image_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to add image"
            )

        return result.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{item_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material_image(
    item_id: str,
    image_id: str,
    supabase: Client = Depends(get_supabase)
):
    """删除材料图片"""
    try:
        result = supabase.table("item_images").delete().eq("id", image_id).eq("item_id", item_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )

        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.patch("/{item_id}/images/{image_id}/primary", response_model=MaterialImage)
async def set_primary_image(
    item_id: str,
    image_id: str,
    supabase: Client = Depends(get_supabase)
):
    """设置主图片"""
    try:
        # 取消所有主图片
        supabase.table("item_images").update({
            "is_primary": False
        }).eq("item_id", item_id).execute()

        # 设置新的主图片
        result = supabase.table("item_images").update({
            "is_primary": True
        }).eq("id", image_id).eq("item_id", item_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ 材料详情（包含别名和图片） ============

@router.get("/{item_id}/detail", response_model=MaterialDetail)
async def get_material_detail(
    item_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取材料详细信息（包含别名和图片）"""
    try:
        # 获取材料基本信息
        item_result = supabase.table("items").select(
            "*, category:categories(name)"
        ).eq("id", item_id).execute()

        if not item_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Material not found"
            )

        item = item_result.data[0]

        # 获取别名
        aliases_result = supabase.table("item_aliases").select("alias").eq("item_id", item_id).execute()
        aliases = [a["alias"] for a in aliases_result.data] if aliases_result.data else []

        # 获取图片
        images_result = supabase.table("item_images").select("*").eq("item_id", item_id).order("is_primary", desc=True).execute()
        images = images_result.data if images_result.data else []

        # 组装响应
        return {
            "id": item["id"],
            "name": item["name"],
            "barcode": item.get("barcode"),
            "category_id": item.get("category_id"),
            "category_name": item["category"]["name"] if item.get("category") else None,
            "type": item["type"],
            "unit": item["unit"],
            "description": item.get("description"),
            "current_stock": item.get("current_stock", 0),
            "min_stock": item.get("min_stock", 0),
            "is_active": item["is_active"],
            "aliases": aliases,
            "images": images
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============ 智能搜索 ============

@router.get("/search", response_model=List[SearchResult])
async def search_materials(
    q: str = Query(..., min_length=1, description="搜索关键词"),
    supabase: Client = Depends(get_supabase)
):
    """智能搜索材料（支持名称、别名、模糊匹配）"""
    try:
        # 调用数据库搜索函数
        result = supabase.rpc("search_items", {"search_term": q}).execute()
        return result.data if result.data else []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
