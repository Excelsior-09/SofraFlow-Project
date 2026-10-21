import { describe, it, expect } from 'vitest';
import { buildMetaTemplatePayload, dispatchOrderNotification } from '../services/whatsappService';
import { Order, WhatsAppConfig } from '../types';

describe('Official WhatsApp Business Platform API Integration', () => {
  const dummyConfig: WhatsAppConfig = {
    restaurantId: 'rest_marrakech',
    enabled: true,
    destinationPhoneNumber: '+212661234567',
    destinationName: 'Kitchen Pass',
    apiProvider: 'meta_cloud_api',
    phoneNumberId: '',
    wabaId: '',
    systemAccessToken: '',
    templateName: 'sofraflow_order_notification_v1',
    templateLanguage: 'en_US'
  };

  const dummyOrder: Order = {
    id: 'ord_test_99',
    publicOrderReference: 'SF-5820',
    restaurantId: 'rest_marrakech',
    orderType: 'dine_in',
    tableNumber: '4',
    customerName: 'Yassine',
    customerNotes: 'Extra hot tea please',
    items: [
      {
        productId: 'prod_1',
        productName: { en: 'Lamb Tagine', fr: 'Tagine', ar: 'طاجين' },
        unitPrice: 135,
        quantity: 1,
        selectedOptions: [],
        subtotal: 135
      }
    ],
    currency: 'MAD',
    subtotal: 135,
    taxAmount: 13.5,
    serviceFeeAmount: 0,
    total: 148.5,
    status: 'new',
    notificationStatus: 'pending',
    statusHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it('builds official Meta template structure conforming to Cloud API schema', () => {
    const payload = buildMetaTemplatePayload(dummyOrder, dummyConfig, 'Le Jardin de Marrakech');

    expect(payload.messaging_product).toBe('whatsapp');
    expect(payload.recipient_type).toBe('individual');
    expect(payload.to).toBe('212661234567');
    expect(payload.type).toBe('template');
    expect(payload.template.name).toBe('sofraflow_order_notification_v1');
    expect(payload.template.components.length).toBeGreaterThanOrEqual(2);

    // Verify header and body parameters
    const headerComponent = payload.template.components.find(c => c.type === 'header');
    expect(headerComponent?.parameters[0].text).toContain('SF-5820');

    const bodyComponent = payload.template.components.find(c => c.type === 'body');
    expect(bodyComponent?.parameters.some(p => p.text.includes('148.50 MAD'))).toBe(true);
  });

  it('dispatches notification and returns tracked event with message ID', async () => {
    const result = await dispatchOrderNotification(dummyOrder, dummyConfig, 'Le Jardin de Marrakech');

    expect(result.success).toBe(true);
    expect(result.event.status).toBe('delivered');
    expect(result.event.providerMessageId).toBeDefined();
    expect(result.event.destinationPhoneNumber).toBe('+212661234567');
  });

  it('handles simulated transient failure safely without throwing or losing order', async () => {
    const failingConfig: WhatsAppConfig = {
      ...dummyConfig,
      destinationPhoneNumber: '+212600000000' // matches test failure pattern
    };

    const result = await dispatchOrderNotification(dummyOrder, failingConfig, 'Le Jardin de Marrakech');

    expect(result.success).toBe(false);
    expect(result.event.status).toBe('failed');
    expect(result.event.errorMessage).toBeDefined();
    // The order ID must remain intact for retry!
    expect(result.event.orderId).toBe(dummyOrder.id);
  });

  it('aborts safely if WhatsApp notifications are disabled in restaurant settings', async () => {
    const disabledConfig: WhatsAppConfig = {
      ...dummyConfig,
      enabled: false
    };

    const result = await dispatchOrderNotification(dummyOrder, disabledConfig, 'Le Jardin de Marrakech');

    expect(result.success).toBe(false);
    expect(result.event.status).toBe('failed');
    expect(result.event.errorMessage).toContain('disabled in restaurant settings');
  });
});
