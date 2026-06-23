// delivery-config.types.ts
export type DeliveryType = 'PAYMENT_ONLY' | 'EBOOK' | 'EXTERNAL_LINK';

export interface DeliveryConfigPayload {
  deliveryType: DeliveryType;
  externalLink?: string | null;
  ebookFile?: string | null;
  isPaymentOnly?: boolean;
  checkoutUrl?: string | null;
  deliveryConfig?: {
    lastUpdated?: string;
    fileType?: 'pdf' | string;
    originalName?: string;
  } | null;
}

export interface GetDeliveryConfigResponse {
  success: boolean;
  data: DeliveryConfigPayload;
}
