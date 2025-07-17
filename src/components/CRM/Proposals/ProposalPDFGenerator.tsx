import jsPDF from 'jspdf';
import type { Database } from '@/integrations/supabase/types';

type CommercialProposal = Database['public']['Tables']['commercial_proposals']['Row'] & {
  contact?: {
    company_name: string;
    contact_name: string;
    email: string;
  } | null;
  opportunity?: {
    title: string;
  } | null;
};

interface PDFContent {
  pt: {
    title: string;
    proposalNumber: string;
    date: string;
    validUntil: string;
    client: string;
    company: string;
    contact: string;
    email: string;
    productInfo: string;
    productName: string;
    description: string;
    commercialTerms: string;
    unitPrice: string;
    totalWeight: string;
    totalValue: string;
    currency: string;
    incoterm: string;
    portOfLoading: string;
    portOfDischarge: string;
    paymentTerms: string;
    deliveryTime: string;
    validityPeriod: string;
    volumePackaging: string;
    shippingFormat: string;
    technicalSpecs: string;
    co2Range: string;
    o2Range: string;
    temperature: string;
    containerSealed: string;
    certifications: string;
    notes: string;
    contactInfo: string;
    exporterName: string;
    exporterContact: string;
    exporterEmail: string;
    footer: string;
  };
  en: {
    title: string;
    proposalNumber: string;
    date: string;
    validUntil: string;
    client: string;
    company: string;
    contact: string;
    email: string;
    productInfo: string;
    productName: string;
    description: string;
    commercialTerms: string;
    unitPrice: string;
    totalWeight: string;
    totalValue: string;
    currency: string;
    incoterm: string;
    portOfLoading: string;
    portOfDischarge: string;
    paymentTerms: string;
    deliveryTime: string;
    validityPeriod: string;
    volumePackaging: string;
    shippingFormat: string;
    technicalSpecs: string;
    co2Range: string;
    o2Range: string;
    temperature: string;
    containerSealed: string;
    certifications: string;
    notes: string;
    contactInfo: string;
    exporterName: string;
    exporterContact: string;
    exporterEmail: string;
    footer: string;
  };
}

const content: PDFContent = {
  pt: {
    title: 'PROPOSTA COMERCIAL',
    proposalNumber: 'Proposta N°',
    date: 'Data',
    validUntil: 'Válido até',
    client: 'CLIENTE',
    company: 'Empresa',
    contact: 'Contato',
    email: 'Email',
    productInfo: 'INFORMAÇÕES DO PRODUTO',
    productName: 'Produto',
    description: 'Descrição',
    commercialTerms: 'CONDIÇÕES COMERCIAIS',
    unitPrice: 'Preço Unitário',
    totalWeight: 'Peso Total',
    totalValue: 'Valor Total',
    currency: 'Moeda',
    incoterm: 'Incoterm',
    portOfLoading: 'Porto de Embarque',
    portOfDischarge: 'Porto de Descarga',
    paymentTerms: 'Condições de Pagamento',
    deliveryTime: 'Prazo de Entrega',
    validityPeriod: 'Validade da Proposta',
    volumePackaging: 'VOLUME E EMBALAGEM',
    shippingFormat: 'Formato de Envio',
    technicalSpecs: 'ESPECIFICAÇÕES TÉCNICAS DE ENVIO',
    co2Range: 'CO₂',
    o2Range: 'O₂',
    temperature: 'Temperatura',
    containerSealed: 'Válvulas e drenos lacrados',
    certifications: 'Certificações',
    notes: 'Observações',
    contactInfo: 'INFORMAÇÕES DE CONTATO',
    exporterName: 'Exportador',
    exporterContact: 'Contato',
    exporterEmail: 'Email',
    footer: 'Esta proposta é válida pelos dias indicados e está sujeita aos termos e condições especificados.'
  },
  en: {
    title: 'COMMERCIAL PROPOSAL',
    proposalNumber: 'Proposal No.',
    date: 'Date',
    validUntil: 'Valid until',
    client: 'CLIENT',
    company: 'Company',
    contact: 'Contact',
    email: 'Email',
    productInfo: 'PRODUCT INFORMATION',
    productName: 'Product',
    description: 'Description',
    commercialTerms: 'COMMERCIAL TERMS',
    unitPrice: 'Unit Price',
    totalWeight: 'Total Weight',
    totalValue: 'Total Value',
    currency: 'Currency',
    incoterm: 'Incoterm',
    portOfLoading: 'Port of Loading',
    portOfDischarge: 'Port of Discharge',
    paymentTerms: 'Payment Terms',
    deliveryTime: 'Delivery Time',
    validityPeriod: 'Proposal Validity',
    volumePackaging: 'VOLUME AND PACKAGING',
    shippingFormat: 'Shipping Format',
    technicalSpecs: 'TECHNICAL SHIPPING SPECIFICATIONS',
    co2Range: 'CO₂',
    o2Range: 'O₂',
    temperature: 'Temperature',
    containerSealed: 'Sealed valves and drains',
    certifications: 'Certifications',
    notes: 'Notes',
    contactInfo: 'CONTACT INFORMATION',
    exporterName: 'Exporter',
    exporterContact: 'Contact',
    exporterEmail: 'Email',
    footer: 'This proposal is valid for the indicated days and is subject to the specified terms and conditions.'
  }
};

