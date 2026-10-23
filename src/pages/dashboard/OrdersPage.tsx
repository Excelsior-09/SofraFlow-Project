import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  ChevronRight,
  Volume2,
  VolumeX,
  ExternalLink
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { OrderStatusBadge, WhatsAppStatusBadge } from '../../components/common/Badge';
import { NoActiveRestaurantCard } from '../../components/common/NoActiveRestaurantCard';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Order, OrderStatus } from '../../types';

export const OrdersPage: React.FC = () => {
  const { activeRestaurant } = useAuth();
  const { language, t, formatCurrency, formatTime } = useLanguage();
  const isEn = language === 'en';
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const loadOrders = async () => {
    if (!activeRestaurant) {
      setOrders([]);
      return;
    }
    if (isSupabaseConfigured) {
      try {
        const supaOrders = await supabaseService.getOrdersForRestaurant(activeRestaurant.id);
        setOrders(supaOrders);
      } catch (err) {
        console.warn('[OrdersPage] Supabase getOrders warning:', err);
        setOrders([]);
      }
    } else {
      setOrders(db.getOrders(activeRestaurant.id));
    }
  };

  useEffect(() => {
    loadOrders();
    const unsub = db.subscribe(loadOrders);
    return () => unsub();
  }, [activeRestaurant]);

  if (!activeRestaurant) {
    return (
      <DashboardLayout>
        <NoActiveRestaurantCard
          icon={<ShoppingBag className="w-8 h-8" />}
          title={isEn ? 'No active establishment' : 'Aucun établissement actif'}
          description={
            isEn
              ? 'Please select or create your establishment to monitor and manage live kitchen orders.'
              : 'Veuillez sélectionner ou créer votre établissement pour visualiser et gérer vos commandes en direct.'
          }
        />
      </DashboardLayout>
    );
  }

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    db.updateOrderStatus(orderId, activeRestaurant.id, nextStatus, `Updated via orders screen to ${nextStatus}`);

    if (isSupabaseConfigured) {
      supabaseService.updateOrderStatus(orderId, nextStatus).catch(e =>
        console.warn('[OrdersPage] Supabase updateOrderStatus warning:', e)
      );
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.publicOrderReference.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (o.tableNumber && o.tableNumber.includes(search));
    return matchesStatus && matchesSearch;
  });

  const statuses: Array<{ key: OrderStatus | 'all'; label: string }> = [
    { key: 'all', label: t('orders.allTab', { count: orders.length }) },
    { key: 'new', label: t('orders.newTab', { count: orders.filter(o => o.status === 'new').length }) },
    { key: 'confirmed', label: `${t('orders.statusLabels.confirmed')} (${orders.filter(o => o.status === 'confirmed').length})` },
    { key: 'preparing', label: t('orders.preparingTab', { count: orders.filter(o => o.status === 'preparing').length }) },
    { key: 'ready', label: t('orders.readyTab', { count: orders.filter(o => o.status === 'ready').length }) },
    { key: 'completed', label: t('orders.completedTab', { count: orders.filter(o => o.status === 'completed').length }) },
    { key: 'cancelled', label: t('orders.cancelledTab', { count: orders.filter(o => o.status === 'cancelled').length }) }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
                {t('orders.pageTitle')}
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-status-success dark:bg-[#4ADE80] animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
              {t('orders.pageSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#14241F] text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-gold transition-colors"
              title={soundEnabled ? 'Alerte sonore activée' : 'Son désactivé'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-forest dark:text-gold" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <Link to={`/m/${activeRestaurant.slug}`} target="_blank">
              <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                {t('navigation.customerView')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white dark:bg-[#101E1A] p-2 rounded-2xl border border-border-subtle dark:border-[#233831] shadow-soft dark:shadow-none">
            {statuses.map(st => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st.key
                    ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark shadow-soft'
                    : 'text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2] hover:bg-ivory dark:hover:bg-[#152520]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-secondary dark:text-[#97A7A0] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('orders.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#14241F] border border-border-subtle dark:border-[#233831] text-ink-main dark:text-[#F0F4F2] text-xs focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold shadow-soft dark:shadow-none placeholder-ink-muted dark:placeholder-[#6F8078]"
            />
          </div>
        </div>

        {/* Orders Stream List */}
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-ink-secondary/50 dark:text-[#97A7A0]/50 mx-auto" />
            <h3 className="font-bold text-forest dark:text-[#F0F4F2] text-base">{t('orders.emptyTitle')}</h3>
            <p className="text-xs text-ink-secondary dark:text-[#97A7A0] max-w-sm mx-auto">
              {t('orders.emptyDesc')}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-border-subtle dark:border-[#233831] hover:border-forest/30 dark:hover:border-gold/30 transition-all shadow-soft dark:shadow-none"
              >
                {/* Left: Table & Order Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-forest-light dark:bg-[#1C332B] text-forest dark:text-gold flex flex-col items-center justify-center font-bold text-xs flex-shrink-0">
                    {order.orderType === 'dine_in' ? (
                      <>
                        <span className="text-[9px] uppercase tracking-tighter text-ink-secondary dark:text-[#97A7A0]">{t('common.table')}</span>
                        <span className="text-sm font-extrabold">{order.tableNumber || '?'}</span>
                      </>
                    ) : (
                      <span className="text-xs font-extrabold uppercase">TA</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/app/orders/${order.id}`} className="font-bold text-base text-forest dark:text-gold hover:underline">
                        {order.publicOrderReference}
                      </Link>
                      <OrderStatusBadge status={order.status} />
                      <WhatsAppStatusBadge status={order.notificationStatus} />
                    </div>

                    <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                      {formatTime(order.createdAt)} •{' '}
                      {order.customerName ? `${t('orders.customer')} : ${order.customerName}` : t('orders.dineIn')}
                      {order.customerPhone ? ` (${order.customerPhone})` : ''}
                    </p>

                    {/* Items preview */}
                    <div className="text-xs text-ink-main dark:text-[#F0F4F2] pt-1 font-medium">
                      {order.items.map((i, idx) => (
                        <span key={idx} className="mr-3 inline-block">
                          <strong className="text-forest dark:text-gold">{i.quantity}x</strong> {t(i.productName)}
                        </span>
                      ))}
                    </div>

                    {order.customerNotes && (
                      <p className="text-[11px] text-amber-800 dark:text-[#FBBF24] bg-amber-50 dark:bg-[#2B2310] rounded-lg px-2.5 py-1 border border-amber-200 dark:border-amber-800/40 inline-block mt-1">
                        {t('orders.customerNotes')} {order.customerNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Total & Status Flow Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-0 border-border-subtle dark:border-[#233831]">
                  <div className="text-left md:text-right">
                    <div className="text-base font-extrabold text-forest dark:text-[#F0F4F2]">
                      {formatCurrency(order.total)}
                    </div>
                    <span className="text-[11px] text-ink-secondary dark:text-[#97A7A0]">
                      {t('orders.itemsCount', { count: order.items.length })}
                    </span>
                  </div>

                  {/* Status Progression Quick Buttons */}
                  <div className="flex items-center gap-2">
                    {order.status === 'new' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                      >
                        {t('orders.acceptOrder')}
                      </Button>
                    )}

                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      >
                        {t('orders.startPreparing')}
                      </Button>
                    )}

                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                      >
                        {t('orders.markReady')}
                      </Button>
                    )}

                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                      >
                        {t('orders.markCompleted')}
                      </Button>
                    )}

                    <Link to={`/app/orders/${order.id}`}>
                      <Button size="sm" variant="outline" className="p-2" aria-label={t('common.details')}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
