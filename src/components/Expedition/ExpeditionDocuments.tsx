import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Upload, Download, Eye, Trash2 } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  status: 'pending' | 'uploaded' | 'verified';
}

export default function ExpeditionDocuments() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Nota Fiscal - NFe 12345',
      type: 'invoice',
      uploadDate: '2024-01-15',
      size: '245 KB',
      status: 'uploaded'
    },
    {
      id: '2',
      name: 'Certificado GLOBALG.A.P.',
      type: 'certificate',
      uploadDate: '2024-01-15',
      size: '1.2 MB',
      status: 'verified'
    }
  ]);

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
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "Arquivo muito grande. Máximo 10MB permitido.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Erro",
          description: "Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.",
          variant: "destructive",
        });
        return;
      }

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

    try {
      // Here you would implement the actual file upload logic
      // For now, we'll simulate it
      const newDoc: Document = {
        id: Date.now().toString(),
        name: newDocument.file.name,
        type: newDocument.type,
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(newDocument.file.size / 1024).toFixed(0)} KB`,
        status: 'uploaded'
      };

      setDocuments([...documents, newDoc]);
      setNewDocument({ type: '', file: null });

      toast({
        title: "Sucesso",
        description: "Documento carregado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar documento.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (documentId: string) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
    toast({
      title: "Sucesso",
      description: "Documento removido com sucesso.",
    });
  };

  const getStatusBadge = (status: Document['status']) => {
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

  return (
    <div className="space-y-6">
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
              disabled={!newDocument.type || !newDocument.file}
              className="w-full md:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              Carregar Documento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos da Expedição
          </CardTitle>
          <CardDescription>
            Documentos carregados e verificados para esta expedição
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
                    <TableCell>{new Date(document.uploadDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{document.size}</TableCell>
                    <TableCell>{getStatusBadge(document.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
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
          <CardTitle>Documentos Obrigatórios</CardTitle>
          <CardDescription>
            Verifique se todos os documentos necessários foram carregados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.slice(0, 4).map((docType) => {
              const hasDocument = documents.some(doc => doc.type === docType.value);
              return (
                <div key={docType.value} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{docType.label}</span>
                  <Badge variant={hasDocument ? "default" : "secondary"}>
                    {hasDocument ? "✓ Carregado" : "Pendente"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}