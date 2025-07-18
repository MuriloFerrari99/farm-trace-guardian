import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface DocumentUploaderProps {
  referenceId: string;
  referenceType: string;
  onFileUploaded?: (file: UploadedFile) => void;
  onFileRemoved?: (fileId: string) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  existingFiles?: UploadedFile[];
}

export default function DocumentUploader({
  referenceId,
  referenceType,
  onFileUploaded,
  onFileRemoved,
  maxFiles = 5,
  acceptedTypes = ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  existingFiles = []
}: DocumentUploaderProps) {
  const uploadFile = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${referenceType}/${referenceId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('financial-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Inserir registro no banco
      const { data: docData, error: docError } = await supabase
        .from('financial_documents')
        .insert({
          reference_id: referenceId,
          reference_type: referenceType,
          document_type: file.type,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (docError) throw docError;

      const { data: urlData } = supabase.storage
        .from('financial-documents')
        .getPublicUrl(uploadData.path);

      const uploadedFile: UploadedFile = {
        id: docData.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
      };

      onFileUploaded?.(uploadedFile);

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!",
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const removeFile = async (file: UploadedFile) => {
    try {
      // Remover do storage
      const { error: storageError } = await supabase.storage
        .from('financial-documents')
        .remove([file.url.split('/').pop() || '']);

      if (storageError) console.warn('Erro ao remover do storage:', storageError);

      // Remover do banco
      const { error: dbError } = await supabase
        .from('financial_documents')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      onFileRemoved?.(file.id);

      toast({
        title: "Sucesso",
        description: "Arquivo removido com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(uploadFile);
  }, [referenceId, referenceType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: maxFiles - existingFiles.length,
    disabled: existingFiles.length >= maxFiles,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Documentos</h4>
        <Badge variant="secondary">
          {existingFiles.length}/{maxFiles}
        </Badge>
      </div>

      {existingFiles.length < maxFiles && (
        <Card 
          {...getRootProps()} 
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-muted-foreground">Solte os arquivos aqui...</p>
          ) : (
            <div>
              <p className="text-muted-foreground mb-2">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, XLS, JPG, PNG até 10MB
              </p>
            </div>
          )}
        </Card>
      )}

      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}