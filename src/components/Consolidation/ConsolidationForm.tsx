import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useReceptions } from '@/hooks/useReceptions';
import { useConsolidation } from '@/hooks/useConsolidation';
import { useToast } from '@/hooks/use-toast';
import { generateConsolidationCode } from '@/utils/codeGenerators';
import { Merge, Package, User, Calendar } from 'lucide-react';

const ConsolidationForm = () => {
  const [consolidationCode, setConsolidationCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [selectedReceptions, setSelectedReceptions] = useState<string[]>([]);
  const { receptions, isLoading } = useReceptions();
  const { createConsolidation } = useConsolidation();
  const { toast } = useToast();

  useEffect(() => {
    // Generate automatic consolidation code
    setConsolidationCode(generateConsolidationCode());
  }, []);

  const approvedReceptions = receptions?.filter(r => r.status === 'approved') || [];

  const handleReceptionSelect = (receptionId: string, checked: boolean) => {
    if (checked) {
      setSelectedReceptions([...selectedReceptions, receptionId]);
    } else {
      setSelectedReceptions(selectedReceptions.filter(id => id !== receptionId));
    }
  };

  const handleCreateConsolidation = async () => {
    if (!clientName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (selectedReceptions.length === 0) {
      toast({
        title: "Erro", 
        description: "Selecione pelo menos um lote para consolidação",
        variant: "destructive",
      });
      return;
    }

    const totalWeight = selectedReceptions.reduce((sum, id) => {
      const reception = approvedReceptions.find(r => r.id === id);
      return sum + (reception?.quantity_kg || 0);
    }, 0);

    // Get the product type from the first selected reception
    const firstReception = approvedReceptions.find(r => r.id === selectedReceptions[0]);
    const productType = firstReception?.product_type || 'outros';

    const consolidationData = {
      consolidation_code: consolidationCode,
      client_name: clientName,
      product_type: productType,
      total_quantity_kg: totalWeight,
      items: selectedReceptions.map(id => {
        const reception = approvedReceptions.find(r => r.id === id);
        return {
          original_reception_id: id,
          quantity_used_kg: reception?.quantity_kg || 0,
        };
      }),
    };

    try {
      await createConsolidation.mutateAsync(consolidationData);
      
      // Reset form
      setConsolidationCode(generateConsolidationCode());
      setClientName('');
      setSelectedReceptions([]);
    } catch (error) {
      console.error('Error creating consolidation:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Merge className="h-5 w-5" />
            <span>Nova Consolidação de Lotes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="consolidation_code">Código da Consolidação</Label>
                <Input
                  id="consolidation_code"
                  value={consolidationCode}
                  onChange={(e) => setConsolidationCode(e.target.value)}
                  placeholder="CONS-20250117-001"
                />
              </div>
              <div>
                <Label htmlFor="client_name">Cliente *</Label>
                <Input
                  id="client_name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Lotes Aprovados Disponíveis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando lotes...</div>
          ) : approvedReceptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Nenhum lote aprovado disponível para consolidação</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Selecionar</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Produtor</TableHead>
                  <TableHead>Quantidade (kg)</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedReceptions.map((reception) => (
                  <TableRow key={reception.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedReceptions.includes(reception.id)}
                        onCheckedChange={(checked) => handleReceptionSelect(reception.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{reception.reception_code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{reception.product_type}</Badge>
                    </TableCell>
                    <TableCell>{reception.producer?.name}</TableCell>
                    <TableCell>{reception.quantity_kg}</TableCell>
                    <TableCell>{new Date(reception.reception_date).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedReceptions.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedReceptions.length} lotes selecionados | 
                  Total: {selectedReceptions.reduce((sum, id) => {
                    const reception = approvedReceptions.find(r => r.id === id);
                    return sum + (reception?.quantity_kg || 0);
                  }, 0).toFixed(2)} kg
                </p>
              </div>
              <Button onClick={handleCreateConsolidation}>
                <Merge className="h-4 w-4 mr-2" />
                Criar Consolidação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsolidationForm;