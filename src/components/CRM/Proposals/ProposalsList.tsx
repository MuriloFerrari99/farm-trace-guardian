import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MoreHorizontal, 
  Search, 
  FileText, 
  Download, 
  Send, 
  Edit3,
  Calendar,
  DollarSign,
  Package,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Database } from '@/integrations/supabase/types';

type CommercialProposal = Database['public']['Tables']['commercial_proposals']['Row'] & {
  contact?: {
    contact_name: string;
    company_name: string;
    email: string;
  };
  opportunity?: {
    title: string;
    stage: string;
  };
};

interface ProposalsListProps {
  proposals: CommercialProposal[];
  loading: boolean;
  onEdit: (proposal: CommercialProposal) => void;
  onGeneratePDF: (proposalId: string, language: 'pt' | 'en') => void;
  onSend: (proposalId: string) => void;
  onStatusUpdate: (proposalId: string, status: string) => void;
  onDelete: (proposalId: string) => void;
}

const ProposalsList: React.FC<ProposalsListProps> = ({
  proposals,
  loading,
  onEdit,
  onGeneratePDF,
  onSend,
  onStatusUpdate,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'secondary';
      case 'enviada': return 'default';
      case 'aceita': return 'default';
      case 'rejeitada': return 'destructive';
      case 'expirada': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'rascunho': return 'Rascunho';
      case 'enviada': return 'Enviada';
      case 'aceita': return 'Aceita';
      case 'rejeitada': return 'Rejeitada';
      case 'expirada': return 'Expirada';
      default: return status;
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = (
      proposal.proposal_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.contact?.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.contact?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    const matchesCurrency = currencyFilter === 'all' || proposal.currency === currencyFilter;
    
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por número, produto, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="enviada">Enviada</SelectItem>
                <SelectItem value="aceita">Aceita</SelectItem>
                <SelectItem value="rejeitada">Rejeitada</SelectItem>
                <SelectItem value="expirada">Expirada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Moeda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma proposta encontrada</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || currencyFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie sua primeira proposta comercial'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {proposal.proposal_number}
                      </CardTitle>
                      <Badge variant={getStatusColor(proposal.status)}>
                        {getStatusLabel(proposal.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {proposal.contact?.company_name} • {proposal.contact?.contact_name}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(proposal)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onGeneratePDF(proposal.id, 'pt')}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF Português
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onGeneratePDF(proposal.id, 'en')}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF English
                      </DropdownMenuItem>
                      {proposal.status === 'rascunho' && (
                        <DropdownMenuItem onClick={() => onSend(proposal.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Proposta
                        </DropdownMenuItem>
                      )}
                      {proposal.status === 'enviada' && (
                        <>
                          <DropdownMenuItem onClick={() => onStatusUpdate(proposal.id, 'aceita')}>
                            Marcar como Aceita
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusUpdate(proposal.id, 'rejeitada')}>
                            Marcar como Rejeitada
                          </DropdownMenuItem>
                        </>
                       )}
                       <DropdownMenuItem 
                         onClick={() => onDelete(proposal.id)}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
                       >
                         <Trash2 className="h-4 w-4 mr-2" />
                         Excluir Proposta
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      Produto
                    </div>
                    <p className="font-medium">{proposal.product_name}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Valor Total
                    </div>
                    <p className="font-medium">
                      {proposal.currency} {parseFloat(proposal.total_value?.toString() || '0').toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2 
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      Volume
                    </div>
                    <p className="font-medium">
                      {parseFloat(proposal.total_weight_kg?.toString() || '0').toLocaleString('pt-BR')} kg
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Data
                    </div>
                    <p className="font-medium">
                      {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        Incoterm: <span className="font-medium">{proposal.incoterm}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Prazo: <span className="font-medium">{proposal.delivery_time_days} dias</span>
                      </span>
                    </div>
                    {proposal.expires_at && (
                      <span className="text-muted-foreground">
                        Válido até: {format(new Date(proposal.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProposalsList;