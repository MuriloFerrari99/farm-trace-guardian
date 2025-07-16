import React, { useState } from 'react';
import { Plus, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type CostCenter = {
  id: string;
  account_code: string;
  account_name: string;
  account_type: 'receita' | 'custo' | 'despesa' | 'ativo' | 'passivo' | 'patrimonio';
  cost_center: 'producao' | 'comercial' | 'administrativo' | 'financeiro' | 'exportacao';
  description?: string;
  is_active: boolean;
};

interface CostCenterManagerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  accountType?: 'receita' | 'custo' | 'despesa' | 'ativo' | 'passivo' | 'patrimonio';
}

const CostCenterManager: React.FC<CostCenterManagerProps> = ({
  value,
  onValueChange,
  placeholder = "Selecione um centro de custo",
  accountType = 'despesa'
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCostCenter, setNewCostCenter] = useState({
    account_code: '',
    account_name: '',
    account_type: accountType,
    cost_center: 'administrativo' as const,
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cost centers
  const { data: costCenters = [], isLoading } = useQuery({
    queryKey: ['cost-centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('is_active', true)
        .order('account_code');
      
      if (error) throw error;
      return data as CostCenter[];
    }
  });

  const handleCreateCostCenter = async () => {
    if (!newCostCenter.account_code.trim() || !newCostCenter.account_name.trim()) {
      toast({
        title: "Erro",
        description: "Código e nome da conta são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating cost center with data:', newCostCenter);
      
      const insertData = {
        account_code: newCostCenter.account_code,
        account_name: newCostCenter.account_name,
        account_type: newCostCenter.account_type,
        cost_center: newCostCenter.cost_center,
        description: newCostCenter.description || null
      };
      
      console.log('Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating cost center:', error);
        throw error;
      }

      console.log('Cost center created successfully:', data);

      // Update the query cache
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      
      // Select the newly created cost center
      if (onValueChange) {
        onValueChange(data.id);
      }

      toast({
        title: "Sucesso",
        description: "Centro de custo criado com sucesso",
      });

      // Reset form and close dialog
      setNewCostCenter({
        account_code: '',
        account_name: '',
        account_type: accountType,
        cost_center: 'administrativo',
        description: ''
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating cost center:', error);
      const errorMessage = error?.message || 'Erro desconhecido ao criar centro de custo';
      toast({
        title: "Erro",
        description: `Erro ao criar centro de custo: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Carregando..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder={costCenters.length === 0 ? "Nenhum centro de custo encontrado" : placeholder} />
          </SelectTrigger>
          <SelectContent>
            {costCenters.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhum centro de custo encontrado.<br />
                Crie um agora para começar a lançar.
              </div>
            ) : (
              costCenters.map((center) => (
                <SelectItem key={center.id} value={center.id}>
                  {center.account_code} - {center.account_name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-1" />
            Novo Centro de Custo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Criar Centro de Custo
            </DialogTitle>
            <DialogDescription>
              Adicione um novo centro de custo para organizar suas finanças.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_code">Código *</Label>
                <Input
                  id="account_code"
                  value={newCostCenter.account_code}
                  onChange={(e) => setNewCostCenter(prev => ({ ...prev, account_code: e.target.value }))}
                  placeholder="Ex: 001.001"
                />
              </div>
              <div>
                <Label htmlFor="account_type">Tipo da Conta</Label>
                <Select 
                  value={newCostCenter.account_type} 
                  onValueChange={(value) => setNewCostCenter(prev => ({ ...prev, account_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="custo">Custo</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="passivo">Passivo</SelectItem>
                    <SelectItem value="patrimonio">Patrimônio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="account_name">Nome da Conta *</Label>
              <Input
                id="account_name"
                value={newCostCenter.account_name}
                onChange={(e) => setNewCostCenter(prev => ({ ...prev, account_name: e.target.value }))}
                placeholder="Ex: Fornecedores Nacionais"
              />
            </div>

            <div>
              <Label htmlFor="cost_center">Centro de Custo</Label>
              <Select 
                value={newCostCenter.cost_center} 
                onValueChange={(value) => setNewCostCenter(prev => ({ ...prev, cost_center: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="producao">Produção</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="exportacao">Exportação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newCostCenter.description}
                onChange={(e) => setNewCostCenter(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional do centro de custo"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCostCenter} disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Centro de Custo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostCenterManager;