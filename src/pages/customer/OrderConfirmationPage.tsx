import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowRight,
  Printer,
  Copy,
  Check,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge, OrderStatusBadge, WhatsAppStatusBadge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { Order, Restaurant } from '../../types';
import { SEO } from '../../components/common/SEO';

export const OrderConfirmationPage: React.FC = () => {
  const { publicOrderReference } = useParams<{ publicOrderReference: string }>();
  const { t, formatCurrency } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [copied, setCopied] = useState(false);

  const loadOrder = async () => {
    if (!publicOrderReference) return;
    try {
      const supaOrder = await supabaseService.getOrderByReference(publicOrderReference);
      if (supaOrder) {
        setOrder(supaOrder);
        const rest = await supabaseService.getRestaurantById(supaOrder.restaurantId);
        if (rest) {
          setRestaurant(rest);
          return;
        }
      }
    } catch (err) {
      console.warn('[OrderConfirmationPage] Supabase load error:', err);
    }

    const found = db.getOrderByPublicReference(publicOrderReference);
    if (found) {
      setOrder(found);
      const rest = db.getRestaurantById(found.restaurantId);
      setRestaurant(rest || null);
    }
  };

  useEffect(() => {
    loadOrder();
    const unsub = db.subscribe(loadOrder);
    return () => unsub();
  }, [publicOrderReference]);

  if (!order) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-card border border-border-subtle max-w-sm space-y-4">
          <Clock className="w-10 h-10 text-ink-secondary/50 mx-auto" />
          <h2 className="text-xl font-bold text-forest font-display">{t('common.loading')}</h2>
          <p className="text-xs text-ink-secondary">
            Recherche de la référence {publicOrderReference}…
          </p>
        </div>
      </div>
    );
  }

  const handleCopyRef = () => {
    navigator.clipboard.writeText(order.publicOrderReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-ivory py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <SEO
        title={`Commande ${order.publicOrderReference} | SOFRAFLOW`}
        description="Confirmation et suivi en direct de votre commande."
        noindex={true}
      />
      <div className="max-w-xl mx-auto space-y-6">
        {/* Success Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-subtle shadow-card text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-status-success-bg text-status-success flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-gold uppercase tracking-wider">
              {restaurant?.name || 'Restaurant'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest font-display">
              {t('customer.orderConfirmationTitle')}
            </h1>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto">
              {t('customer.orderReceivedDesc')}
            </p>
          </div>

          {/* Reference Badge */}
          <div className="inline-flex items-center gap-2 p-2 px-4 rounded-2xl bg-ivory border border-border-subtle text-forest">
            <span className="text-xs font-semibold">{t('customer.orderRefLabel')}</span>
            <span className="font-mono text-base font-extrabold tracking-wider">{order.publicOrderReference}</span>
            <button
              onClick={handleCopyRef}
              className="p-1 text-ink-secondary hover:text-forest transition-colors ml-1"
              title={t('common.copy')}
            >
              {copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Live Status Tracker */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs">
            <span className="text-ink-secondary">{t('common.status')} :</span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* WhatsApp Notification State Banner */}
        <Card className="p-4 bg-white flex items-center gap-3.5 border-forest/20">
          <div className="w-10 h-10 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-forest">Livraison WhatsApp en Cuisine</span>
              <WhatsAppStatusBadge status={order.notificationStatus} />
            </div>
            <p className="text-ink-secondary mt-0.5">
              {order.notificationStatus === 'delivered' || order.notificationStatus === 'accepted'
                ? 'Notification cuisine transmise avec succès via l’API officielle Meta Cloud.'
                : 'Notification en cours de traitement. La commande est enregistrée.'}
            </p>
          </div>
        </Card>

        {/* Order Breakdown Snapshot */}
        <Card className="p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h3 className="font-bold text-sm text-forest uppercase tracking-wider font-display">
              {t('orders.summaryTitle')}
            </h3>
            <span className="text-xs font-bold text-forest capitalize">
              {order.orderType === 'dine_in' ? `Table ${order.tableNumber || 'Salle'}` : t('customer.takeaway')}
            </span>
          </div>

          <div className="divide-y divide-border-subtle">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-ink-main">
                    {item.quantity}x {t(item.productName)}
                  </div>
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div className="text-[11px] text-ink-secondary">
                      {item.selectedOptions.map(o => o.choiceName).join(', ')}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <div className="text-[11px] text-amber-700 italic">
                      "{item.specialInstructions}"
                    </div>
                  )}
                </div>
                <span className="font-bold text-forest">
                  {formatCurrency(item.subtotal, order.currency)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-border-subtle space-y-1.5 text-xs">
            <div className="flex justify-between text-ink-secondary">
              <span>{t('customer.subtotal')} :</span>
              <span>{formatCurrency(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>{t('customer.tax')} (10%) :</span>
              <span>{formatCurrency(order.taxAmount, order.currency)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-forest pt-2 border-t border-border-subtle">
              <span>{t('customer.total')} :</span>
              <span>{formatCurrency(order.total, order.currency)}</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {restaurant && (
            <Link to={`/m/${restaurant.slug}`} className="flex-1">
              <Button variant="primary" size="md" className="w-full font-bold">
                {t('customer.backToMenu')}
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="md"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            {t('orders.printTicket')}
          </Button>
        </div>
      </div>
    </div>
  );
};
