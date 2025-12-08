"""
AWS S3 服务 - 处理图片上传和管理
"""
import os
import uuid
from typing import Optional, BinaryIO
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError
from PIL import Image
import io


class S3Service:
    """S3 图片上传和管理服务"""

    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'eu-central-1')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME')
        self.cloudfront_domain = os.getenv('CLOUDFRONT_DOMAIN')

        if not self.bucket_name:
            raise ValueError("S3_BUCKET_NAME environment variable not set")

    def upload_image(
        self,
        file: BinaryIO,
        filename: str,
        folder: str = "uploads",
        optimize: bool = True,
        max_size: tuple = (2048, 2048)
    ) -> dict:
        """
        上传图片到 S3

        Args:
            file: 文件对象
            filename: 原始文件名
            folder: S3 中的文件夹
            optimize: 是否优化图片
            max_size: 最大尺寸 (宽, 高)

        Returns:
            包含 URL 和元数据的字典
        """
        try:
            # 生成唯一文件名
            file_ext = os.path.splitext(filename)[1].lower()
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            s3_key = f"{folder}/{datetime.now().strftime('%Y/%m/%d')}/{unique_filename}"

            # 读取图片
            file_content = file.read()

            # 优化图片
            if optimize and file_ext in ['.jpg', '.jpeg', '.png', '.webp']:
                file_content = self._optimize_image(file_content, max_size)

            # 上传到 S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=self._get_content_type(file_ext),
                CacheControl='max-age=31536000',  # 1 year cache
                Metadata={
                    'original-filename': filename,
                    'upload-date': datetime.now().isoformat()
                }
            )

            # 生成 URL
            url = self._get_public_url(s3_key)

            return {
                'success': True,
                'url': url,
                's3_key': s3_key,
                'bucket': self.bucket_name,
                'size': len(file_content)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def _optimize_image(self, image_bytes: bytes, max_size: tuple) -> bytes:
        """优化图片尺寸和质量"""
        try:
            img = Image.open(io.BytesIO(image_bytes))

            # 转换 RGBA 到 RGB (如果需要)
            if img.mode == 'RGBA':
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background

            # 调整大小
            img.thumbnail(max_size, Image.Resampling.LANCZOS)

            # 保存为优化后的字节
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=85, optimize=True)
            return output.getvalue()

        except Exception:
            # 如果优化失败，返回原始图片
            return image_bytes

    def _get_content_type(self, file_ext: str) -> str:
        """获取文件的 Content-Type"""
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf'
        }
        return content_types.get(file_ext.lower(), 'application/octet-stream')

    def _get_public_url(self, s3_key: str) -> str:
        """获取公开访问 URL"""
        if self.cloudfront_domain:
            # 使用 CloudFront CDN
            return f"https://{self.cloudfront_domain}/{s3_key}"
        else:
            # 直接使用 S3 URL
            region = os.getenv('AWS_REGION', 'eu-central-1')
            return f"https://{self.bucket_name}.s3.{region}.amazonaws.com/{s3_key}"

    def generate_presigned_url(
        self,
        s3_key: str,
        expiration: int = 3600
    ) -> Optional[str]:
        """
        生成预签名 URL (用于临时访问私有文件)

        Args:
            s3_key: S3 对象键
            expiration: 过期时间(秒)

        Returns:
            预签名 URL
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError:
            return None

    def delete_image(self, s3_key: str) -> bool:
        """删除 S3 中的图片"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
        except ClientError:
            return False

    def upload_thumbnail(
        self,
        file: BinaryIO,
        filename: str,
        size: tuple = (300, 300)
    ) -> dict:
        """上传缩略图"""
        return self.upload_image(
            file,
            filename,
            folder="thumbnails",
            optimize=True,
            max_size=size
        )


# 创建单例
s3_service = S3Service()
