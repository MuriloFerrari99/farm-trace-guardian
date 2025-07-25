
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
    additionalCosts: string;
    freight: string;
    insurance: string;
    days: string;
    yes: string;
    no: string;
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
    additionalCosts: string;
    freight: string;
    insurance: string;
    days: string;
    yes: string;
    no: string;
  };
  es: {
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
    additionalCosts: string;
    freight: string;
    insurance: string;
    days: string;
    yes: string;
    no: string;
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
    productInfo: 'DETALHES DA PROPOSTA',
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
    volumePackaging: 'FORMATO DE ENVIO',
    shippingFormat: 'Formato de Envio',
    technicalSpecs: 'ESPECIFICAÇÕES TÉCNICAS',
    co2Range: 'CO2:',
    o2Range: 'O2:',
    temperature: 'Temperatura',
    containerSealed: 'Válvulas e drenos lacrados',
    certifications: 'CERTIFICAÇÕES',
    notes: 'OBSERVAÇÕES',
    contactInfo: 'INFORMAÇÕES DE CONTATO',
    exporterName: 'Exportador',
    exporterContact: 'Contato',
    exporterEmail: 'Email',
    footer: 'Esta proposta é válida pelos dias indicados e está sujeita aos termos e condições especificados.',
    additionalCosts: 'CUSTOS ADICIONAIS',
    freight: 'Frete',
    insurance: 'Seguro',
    days: 'dias',
    yes: 'Sim',
    no: 'Não'
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
    productInfo: 'PROPOSAL DETAILS',
    productName: 'Product',
    description: 'Description',
    commercialTerms: 'COMMERCIAL CONDITIONS',
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
    volumePackaging: 'SHIPPING FORMAT',
    shippingFormat: 'Shipping Format',
    technicalSpecs: 'TECHNICAL SPECIFICATIONS',
    co2Range: 'CO2:',
    o2Range: 'O2:',
    temperature: 'Temperature',
    containerSealed: 'Sealed valves and drains',
    certifications: 'CERTIFICATIONS',
    notes: 'OBSERVATIONS',
    contactInfo: 'CONTACT INFORMATION',
    exporterName: 'Exporter',
    exporterContact: 'Contact',
    exporterEmail: 'Email',
    footer: 'This proposal is valid for the indicated days and is subject to the specified terms and conditions.',
    additionalCosts: 'ADDITIONAL COSTS',
    freight: 'Freight',
    insurance: 'Insurance',
    days: 'days',
    yes: 'Yes',
    no: 'No'
  },
  es: {
    title: 'PROPUESTA COMERCIAL',
    proposalNumber: 'Propuesta N°',
    date: 'Fecha',
    validUntil: 'Válido hasta',
    client: 'CLIENTE',
    company: 'Empresa',
    contact: 'Contacto',
    email: 'Email',
    productInfo: 'DETALLES DE LA PROPUESTA',
    productName: 'Producto',
    description: 'Descripción',
    commercialTerms: 'CONDICIONES COMERCIALES',
    unitPrice: 'Precio Unitario',
    totalWeight: 'Peso Total',
    totalValue: 'Valor Total',
    currency: 'Moneda',
    incoterm: 'Incoterm',
    portOfLoading: 'Puerto de Embarque',
    portOfDischarge: 'Puerto de Descarga',
    paymentTerms: 'Condiciones de Pago',
    deliveryTime: 'Plazo de Entrega',
    validityPeriod: 'Validez de la Propuesta',
    volumePackaging: 'FORMATO DE ENVÍO',
    shippingFormat: 'Formato de Envío',
    technicalSpecs: 'ESPECIFICACIONES TÉCNICAS',
    co2Range: 'CO2:',
    o2Range: 'O2:',
    temperature: 'Temperatura',
    containerSealed: 'Válvulas y drenajes sellados',
    certifications: 'CERTIFICACIONES',
    notes: 'OBSERVACIONES',
    contactInfo: 'INFORMACIÓN DE CONTACTO',
    exporterName: 'Exportador',
    exporterContact: 'Contacto',
    exporterEmail: 'Email',
    footer: 'Esta propuesta es válida por los días indicados y está sujeta a los términos y condiciones especificados.',
    additionalCosts: 'COSTOS ADICIONALES',
    freight: 'Flete',
    insurance: 'Seguro',
    days: 'días',
    yes: 'Sí',
    no: 'No'
  }
};

