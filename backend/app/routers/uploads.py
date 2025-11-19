from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from ..database import get_supabase
import uuid
from typing import List
import base64
from datetime import datetime

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

# 允许的图片格式
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def get_file_extension(filename: str) -> str:
    """获取文件扩展名"""
    return '.' + filename.split('.')[-1].lower() if '.' in filename else ''

def is_allowed_file(filename: str) -> bool:
    """检查文件类型是否允许"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    db=Depends(get_supabase)
):
    """
    上传单个图片到 Supabase Storage
    """
    try:
        # 验证文件类型
        if not is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件格式。允许的格式: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # 读取文件内容
        contents = await file.read()

        # 验证文件大小
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"文件太大。最大允许 {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        # 生成唯一文件名
        file_ext = get_file_extension(file.filename)
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        storage_path = f"request-images/{unique_filename}"

        # 上传到 Supabase Storage
        # 注意：需要先在 Supabase 中创建 "request-images" bucket
        result = db.storage.from_("request-images").upload(
            storage_path,
            contents,
            {
                "content-type": file.content_type or "image/jpeg",
                "cache-control": "3600"
            }
        )

        if hasattr(result, 'error') and result.error:
            raise HTTPException(status_code=500, detail=f"上传失败: {result.error}")

        # 获取公开 URL
        public_url = db.storage.from_("request-images").get_public_url(storage_path)

        return {
            "success": True,
            "url": public_url,
            "filename": file.filename,
            "size": len(contents),
            "path": storage_path
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")

@router.post("/images")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    db=Depends(get_supabase)
):
    """
    批量上传图片
    """
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="最多一次上传5张图片")

    results = []
    errors = []

    for file in files:
        try:
            # 验证文件类型
            if not is_allowed_file(file.filename):
                errors.append({
                    "filename": file.filename,
                    "error": f"不支持的文件格式"
                })
                continue

            # 读取文件内容
            contents = await file.read()

            # 验证文件大小
            if len(contents) > MAX_FILE_SIZE:
                errors.append({
                    "filename": file.filename,
                    "error": f"文件太大"
                })
                continue

            # 生成唯一文件名
            file_ext = get_file_extension(file.filename)
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            storage_path = f"{unique_filename}"  # 简化路径，不使用子文件夹

            # 上传到 Supabase Storage
            try:
                result = db.storage.from_("request-images").upload(
                    storage_path,
                    contents,
                    {
                        "content-type": file.content_type or "image/jpeg",
                        "cache-control": "3600",
                        "upsert": "false"
                    }
                )

                print(f"Upload result for {file.filename}: {result}")

                if hasattr(result, 'error') and result.error:
                    print(f"Upload error details: {result.error}")
                    errors.append({
                        "filename": file.filename,
                        "error": f"Storage error: {str(result.error)}"
                    })
                    continue

                # 获取公开 URL
                public_url = db.storage.from_("request-images").get_public_url(storage_path)

                results.append({
                    "url": public_url,
                    "filename": file.filename,
                    "size": len(contents),
                    "path": storage_path
                })
            except Exception as storage_error:
                print(f"Storage exception for {file.filename}: {str(storage_error)}")
                errors.append({
                    "filename": file.filename,
                    "error": f"Storage exception: {str(storage_error)}"
                })
                continue

        except Exception as e:
            print(f"General exception for {file.filename}: {str(e)}")
            errors.append({
                "filename": file.filename,
                "error": f"Exception: {str(e)}"
            })

    return {
        "success": len(results) > 0,
        "uploaded": results,
        "errors": errors,
        "total": len(files),
        "success_count": len(results),
        "error_count": len(errors)
    }

@router.delete("/image")
async def delete_image(
    path: str,
    db=Depends(get_supabase)
):
    """
    删除图片
    """
    try:
        result = db.storage.from_("request-images").remove([path])

        if hasattr(result, 'error') and result.error:
            raise HTTPException(status_code=500, detail=f"删除失败: {result.error}")

        return {"success": True, "message": "图片已删除"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")

@router.post("/request-images")
async def save_request_images(
    request_id: str,
    images: List[dict],
    user_id: str,
    db=Depends(get_supabase)
):
    """
    保存申请的图片记录到数据库
    images: [{"url": "...", "filename": "...", "size": 123}]
    """
    try:
        # 插入图片记录
        image_records = []
        for img in images:
            image_records.append({
                "request_id": request_id,
                "image_url": img["url"],
                "file_name": img.get("filename"),
                "file_size": img.get("size"),
                "uploaded_by": user_id
            })

        if image_records:
            result = db.table("request_images").insert(image_records).execute()

            return {
                "success": True,
                "count": len(image_records),
                "data": result.data
            }

        return {"success": True, "count": 0}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存图片记录失败: {str(e)}")
