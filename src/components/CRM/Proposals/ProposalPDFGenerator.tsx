import jsPDF from 'jspdf';
import { Database } from '@/integrations/supabase/types';

type CommercialProposal = Database['public']['Tables']['commercial_proposals']['Row'] & {
  contact?: {
    contact_name: string;
    company_name: string;
    email: string;
  };
};

interface PDFContent {
  pt: {
    title: string;
    companyInfo: string;
    proposalNumber: string;
    date: string;
    client: string;
    product: string;
    packing: string;
    totalVolume: string;
    unitPrice: string;
    totalValue: string;
    deliveryTime: string;
    paymentTerms: string;
    certifications: string;
    exporterContact: string;
    validity: string;
    notes: string;
    footer: string;
  };
  en: {
    title: string;
    companyInfo: string;
    proposalNumber: string;
    date: string;
    client: string;
    product: string;
    packing: string;
    totalVolume: string;
    unitPrice: string;
    totalValue: string;
    deliveryTime: string;
    paymentTerms: string;
    certifications: string;
    exporterContact: string;
    validity: string;
    notes: string;
    footer: string;
  };
}

const content: PDFContent = {
  pt: {
    title: 'PROPOSTA COMERCIAL',
    companyInfo: 'Pé Doce Exportadora',
    proposalNumber: 'Proposta Nº:',
    date: 'Data:',
    client: 'Cliente:',
    product: 'Produto:',
    packing: 'Embalagem:',
    totalVolume: 'Volume Total:',
    unitPrice: 'Preço Unitário:',
    totalValue: 'Valor Total:',
    deliveryTime: 'Prazo de Entrega:',
    paymentTerms: 'Condições de Pagamento:',
    certifications: 'Certificações:',
    exporterContact: 'Contato do Exportador:',
    validity: 'Validade da Proposta:',
    notes: 'Observações:',
    footer: 'Esta proposta está sujeita aos termos e condições padrão de exportação.'
  },
  en: {
    title: 'COMMERCIAL PROPOSAL',
    companyInfo: 'Pé Doce Exporter',
    proposalNumber: 'Proposal No:',
    date: 'Date:',
    client: 'Client:',
    product: 'Product:',
    packing: 'Packing:',
    totalVolume: 'Total Volume:',
    unitPrice: 'Unit Price:',
    totalValue: 'Total Value:',
    deliveryTime: 'Delivery Time:',
    paymentTerms: 'Payment Terms:',
    certifications: 'Certifications:',
    exporterContact: 'Exporter Contact:',
    validity: 'Proposal Validity:',
    notes: 'Notes:',
    footer: 'This proposal is subject to standard export terms and conditions.'
  }
};

export const generateProposalPDF = (proposal: CommercialProposal, language: 'pt' | 'en' = 'pt'): void => {
  const doc = new jsPDF();
  const lang = content[language];
  
  // Colors - Green theme
  const primaryColor: [number, number, number] = [34, 139, 34]; // Forest Green
  const textColor: [number, number, number] = [51, 51, 51]; // Dark gray
  const lightGray: [number, number, number] = [240, 240, 240];
  
  // Header
  doc.setFillColor(34, 139, 34); // Green header
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(lang.title, 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(lang.companyInfo, 20, 33);
  
  // Reset text color
  doc.setTextColor(51, 51, 51);
  
  let yPosition = 55;
  
  // Proposal Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${lang.proposalNumber} ${proposal.proposal_number}`, 20, yPosition);
  doc.text(`${lang.date} ${new Date(proposal.created_at).toLocaleDateString('pt-BR')}`, 130, yPosition);
  
  yPosition += 15;
  
  // Client Info
  doc.setFont('helvetica', 'bold');
  doc.text(lang.client, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${proposal.contact?.company_name || ''} - ${proposal.contact?.contact_name || ''}`, 20, yPosition + 6);
  
  yPosition += 20;
  
  // Product Details Section
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPosition - 5, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DETALHES DO PRODUTO / PRODUCT DETAILS', 20, yPosition);
  
  yPosition += 15;
  
  // Product info
  const addField = (label: string, value: string, nextLine = true) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${label}:`, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPosition);
    if (nextLine) yPosition += 7;
  };
  
  addField(lang.product, proposal.product_name);
  
  const packingInfo = `${proposal.package_weight_kg}kg per box, ${proposal.packages_per_container} boxes per container`;
  addField(lang.packing, packingInfo);
  
  const volumeInfo = `${parseFloat(proposal.total_weight_kg?.toString() || '0').toLocaleString()} kg (${(parseFloat(proposal.total_weight_kg?.toString() || '0') / 1000).toFixed(1)} metric tons)`;
  addField(lang.totalVolume, volumeInfo);
  
  const priceInfo = `${proposal.currency} ${parseFloat(proposal.unit_price?.toString() || '0').toFixed(2)}/kg (${proposal.incoterm} ${proposal.port_of_loading || 'Santos'})`;
  addField(lang.unitPrice, priceInfo);
  
  const totalInfo = `${proposal.currency} ${parseFloat(proposal.total_value?.toString() || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  addField(lang.totalValue, totalInfo);
  
  yPosition += 5;
  
  // Commercial Terms Section
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPosition - 5, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CONDIÇÕES COMERCIAIS / COMMERCIAL TERMS', 20, yPosition);
  
  yPosition += 15;
  
  addField(lang.deliveryTime, `${proposal.delivery_time_days} ${language === 'pt' ? 'dias após confirmação do pedido' : 'days from order confirmation'}`);
  addField(lang.paymentTerms, proposal.payment_terms || '');
  
  if (proposal.certifications && proposal.certifications.length > 0) {
    addField(lang.certifications, proposal.certifications.join(', '));
  }
  
  yPosition += 5;
  
  // Contact Information
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPosition - 5, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INFORMAÇÕES DE CONTATO / CONTACT INFORMATION', 20, yPosition);
  
  yPosition += 15;
  
  addField(lang.exporterContact, `${proposal.exporter_name} - ${proposal.exporter_email}`);
  
  const validityText = `${proposal.validity_days} ${language === 'pt' ? 'dias a partir da data desta proposta' : 'days from proposal date'}`;
  addField(lang.validity, validityText);
  
  // Notes
  if (proposal.notes) {
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`${lang.notes}:`, 20, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    
    // Split long text into lines
    const lines = doc.splitTextToSize(proposal.notes, 170);
    lines.forEach((line: string) => {
      doc.text(line, 20, yPosition);
      yPosition += 5;
    });
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(lang.footer, 20, pageHeight - 20);
  
  // Page numbers
  doc.text(`${language === 'pt' ? 'Página' : 'Page'} 1`, 180, pageHeight - 10);
  
  // Save the PDF
  const filename = `${proposal.proposal_number}_${language}.pdf`;
  doc.save(filename);
};

export default generateProposalPDF;