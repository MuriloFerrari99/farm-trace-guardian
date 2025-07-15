import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Phone, Calendar, DollarSign, User, Building, Edit, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CrmSalesFunnel = () => {
  const [showNewOpportunity, setShowNewOpportunity] = useState(false);
  const [selectedStage, setSelectedStage] = useState('contato_inicial');
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    estimated_value: '',
    product_interest: '',
    contact_id: '',
    expected_close_date: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const stages = [
    { id: 'contato_inicial', name: '📞 Contato Inicial', color: 'bg-gray-100' },
    { id: 'qualificado', name: '🤝 Qualificado', color: 'bg-blue-100' },
    { id: 'proposta_enviada', name: '📄 Proposta Enviada', color: 'bg-yellow-100' },
    { id: 'negociacao', name: '💼 Negociação', color: 'bg-orange-100' },
    { id: 'fechado_ganhou', name: '✅ Fechado - Ganhou', color: 'bg-green-100' },
    { id: 'fechado_perdeu', name: '❌ Fechado - Perdido', color: 'bg-red-100' }
  ];

  // Fetch opportunities
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['crm-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_opportunities')
        .select(`
          *,
          contact:crm_contacts!inner(company_name, contact_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch contacts for the dropdown
  const { data: contacts = [] } = useQuery({
    queryKey: ['crm-contacts-for-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('id, company_name, contact_name')
        .eq('status', 'ativo')
        .order('company_name');

      if (error) throw error;
      return data;
    }
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (opportunityData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('crm_opportunities')
        .insert([{
          ...opportunityData,
          stage: selectedStage as 'contato_inicial' | 'qualificado' | 'proposta_enviada' | 'negociacao' | 'fechado_ganhou' | 'fechado_perdeu',
          estimated_value: parseFloat(opportunityData.estimated_value) || 0,
          created_by: user.id,
          assigned_to: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-opportunities'] });
      toast({
        title: "Sucesso",
        description: "Oportunidade criada com sucesso",
      });
      setShowNewOpportunity(false);
      setNewOpportunity({
        title: '',
        description: '',
        estimated_value: '',
        product_interest: '',
        contact_id: '',
        expected_close_date: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar oportunidade: " + error.message,
        variant: "destructive",
      });
    }
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ opportunityId, newStage }: { opportunityId: string, newStage: string }) => {
      const { error } = await supabase
        .from('crm_opportunities')
        .update({ 
          stage: newStage as 'contato_inicial' | 'qualificado' | 'proposta_enviada' | 'negociacao' | 'fechado_ganhou' | 'fechado_perdeu',
          actual_close_date: ['fechado_ganhou', 'fechado_perdeu'].includes(newStage) ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', opportunityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-opportunities'] });
      toast({
        title: "Sucesso",
        description: "Oportunidade movida com sucesso",
      });
    }
  });

  const handleCreateOpportunity = () => {
    if (!newOpportunity.title || !newOpportunity.contact_id) {
      toast({
        title: "Erro",
        description: "Título e contato são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createOpportunityMutation.mutate(newOpportunity);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const opportunityId = result.draggableId;
    const newStage = result.destination.droppableId;

    updateStageMutation.mutate({ opportunityId, newStage });
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter(opp => opp.stage === stageId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStageTotal = (stageId: string) => {
    const stageOpportunities = getOpportunitiesByStage(stageId);
    const total = stageOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
    return { count: stageOpportunities.length, value: total };
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando funil de vendas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with new opportunity */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Funil de Vendas</h2>
        <Dialog open={showNewOpportunity} onOpenChange={setShowNewOpportunity}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Oportunidade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título da Oportunidade *</Label>
                  <Input 
                    value={newOpportunity.title}
                    onChange={(e) => setNewOpportunity(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Venda de tomates - Q1 2024" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contato/Empresa *</Label>
                  <Select 
                    value={newOpportunity.contact_id} 
                    onValueChange={(value) => setNewOpportunity(prev => ({ ...prev, contact_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um contato" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map(contact => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.company_name} - {contact.contact_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Estimado (R$)</Label>
                  <Input 
                    type="number"
                    value={newOpportunity.estimated_value}
                    onChange={(e) => setNewOpportunity(prev => ({ ...prev, estimated_value: e.target.value }))}
                    placeholder="50000" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Esperada de Fechamento</Label>
                  <Input 
                    type="date"
                    value={newOpportunity.expected_close_date}
                    onChange={(e) => setNewOpportunity(prev => ({ ...prev, expected_close_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Produto de Interesse</Label>
                  <Input 
                    value={newOpportunity.product_interest}
                    onChange={(e) => setNewOpportunity(prev => ({ ...prev, product_interest: e.target.value }))}
                    placeholder="Ex: Tomates, Alface, Pimentão" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estágio Inicial</Label>
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.slice(0, 4).map(stage => (
                        <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea 
                  value={newOpportunity.description}
                  onChange={(e) => setNewOpportunity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalhes sobre a oportunidade..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowNewOpportunity(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleCreateOpportunity} className="flex-1" disabled={createOpportunityMutation.isPending}>
                  {createOpportunityMutation.isPending ? "Criando..." : "Criar Oportunidade"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 overflow-x-auto">
          {stages.map((stage) => {
            const stageStats = getStageTotal(stage.id);
            return (
              <div key={stage.id} className="min-w-[280px]">
                <Card className={`h-full ${stage.color}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex justify-between items-center">
                      <span>{stage.name}</span>
                      <Badge variant="secondary">{stageStats.count}</Badge>
                    </CardTitle>
                    <p className="text-xs text-gray-600 font-medium">
                      {formatCurrency(stageStats.value)}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[200px] p-2 rounded ${
                            snapshot.isDraggingOver ? 'bg-blue-50' : ''
                          }`}
                        >
                          {getOpportunitiesByStage(stage.id).map((opportunity, index) => (
                            <Draggable
                              key={opportunity.id}
                              draggableId={opportunity.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-3 rounded-lg shadow-sm border cursor-grab ${
                                    snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                                  }`}
                                >
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm line-clamp-2">
                                      {opportunity.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <Building className="h-3 w-3" />
                                      <span className="truncate">{opportunity.contact?.company_name}</span>
                                    </div>
                                    {opportunity.estimated_value && (
                                      <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                                        <DollarSign className="h-3 w-3" />
                                        {formatCurrency(opportunity.estimated_value)}
                                      </div>
                                    )}
                                    {opportunity.product_interest && (
                                      <div className="text-xs text-gray-500 truncate">
                                        Produto: {opportunity.product_interest}
                                      </div>
                                    )}
                                    {opportunity.expected_close_date && (
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(opportunity.expected_close_date).toLocaleDateString('pt-BR')}
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {opportunity.probability || 50}%
                                      </Badge>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{opportunities.length}</p>
              <p className="text-sm text-gray-600">Total de Oportunidades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0))}
              </p>
              <p className="text-sm text-gray-600">Valor Total do Pipeline</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {getStageTotal('fechado_ganhou').count}
              </p>
              <p className="text-sm text-gray-600">Negócios Fechados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {opportunities.length > 0 ? 
                  ((getStageTotal('fechado_ganhou').count / opportunities.length) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-600">Taxa de Conversão</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmSalesFunnel;