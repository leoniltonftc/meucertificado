// Gemini AI Service removido.
// Este arquivo é mantido apenas para compatibilidade de imports, mas a funcionalidade de IA foi desativada.

export const generateCertificateText = async (eventTitle: string, hours: number, organizer: string): Promise<string> => {
  // Retorna um texto padrão sem uso de IA
  return "Certificamos que [NOME_DO_PARTICIPANTE], CPF [CPF], participou com êxito do evento.";
};

export const parseParticipantData = async (rawData: string): Promise<{ name: string; email: string; cpf: string }[]> => {
  // Retorna array vazio, já que o parsing agora é feito manualmente no componente
  return [];
};
