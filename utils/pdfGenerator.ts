
import { jsPDF } from "jspdf";
import { Event, Participant } from "../types";

export const generatePDF = (
  participant: Participant,
  event: Event,
  certificateCode: string
) => {
  // Create landscape A4 PDF
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // ==========================================
  // PAGE 1: FRONT (CERTIFICADO)
  // ==========================================

  // 1. Background Image
  let hasCustomFront = false;
  if (event.backgroundImage) {
    try {
      doc.addImage(event.backgroundImage, 'JPEG', 0, 0, width, height);
      hasCustomFront = true;
    } catch (e) {
      console.error("Error loading front background image", e);
    }
  } 
  
  // Fallback if no image
  if (!hasCustomFront) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.rect(10, 10, width - 20, height - 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(60);
    doc.setTextColor(50, 50, 50); 
    doc.text("CERTIFICADO", width / 2, 60, { align: "center" });
  }

  // 2. Content Text (Dynamic Overlay)
  doc.setFont("times", "normal");
  doc.setFontSize(16);
  
  // Use custom color if available
  if (event.textColor) {
      doc.setTextColor(event.textColor);
  } else {
      doc.setTextColor(0, 0, 0);
  }

  let bodyText = event.templateText || "Certificamos que [NOME_DO_PARTICIPANTE], CPF: [CPF] participou de 100,00% do evento.";
  
  bodyText = bodyText
    .replace("[NOME_DO_PARTICIPANTE]", participant.name.toUpperCase())
    .replace("[NOME]", participant.name.toUpperCase())
    .replace("[CPF]", participant.cpf || "___________")
    .replace("[NOME_EVENTO]", event.title)
    .replace("[LOCAL]", event.location)
    .replace("[HORAS]", event.hours.toString());

  // Margins
  const marginLeft = event.marginLeft !== undefined ? Number(event.marginLeft) : 30;
  const marginRight = event.marginRight !== undefined ? Number(event.marginRight) : 30;
  const maxWidth = width - marginLeft - marginRight;
  
  // Y Position
  const textY = event.textY ? Number(event.textY) : 95;
  
  // Alignment
  const textAlign = event.textAlign || 'justify';
  let textX = marginLeft; 
  
  if (textAlign === 'center') {
     textX = marginLeft + (maxWidth / 2); 
  } else if (textAlign === 'right') {
     textX = width - marginRight;
  } else {
     textX = marginLeft;
  }

  doc.text(bodyText, textX, textY, { 
    align: textAlign, 
    maxWidth: maxWidth, 
    lineHeightFactor: 1.5 
  });

  // 3. Date and Location
  // ALIGNMENT CHANGE: Align to the Right Margin defined by the user.
  if (event.location && event.endDate) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(event.textColor || '#000000'); // Use same color as text
    
    // FIX: Manual parsing to prevent Timezone issues (off-by-one day)
    const [year, month, day] = event.endDate.split('-').map(Number);
    // Create date using local time constructor (Month is 0-index)
    const dateObj = new Date(year, month - 1, day);
    
    const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const dateX = width - marginRight;
    // Position slightly below the main text area (approx estimate or fixed)
    // We'll use a fixed offset relative to textY or just a fixed position if textY varies too much.
    // Let's try to put it relative to the bottom signature area to look cleaner.
    const dateY = (event.signatureTextY ? Number(event.signatureTextY) : 170) - 15; 

    doc.text(`${event.location}, ${formattedDate}.`, dateX, dateY, { align: "right" });
  }

  // 4. Signature Section
  const sigY = event.signatureTextY ? Number(event.signatureTextY) : 170;
  
  // Signature Color
  if (event.signatureTextColor) {
    doc.setTextColor(event.signatureTextColor);
  } else {
    doc.setTextColor(0, 0, 0);
  }

  if (event.signatureName) {
    if (event.signatureImage) {
        try {
            const sigImgWidth = 50; 
            const sigImgHeight = 20;
            doc.addImage(event.signatureImage, 'PNG', (width / 2) - (sigImgWidth / 2), sigY - 18, sigImgWidth, sigImgHeight);
        } catch (e) {
            console.error("Error rendering signature image", e);
        }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(event.signatureName.toUpperCase(), width/2, sigY, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(event.signatureRole.toUpperCase(), width/2, sigY + 5, { align: "center" });
  }

  // ==========================================
  // PAGE 2: CONTENT (VERSO)
  // ==========================================
  if (event.backImage || event.programContent) {
      doc.addPage();

      let hasCustomBack = false;
      if (event.backImage) {
        try {
            doc.addImage(event.backImage, 'JPEG', 0, 0, width, height);
            hasCustomBack = true;
        } catch(e) {
            console.error("Error loading back image", e);
        }
      }

      // If no custom back image, draw a header box
      if (!hasCustomBack) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.rect(10, 10, width - 20, 30);
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(24);
          doc.setTextColor(0, 0, 0);
          doc.text("CONTEÚDO PROGRAMÁTICO", width / 2, 28, { align: "center" });
      }

      if (event.programContent) {
          // Use the specific configurations for Back Page
          const progY = event.programTextY ? Number(event.programTextY) : (hasCustomBack ? 40 : 55);
          const progMarginLeft = event.programMarginLeft !== undefined ? Number(event.programMarginLeft) : 20;
          const progMarginRight = event.programMarginRight !== undefined ? Number(event.programMarginRight) : 20;
          const progMaxWidth = width - progMarginLeft - progMarginRight;
          const progAlign = event.programTextAlign || 'left';
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(event.programTextColor || '#000000');

          let progX = progMarginLeft;
          if (progAlign === 'center') progX = progMarginLeft + (progMaxWidth / 2);
          else if (progAlign === 'right') progX = width - progMarginRight;

          doc.text(event.programContent, progX, progY, {
             align: progAlign,
             maxWidth: progMaxWidth,
             lineHeightFactor: 1.5
          });
      }
  }

  // ==========================================
  // PAGE 3: DECLARATION (Technical Sheet)
  // ==========================================
  doc.addPage();
  
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, width, 40, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("REGISTRO DE AUTENTICIDADE", width / 2, 25, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  const declText = `Declaro para os devidos fins que, ${participant.name.toUpperCase()}, CPF: ${participant.cpf || "N/A"}, compareceu ao evento "${event.title}", realizado na cidade de ${event.location}, cumprindo a carga horária total de ${event.hours} horas.`;
  
  doc.text(doc.splitTextToSize(declText, 180), width / 2, 60, { align: "center", lineHeightFactor: 1.5 });

  const tableY = 100;
  doc.setDrawColor(100);
  doc.rect(40, tableY, width - 80, 10); // Header
  doc.rect(40, tableY + 10, width - 80, 15); // Row
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("REGISTRO DIGITAL / HASH", width/2, tableY + 6, { align: "center" });
  
  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.text(certificateCode, width/2, tableY + 19, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("A validade deste documento pode ser verificada no site oficial do evento.", width/2, height - 20, { align: "center" });

  doc.save(`Certificado_${participant.name.replace(/\s+/g, '_')}.pdf`);
};
