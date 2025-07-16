import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';

interface FileUploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // em bytes, padrão 10MB
  allowedTypes?: string[];
}

export const useFileUpload = (options: FileUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { handleError, handleSuccess } = useErrorHandler();

  const {
    bucket,
    folder = '',
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
  } = options;

  const validateFile = (file: File): boolean => {
    // Validate file size
    if (file.size > maxSize) {
      handleError(
        new Error(`Arquivo muito grande. Tamanho máximo: ${(maxSize / 1024 / 1024).toFixed(1)}MB`),
        'validação de arquivo'
      );
      return false;
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      handleError(
        new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`),
        'validação de arquivo'
      );
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File, fileName?: string): Promise<string | null> => {
    try {
      // Validate authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Validate file
      if (!validateFile(file)) {
        return null;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const fullPath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      setUploadProgress(100);
      handleSuccess('Arquivo enviado com sucesso!');
      
      return data.path;
    } catch (error: any) {
      handleError(error, 'upload de arquivo');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      // Validate authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      handleSuccess('Arquivo removido com sucesso!');
      return true;
    } catch (error: any) {
      handleError(error, 'remoção de arquivo');
      return false;
    }
  };

  const getFileUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  return {
    uploadFile,
    deleteFile,
    getFileUrl,
    isUploading,
    uploadProgress,
    validateFile
  };
};