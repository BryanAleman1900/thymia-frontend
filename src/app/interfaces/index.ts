export interface ILoginResponse {
  token?: string;
  accessToken?: string;
  expiresIn: number;
  authUser?: IUser;
}

export interface IResponse<T> {
  data: T;
  message: string;
  meta: T; 
}

export interface IUser {
  id?: number;
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  authorities?: IAuthority[];
  faceIdValue?: string | null;
  role?: IRole;
  fullName?: string;
}

export interface IAuthority {
  authority: string;
}

export interface IFeedBackMessage {
  type?: IFeedbackStatus;
  message?: string;
}

export enum IFeedbackStatus {
  success = 'SUCCESS',
  error = 'ERROR',
  default = '',
}

export enum IRoleType {
  admin = 'ROLE_ADMIN',
  user = 'ROLE_USER',
  superAdmin = 'ROLE_SUPER_ADMIN',
  therapist = 'ROLE_THERAPIST', 
}

export interface IRole {
  createdAt: string;
  description: string;
  id: number;
  name: string; 
  updatedAt: string;
}

export interface ISearch {
  page?: number;
  size?: number;
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface IAppointment {
  id?: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  googleEventId?: string;
  patientId: number;
  doctorId: number;
  patient?: IUser;
  doctor?: IUser;
}

export interface JournalEntry {
  id: number;
  content: string;
  createdAt?: string;
  sentimentLabel?: string;
  sentimentScore?: number;
  sharedWithProfessional?: boolean;
  sharedWithTherapists?: string[];
}

export interface WellnessTipReceipt {
  id: number;
  title: string;
  content: string;
  category: string;
  source?: string;
  createdAt: string;
  viewCount: number;
  firstViewedAt?: string;
  lastViewedAt?: string;
}


export interface Therapist {
  name: string;
  email: string;
}

export interface SharedJournalEntry {
  content: string;
  createdAt: string;
  sentimentLabel?: string;
  sentimentScore?: number;
  patientName: string;
  patientEmail: string;
}

export interface WellnessTip {
  id: string | number;
  title: string;
  content: string;
  category?: string;
  source?: string;
  createdAt: string | Date;
  viewCount?: number;
}