// Helper function to translate dynamic text content
const translateText = (text: string, language: 'pt' | 'en' | 'es'): string => {
  if (!text || language === 'pt') return text;
  
  // Common translations dictionary
  const translations = {
    // Fruits and products
    'abacate': { en: 'avocado', es: 'aguacate' },
    'manga': { en: 'mango', es: 'mango' },
    'limão': { en: 'lime', es: 'limón' },
    'maracujá': { en: 'passion fruit', es: 'maracuyá' },
    'goiaba': { en: 'guava', es: 'guayaba' },
    'caju': { en: 'cashew', es: 'anacardo' },
    'acerola': { en: 'acerola', es: 'acerola' },
    'coco': { en: 'coconut', es: 'coco' },
    
    // Quality descriptions
    'fresco': { en: 'fresh', es: 'fresco' },
    'maduro': { en: 'ripe', es: 'maduro' },
    'selecionado': { en: 'selected', es: 'seleccionado' },
    'premium': { en: 'premium', es: 'premium' },
    'orgânico': { en: 'organic', es: 'orgánico' },
    'natural': { en: 'natural', es: 'natural' },
    'qualidade superior': { en: 'superior quality', es: 'calidad superior' },
    
    // Shipping format terms
    'caixas plásticas': { en: 'plastic boxes', es: 'cajas plásticas' },
    'ventiladas': { en: 'ventilated', es: 'ventiladas' },
    'padronizadas': { en: 'standardized', es: 'estandarizadas' },
    'A mercadoria será acondicionada em': { en: 'The merchandise will be packed in', es: 'La mercancía será empacada en' },
    'embalagens de': { en: 'packages of', es: 'empaques de' },
    'cada': { en: 'each', es: 'cada' },
    'unidades': { en: 'units', es: 'unidades' },
    'com peso': { en: 'with weight', es: 'con peso' },
    'líquido': { en: 'net', es: 'neto' },
    'aproximado': { en: 'approximately', es: 'aproximadamente' },
    'por pallet': { en: 'per pallet', es: 'por pallet' },
    'por container': { en: 'per container', es: 'por contenedor' },
    
    // Common observations/notes
    'produto de alta qualidade': { en: 'high quality product', es: 'producto de alta calidad' },
    'armazenamento refrigerado': { en: 'refrigerated storage', es: 'almacenamiento refrigerado' },
    'transporte refrigerado': { en: 'refrigerated transport', es: 'transporte refrigerado' },
    'manter em temperatura controlada': { en: 'keep at controlled temperature', es: 'mantener a temperatura controlada' },
    'produto perecível': { en: 'perishable product', es: 'producto perecedero' },
    'certificação orgânica': { en: 'organic certification', es: 'certificación orgánica' },
    'rastreabilidade completa': { en: 'full traceability', es: 'trazabilidad completa' },
    'conforme regulamentações': { en: 'according to regulations', es: 'conforme a regulaciones' },
    'inspeção sanitária': { en: 'sanitary inspection', es: 'inspección sanitaria' },
    'documentação completa': { en: 'complete documentation', es: 'documentación completa' },
    
    // Units and measures
    'quilos': { en: 'kilos', es: 'kilos' },
    'toneladas': { en: 'tons', es: 'toneladas' },
    'caixas': { en: 'boxes', es: 'cajas' },
    'pallets': { en: 'pallets', es: 'pallets' },
    'containers': { en: 'containers', es: 'contenedores' },
    
    // Common prepositions and conjunctions
    'de': { en: 'of', es: 'de' },
    'com': { en: 'with', es: 'con' },
    'para': { en: 'for', es: 'para' },
    'em': { en: 'in', es: 'en' },
    'por': { en: 'per', es: 'por' },
    'e': { en: 'and', es: 'y' },
    'ou': { en: 'or', es: 'o' }
  };
  
  let translatedText = text;
  
  // Apply translations based on target language
  Object.entries(translations).forEach(([pt, translations]) => {
    const targetTranslation = translations[language];
    if (targetTranslation) {
      const regex = new RegExp(`\\b${pt}\\b`, 'gi');
      translatedText = translatedText.replace(regex, targetTranslation);
    }
  });
  
  return translatedText;
};

// Helper function to translate shipping format text
const translateShippingFormat = (text: string, language: 'pt' | 'en' | 'es'): string => {
  if (!text || language === 'pt') return text;
  return translateText(text, language);
};

