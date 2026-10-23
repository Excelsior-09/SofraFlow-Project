import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { NoActiveRestaurantCard } from '../../components/common/NoActiveRestaurantCard';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Order, NotificationEvent } from '../../types';

export const AnalyticsPage: React.FC = () => {
  const { activeRestaurant } = useAuth();
  const { language, t, formatCurrency, formatDate } = useLanguage();
  const isEn = language === 'en';
  const { resolvedTheme } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<NotificationEvent[]>([]);

  const loadData = async () => {
    if (!activeRestaurant) {
      setOrders([]);
      setEvents([]);
      return;
    }

    if (isSupabaseConfigured) {
      try {
        const supaOrders = await supabaseService.getOrdersForRestaurant(activeRestaurant.id);
        setOrders(supaOrders);
        const supaEvents = await supabaseService.getNotificationEvents(activeRestaurant.id);
        setEvents(supaEvents);
      } catch (err) {
        console.warn('[AnalyticsPage] Error fetching remote analytics data:', err);
        setOrders([]);
        setEvents([]);
      }
    } else {
      setOrders(db.getOrders(activeRestaurant.id));
      setEvents(db.getNotificationEvents(activeRestaurant.id));
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [activeRestaurant]);

  if (!activeRestaurant) {
    return (
      <DashboardLayout>
        <NoActiveRestaurantCard
          icon={<BarChart3 className="w-8 h-8" />}
          title={isEn ? 'No active establishment' : 'Aucun établissement actif'}
          description={
            isEn
              ? 'Please select or configure your establishment to view sales analytics and kitchen performance.'
              : 'Veuillez sélectionner ou configurer votre établissement pour visualiser vos métriques et performances commerciales.'
          }
        />
      </DashboardLayout>
    );
  }

  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const averageOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  // WhatsApp notification success rate
  const totalNotifs = events.length;
  const successfulNotifs = events.filter(e => e.status === 'delivered' || e.status === 'accepted').length;
  const notifSuccessRate = totalNotifs > 0 ? Math.round((successfulNotifs / totalNotifs) * 100) : 100;

  const isDark = resolvedTheme === 'dark';

  // Orders status distribution data
  const statusDistribution = [
    { name: t('analytics.statusCompleted'), count: completedOrders.length, color: isDark ? '#34D399' : '#23865B' },
    { name: t('analytics.statusInKitchen'), count: orders.filter(o => o.status === 'new' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready').length, color: '#D9A441' },
    { name: t('analytics.statusCancelled'), count: cancelledOrders.length, color: isDark ? '#F87171' : '#C84B4B' }
  ].filter(item => item.count > 0);

  // Daily revenue data
  const dailyData: Record<string, { date: string; revenue: number; orders: number }> = {};
  for (const o of validOrders) {
    const day = formatDate(o.createdAt, { month: 'short', day: 'numeric' });
    if (!dailyData[day]) {
      dailyData[day] = { date: day, revenue: 0, orders: 0 };
    }
    dailyData[day].revenue += o.total;
    dailyData[day].orders += 1;
  }
  const revenueChartData = Object.values(dailyData);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
              {t('analytics.pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
              {t('analytics.pageSubtitle')}
            </p>
          </div>
          <Badge variant="ivory">{t('analytics.periodBadge')}</Badge>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 space-y-2 border border-border-subtle dark:border-[#233831]">
            <span className="text-xs font-semibold text-ink-secondary dark:text-[#97A7A0] uppercase">
              {t('analytics.kpiRevenue')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] pt-1 border-t border-border-subtle dark:border-[#233831]">
              {t('analytics.kpiRevenueDesc')}
            </p>
          </Card>

          <Card className="p-5 space-y-2 border border-border-subtle dark:border-[#233831]">
            <span className="text-xs font-semibold text-ink-secondary dark:text-[#97A7A0] uppercase">
              {t('analytics.kpiAov')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
                {formatCurrency(averageOrderValue)}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] pt-1 border-t border-border-subtle dark:border-[#233831]">
              {t('analytics.kpiAovDesc')}
            </p>
          </Card>

          <Card className="p-5 space-y-2 border border-border-subtle dark:border-[#233831]">
            <span className="text-xs font-semibold text-ink-secondary dark:text-[#97A7A0] uppercase">
              {t('analytics.kpiOrders')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
                {orders.length}
              </span>
              <span className="text-xs text-ink-secondary dark:text-[#97A7A0]">{t('common.orders').toLowerCase()}</span>
            </div>
            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] pt-1 border-t border-border-subtle dark:border-[#233831]">
              {t('analytics.kpiOrdersDesc', { completed: completedOrders.length, cancelled: cancelledOrders.length })}
            </p>
          </Card>

          <Card className="p-5 space-y-2 border border-border-subtle dark:border-[#233831]">
            <span className="text-xs font-semibold text-ink-secondary dark:text-[#97A7A0] uppercase">
              {t('analytics.kpiDeliveryRate')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
                {notifSuccessRate}%
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] pt-1 border-t border-border-subtle dark:border-[#233831]">
              {t('analytics.kpiDeliveryRateDesc', { delivered: successfulNotifs, total: totalNotifs })}
            </p>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart (2 cols) */}
          <Card className="lg:col-span-2 p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
            <h3 className="font-bold text-base text-forest dark:text-[#F0F4F2] font-display">
              {t('analytics.revenueChartTitle')}
            </h3>

            {revenueChartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-ink-secondary dark:text-[#97A7A0]">
                {t('analytics.noDataChart')}
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#233831' : '#E5E9E3'} vertical={false} />
                    <XAxis dataKey="date" stroke={isDark ? '#97A7A0' : '#727B74'} fontSize={11} />
                    <YAxis stroke={isDark ? '#97A7A0' : '#727B74'} fontSize={11} />
                    <Tooltip
                      formatter={(val: any) => [`${val} MAD`, t('analytics.revenueChartTooltip')]}
                      contentStyle={{
                        backgroundColor: isDark ? '#14241F' : '#ffffff',
                        borderColor: isDark ? '#233831' : '#E5E9E3',
                        color: isDark ? '#F0F4F2' : '#202923',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="revenue" fill={isDark ? '#D9A441' : '#153E35'} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Status Breakdown (1 col) */}
          <Card className="p-6 space-y-4 border border-border-subtle dark:border-[#233831]">
            <h3 className="font-bold text-base text-forest dark:text-[#F0F4F2] font-display">
              {t('analytics.statusPieTitle')}
            </h3>

            {statusDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-ink-secondary dark:text-[#97A7A0]">
                {t('common.noResults')}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#14241F' : '#ffffff',
                          borderColor: isDark ? '#233831' : '#E5E9E3',
                          color: isDark ? '#F0F4F2' : '#202923',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 border-t border-border-subtle dark:border-[#233831] pt-3 text-xs">
                  {statusDistribution.map((st, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                        <span className="text-ink-main dark:text-[#F0F4F2]">{st.name}</span>
                      </div>
                      <span className="font-bold text-forest dark:text-gold">
                        {t('analytics.ordersCount', { count: st.count })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
