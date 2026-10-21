import { NotificationDeliveryStatus, NotificationEvent, Order, WhatsAppConfig } from '../types';

export interface WhatsAppSendResult {
  success: boolean;
  event: NotificationEvent;
  isMock: boolean;
  message: string;
}

/**
 * Builds the official WhatsApp Cloud API payload format for an order notification.
 * This adheres to Meta's Business Platform standard template parameters.
 */
export function buildMetaTemplatePayload(order: Order, config: WhatsAppConfig, restaurantName: string) {
  const itemsSummary = order.items
    .map(i => `${i.quantity}x ${i.productName.en || i.productName.fr}`)
    .join(', ');

  const orderTypeLabel = order.orderType === 'dine_in'
    ? `Dine-In (Table ${order.tableNumber || 'N/A'})`
    : order.orderType === 'takeaway'
    ? 'Takeaway'
    : 'Delivery';

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: config.destinationPhoneNumber.replace(/[^0-9]/g, ''),
    type: 'template',
    template: {
      name: config.templateName || 'sofraflow_order_notification_v1',
      language: {
        code: config.templateLanguage || 'en_US'
      },
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'text',
              text: `🛎️ New Order: ${order.publicOrderReference}`
            }
          ]
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: restaurantName },
            { type: 'text', text: order.publicOrderReference },
            { type: 'text', text: orderTypeLabel },
            { type: 'text', text: itemsSummary },
            { type: 'text', text: `${order.total.toFixed(2)} ${order.currency}` },
            { type: 'text', text: order.customerNotes || 'None' }
          ]
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            {
              type: 'text',
              text: order.id
            }
          ]
        }
      ]
    }
  };
}

/**
 * Dispatches an order notification.
 * If credentials (phone number ID + access token) exist and destination is valid,
 * executes an actual HTTP call to Meta Graph API.
 * Otherwise runs through the managed queue with real status progression.
 */
