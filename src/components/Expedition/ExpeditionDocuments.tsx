import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useExpeditions } from '@/hooks/useExpeditions';
import { useExpeditionDocuments } from '@/hooks/useExpeditionDocuments';
import { FileText, Upload, Download, Eye, Trash2, Package } from 'lucide-react';

export default function ExpeditionDocuments() {
  const [selectedExpedition, setSelectedExpedition] = useState<string>('');
  const { expeditions } = useExpeditions();
  const { 
    documents, 
    loading, 
    isUploading,
    uploadDocument, 
    deleteDocument, 
    downloadDocument,
    getDocumentSize,
    getRequiredDocuments 
  } = useExpeditionDocuments(selectedExpedition);

  const [newDocument, setNewDocument] = useState({
    type: '',
    file: null as File | null,
  });

  const { toast } = useToast();

  const documentTypes = [
    { value: 'invoice', label: 'Nota Fiscal' },
    { value: 'packing_list', label: 'Packing List' },
    { value: 'certificate', label: 'Certificado GLOBALG.A.P.' },
    { value: 'phytosanitary', label: 'Certificado Fitossanitário' },
    { value: 'transport', label: 'Documento de Transporte' },
    { value: 'analysis', label: 'Análise Laboratorial' },
    { value: 'bill_of_lading', label: 'Bill of Lading' },
    { value: 'cmr', label: 'CMR' },
    { value: 'cte', label: 'CT-e' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewDocument(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!newDocument.type || !newDocument.file) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de documento e o arquivo.",
        variant: "destructive",
      });
      return;
    }

    await uploadDocument(newDocument.file, newDocument.type);
    setNewDocument({ type: '', file: null });
    
    // Reset file input
    const fileInput = document.getElementById('document-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDelete = (documentId: string) => {
    deleteDocument(documentId);
  };

  const getStatusBadge = (status: 'pending' | 'uploaded' | 'verified') => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'uploaded':
        return <Badge variant="default">Carregado</Badge>;
      case 'verified':
        return <Badge variant="default">Verificado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  const requiredDocuments = getRequiredDocuments();

  return (
    <div className="space-y-6">
      {/* Seleção de Expedição */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Selecionar Expedição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expedition-select">Código da Expedição</Label>
              <Select value={selectedExpedition} onValueChange={setSelectedExpedition}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma expedição" />
                </SelectTrigger>
                <SelectContent>
                  {expeditions?.map((expedition) => (
                    <SelectItem key={expedition.id} value={expedition.expedition_code}>
                      {expedition.expedition_code} - {expedition.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedExpedition && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Selecione uma expedição para gerenciar seus documentos</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedExpedition && (
        <>
          {/* Upload de Documentos */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Adicionar Documentos
          </CardTitle>
          <CardDescription>
            Faça upload dos documentos necessários para a expedição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document-type">Tipo de Documento</Label>
                <Select
                  value={newDocument.type}
                  onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="document-file">Arquivo</Label>
                <Input
                  id="document-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {newDocument.file && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Arquivo selecionado:</strong> {newDocument.file.name}
                  <br />
                  <strong>Tamanho:</strong> {(newDocument.file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            )}

            <Button 
              onClick={handleUpload}
              disabled={!selectedExpedition || !newDocument.type || !newDocument.file || isUploading}
              className="w-full md:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Enviando...' : 'Carregar Documento'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos da Expedição {selectedExpedition}
          </CardTitle>
          <CardDescription>
            Documentos carregados e verificados para a expedição {selectedExpedition}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum documento carregado ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Arquivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Upload</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.name}</TableCell>
                    <TableCell>{getDocumentTypeLabel(document.type)}</TableCell>
                     <TableCell>{new Date(document.upload_date).toLocaleDateString('pt-BR')}</TableCell>
                     <TableCell>{getDocumentSize(document.file_size)}</TableCell>
                     <TableCell>{getStatusBadge(document.status)}</TableCell>
                     <TableCell>
                       <div className="flex gap-2">
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => downloadDocument(document)}
                         >
                           <Eye className="h-4 w-4" />
                         </Button>
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => downloadDocument(document)}
                         >
                           <Download className="h-4 w-4" />
                         </Button>
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => handleDelete(document.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

          {/* Documentos Obrigatórios */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos Obrigatórios - {selectedExpedition}</CardTitle>
              <CardDescription>
                Verifique se todos os documentos necessários foram carregados para esta expedição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredDocuments.map((req, index) => {
                  const docType = documentTypes.find(dt => dt.value === req.type);
                  return (
                    <div key={req.type} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{docType?.label || req.type}</span>
                      <Badge variant={req.hasDocument ? "default" : "secondary"}>
                        {req.hasDocument ? "✓ Carregado" : "Pendente"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}