export const generateProposalPDF = (proposal: CommercialProposal, language: 'pt' | 'en' | 'es' = 'pt'): void => {
  const doc = new jsPDF();
  const t = content[language];
  
  // Professional colors matching the reference
  const primaryGreen = [45, 125, 75]; // Verde profissional
  const lightGreen = [240, 248, 245]; // Verde claro para backgrounds
  const darkGray = [51, 51, 51]; // Texto principal
  const mediumGray = [102, 102, 102]; // Texto secundário
  const lightGray = [245, 245, 245]; // Background alternado
  
  let yPosition = 25;
  const margin = 20;
  const pageWidth = 210; // A4 width in mm
  const contentWidth = pageWidth - 2 * margin;
  
  // Helper function to draw rounded rectangle
  const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number, fillColor?: number[], strokeColor?: number[]) => {
    if (fillColor) {
      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    }
    if (strokeColor) {
      doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
    }
    
    // Simple rounded rectangle approximation
    doc.roundedRect(x, y, width, height, radius, radius, fillColor ? 'F' : 'S');
  };
  
  // Helper function to create table with rounded borders
  const createTable = (headers: string[], rows: string[][], startY: number, headerBg: number[] = lightGreen): number => {
    const cellHeight = 8;
    const cellPadding = 2;
    const colWidth = contentWidth / headers.length;
    let currentY = startY;
    
    // Header
    drawRoundedRect(margin, currentY, contentWidth, cellHeight, 2, headerBg);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, index) => {
      doc.text(header, margin + (index * colWidth) + cellPadding, currentY + 5.5);
    });
    
    currentY += cellHeight;
    
    // Rows
    doc.setFont('helvetica', 'normal');
    rows.forEach((row, rowIndex) => {
      const bgColor = rowIndex % 2 === 0 ? [255, 255, 255] : lightGray;
      drawRoundedRect(margin, currentY, contentWidth, cellHeight, 1, bgColor);
      
      row.forEach((cell, cellIndex) => {
        const cellText = doc.splitTextToSize(cell, colWidth - cellPadding * 2);
        doc.text(cellText[0] || '', margin + (cellIndex * colWidth) + cellPadding, currentY + 5.5);
      });
      
      currentY += cellHeight;
    });
    
    return currentY + 5;
  };
  
  // Header Section - Company Name
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PÉ DOCE', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Comércio de Frutas e Vegetais', pageWidth / 2, 28, { align: 'center' });
  
  yPosition = 50;
  
  // Title with highlighted background
  drawRoundedRect(margin, yPosition, contentWidth, 12, 3, lightGreen);
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(t.title, pageWidth / 2, yPosition + 8, { align: 'center' });
  
  yPosition += 20;
  
  // Proposal basic info in two columns
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const proposalDate = new Date().toLocaleDateString(
    language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES'
  );
  const validUntilDate = proposal.expires_at 
    ? new Date(proposal.expires_at).toLocaleDateString(
        language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES'
      )
    : 'N/A';
  
  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.proposalNumber}:`, margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(proposal.proposal_number, margin + 35, yPosition);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.date}:`, margin, yPosition + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(proposalDate, margin + 35, yPosition + 8);
  
  // Right column
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.validUntil}:`, margin + 100, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(validUntilDate, margin + 135, yPosition);
  
  yPosition += 25;
  
  // Client Information Table
  const clientName = proposal.contact?.company_name || proposal.manual_company_name || 'N/A';
  const contactName = proposal.contact?.contact_name || proposal.manual_contact_name || 'N/A';
  const contactEmail = proposal.contact?.email || proposal.manual_contact_email || 'N/A';
  
  const clientHeaders = [t.client];
  const clientRows = [
    [`${t.company}: ${clientName}`],
    [`${t.contact}: ${contactName}`],
    [`${t.email}: ${contactEmail}`]
  ];
  
  yPosition = createTable(clientHeaders, clientRows, yPosition);
  
  // Product Details Table with translation
  const productHeaders = [t.productInfo];
  const productRows = [
    [`${t.productName}: ${proposal.product_name}`],
    [`${t.unitPrice}: ${proposal.currency} ${proposal.unit_price.toLocaleString(
      language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', 
      { minimumFractionDigits: 2 }
    )}/kg`],
    [`${t.totalWeight}: ${proposal.total_weight_kg.toLocaleString(
      language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES'
    )} kg`],
    [`${t.totalValue}: ${proposal.currency} ${(proposal.total_value || 0).toLocaleString(
      language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', 
      { minimumFractionDigits: 2 }
    )}`]
  ];
  
  if (proposal.product_description) {
    const translatedDescription = translateText(proposal.product_description, language);
    productRows.splice(1, 0, [`${t.description}: ${translatedDescription}`]);
  }
  
  yPosition = createTable(productHeaders, productRows, yPosition);
  
  // Commercial Conditions Table
  const commercialHeaders = [t.commercialTerms];
  const commercialRows = [
    [`${t.incoterm}: ${proposal.incoterm}`],
    [`${t.portOfLoading}: ${proposal.port_of_loading || 'N/A'}`],
    [`${t.portOfDischarge}: ${proposal.port_of_discharge || 'N/A'}`],
    [`${t.paymentTerms}: ${proposal.payment_terms || 'N/A'}`],
    [`${t.deliveryTime}: ${proposal.delivery_time_days || 'N/A'} ${t.days}`],
    [`${t.validityPeriod}: ${proposal.validity_days || 'N/A'} ${t.days}`]
  ];
  
  yPosition = createTable(commercialHeaders, commercialRows, yPosition);
  
  // Check if we need a new page
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 30;
  }
  
  // Technical Specifications Table
  console.log('Technical specs debug:', {
    co2_min: proposal.co2_range_min,
    co2_max: proposal.co2_range_max,
    o2_min: proposal.o2_range_min,
    o2_max: proposal.o2_range_max,
    temp_min: proposal.temperature_min,
    temp_max: proposal.temperature_max,
    container_sealed: proposal.container_sealed
  });
  
  const techHeaders = [t.technicalSpecs];
  const techRows = [
    [`${t.co2Range} ${proposal.co2_range_min ?? 3}% - ${proposal.co2_range_max ?? 10}%`],
    [`${t.o2Range} ${proposal.o2_range_min ?? 2}% - ${proposal.o2_range_max ?? 5}%`],
    [`${t.temperature}: ${proposal.temperature_min ?? 5}°C - ${proposal.temperature_max ?? 7}°C`],
    [`${t.containerSealed}: ${proposal.container_sealed ? t.yes : t.no}`]
  ];
  
  yPosition = createTable(techHeaders, techRows, yPosition);
  
  // Shipping Format with translation
  if (proposal.shipping_format) {
    const shippingHeaders = [t.volumePackaging];
    const translatedShippingFormat = translateShippingFormat(proposal.shipping_format, language);
    const shippingRows = [[translatedShippingFormat]];
    yPosition = createTable(shippingHeaders, shippingRows, yPosition);
  }
  
  // Additional Costs (if any)
  if (proposal.freight_cost || proposal.insurance_cost) {
    const costsHeaders = [t.additionalCosts];
    const costsRows = [];
    
    if (proposal.freight_cost) {
      costsRows.push([`${t.freight}: ${proposal.currency} ${proposal.freight_cost.toLocaleString(
        language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', 
        { minimumFractionDigits: 2 }
      )}`]);
    }
    if (proposal.insurance_cost) {
      costsRows.push([`${t.insurance}: ${proposal.currency} ${proposal.insurance_cost.toLocaleString(
        language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', 
        { minimumFractionDigits: 2 }
      )}`]);
    }
    
    yPosition = createTable(costsHeaders, costsRows, yPosition);
  }
  
  // Certifications
  if (proposal.certifications && proposal.certifications.length > 0) {
    const certsHeaders = [t.certifications];
    const certsRows = [[proposal.certifications.join(', ')]];
    yPosition = createTable(certsHeaders, certsRows, yPosition);
  }
  
  // Notes/Observations with translation
  if (proposal.notes) {
    const notesHeaders = [t.notes];
    const translatedNotes = translateText(proposal.notes, language);
    const notesRows = [[translatedNotes]];
    yPosition = createTable(notesHeaders, notesRows, yPosition);
  }
  
  // Contact Information
  const contactHeaders = [t.contactInfo];
  const contactRows = [
    [`${t.exporterName}: ${proposal.exporter_name}`],
    [`${t.exporterContact}: ${proposal.exporter_contact}`],
    [`${t.exporterEmail}: ${proposal.exporter_email}`]
  ];
  
  yPosition = createTable(contactHeaders, contactRows, yPosition);
  
  // Footer with rounded background
  const footerY = 270;
  drawRoundedRect(margin, footerY, contentWidth, 15, 3, lightGreen);
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  
  const footerText = doc.splitTextToSize(t.footer, contentWidth - 10);
  doc.text(footerText, pageWidth / 2, footerY + 8, { align: 'center' });
  
  // Save the PDF
  const fileName = `proposta_${proposal.proposal_number}_${language}.pdf`;
  doc.save(fileName);
};
