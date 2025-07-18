import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useCashFlowProjection } from "@/hooks/useCashFlowProjection";

export default function CashFlowProjection() {
  const { data: projection, isLoading, error } = useCashFlowProjection(60);

  const chartData = useMemo(() => {
    if (!projection) return [];
    
    return projection.map((item) => ({
      date: new Date(item.projection_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      fullDate: item.projection_date,
      entradas: Number(item.total_inflow),
      saidas: Number(item.total_outflow),
      saldo: Number(item.accumulated_balance),
      fluxoLiquido: Number(item.net_flow),
    }));
  }, [projection]);

  const summary = useMemo(() => {
    if (!projection || projection.length === 0) return null;

    const totalInflow = projection.reduce((sum, item) => sum + Number(item.total_inflow), 0);
    const totalOutflow = projection.reduce((sum, item) => sum + Number(item.total_outflow), 0);
    const negativeDays = projection.filter(item => Number(item.accumulated_balance) < 0).length;
    const lowestBalance = Math.min(...projection.map(item => Number(item.accumulated_balance)));

    return {
      totalInflow,
      totalOutflow,
      netFlow: totalInflow - totalOutflow,
      negativeDays,
      lowestBalance,
    };
  }, [projection]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p>Erro ao carregar projeção de fluxo de caixa</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Entradas</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {summary.totalInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Saídas</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {summary.totalOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fluxo Líquido</p>
                  <p className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {summary.netFlow.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {summary.netFlow >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Menor Saldo</p>
                  <p className={`text-2xl font-bold ${summary.lowestBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {summary.lowestBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant={summary.negativeDays > 0 ? "destructive" : "secondary"} className="mt-1">
                    {summary.negativeDays} dias negativos
                  </Badge>
                </div>
                <AlertTriangle className={`h-8 w-8 ${summary.lowestBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Linha - Saldo Acumulado */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Saldo (60 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Saldo']}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Saldo Acumulado"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Barras - Entradas vs Saídas */}
      <Card>
        <CardHeader>
          <CardTitle>Entradas vs Saídas Diárias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.slice(0, 30)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
                  name === 'entradas' ? 'Entradas' : 'Saídas'
                ]}
              />
              <Legend />
              <Bar dataKey="entradas" fill="hsl(var(--success))" name="Entradas" />
              <Bar dataKey="saidas" fill="hsl(var(--destructive))" name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Diário - Próximos 30 dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Entradas</TableHead>
                  <TableHead className="text-right">Saídas</TableHead>
                  <TableHead className="text-right">Fluxo Líquido</TableHead>
                  <TableHead className="text-right">Saldo Acumulado</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.slice(0, 30).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {new Date(item.fullDate).toLocaleDateString('pt-BR', { 
                        weekday: 'short', 
                        day: '2-digit', 
                        month: '2-digit' 
                      })}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      R$ {item.entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      R$ {item.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`text-right ${item.fluxoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {item.fluxoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${item.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.saldo >= 0 ? "secondary" : "destructive"}>
                        {item.saldo >= 0 ? "Positivo" : "Negativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}