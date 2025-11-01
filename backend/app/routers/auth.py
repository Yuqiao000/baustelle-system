from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.database import get_supabase
from app.models import Profile, ProfileCreate, ProfileUpdate
from typing import List

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Profile, status_code=status.HTTP_201_CREATED)
async def register(
    profile_data: ProfileCreate,
    supabase: Client = Depends(get_supabase)
):
    """注册新用户"""
    try:
        # 创建用户（使用 Supabase Auth）
        auth_response = supabase.auth.sign_up({
            "email": profile_data.email,
            "password": "temporary_password"  # 实际应用中应该让用户设置密码
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )

        # 创建用户资料
        profile = {
            "id": auth_response.user.id,
            "email": profile_data.email,
            "full_name": profile_data.full_name,
            "role": profile_data.role,
            "phone": profile_data.phone
        }

        result = supabase.table("profiles").insert(profile).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create profile"
            )

        return result.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/login")
async def login(
    email: str,
    password: str,
    supabase: Client = Depends(get_supabase)
):
    """用户登录"""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": response.user
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@router.post("/logout")
async def logout(supabase: Client = Depends(get_supabase)):
    """用户登出"""
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/me", response_model=Profile)
async def get_current_user(supabase: Client = Depends(get_supabase)):
    """获取当前用户信息"""
    try:
        user = supabase.auth.get_user()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )

        result = supabase.table("profiles").select("*").eq("id", user.user.id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )

        return result.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.patch("/me", response_model=Profile)
async def update_current_user(
    profile_data: ProfileUpdate,
    supabase: Client = Depends(get_supabase)
):
    """更新当前用户信息"""
    try:
        user = supabase.auth.get_user()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )

        update_data = profile_data.model_dump(exclude_unset=True)

        result = supabase.table("profiles").update(update_data).eq("id", user.user.id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )

        return result.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
