import React, { useState } from 'react';
import { CreditCard, Check, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';

export const BillingPage: React.FC = () => {
  const { activeRestaurant, refreshState } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<'starter' | 'growth' | 'pro'>('growth');

  if (!activeRestaurant) return null;

  const handleApplyPlan = (plan: 'starter' | 'growth' | 'pro') => {
    const updated = {
      ...activeRestaurant,
      subscriptionPlan: plan,
      subscriptionStatus: 'active' as const
    };
    db.updateRestaurant(updated);
    refreshState();
    setIsUpgradeModalOpen(false);
  };

  const currentPlan = activeRestaurant.subscriptionPlan || 'growth';

  const planPricing: Record<string, { name: string; price: number; desc: string }> = {
    starter: {
      name: t('billing.plans.starter.name'),
      price: 290,
      desc: t('billing.plans.starter.desc')
    },
    growth: {
      name: t('billing.plans.growth.name'),
      price: 590,
      desc: t('billing.plans.growth.desc')
    },
    pro: {
      name: t('billing.plans.pro.name'),
      price: 990,
      desc: t('billing.plans.pro.desc')
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-dark-text font-display">
            {t('billing.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-dark-secondary mt-1">
            {t('billing.pageSubtitle')}
          </p>
        </div>

        {/* Demo Disclaimer Alert */}
        <Alert type="info">
          <div className="text-xs leading-relaxed">
            <strong>{t('common.demo')} :</strong> Mode de simulation sans passerelle bancaire active pour des tests sécurisés en environnement de démonstration au Maroc.
          </div>
        </Alert>

        {/* Current Active Plan Card */}
        <Card className="p-6 space-y-5 bg-white dark:bg-dark-card border-2 border-forest/20 dark:border-forest/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle dark:border-dark-border">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-secondary dark:text-dark-muted">
                {t('billing.currentPlanTitle')}
              </span>
              <h3 className="text-2xl font-extrabold text-forest dark:text-dark-text font-display capitalize">
                {planPricing[currentPlan]?.name || 'Growth'}
              </h3>
              <p className="text-xs text-ink-secondary dark:text-dark-secondary mt-0.5">
                {planPricing[currentPlan]?.desc}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="success">{t('billing.statusActive')}</Badge>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-forest dark:text-dark-text font-display">
                  {formatCurrency(planPricing[currentPlan]?.price || 590)}
                </span>
                <span className="text-xs text-ink-secondary dark:text-dark-muted font-medium"> {t('billing.plans.growth.period')}</span>
              </div>
            </div>
          </div>

          {/* Entitlements Usage */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-forest dark:text-dark-text uppercase tracking-wider">
              {t('billing.currentPlanTitle')} & Utilisation
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border">
                <span className="text-ink-secondary dark:text-dark-muted block mb-1">Menus publiés</span>
                <span className="font-extrabold text-sm text-forest dark:text-dark-text">
                  {db.getMenus(activeRestaurant.id).filter(m => m.status === 'published').length} / Illimité
                </span>
              </div>

              <div className="p-3 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border">
                <span className="text-ink-secondary dark:text-dark-muted block mb-1">Plats au catalogue</span>
                <span className="font-extrabold text-sm text-forest dark:text-dark-text">
                  {db.getProducts(activeRestaurant.id).length} plats
                </span>
              </div>

              <div className="p-3 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border">
                <span className="text-ink-secondary dark:text-dark-muted block mb-1">Alertes WhatsApp</span>
                <span className="font-extrabold text-sm text-forest dark:text-dark-text">Inclus (Actif)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              Changer de formule
            </Button>
          </div>
        </Card>

        {/* Change Plan Modal */}
        <Modal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          title="Modifier votre formule d'abonnement"
          description="Sélectionnez la formule adaptée à la taille de votre restaurant."
        >
          <div className="space-y-4">
            {(['starter', 'growth', 'pro'] as const).map(tier => {
              const info = planPricing[tier];
              const isSelected = tier === currentPlan;
              return (
                <div
                  key={tier}
                  onClick={() => setSelectedPlanToUpgrade(tier)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedPlanToUpgrade === tier
                      ? 'border-forest dark:border-gold bg-forest/5 dark:bg-dark-surface shadow-soft'
                      : 'border-border-subtle dark:border-dark-border hover:bg-ivory dark:hover:bg-dark-surface'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-forest dark:text-dark-text">{info.name}</h4>
                      {isSelected && <Badge variant="forest" size="sm">Actuelle</Badge>}
                    </div>
                    <p className="text-xs text-ink-secondary dark:text-dark-muted mt-0.5">{info.desc}</p>
                  </div>
                  <span className="font-extrabold text-sm text-forest dark:text-gold whitespace-nowrap">
                    {formatCurrency(info.price)}/mois
                  </span>
                </div>
              );
            })}

            <div className="pt-3 border-t border-border-subtle dark:border-dark-border flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsUpgradeModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleApplyPlan(selectedPlanToUpgrade)}>
                Confirmer le changement
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