export const generateProposalPDF = (proposal: CommercialProposal, language: 'pt' | 'en' = 'pt'): void => {
  const doc = new jsPDF();
  const t = content[language];
  
  // Colors
  const primaryColor = '#2563eb';
  const secondaryColor = '#64748b';
  const lightGray = '#f8fafc';
  
  let yPosition = 30;
  const margin = 20;
  const pageWidth = 210; // A4 width in mm
  
  // Helper function to add a styled section
  const addSection = (title: string, startY: number): number => {
    doc.setFillColor(primaryColor);
    doc.rect(margin, startY - 5, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, startY);
    doc.setTextColor(0, 0, 0);
    return startY + 15;
  };
  
  // Header with gradient effect
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, pageWidth / 2, 25, { align: 'center' });
  
  // Proposal info section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const proposalDate = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US');
  const validUntilDate = proposal.expires_at 
    ? new Date(proposal.expires_at).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')
    : 'N/A';
  
  doc.text(`${t.proposalNumber}: ${proposal.proposal_number}`, margin, 50);
  doc.text(`${t.date}: ${proposalDate}`, margin, 57);
  doc.text(`${t.validUntil}: ${validUntilDate}`, margin, 64);
  
  yPosition = 80;
  
  // Client Information
  yPosition = addSection(t.client, yPosition);
  
  const clientName = proposal.contact?.company_name || proposal.manual_company_name || 'N/A';
  const contactName = proposal.contact?.contact_name || proposal.manual_contact_name || 'N/A';
  const contactEmail = proposal.contact?.email || proposal.manual_contact_email || 'N/A';
  
  doc.setFont('helvetica', 'normal');
  doc.text(`${t.company}: ${clientName}`, margin, yPosition);
  doc.text(`${t.contact}: ${contactName}`, margin, yPosition + 7);
  doc.text(`${t.email}: ${contactEmail}`, margin, yPosition + 14);
  
  yPosition += 30;
  
  // Product Information
  yPosition = addSection(t.productInfo, yPosition);
  
  doc.text(`${t.productName}: ${proposal.product_name}`, margin, yPosition);
  if (proposal.product_description) {
    const splitDescription = doc.splitTextToSize(proposal.product_description, pageWidth - 2 * margin - 10);
    doc.text(`${t.description}: ${splitDescription}`, margin, yPosition + 7);
    yPosition += splitDescription.length * 7;
  }
  
  yPosition += 20;
  
  // Commercial Terms
  yPosition = addSection(t.commercialTerms, yPosition);
  
  const terms = [
    `${t.unitPrice}: ${proposal.currency} ${proposal.unit_price.toFixed(2)}`,
    `${t.totalWeight}: ${proposal.total_weight_kg} kg`,
    `${t.totalValue}: ${proposal.currency} ${proposal.total_value?.toFixed(2) || 'N/A'}`,
    `${t.incoterm}: ${proposal.incoterm}`,
    `${t.portOfLoading}: ${proposal.port_of_loading || 'N/A'}`,
    `${t.portOfDischarge}: ${proposal.port_of_discharge || 'N/A'}`,
    `${t.paymentTerms}: ${proposal.payment_terms || 'N/A'}`,
    `${t.deliveryTime}: ${proposal.delivery_time_days || 'N/A'} dias`,
    `${t.validityPeriod}: ${proposal.validity_days || 'N/A'} dias`
  ];
  
  terms.forEach((term, index) => {
    doc.text(term, margin, yPosition + (index * 7));
  });
  
  yPosition += terms.length * 7 + 15;
  
  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  // Volume and Packaging
  yPosition = addSection(t.volumePackaging, yPosition);
  
  if (proposal.shipping_format) {
    const shippingText = doc.splitTextToSize(proposal.shipping_format, pageWidth - 2 * margin - 10);
    doc.text(`${t.shippingFormat}: ${shippingText}`, margin, yPosition);
    yPosition += shippingText.length * 7 + 10;
  }
  
  // Technical Specifications
  yPosition = addSection(t.technicalSpecs, yPosition);
  
  const techSpecs = [
    `${t.co2Range}: ${proposal.co2_range_min || 3}% - ${proposal.co2_range_max || 10}%`,
    `${t.o2Range}: ${proposal.o2_range_min || 2}% - ${proposal.o2_range_max || 5}%`,
    `${t.temperature}: ${proposal.temperature_min || 5}°C - ${proposal.temperature_max || 7}°C`,
    `${t.containerSealed}: ${proposal.container_sealed ? 'Sim' : 'Não'}`
  ];
  
  techSpecs.forEach((spec, index) => {
    doc.text(spec, margin, yPosition + (index * 7));
  });
  
  yPosition += techSpecs.length * 7 + 15;
  
  // Certifications
  if (proposal.certifications && proposal.certifications.length > 0) {
    yPosition = addSection(t.certifications, yPosition);
    const certsText = proposal.certifications.join(', ');
    const splitCerts = doc.splitTextToSize(certsText, pageWidth - 2 * margin - 10);
    doc.text(splitCerts, margin, yPosition);
    yPosition += splitCerts.length * 7 + 15;
  }
  
  // Notes
  if (proposal.notes) {
    yPosition = addSection(t.notes, yPosition);
    const notesText = doc.splitTextToSize(proposal.notes, pageWidth - 2 * margin - 10);
    doc.text(notesText, margin, yPosition);
    yPosition += notesText.length * 7 + 15;
  }
  
  // Contact Information
  yPosition = addSection(t.contactInfo, yPosition);
  
  doc.text(`${t.exporterName}: ${proposal.exporter_name}`, margin, yPosition);
  doc.text(`${t.exporterContact}: ${proposal.exporter_contact}`, margin, yPosition + 7);
  doc.text(`${t.exporterEmail}: ${proposal.exporter_email}`, margin, yPosition + 14);
  
  // Footer
  doc.setFillColor(lightGray);
  doc.rect(0, 280, pageWidth, 17, 'F');
  doc.setTextColor(secondaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(t.footer, pageWidth / 2, 290, { align: 'center' });
  
  // Save the PDF
  const fileName = `proposta_${proposal.proposal_number}_${language}.pdf`;
  doc.save(fileName);
};