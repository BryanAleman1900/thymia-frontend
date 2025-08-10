export interface ILoginResponse {
  accessToken: string;
  expiresIn: number
}

export interface IResponse<T> {
  data: T;
  message: string,
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
  role?: IRole
}

export interface IAuthority {
  authority: string;
}

export interface IFeedBackMessage {
  type?: IFeedbackStatus;
  message?: string;
}

export enum IFeedbackStatus {
  success = "SUCCESS",
  error = "ERROR",
  default = ''
}

export enum IRoleType {
  admin = "ROLE_ADMIN",
  user = "ROLE_USER",
  superAdmin = 'ROLE_SUPER_ADMIN'
}

export interface IRole {
  createdAt: string;
  description: string;
  id: number;
  name : string;
  updatedAt: string;
}



export interface ISearch {
  page?: number;
  size?: number;
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?:number;
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

//Mauro
export interface IFeedback {
    id?: number;
    appointmentId: number;
    patientId: number;
    comments: string;
    rating: number;
    createdAt?: string;
}

//Mauro

export interface IAuditLog {
  id: number;
  actionType: AuditActionType;
  user?: IUser;
  ipAddress: string;
  details: string;
  timestamp: string;
  endpoint: string;
}

export enum AuditActionType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  SECURITY_EVENT = 'SECURITY_EVENT'
}

export interface IAuditFilter {
  actionType?: AuditActionType;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}