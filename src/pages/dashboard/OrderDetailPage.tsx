import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  Phone,
  Calendar,
  Check,
  ShoppingBag
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { OrderStatusBadge, WhatsAppStatusBadge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { dispatchOrderNotification } from '../../services/whatsappService';
import { Order, OrderStatus } from '../../types';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { activeRestaurant } = useAuth();
  const { t, formatCurrency, formatDate, formatTime } = useLanguage();

  const [order, setOrder] = useState<Order | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendResult, setResendResult] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const loadOrder = async () => {
    if (!orderId) return;
    if (isSupabaseConfigured) {
      try {
        const supaOrder = await supabaseService.getOrderById(orderId);
        if (supaOrder) {
          setOrder(supaOrder);
          return;
        }
      } catch (err) {
        console.warn('[OrderDetailPage] Error fetching order from Supabase:', err);
      }
    }
    const found = db.getOrderById(orderId);
    if (found) {
      setOrder(found);
    }
  };

  useEffect(() => {
    loadOrder();
    const unsub = db.subscribe(loadOrder);
    return () => unsub();
  }, [orderId]);

  if (!activeRestaurant || !order) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center space-y-4 max-w-xl mx-auto my-12 border-border-subtle dark:border-[#233831]">
          <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-forest dark:text-[#F0F4F2]">
            Commande introuvable
          </h2>
          <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
            La commande demandée n'existe pas ou aucun établissement actif n'a été sélectionné.
          </p>
          <div className="pt-2">
            <Link to="/app/orders">
              <Button size="sm" variant="outline">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Retour aux commandes
              </Button>
            </Link>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  const handleStatusChange = (nextStatus: OrderStatus, note?: string) => {
    const updated = db.updateOrderStatus(order.id, activeRestaurant.id, nextStatus, note);
    if (updated) setOrder(updated);

    if (isSupabaseConfigured) {
      supabaseService.updateOrderStatus(order.id, nextStatus, note).catch(e =>
        console.warn('[OrderDetailPage] Error updating order status in Supabase:', e)
      );
    }
  };

  const handleCancelOrder = (e: React.FormEvent) => {
    e.preventDefault();
    handleStatusChange('cancelled', cancelReason ? `Motif d'annulation : ${cancelReason}` : 'Annulée par le restaurant');
    setIsCancelModalOpen(false);
  };

  const handleResendWhatsApp = async () => {
    setIsResending(true);
    setResendResult(null);

    try {
      const result = await dispatchOrderNotification(
        order,
        activeRestaurant.whatsappConfig,
        activeRestaurant.name
      );

      db.saveNotificationEvent(result.event);
      db.updateOrderNotificationStatus(order.id, result.event.status, result.event.id);
      setResendResult(result.message);
      loadOrder();
    } catch (err: any) {
      setResendResult(`Échec de transmission : ${err.message}`);
    } finally {
      setIsResending(false);
    }
  };

  const printTicket = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/app/orders"
              className="p-2 rounded-xl bg-white dark:bg-[#14241F] border border-border-subtle dark:border-[#233831] hover:bg-ivory dark:hover:bg-[#1B2F29] text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
                  {t('orders.orderDetailsTitle', { ref: order.publicOrderReference })}
                </h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5">
                {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={printTicket}
            >
              {t('orders.printTicket')}
            </Button>

            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="w-4 h-4" />}
                onClick={() => setIsCancelModalOpen(true)}
              >
                {t('orders.cancelOrder')}
              </Button>
            )}
          </div>
        </div>

        {/* Resend Result Alert */}
        {resendResult && (
          <Alert type={resendResult.includes('Échec') || resendResult.includes('Failed') ? 'error' : 'success'}>
            {resendResult}
          </Alert>
        )}

        {/* Status Flow Action Bar */}
        {order.status !== 'cancelled' && order.status !== 'completed' && (
          <Card className="p-4 bg-forest-light/60 dark:bg-[#152520] border-forest/20 dark:border-[#233831] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-forest dark:text-gold uppercase tracking-wider">
                {t('common.status')} :
              </span>
              <span className="text-xs font-bold text-ink-main dark:text-[#F0F4F2]">
                {t(`orders.statusLabels.${order.status}`)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {order.status === 'new' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleStatusChange('confirmed', 'Commande acceptée par le responsable')}
                >
                  {t('orders.acceptOrder')}
                </Button>
              )}

              {(order.status === 'new' || order.status === 'confirmed') && (
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => handleStatusChange('preparing', 'Transmission aux fourneaux')}
                >
                  {t('orders.startPreparing')}
                </Button>
              )}

              {order.status === 'preparing' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleStatusChange('ready', 'Prête sur passe-plat')}
                >
                  {t('orders.markReady')}
                </Button>
              )}

              {order.status === 'ready' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleStatusChange('completed', 'Commande servie et réglée')}
                >
                  {t('orders.markCompleted')}
                </Button>
              )}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Items Breakdown (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-base text-forest dark:text-[#F0F4F2] font-display">
                {t('orders.summaryTitle')}
              </h3>

              <div className="divide-y divide-border-subtle dark:divide-[#233831]">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center font-bold text-xs">
                          {item.quantity}x
                        </span>
                        <h4 className="font-semibold text-sm text-ink-main dark:text-[#F0F4F2]">
                          {t(item.productName)}
                        </h4>
                      </div>

                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="pl-8 text-xs text-ink-secondary dark:text-[#97A7A0] space-y-0.5">
                          {item.selectedOptions.map((opt, oIdx) => (
                            <div key={oIdx}>
                              • {opt.groupTitle}: <strong className="text-ink-main dark:text-[#F0F4F2]">{opt.choiceName}</strong>
                              {opt.priceModifier > 0 && ` (+${opt.priceModifier} MAD)`}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.specialInstructions && (
                        <p className="pl-8 text-xs text-amber-800 dark:text-[#FBBF24] italic">
                          "{item.specialInstructions}"
                        </p>
                      )}
                    </div>

                    <span className="font-bold text-sm text-forest dark:text-[#F0F4F2]">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals Calculation */}
              <div className="pt-4 border-t border-border-subtle dark:border-[#233831] space-y-2 text-xs">
                <div className="flex justify-between text-ink-secondary dark:text-[#97A7A0]">
                  <span>{t('orders.subtotal')}</span>
                  <span className="font-semibold text-ink-main dark:text-[#F0F4F2]">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink-secondary dark:text-[#97A7A0]">
                  <span>{t('orders.tax', { percent: activeRestaurant.settings?.taxRatePercent ?? 10 })}</span>
                  <span className="font-semibold text-ink-main dark:text-[#F0F4F2]">{formatCurrency(order.taxAmount)}</span>
                </div>
                {order.serviceFeeAmount > 0 && (
                  <div className="flex justify-between text-ink-secondary dark:text-[#97A7A0]">
                    <span>{t('orders.serviceFee', { percent: activeRestaurant.settings?.serviceFeePercent ?? 0 })}</span>
                    <span className="font-semibold text-ink-main dark:text-[#F0F4F2]">{formatCurrency(order.serviceFeeAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-border-subtle dark:border-[#233831] text-base font-extrabold text-forest dark:text-[#F0F4F2]">
                  <span>{t('orders.total')}</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </Card>

            {/* WhatsApp Audit Dispatch */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#25D366]" />
                  <h3 className="font-bold text-base text-forest dark:text-[#F0F4F2] font-display">
                    {t('whatsapp.pageTitle')}
                  </h3>
                </div>
                <WhatsAppStatusBadge status={order.notificationStatus} />
              </div>

              <div className="text-xs text-ink-secondary dark:text-[#97A7A0] space-y-2">
                <p>
                  {t('whatsapp.destPhone')} :{' '}
                  <strong className="text-ink-main dark:text-[#F0F4F2]">
                    {activeRestaurant.whatsappConfig?.destinationPhoneNumber || t('whatsapp.disconnected')}
                  </strong>
                </p>
                <p>
                  {t('whatsapp.templateName')} :{' '}
                  <span className="font-mono text-forest dark:text-gold">{activeRestaurant.whatsappConfig?.templateName || 'sofraflow_order_notification_v1'}</span>
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />}
                onClick={handleResendWhatsApp}
                isLoading={isResending}
              >
                {t('whatsapp.sendTestBtn')}
              </Button>
            </Card>
          </div>

          {/* Right Column: Customer Info & Timeline */}
          <div className="space-y-6">
            {/* Customer Details */}
            <Card className="p-5 space-y-3">
              <h4 className="font-bold text-xs text-forest dark:text-[#F0F4F2] uppercase tracking-wider">
                {t('orders.customerInfo')}
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-ink-secondary dark:text-[#97A7A0]">
                  <User className="w-4 h-4 text-forest dark:text-gold" />
                  <span className="text-ink-main dark:text-[#F0F4F2] font-semibold">
                    {order.customerName || t('orders.dineIn')}
                  </span>
                </div>

                {order.customerPhone && (
                  <div className="flex items-center gap-2 text-ink-secondary dark:text-[#97A7A0]">
                    <Phone className="w-4 h-4 text-forest dark:text-gold" />
                    <span className="text-ink-main dark:text-[#F0F4F2] font-mono">{order.customerPhone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-ink-secondary dark:text-[#97A7A0]">
                  <Calendar className="w-4 h-4 text-forest dark:text-gold" />
                  <span>{formatDate(order.createdAt)} • {formatTime(order.createdAt)}</span>
                </div>

                <div className="pt-2 border-t border-border-subtle dark:border-[#233831] flex justify-between">
                  <span className="text-ink-secondary dark:text-[#97A7A0]">{t('customer.orderType')} :</span>
                  <span className="font-bold text-forest dark:text-gold uppercase">
                    {order.orderType === 'dine_in'
                      ? `${t('customer.dineIn')} (Table ${order.tableNumber || '?'})`
                      : t('customer.takeaway')}
                  </span>
                </div>
              </div>

              {order.customerNotes && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-[#2B2310] border border-amber-200 dark:border-amber-800/40 text-xs">
                  <p className="font-semibold text-amber-900 dark:text-[#FBBF24] mb-0.5">{t('orders.customerNotes')}</p>
                  <p className="text-amber-800 dark:text-[#FBBF24]/90">{order.customerNotes}</p>
                </div>
              )}
            </Card>

            {/* Status History Timeline */}
            <Card className="p-5 space-y-3">
              <h4 className="font-bold text-xs text-forest dark:text-[#F0F4F2] uppercase tracking-wider">
                {t('orders.statusHistory')}
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-subtle dark:before:bg-[#233831]">
                {order.statusHistory.map((step, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-forest dark:bg-gold ring-4 ring-white dark:ring-[#14241F]" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink-main dark:text-[#F0F4F2]">
                        {t(`orders.statusLabels.${step.status}`) || step.status}
                      </span>
                      <span className="text-[10px] text-ink-secondary dark:text-[#97A7A0]">
                        {formatTime(step.timestamp)}
                      </span>
                    </div>
                    {step.note && <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] mt-0.5">{step.note}</p>}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={t('orders.cancelOrder')}
        description={t('menus.deleteConfirm')}
      >
        <form onSubmit={handleCancelOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
              Motif de l'annulation (facultatif)
            </label>
            <input
              type="text"
              placeholder="ex. Rupture de stock ingrédient, client injoignable..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-xs text-ink-main dark:text-[#F0F4F2] focus:outline-none focus:ring-2 focus:ring-status-error"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle dark:border-[#233831]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsCancelModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" size="sm" type="submit">
              {t('orders.cancelOrder')}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
