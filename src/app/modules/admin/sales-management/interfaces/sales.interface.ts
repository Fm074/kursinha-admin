export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  totalRefunds: number;
  refundAmount: number;
  netRevenue: number;
  byProduct: {
    [key: string]: {
      name: string;
      totalSales: number;
      totalRevenue: number;
      refunds: number;
    };
  };
  bySeller: {
    [key: string]: {
      name: string;
      totalSales: number;
      totalRevenue: number;
      refunds: number;
    };
  };
  byAffiliate: {
    [key: string]: {
      name: string;
      totalSales: number;
      totalRevenue: number;
      refunds: number;
    };
  };
}

export interface RefundRequest {
  amount: number;
  reason: string;
}

export interface FraudAlert {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

export interface FraudAlertStatusUpdate {
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
}