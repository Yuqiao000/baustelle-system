from supabase import create_client, Client
from app.config import settings

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Storage operations need service role key for upload permissions
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def get_supabase() -> Client:
    """获取 Supabase 客户端实例"""
    return supabase


def get_supabase_admin() -> Client:
    """获取 Supabase Admin 客户端实例 (用于Storage等需要service role的操作)"""
    return supabase_admin
