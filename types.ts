
export enum UserRole {
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT',
  GUEST = 'GUEST'
}

export interface CertificateTemplate {
  id: string;
  name: string;
  backgroundImage?: string; // Front Image
  backImage?: string; // Back Image
  frontText: string;
  backText: string;
  
  // Front Text Styling Configuration
  textY?: number; // Vertical Position in mm
  textSize?: number; // Font Size
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string; // Hex Color
  marginLeft?: number;
  marginRight?: number;

  // Back Text Styling Configuration
  programTextY?: number;
  programTextSize?: number;
  programTextAlign?: 'left' | 'center' | 'right' | 'justify';
  programTextColor?: string;
  programMarginLeft?: number;
  programMarginRight?: number;

  // Signature Styling
  signatureTextY?: number;
  signatureTextSize?: number;
  signatureTextColor?: string;
  signatureMarginLeft?: number;
  signatureMarginRight?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  organizer: string;
  hours: number;
  location: string; 
  signatureName: string;
  signatureRole: string;
  signatureImage?: string; 
  
  // Content
  templateText?: string; 
  programContent?: string;
  backgroundImage?: string; // Front
  backImage?: string; // Back
  
  // Front Text Styling Override
  textY?: number;
  textSize?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  marginLeft?: number;
  marginRight?: number;

  // Back Text Styling Override
  programTextY?: number;
  programTextSize?: number;
  programTextAlign?: 'left' | 'center' | 'right' | 'justify';
  programTextColor?: string;
  programMarginLeft?: number;
  programMarginRight?: number;

  // Signature Styling Override
  signatureTextY?: number;
  signatureTextSize?: number;
  signatureTextColor?: string;
  signatureMarginLeft?: number;
  signatureMarginRight?: number;
  
  status: 'draft' | 'active' | 'completed';
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  cpf: string; 
  eventId: string;
  attended: boolean;
  certificateId?: string; 
}

export interface Certificate {
  id: string; 
  participantId: string;
  participantName: string;
  eventId: string;
  eventTitle: string;
  issueDate: string;
  validationUrl: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  password?: string; // Added for admin management
  cpf?: string;
  role: UserRole;
}