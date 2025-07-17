import React, { useState } from 'react';
import { MessageSquare, Calendar, User, TrendingUp, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCrmInteractions } from '@/hooks/useCrmInteractions';
import NewInteractionModal from './NewInteractionModal';
import InteractionTimeline from './InteractionTimeline';

const CrmInteractions = () => {
  const [showNewInteraction, setShowNewInteraction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterResult, setFilterResult] = useState('all');

  const { interactions, isLoading, createInteraction, isCreating } = useCrmInteractions();

  // Filter interactions based on search and filters
  const filteredInteractions = interactions?.filter(interaction => {
    const matchesSearch = !searchTerm || 
      interaction.contact?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.contact?.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.feedback?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || interaction.interaction_type === filterType;
    const matchesResult = filterResult === 'all' || interaction.result === filterResult;

    return matchesSearch && matchesType && matchesResult;
  });

  const handleCreateInteraction = (data: any) => {
    createInteraction(data);
    setShowNewInteraction(false);
  };

  // Stats for dashboard cards
  const totalInteractions = interactions?.length || 0;
  const recentInteractions = interactions?.filter(i => {
    const interactionDate = new Date(i.interaction_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return interactionDate >= weekAgo;
  }).length || 0;

  const pendingActions = interactions?.filter(i => {
    return i.next_action_date && new Date(i.next_action_date) >= new Date();
  }).length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Interações</p>
                <p className="text-2xl font-bold">{totalInteractions}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold">{recentInteractions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ações Pendentes</p>
                <p className="text-2xl font-bold">{pendingActions}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Interactions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Registro de Interações
            </span>
            <Button onClick={() => setShowNewInteraction(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Interação
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por empresa, contato ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Interação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="ligacao">Ligação</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="visita">Visita</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterResult} onValueChange={setFilterResult}>
              <SelectTrigger>
                <SelectValue placeholder="Resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Resultados</SelectItem>
                <SelectItem value="sucesso">Sucesso</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="sem_interesse">Sem Interesse</SelectItem>
                <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
                <SelectItem value="agendamento">Agendamento</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Mais Filtros
            </Button>
          </div>

          {/* Interactions Timeline */}
          <InteractionTimeline 
            interactions={filteredInteractions} 
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* New Interaction Modal */}
      <NewInteractionModal
        open={showNewInteraction}
        onOpenChange={setShowNewInteraction}
        onSubmit={handleCreateInteraction}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default CrmInteractions;