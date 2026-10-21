import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  MessageSquare,
  QrCode,
  UtensilsCrossed,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, OrderStatusBadge, WhatsAppStatusBadge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { Order } from '../../types';

export const OverviewPage: React.FC = () => {
  const { activeRestaurant, user } = useAuth();
  const { t, formatCurrency, formatTime } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);

  const loadData = () => {
    if (activeRestaurant) {
      setOrders(db.getOrders(activeRestaurant.id));
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(() => {
      loadData();
    });
    return () => unsub();
  }, [activeRestaurant]);

  if (!activeRestaurant) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-ink-secondary dark:text-[#97A7A0]">{t('common.loading')}</div>
      </DashboardLayout>
    );
  }

  // Explicit metric calculations
  const totalOrdersCount = orders.length;
  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  // Revenue only counted from completed or valid active orders (not cancelled)
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const aov = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  // Best selling items tally
  const itemCounts: Record<string, { name: string; count: number; total: number }> = {};
  for (const o of validOrders) {
    for (const item of o.items) {
      const name = t(item.productName);
      if (!itemCounts[name]) {
        itemCounts[name] = { name, count: 0, total: 0 };
      }
      itemCounts[name].count += item.quantity;
      itemCounts[name].total += item.subtotal;
    }
  }
  const topDishes = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top greeting & Quick actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
                {t('dashboard.greeting', { name: user?.fullName || 'Manager' })}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-light dark:bg-[#1C332B] text-forest dark:text-gold border border-forest/10 dark:border-gold/20">
                {t('common.morocco')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
              {t('dashboard.subtitle', { city: activeRestaurant.city || 'Marrakech' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/app/products">
              <Button size="sm" variant="outline" leftIcon={<UtensilsCrossed className="w-3.5 h-3.5" />}>
                {t('dashboard.addDish')}
              </Button>
            </Link>
            <Link to="/app/qr-nfc">
              <Button size="sm" variant="outline" leftIcon={<QrCode className="w-3.5 h-3.5" />}>
                {t('dashboard.printQrs')}
              </Button>
            </Link>
            <Link to={`/m/${activeRestaurant.slug}`} target="_blank">
              <Button size="sm" variant="primary" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                {t('navigation.viewPublicMenu')}
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Primary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Today's Orders */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-ink-secondary dark:text-[#97A7A0]">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('analytics.kpiOrders')}</span>
              <div className="p-2 rounded-xl bg-forest/5 dark:bg-forest/20 text-forest dark:text-gold">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">{totalOrdersCount}</span>
              <span className="text-xs text-ink-secondary dark:text-[#97A7A0]">{t('common.orders').toLowerCase()}</span>
            </div>
            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] pt-1 border-t border-border-subtle dark:border-[#233831]">
              {newOrders.length} {t('orders.statusLabels.new').toLowerCase()}
            </p>
          </Card>

          {/* Pending Action */}
          <Card className="p-5 space-y-2 border-status-warning/40 dark:border-status-warning/30 bg-status-warning-bg/30 dark:bg-[#2B2310]/40">
            <div className="flex items-center justify-between text-amber-800 dark:text-[#FBBF24]">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('dashboard.kpiActiveOrders')}</span>
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-[#FBBF24]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-900 dark:text-[#FBBF24] font-display">
                {newOrders.length + preparingOrders.length}
              </span>
              <span className="text-xs text-amber-800 dark:text-[#FBBF24]/80">{t('dashboard.kpiActiveOrdersDesc')}</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-[#FBBF24]/70 pt-1 border-t border-amber-200 dark:border-amber-800/40">
              {newOrders.length} {t('orders.statusLabels.new')} • {preparingOrders.length} {t('orders.statusLabels.preparing')}
            </p>
          </Card>

          {/* Total Revenue */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-ink-secondary dark:text-[#97A7A0]">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('analytics.kpiRevenue')}</span>
              <div className="p-2 rounded-xl bg-status-success-bg dark:bg-[#102B20] text-status-success dark:text-[#4ADE80]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] pt-1 border-t border-border-subtle dark:border-[#233831]">
              {t('analytics.kpiRevenueDesc')}
            </p>
          </Card>

          {/* Average Order Value (AOV) */}
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-ink-secondary dark:text-[#97A7A0]">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('analytics.kpiAov')}</span>
              <div className="p-2 rounded-xl bg-gold/20 dark:bg-gold/15 text-gold-hover dark:text-gold">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
                {formatCurrency(aov)}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] pt-1 border-t border-border-subtle dark:border-[#233831]">
              {t('analytics.kpiAovDesc')}
            </p>
          </Card>
        </div>

        {/* Middle Section: Recent Orders + WhatsApp Alert Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders List (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-forest dark:text-[#F0F4F2] font-display">
                  {t('dashboard.recentOrdersTitle')}
                </h3>
                <span className="text-xs text-ink-secondary dark:text-[#97A7A0]">({orders.length} {t('common.all').toLowerCase()})</span>
              </div>
              <Link to="/app/orders" className="text-xs font-semibold text-forest dark:text-gold hover:underline flex items-center gap-1">
                {t('dashboard.viewAllOrders')} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <Card className="p-10 text-center space-y-3">
                <ShoppingBag className="w-8 h-8 text-ink-secondary/50 dark:text-[#97A7A0]/50 mx-auto" />
                <h4 className="font-bold text-forest dark:text-[#F0F4F2] text-sm">{t('dashboard.noOrdersTitle')}</h4>
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0] max-w-sm mx-auto">
                  {t('dashboard.noOrdersDesc')}
                </p>
                <Link to={`/m/${activeRestaurant.slug}`} target="_blank">
                  <Button size="sm" variant="gold">
                    {t('navigation.viewPublicMenu')}
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <Card key={order.id} hoverEffect className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-forest-light dark:bg-[#1C332B] text-forest dark:text-gold flex flex-col items-center justify-center font-bold text-xs flex-shrink-0">
                        {order.orderType === 'dine_in' ? (
                          <>
                            <span className="text-[9px] uppercase tracking-tighter text-ink-secondary dark:text-[#97A7A0]">{t('common.table')}</span>
                            <span className="text-sm font-extrabold">{order.tableNumber || '?'}</span>
                          </>
                        ) : (
                          <span className="text-xs font-extrabold uppercase">TA</span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Link to={`/app/orders/${order.id}`} className="font-bold text-sm text-forest dark:text-gold hover:underline">
                            {order.publicOrderReference}
                          </Link>
                          <span className="text-xs text-ink-secondary dark:text-[#97A7A0]">•</span>
                          <span className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                            {formatTime(order.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                          {order.items.map(i => `${i.quantity}x ${t(i.productName)}`).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border-subtle dark:border-[#233831]">
                      <div className="text-right sm:pr-2">
                        <div className="text-xs font-bold text-forest dark:text-[#F0F4F2]">
                          {formatCurrency(order.total)}
                        </div>
                        <WhatsAppStatusBadge status={order.notificationStatus} />
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: WhatsApp Status & Top Dishes */}
          <div className="space-y-6">
            {/* WhatsApp Integration Card */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle dark:border-[#233831]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-forest dark:text-[#F0F4F2]">WhatsApp Cloud API</h4>
                    <span className="text-[10px] text-ink-secondary dark:text-[#97A7A0]">Meta Business</span>
                  </div>
                </div>
                <Badge variant={activeRestaurant.whatsappConfig.enabled ? 'success' : 'neutral'}>
                  {activeRestaurant.whatsappConfig.enabled ? t('common.active') : t('common.inactive')}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border-subtle/50 dark:border-[#233831]/50">
                  <span className="text-ink-secondary dark:text-[#97A7A0]">{t('whatsapp.destPhone')} :</span>
                  <span className="font-semibold text-ink-main dark:text-[#F0F4F2]">
                    {activeRestaurant.whatsappConfig.destinationPhoneNumber || t('whatsapp.disconnected')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-subtle/50 dark:border-[#233831]/50">
                  <span className="text-ink-secondary dark:text-[#97A7A0]">{t('whatsapp.templateName')} :</span>
                  <span className="font-mono text-[11px] text-forest dark:text-gold truncate max-w-[150px]">
                    {activeRestaurant.whatsappConfig.templateName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border-subtle/50 dark:border-[#233831]/50">
                  <span className="text-ink-secondary dark:text-[#97A7A0]">{t('whatsapp.apiProvider')} :</span>
                  <span className="font-semibold text-ink-main dark:text-[#F0F4F2]">
                    {activeRestaurant.whatsappConfig.phoneNumberId ? 'Meta Cloud API' : 'Sandbox SOFRAFLOW'}
                  </span>
                </div>
              </div>

              <Link to="/app/whatsapp" className="block pt-1">
                <Button size="sm" variant="secondary" className="w-full text-xs" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                  {t('whatsapp.sendTestBtn')}
                </Button>
              </Link>
            </Card>

            {/* Popular Dishes Card */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle dark:border-[#233831]">
                <h4 className="font-bold text-xs text-forest dark:text-[#F0F4F2] uppercase tracking-wider">
                  {t('customer.popularDishes')}
                </h4>
                <UtensilsCrossed className="w-4 h-4 text-ink-secondary dark:text-[#97A7A0]" />
              </div>

              {topDishes.length === 0 ? (
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0] py-3 text-center">
                  {t('common.noResults')}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {topDishes.map((dish, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <span className="w-5 h-5 rounded-md bg-ivory dark:bg-[#152520] font-bold text-[10px] text-ink-secondary dark:text-[#97A7A0] flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-medium text-ink-main dark:text-[#F0F4F2] truncate">{dish.name}</span>
                      </div>
                      <span className="font-bold text-forest dark:text-gold whitespace-nowrap">
                        {dish.count} {t('common.orders').toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
