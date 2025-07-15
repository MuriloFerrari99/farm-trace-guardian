import React, { useState } from 'react';
import { Plus, Search, Filter, Building, Phone, Mail, MapPin, User, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CrmContacts = () => {
  const [showNewContact, setShowNewContact] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSegment, setFilterSegment] = useState('all');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [newContact, setNewContact] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    country: '',
    state: '',
    city: '',
    segment: 'outros',
    status: 'ativo',
    general_notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['crm-contacts', searchTerm, filterStatus, filterSegment],
    queryFn: async () => {
      let query = supabase
        .from('crm_contacts')
        .select(`
          *,
          created_by_profile:profiles!crm_contacts_created_by_fkey(name),
          assigned_to_profile:profiles!crm_contacts_assigned_to_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all' && ['ativo', 'desqualificado', 'em_negociacao'].includes(filterStatus)) {
        query = query.eq('status', filterStatus as 'ativo' | 'desqualificado' | 'em_negociacao');
      }

      if (filterSegment !== 'all' && ['importador', 'distribuidor', 'varejo', 'atacado', 'industria', 'outros'].includes(filterSegment)) {
        query = query.eq('segment', filterSegment as 'importador' | 'distribuidor' | 'varejo' | 'atacado' | 'industria' | 'outros');
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.filter(contact => 
        searchTerm === '' || 
        contact.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  });

  const createContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('crm_contacts')
        .insert([{
          ...contactData,
          created_by: user.id,
          assigned_to: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast({
        title: "Sucesso",
        description: "Contato criado com sucesso",
      });
      setShowNewContact(false);
      setNewContact({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        whatsapp: '',
        country: '',
        state: '',
        city: '',
        segment: 'outros',
        status: 'ativo',
        general_notes: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar contato: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreateContact = () => {
    if (!newContact.company_name || !newContact.contact_name || !newContact.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createContactMutation.mutate(newContact);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      desqualificado: { label: 'Desqualificado', variant: 'destructive' as const },
      em_negociacao: { label: 'Em Negociação', variant: 'secondary' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSegmentLabel = (segment: string) => {
    const segmentMap = {
      importador: 'Importador',
      distribuidor: 'Distribuidor',
      varejo: 'Varejo',
      atacado: 'Atacado',
      industria: 'Indústria',
      outros: 'Outros'
    };
    return segmentMap[segment as keyof typeof segmentMap] || segment;
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Gestão de Contatos</span>
            <Dialog open={showNewContact} onOpenChange={setShowNewContact}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Contato
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Contato</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da Empresa *</Label>
                      <Input 
                        value={newContact.company_name}
                        onChange={(e) => setNewContact(prev => ({ ...prev, company_name: e.target.value }))}
                        placeholder="Ex: ABC Trading Company" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Contato *</Label>
                      <Input 
                        value={newContact.contact_name}
                        onChange={(e) => setNewContact(prev => ({ ...prev, contact_name: e.target.value }))}
                        placeholder="Ex: João Silva" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>E-mail *</Label>
                      <Input 
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="joao@empresa.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input 
                        value={newContact.phone}
                        onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+55 11 9999-9999" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>País</Label>
                      <Input 
                        value={newContact.country}
                        onChange={(e) => setNewContact(prev => ({ ...prev, country: e.target.value }))}
                        placeholder="Brasil" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input 
                        value={newContact.state}
                        onChange={(e) => setNewContact(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="SP" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input 
                        value={newContact.city}
                        onChange={(e) => setNewContact(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="São Paulo" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Segmento</Label>
                      <Select 
                        value={newContact.segment} 
                        onValueChange={(value) => setNewContact(prev => ({ ...prev, segment: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="importador">Importador</SelectItem>
                          <SelectItem value="distribuidor">Distribuidor</SelectItem>
                          <SelectItem value="varejo">Varejo</SelectItem>
                          <SelectItem value="atacado">Atacado</SelectItem>
                          <SelectItem value="industria">Indústria</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp</Label>
                      <Input 
                        value={newContact.whatsapp}
                        onChange={(e) => setNewContact(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="+55 11 9999-9999" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Observações Gerais</Label>
                    <Textarea 
                      value={newContact.general_notes}
                      onChange={(e) => setNewContact(prev => ({ ...prev, general_notes: e.target.value }))}
                      placeholder="Informações adicionais sobre o contato..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setShowNewContact(false)} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateContact} className="flex-1" disabled={createContactMutation.isPending}>
                      {createContactMutation.isPending ? "Criando..." : "Criar Contato"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por empresa, contato ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="desqualificado">Desqualificado</SelectItem>
                <SelectItem value="em_negociacao">Em Negociação</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSegment} onValueChange={setFilterSegment}>
              <SelectTrigger>
                <SelectValue placeholder="Segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Segmentos</SelectItem>
                <SelectItem value="importador">Importador</SelectItem>
                <SelectItem value="distribuidor">Distribuidor</SelectItem>
                <SelectItem value="varejo">Varejo</SelectItem>
                <SelectItem value="atacado">Atacado</SelectItem>
                <SelectItem value="industria">Indústria</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Mais Filtros
            </Button>
          </div>

          {/* Contacts Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando contatos...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts?.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contact.company_name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contact.contact_name}</p>
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getSegmentLabel(contact.segment)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3" />
                        {contact.city && contact.state ? `${contact.city}, ${contact.state}` : contact.country || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(contact.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {contacts && contacts.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum contato encontrado</h3>
              <p className="text-gray-600">Comece criando seu primeiro contato para gerenciar relacionamentos.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmContacts;