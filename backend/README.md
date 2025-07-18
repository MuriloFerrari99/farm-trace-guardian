
# FarmTrace Backend - Python FastAPI

Backend completo em Python FastAPI substituindo o Supabase, com PostgreSQL, Redis e MinIO.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação e Usuários
- Registro e login de usuários
- JWT tokens para autenticação
- Perfis de usuário com roles (admin, supervisor, operator)
- Middleware de segurança

### ✅ Módulo Financeiro
- Contas a pagar e receber
- Fluxo de caixa e projeções
- Múltiplas moedas com conversão automática
- Plano de contas
- Upload de documentos financeiros

### ✅ CRM Completo
- Gerenciamento de contatos/clientes
- Propostas comerciais com geração automática de números
- Histórico de interações
- Oportunidades de vendas
- Funil de vendas

### ✅ Storage e Upload
- MinIO para armazenamento de arquivos
- Buckets organizados por tipo de documento
- URLs presignadas para acesso seguro
- Upload de múltiplos tipos de arquivo

## 🛠️ Stack Tecnológica

- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para PostgreSQL  
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões
- **MinIO** - Storage de arquivos (compatível S3)
- **Alembic** - Migrações de banco
- **JWT** - Autenticação segura
- **Pydantic** - Validação de dados

## 📦 Instalação e Execução

### 1. Pré-requisitos
```bash
# Instalar Python 3.11+
# Instalar Docker e Docker Compose
```

### 2. Configurar Ambiente
```bash
# Clonar repositório
git clone <repo-url>
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt
```

### 3. Executar com Docker (Recomendado)
```bash
# Iniciar serviços (PostgreSQL, Redis, MinIO)
docker-compose up -d db redis minio

# Aguardar inicialização dos serviços (30 segundos)
# Executar API localmente
python -m app.main
```

### 4. Executar Tudo com Docker
```bash
# Descomentar serviço 'api' no docker-compose.yml
# Depois executar:
docker-compose up -d
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```bash
# Database
DATABASE_URL=postgresql://farmtrace:farmtrace123@localhost:5432/farmtrace

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_URL=redis://localhost:6379/0

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# External APIs (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📋 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário atual

### Financeiro  
- `GET /api/financial/accounts-payable` - Listar contas a pagar
- `POST /api/financial/accounts-payable` - Criar conta a pagar
- `GET /api/financial/cash-flow-projection` - Projeção de fluxo de caixa

### CRM
- `GET /api/crm/contacts` - Listar contatos
- `POST /api/crm/contacts` - Criar contato
- `GET /api/crm/proposals` - Listar propostas
- `POST /api/crm/proposals` - Criar proposta

## 🧪 Testendo a API

### 1. Acessar Documentação Interativa
```
http://localhost:8000/docs
```

### 2. Exemplo de Requisições
```bash
# Registrar usuário
curl -X POST "http://localhost:8000/api/auth/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@farmtrace.com",
  "password": "123456",
  "name": "Admin User",
  "role": "admin"
}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@farmtrace.com", 
  "password": "123456"
}'
```

## 🔄 Migração do Supabase

Para migrar dados existentes do Supabase:

1. **Exportar dados do Supabase**
2. **Executar script de migração** (em desenvolvimento)
3. **Adaptar frontend** para usar nova API

## 📈 Próximos Passos

### Fase 2 - Funcionalidades Avançadas
- [ ] Módulo de Recepção e Produtores
- [ ] Sistema de Storage/Armazenamento
- [ ] Módulo de Expedição
- [ ] Consolidação de Lotes
- [ ] Relatórios e Analytics

### Fase 3 - Integração
- [ ] Adaptação completa do frontend React
- [ ] Sistema de notificações
- [ ] Integração com Google Calendar
- [ ] Sistema de backup automatizado

## 🎯 Vantagens vs Supabase

✅ **Controle Total** - Sem limitações de plataforma
✅ **Performance** - FastAPI é extremamente rápido  
✅ **Flexibilidade** - Customização completa
✅ **Escalabilidade** - Arquitetura preparada para crescimento
✅ **Custos** - Sem taxas de plataforma externa
✅ **Integração** - Fácil integração com SaaS existente

---

**Status**: ✅ Backend base implementado e funcional
**Próximo**: Adaptação do frontend React
