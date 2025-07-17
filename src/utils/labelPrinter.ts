import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface LabelData {
  labelCode: string;
  receptionCode: string;
  productType: string;
  producerName: string;
  quantity: number;
  receptionDate: string;
  receptionId: string;
}

export const generateLabelPDF = async (labelData: LabelData): Promise<void> => {
  try {
    // Generate QR code with URL to reception details
    const qrCodeUrl = `${window.location.origin}/reception/details/${labelData.receptionId}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrCodeUrl, {
      width: 100,
      margin: 1,
    });

    // Create new PDF document (A4 size: 210 x 297 mm)
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Define label dimensions (80mm x 50mm)
    const labelWidth = 80;
    const labelHeight = 50;
    const marginX = 10;
    const marginY = 10;
    
    // Background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(marginX, marginY, labelWidth, labelHeight, 'F');
    
    // Border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(marginX, marginY, labelWidth, labelHeight);
    
    // Title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ETIQUETA DE IDENTIFICAÇÃO', marginX + 2, marginY + 8);
    
    // QR Code
    pdf.addImage(qrCodeDataURL, 'PNG', marginX + 2, marginY + 12, 20, 20);
    
    // Label information
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    const textStartX = marginX + 25;
    let textY = marginY + 15;
    
    pdf.text(`Código: ${labelData.labelCode}`, textStartX, textY);
    textY += 4;
    pdf.text(`Recebimento: ${labelData.receptionCode}`, textStartX, textY);
    textY += 4;
    pdf.text(`Produto: ${labelData.productType}`, textStartX, textY);
    textY += 4;
    pdf.text(`Produtor: ${labelData.producerName}`, textStartX, textY);
    textY += 4;
    pdf.text(`Quantidade: ${labelData.quantity} kg`, textStartX, textY);
    textY += 4;
    pdf.text(`Data: ${labelData.receptionDate}`, textStartX, textY);
    
    // Footer
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Sistema de Gestão de Estoque', marginX + 2, marginY + labelHeight - 2);
    
    // Save/Print the PDF
    const fileName = `etiqueta_${labelData.labelCode}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Erro ao gerar PDF da etiqueta:', error);
    throw new Error('Falha ao gerar PDF da etiqueta');
  }
};