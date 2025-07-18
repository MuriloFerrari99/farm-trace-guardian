
from minio import Minio
from minio.error import S3Error
from fastapi import UploadFile
import uuid
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self._ensure_buckets()
    
    def _ensure_buckets(self):
        """Ensure required buckets exist"""
        buckets = [
            "financial-documents",
            "proposal-pdfs", 
            "user-avatars",
            "expedition-documents",
            "certificates"
        ]
        
        for bucket in buckets:
            try:
                if not self.client.bucket_exists(bucket):
                    self.client.make_bucket(bucket)
            except S3Error as e:
                print(f"Error creating bucket {bucket}: {e}")
    
    def upload_file(self, bucket: str, file: UploadFile, folder: str = ""):
        """Upload file to MinIO"""
        try:
            # Generate unique filename
            file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
            unique_filename = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
            
            if folder:
                object_name = f"{folder}/{unique_filename}"
            else:
                object_name = unique_filename
            
            # Upload file
            self.client.put_object(
                bucket,
                object_name,
                file.file,
                length=file.size or -1,
                content_type=file.content_type
            )
            
            return {
                "bucket": bucket,
                "object_name": object_name,
                "file_url": f"http://{settings.MINIO_ENDPOINT}/{bucket}/{object_name}"
            }
            
        except S3Error as e:
            raise Exception(f"Failed to upload file: {str(e)}")
    
    def get_file_url(self, bucket: str, object_name: str, expires_in_days: int = 7):
        """Generate presigned URL for file access"""
        try:
            from datetime import timedelta
            url = self.client.presigned_get_object(
                bucket, 
                object_name, 
                expires=timedelta(days=expires_in_days)
            )
            return url
        except S3Error as e:
            raise Exception(f"Failed to generate file URL: {str(e)}")
    
    def delete_file(self, bucket: str, object_name: str):
        """Delete file from MinIO"""
        try:
            self.client.remove_object(bucket, object_name)
            return True
        except S3Error as e:
            raise Exception(f"Failed to delete file: {str(e)}")

# Global instance
storage_service = StorageService()
