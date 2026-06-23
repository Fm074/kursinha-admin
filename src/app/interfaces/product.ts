export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  type: string;
  price: string;
  mediaUrl: string;
  fileUrl: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'REJECTED';
  clientId: string;
  createdAt: string;
  updatedAt: string;
  commission: string;
  affiliable: boolean;
  orderBumpEnabled: boolean;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  sales?: any[];
  _count?: {
    sales: number;
  };
}