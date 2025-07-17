import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

type ConsolidationLabelData = {
  consolidated_lot_id: string;
  importer_name: string;
  po_number: string;
  volume_quantity: number;
  origin_country: string;
  destination_country: string;
  product_type: string;
  tracking_code: string;
  extra_labels: string[];
  logistics_instructions: string;
  language: string;
};

export const useConsolidationLabels = () => {
  const queryClient = useQueryClient();

  const generateLabelPDF = async (labelData: ConsolidationLabelData, consolidation: any) => {
    const pdf = new jsPDF();
    
    // Configurações do PDF
    pdf.setFontSize(16);
    pdf.text('RÓTULO DE EXPEDIÇÃO', 105, 20, { align: 'center' });
    
    // Gerar QR Code
    const qrCodeData = JSON.stringify({
      consolidation_code: consolidation.consolidation_code,
      tracking_code: labelData.tracking_code,
      po_number: labelData.po_number,
      product_type: labelData.product_type,
      timestamp: new Date().toISOString()
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
      width: 100,
      margin: 2,
    });
    
    // Layout do rótulo
    let y = 40;
    
    // Seção do Destinatário
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DESTINATÁRIO / IMPORTER:', 20, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(labelData.importer_name, 20, y + 8);
    
    y += 25;
    
    // Informações do Pedido
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMAÇÕES DO PEDIDO:', 20, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`PO/Invoice: ${labelData.po_number}`, 20, y + 8);
    pdf.text(`Volumes: ${labelData.volume_quantity}`, 20, y + 16);
    pdf.text(`Produto: ${labelData.product_type}`, 20, y + 24);
    
    y += 40;
    
    // Origem e Destino
    pdf.setFont('helvetica', 'bold');
    pdf.text('ORIGEM/DESTINO:', 20, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Origem: ${labelData.origin_country}`, 20, y + 8);
    pdf.text(`Destino: ${labelData.destination_country}`, 20, y + 16);
    
    y += 30;
    
    // Código de Rastreamento
    pdf.setFont('helvetica', 'bold');
    pdf.text('CÓDIGO DE RASTREAMENTO:', 20, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    pdf.text(labelData.tracking_code, 20, y + 10);
    
    // QR Code
    pdf.addImage(qrCodeDataURL, 'PNG', 140, 40, 40, 40);
    pdf.setFontSize(8);
    pdf.text('Código QR para rastreabilidade', 140, 85, { align: 'left' });
    
    y += 30;
    
    // Etiquetas Especiais
    if (labelData.extra_labels.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ETIQUETAS ESPECIAIS:', 20, y);
      pdf.setFont('helvetica', 'normal');
      
      labelData.extra_labels.forEach((label, index) => {
        pdf.setFillColor(255, 255, 0); // Amarelo para destaque
        pdf.rect(20, y + 8 + (index * 12), pdf.getTextWidth(label) + 4, 8, 'F');
        pdf.text(label, 22, y + 14 + (index * 12));
      });
      
      y += (labelData.extra_labels.length * 12) + 20;
    }
    
    // Instruções Logísticas
    if (labelData.logistics_instructions) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INSTRUÇÕES LOGÍSTICAS:', 20, y);
      pdf.setFont('helvetica', 'normal');
      
      const splitInstructions = pdf.splitTextToSize(labelData.logistics_instructions, 170);
      pdf.text(splitInstructions, 20, y + 8);
    }
    
    // Informações do Sistema
    y = 260;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, y);
    pdf.text(`Consolidação: ${consolidation.consolidation_code}`, 20, y + 8);
    
    return { pdf, qrCodeData };
  };

  const createLabel = useMutation({
    mutationFn: async (labelData: ConsolidationLabelData) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Buscar dados da consolidação
      const { data: consolidation, error: consolidationError } = await supabase
        .from('consolidated_lots')
        .select('*')
        .eq('id', labelData.consolidated_lot_id)
        .single();
      
      if (consolidationError) throw consolidationError;
      
      // Gerar PDF
      const { pdf, qrCodeData } = await generateLabelPDF(labelData, consolidation);
      
      // Salvar no banco de dados
      const { data: label, error: labelError } = await supabase
        .from('generated_labels')
        .insert({
          consolidated_lot_id: labelData.consolidated_lot_id,
          label_layout: 'standard',
          qr_code_data: qrCodeData,
          language: labelData.language,
          status: 'active',
          generated_by: user.user?.id,
          client_customization: {
            importer_name: labelData.importer_name,
            po_number: labelData.po_number,
            volume_quantity: labelData.volume_quantity,
            origin_country: labelData.origin_country,
            destination_country: labelData.destination_country,
            tracking_code: labelData.tracking_code,
            extra_labels: labelData.extra_labels,
            logistics_instructions: labelData.logistics_instructions
          }
        })
        .select()
        .single();
      
      if (labelError) throw labelError;
      
      // Download do PDF
      pdf.save(`rotulo-${consolidation.consolidation_code}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      return label;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-labels'] });
      toast.success('Rótulo gerado e baixado com sucesso!');
    },
    onError: (error) => {
      console.error('Error generating label:', error);
      toast.error('Erro ao gerar rótulo');
    },
  });

  return {
    createLabel,
  };
};