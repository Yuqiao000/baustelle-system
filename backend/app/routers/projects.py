from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client
from app.database import get_supabase
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

router = APIRouter(prefix="/projects", tags=["projects"])

# Pydantic Models
class ProjectBase(BaseModel):
    name: str
    project_number: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    bauleiter_id: Optional[str] = None
    is_active: bool = True

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    project_number: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    bauleiter_id: Optional[str] = None
    is_active: Optional[bool] = None

class Project(ProjectBase):
    id: str
    created_at: str
    updated_at: str
    bauleiter_name: Optional[str] = None

@router.get("/", response_model=List[Project])
async def get_projects(
    is_active: Optional[bool] = Query(None),
    supabase: Client = Depends(get_supabase)
):
    """获取所有项目列表"""
    query = supabase.table("projects").select("""
        *,
        bauleiter:profiles!projects_bauleiter_id_fkey(full_name)
    """)

    if is_active is not None:
        query = query.eq("is_active", is_active)

    result = query.order("created_at", desc=True).execute()

    # 格式化返回数据
    projects = []
    for project in result.data:
        project_data = {
            **project,
            "bauleiter_name": project.get("bauleiter", {}).get("full_name") if project.get("bauleiter") else None
        }
        # 移除嵌套的 bauleiter 对象
        if "bauleiter" in project_data:
            del project_data["bauleiter"]
        projects.append(project_data)

    return projects

@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取单个项目详情"""
    result = supabase.table("projects").select("""
        *,
        bauleiter:profiles!projects_bauleiter_id_fkey(full_name)
    """).eq("id", project_id).single().execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = result.data
    return {
        **project,
        "bauleiter_name": project.get("bauleiter", {}).get("full_name") if project.get("bauleiter") else None
    }

@router.post("/", response_model=Project, status_code=201)
async def create_project(
    project: ProjectCreate,
    supabase: Client = Depends(get_supabase)
):
    """创建新项目"""
    result = supabase.table("projects").insert(project.model_dump()).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create project")

    # 重新获取完整数据（包含关联的 bauleiter 信息）
    return await get_project(result.data[0]["id"], supabase)

@router.patch("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project: ProjectUpdate,
    supabase: Client = Depends(get_supabase)
):
    """更新项目信息"""
    # 只更新提供的字段
    update_data = {k: v for k, v in project.model_dump().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = supabase.table("projects").update(update_data).eq("id", project_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")

    return await get_project(project_id, supabase)

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    supabase: Client = Depends(get_supabase)
):
    """删除项目（软删除 - 设置 is_active = false）"""
    result = supabase.table("projects").update({"is_active": False}).eq("id", project_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"message": "Project deactivated successfully"}

@router.get("/{project_id}/materials")
async def get_project_materials(
    project_id: str,
    supabase: Client = Depends(get_supabase)
):
    """获取项目使用的材料统计"""
    result = supabase.rpc("project_material_stats").eq("project_id", project_id).execute()
    return result.data
