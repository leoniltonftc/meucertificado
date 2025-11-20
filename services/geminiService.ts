
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCertificateText = async (eventTitle: string, hours: number, organizer: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Certificamos que [NOME_DO_PARTICIPANTE], CPF: [CPF], participou do evento...";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Escreva um texto formal para um certificado de participação no padrão ABNT brasileiro.
      Evento: "${eventTitle}".
      Carga Horária: ${hours} horas.
      Organizador: "${organizer}".
      
      Use EXATAMENTE os placeholders: [NOME_DO_PARTICIPANTE] e [CPF].
      O texto deve começar com "Certificamos que..." e ser um parágrafo único justificado.
      Inclua detalhes sobre "participou de 100% do evento", "realizado entre os dias...", etc.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating text:", error);
    return "Certificamos que [NOME_DO_PARTICIPANTE], CPF [CPF], participou com êxito do evento.";
  }
};

export const parseParticipantData = async (rawData: string): Promise<{ name: string; email: string; cpf: string }[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract a list of participants from the raw text. Look for Name, Email, and CPF.
      CPF format in Brazil is typically 000.000.000-00, but might be unformatted. 
      If Email is missing, generate a placeholder based on the name.
      If CPF is missing, leave as empty string.
      Return strictly JSON array.
      
      Raw Data:
      ${rawData}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              email: { type: Type.STRING },
              cpf: { type: Type.STRING }
            },
            required: ["name", "email", "cpf"]
          }
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error parsing participants:", error);
    return [];
  }
};