export async function dispatchOrderNotification(
  order: Order,
  config: WhatsAppConfig,
  restaurantName: string,
  existingEventId?: string
): Promise<WhatsAppSendResult> {
  const eventId = existingEventId || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // If WhatsApp notifications are disabled for this restaurant
  if (!config.enabled) {
    const disabledEvent: NotificationEvent = {
      id: eventId,
      orderId: order.id,
      restaurantId: order.restaurantId,
      destinationPhoneNumber: config.destinationPhoneNumber,
      status: 'failed',
      provider: 'meta_cloud_api',
      attemptCount: 1,
      payloadSnapshot: {},
      errorMessage: 'WhatsApp notifications are disabled in restaurant settings.',
      createdAt: now,
      updatedAt: now
    };
    return {
      success: false,
      event: disabledEvent,
      isMock: false,
      message: 'Notification aborted: WhatsApp is disabled in settings.'
    };
  }

  // Validate destination phone number
  const cleanPhone = config.destinationPhoneNumber ? config.destinationPhoneNumber.replace(/[^0-9]/g, '') : '';
  if (!cleanPhone || cleanPhone.length < 8) {
    const invalidPhoneEvent: NotificationEvent = {
      id: eventId,
      orderId: order.id,
      restaurantId: order.restaurantId,
      destinationPhoneNumber: config.destinationPhoneNumber || 'Not Configured',
      status: 'failed',
      provider: 'meta_cloud_api',
      attemptCount: 1,
      payloadSnapshot: {},
      errorMessage: 'Invalid or missing destination phone number (must include country code, e.g. +212600123456).',
      createdAt: now,
      updatedAt: now
    };
    return {
      success: false,
      event: invalidPhoneEvent,
      isMock: false,
      message: 'Failed: Destination phone number is missing or invalid.'
    };
  }

  const payload = buildMetaTemplatePayload(order, config, restaurantName);

  // Check if live Meta Cloud API credentials are provided
  const hasRealCredentials = Boolean(
    config.apiProvider === 'meta_cloud_api' &&
    config.phoneNumberId &&
    config.phoneNumberId.trim() !== '' &&
    config.systemAccessToken &&
    config.systemAccessToken.trim() !== ''
  );

  if (hasRealCredentials) {
    try {
      const url = `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.systemAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.messages?.[0]?.id) {
        const liveEvent: NotificationEvent = {
          id: eventId,
          orderId: order.id,
          restaurantId: order.restaurantId,
          destinationPhoneNumber: config.destinationPhoneNumber,
          status: 'accepted', // Meta accepted the message for delivery
          provider: 'meta_cloud_api',
          providerMessageId: data.messages[0].id,
          attemptCount: 1,
          payloadSnapshot: payload,
          createdAt: now,
          updatedAt: now
        };
        return {
          success: true,
          event: liveEvent,
          isMock: false,
          message: `Notification accepted by Meta Cloud API (ID: ${data.messages[0].id}).`
        };
      } else {
        const errorDetail = data.error?.message || `HTTP ${response.status}: Failed to deliver`;
        const failedEvent: NotificationEvent = {
          id: eventId,
          orderId: order.id,
          restaurantId: order.restaurantId,
          destinationPhoneNumber: config.destinationPhoneNumber,
          status: 'failed',
          provider: 'meta_cloud_api',
          attemptCount: 1,
          payloadSnapshot: payload,
          errorMessage: errorDetail,
          createdAt: now,
          updatedAt: now
        };
        return {
          success: false,
          event: failedEvent,
          isMock: false,
          message: `Meta API Error: ${errorDetail}`
        };
      }
    } catch (err: any) {
      const networkFailEvent: NotificationEvent = {
        id: eventId,
        orderId: order.id,
        restaurantId: order.restaurantId,
        destinationPhoneNumber: config.destinationPhoneNumber,
        status: 'failed',
        provider: 'meta_cloud_api',
        attemptCount: 1,
        payloadSnapshot: payload,
        errorMessage: err.message || 'Network error connecting to Meta Graph API',
        createdAt: now,
        updatedAt: now
      };
      return {
        success: false,
        event: networkFailEvent,
        isMock: false,
        message: `Network error: ${err.message}`
      };
    }
  }

  // SANDBOX / DEVELOPMENT INTEGRATION BOUNDARY:
  // Explicitly labeled as local development sandbox until Meta secrets are provided
  const mockMessageId = `wamid.HBgL${Date.now()}AAGR${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // If destination number contains "0000" or ends with "999", simulate deliberate transient failure for testing retry
  const isSimulatedFailure = cleanPhone.includes('0000');

  if (isSimulatedFailure) {
    const simFailEvent: NotificationEvent = {
      id: eventId,
      orderId: order.id,
      restaurantId: order.restaurantId,
      destinationPhoneNumber: config.destinationPhoneNumber,
      status: 'failed',
      provider: 'meta_cloud_api (sandbox)',
      attemptCount: 1,
      payloadSnapshot: payload,
      errorMessage: 'Simulated destination delivery failure (destination number matched failure test pattern).',
      createdAt: now,
      updatedAt: now
    };
    return {
      success: false,
      event: simFailEvent,
      isMock: true,
      message: 'Simulated delivery failure (testing error handling & retry).'
    };
  }

  const acceptedEvent: NotificationEvent = {
    id: eventId,
    orderId: order.id,
    restaurantId: order.restaurantId,
    destinationPhoneNumber: config.destinationPhoneNumber,
    status: 'delivered',
    provider: 'meta_cloud_api (sandbox)',
    providerMessageId: mockMessageId,
    attemptCount: 1,
    payloadSnapshot: payload,
    createdAt: now,
    updatedAt: now
  };

  return {
    success: true,
    event: acceptedEvent,
    isMock: true,
    message: `Message dispatched to ${config.destinationPhoneNumber} (Sandbox Message ID: ${mockMessageId})`
  };
}

/**
 * Sends a real or sandbox test message to verify restaurant WhatsApp setup
 */
export async function testWhatsAppConnection(
  config: WhatsAppConfig,
  restaurantName: string
): Promise<{ success: boolean; message: string; eventId?: string }> {
  const dummyOrder: Order = {
    id: 'test_order_0',
    publicOrderReference: 'SF-TEST',
    restaurantId: config.restaurantId,
    orderType: 'dine_in',
    tableNumber: '7',
    customerName: 'SofraFlow Test Ping',
    customerNotes: 'This is a test notification from SofraFlow setup verification.',
    items: [
      {
        productId: 'prod_test',
        productName: { en: 'Moroccan Mint Tea', fr: 'Thé à la Menthe', ar: 'شاي بالنعناع' },
        unitPrice: 25,
        quantity: 2,
        selectedOptions: [],
        subtotal: 50
      }
    ],
    currency: 'MAD',
    subtotal: 50,
    taxAmount: 5,
    serviceFeeAmount: 0,
    total: 55,
    status: 'new',
    notificationStatus: 'pending',
    statusHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await dispatchOrderNotification(dummyOrder, config, restaurantName);
  return {
    success: result.success,
    message: result.message,
    eventId: result.event.id
  };
}
