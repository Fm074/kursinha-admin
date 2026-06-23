export interface User {
  id?: number | string;
  name: string;
  email: string;
  role: 'PRODUCER' | 'COPRODUCER' | 'ADMIN' | 'AFFILIATE' | 'CLIENT';
  status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  documents?: string[]; // URLs para anexos
  password?: string;
  confPassword?: string;
  address?: string;
  phone?: string | number;
}