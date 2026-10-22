import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Check,
  Copy,
  QrCode,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  Phone,
  FileText,
  Maximize2,
  Download,
  AlertCircle,
  Sparkles,
  Info,
  UserCheck,
  ExternalLink,
  ChevronRight,
  Eye,
  RefreshCw,
  BadgeCheck
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  CIH_BANK_CONFIG,
  ATTIJARIWAFA_BANK_CONFIG,
  CASH_PLUS_CONFIG,
  WESTERN_UNION_CONFIG,
  MONEYGRAM_CONFIG,
  RIA_CONFIG,
  SUBSCRIPTION_PLAN_PRICING
} from '../../data/moroccanPaymentConfig';
import { copyToClipboard } from '../../utils/clipboard';
import {
  MoroccanPaymentMethod,
  PaymentVerificationStatus,
  SubscriptionPaymentRequest
} from '../../types';

// ============================================================================
// RESPONSIVE COPY ROW COMPONENT
// Beautiful, touch-friendly, and responsive on both mobile and desktop
// ============================================================================
interface ResponsiveCopyRowProps {
  label: string;
  value: string;
  buttonLabel: string;
  copyKey: string;
  isCopied: boolean;
  onCopy: (key: string, value: string, label: string) => void;
  isMonospace?: boolean;
}

const ResponsiveCopyRow: React.FC<ResponsiveCopyRowProps> = ({
  label,
  value,
  buttonLabel,
  copyKey,
  isCopied,
  onCopy,
  isMonospace = true
}) => {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-ivory dark:bg-dark-surface border border-border-subtle dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-forest/20 dark:hover:border-gold/20 shadow-xs">
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-secondary dark:text-dark-muted block">
          {label}
        </span>
        <span
          className={`text-xs sm:text-sm text-forest dark:text-dark-text select-all tracking-wide break-all block mt-0.5 ${
            isMonospace ? 'font-mono font-bold' : 'font-bold'
          }`}
        >
          {value}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onCopy(copyKey, value, label)}
        className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 shadow-xs ${
          isCopied
            ? 'bg-emerald-600 text-white border border-emerald-700 shadow-emerald-500/20'
            : 'bg-white dark:bg-[#1B2F29] text-forest dark:text-gold border border-border-subtle dark:border-[#2C4239] hover:bg-forest/5 dark:hover:bg-gold/10 hover:border-forest/40'
        }`}
      >
        {isCopied ? (
          <>
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Copié !</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 opacity-70" />
            <span>{buttonLabel}</span>
          </>
        )}
      </button>
    </div>
  );
};

export const BillingPage: React.FC = () => {
  const { user, activeRestaurant, refreshState } = useAuth();
  const { t, formatCurrency } = useLanguage();

  // Subscription plan selection
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'pro'>('growth');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  // Moroccan Payment method selection (CIH, Attijariwafa, Cash Plus, Western Union, MoneyGram, Ria)
  const [selectedMethod, setSelectedMethod] = useState<MoroccanPaymentMethod>('cih_bank');

  // Clipboard copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copyFeedbackMessage, setCopyFeedbackMessage] = useState<string | null>(null);

  // QR Code zoom modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalInfo, setQrModalInfo] = useState<{ title: string; image: string; subtitle: string } | null>(null);

  // Proof submission form state
  const [transactionRef, setTransactionRef] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User payment requests tracking
  const [paymentRequests, setPaymentRequests] = useState<SubscriptionPaymentRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Admin verification section state
  const isAdminUser = user?.role === 'admin' || user?.email === 'admin@sofraflow.com';
  const [adminSimulationMode, setAdminSimulationMode] = useState(false);
  const showAdminSection = isAdminUser || adminSimulationMode;
  const [allAdminRequests, setAllAdminRequests] = useState<SubscriptionPaymentRequest[]>([]);
  const [adminFilter, setAdminFilter] = useState<'all' | 'under_review' | 'approved' | 'rejected'>('all');
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessingAdminAction, setIsProcessingAdminAction] = useState(false);

  // Receipt viewer modal
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // Set default plan to current restaurant plan if active
  useEffect(() => {
    if (activeRestaurant?.subscriptionPlan && activeRestaurant.subscriptionPlan !== 'enterprise') {
      setSelectedPlan(activeRestaurant.subscriptionPlan);
    }
  }, [activeRestaurant?.subscriptionPlan]);

  // Load payment requests for this restaurant
  const loadRequests = async () => {
    if (!activeRestaurant) return;
    setIsLoadingRequests(true);
    try {
      if (isSupabaseConfigured) {
        const remote = await supabaseService.getPaymentRequests(activeRestaurant.id);
        setPaymentRequests(remote);
      } else {
        const local = db.getPaymentRequests(activeRestaurant.id);
        setPaymentRequests(local);
      }
    } catch (err) {
      console.warn('Failed to fetch remote payment requests, falling back to db:', err);
      const local = db.getPaymentRequests(activeRestaurant.id);
      setPaymentRequests(local);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Load all payment requests for admin panel
  const loadAdminRequests = async () => {
    try {
      if (isSupabaseConfigured) {
        const remoteAll = await supabaseService.getPaymentRequests(undefined, true);
        setAllAdminRequests(remoteAll);
      } else {
        const localAll = db.getPaymentRequests(undefined, true);
        setAllAdminRequests(localAll);
      }
    } catch (err) {
      const localAll = db.getPaymentRequests(undefined, true);
      setAllAdminRequests(localAll);
    }
  };

  useEffect(() => {
    loadRequests();
    if (showAdminSection) {
      loadAdminRequests();
    }
  }, [activeRestaurant?.id, showAdminSection]);

  if (!activeRestaurant) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center space-y-4 max-w-xl mx-auto my-12 border-border-subtle dark:border-[#233831]">
          <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-forest dark:text-[#F0F4F2]">
            Aucun établissement actif
          </h2>
          <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
            Veuillez sélectionner ou créer votre établissement pour consulter vos informations d'abonnement et de facturation.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  // Calculate amount due based on selected plan and period
  const planConfig = SUBSCRIPTION_PLAN_PRICING[selectedPlan];
  const amountDue = billingPeriod === 'annual' ? planConfig.annualPrice : planConfig.monthlyPrice;

  // Copy handler with visual feedback
  const handleCopy = async (key: string, textToCopy: string, label: string) => {
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopiedKey(key);
      setCopyFeedbackMessage(`Copié : ${label}`);
      setTimeout(() => {
        setCopiedKey(null);
        setCopyFeedbackMessage(null);
      }, 2500);
    } else {
      setCopyFeedbackMessage("Impossible de copier automatiquement dans le presse-papiers.");
      setTimeout(() => setCopyFeedbackMessage(null), 3000);
    }
  };

  // Helper for method display name
  const getMethodDisplayName = (method: MoroccanPaymentMethod) => {
    switch (method) {
      case 'cih_bank': return 'CIH Bank';
      case 'attijariwafa_bank': return 'Attijariwafa bank';
      case 'cash_plus': return 'Cash Plus';
      case 'western_union': return 'Western Union';
      case 'moneygram': return 'MoneyGram';
      case 'ria': return 'Ria Money Transfer';
      default: return method;
    }
  };

  // Handle receipt file upload & preview
  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormErrorMessage("Le fichier est trop volumineux (maximum 5 Mo autorisés).");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFormErrorMessage("Format invalide. Veuillez fournir une image (JPG, PNG) ou un PDF.");
      return;
    }

    setReceiptFile(file);
    setFormErrorMessage(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptPreviewUrl(null);
    }
  };

  // Submit payment proof
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      setFormErrorMessage("Veuillez renseigner la référence ou le numéro de transaction.");
      return;
    }

    setIsSubmittingProof(true);
    setFormErrorMessage(null);
    setFormSuccessMessage(null);

    try {
      const newRequestData: Omit<SubscriptionPaymentRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        restaurantId: activeRestaurant.id,
        restaurantName: activeRestaurant.name,
        userId: user?.id || 'anonymous_user',
        userName: user?.fullName || activeRestaurant.name,
        plan: selectedPlan,
        billingPeriod,
        amount: amountDue,
        currency: 'MAD',
        paymentMethod: selectedMethod,
        transactionReference: transactionRef.trim(),
        receiptUrl: receiptPreviewUrl || undefined,
        receiptFileName: receiptFile?.name || undefined,
        payerName: payerName.trim() || undefined,
        payerPhone: payerPhone.trim() || undefined,
        notes: notes.trim() || undefined
      };

      if (isSupabaseConfigured) {
        await supabaseService.createPaymentRequest(newRequestData);
      }
      db.createPaymentRequest(newRequestData);

      setFormSuccessMessage(
        "Votre justificatif de paiement a été soumis avec succès. Notre équipe va vérifier la réception des fonds et activer votre abonnement."
      );
      setTransactionRef('');
      setPayerName('');
      setPayerPhone('');
      setNotes('');
      setReceiptFile(null);
      setReceiptPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      await loadRequests();
      if (showAdminSection) {
        await loadAdminRequests();
      }
    } catch (err: any) {
      console.error('Error submitting payment proof:', err);
      setFormErrorMessage(err?.message || "Erreur lors de la transmission du justificatif. Veuillez réessayer.");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // Admin approval action
  const handleAdminApprove = async (request: SubscriptionPaymentRequest) => {
    if (!confirm(`Confirmer l'approbation du paiement de ${request.amount} MAD pour le restaurant "${request.restaurantName || request.restaurantId}" ?\n\nCette action activera immédiatement l'abonnement "${request.plan.toUpperCase()}".`)) {
      return;
    }

    setIsProcessingAdminAction(true);
    try {
      const verifierName = user?.fullName || user?.email || 'Administrateur SOFRAFLOW';

      if (isSupabaseConfigured) {
        await supabaseService.updatePaymentRequestStatus(request.id, 'approved', {
          verifierId: verifierName
        });
      }
      db.updatePaymentRequestStatus(request.id, 'approved', {
        verifierId: verifierName
      });

      await refreshState();
      await loadRequests();
      await loadAdminRequests();
    } catch (err: any) {
      console.error('Error approving payment request:', err);
      alert("Erreur lors de l'approbation : " + (err.message || 'Action impossible'));
    } finally {
      setIsProcessingAdminAction(false);
    }
  };

  // Admin rejection action
  const handleAdminRejectSubmit = async () => {
    if (!rejectingRequestId) return;
    if (!rejectionReason.trim()) {
      alert("Veuillez indiquer un motif de refus précis pour informer le client.");
      return;
    }

    setIsProcessingAdminAction(true);
    try {
      const verifierName = user?.fullName || user?.email || 'Administrateur SOFRAFLOW';

      if (isSupabaseConfigured) {
        await supabaseService.updatePaymentRequestStatus(rejectingRequestId, 'rejected', {
          reason: rejectionReason.trim(),
          verifierId: verifierName
        });
      }
      db.updatePaymentRequestStatus(rejectingRequestId, 'rejected', {
        reason: rejectionReason.trim(),
        verifierId: verifierName
      });

      setRejectingRequestId(null);
      setRejectionReason('');
      await loadRequests();
      await loadAdminRequests();
    } catch (err: any) {
      console.error('Error rejecting payment request:', err);
      alert("Erreur lors du refus : " + (err.message || 'Action impossible'));
    } finally {
      setIsProcessingAdminAction(false);
    }
  };

  const currentPlan = activeRestaurant.subscriptionPlan || 'growth';
  const currentPlanInfo = SUBSCRIPTION_PLAN_PRICING[currentPlan as keyof typeof SUBSCRIPTION_PLAN_PRICING] || SUBSCRIPTION_PLAN_PRICING.growth;

  const filteredAdminRequests = allAdminRequests.filter(req => {
    if (adminFilter === 'all') return true;
    return req.status === adminFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest dark:text-gold bg-forest/10 dark:bg-gold/15 px-2.5 py-0.5 rounded-full">
                Maroc & Paiements Locaux
              </span>
              {isAdminUser && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2.5 py-0.5 rounded-full">
                  Administrateur
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-dark-text font-display">
              {t('navigation.subscriptionBilling') || 'Abonnement et paiement'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-dark-secondary mt-1">
              Gérez votre formule SOFRAFLOW et effectuez vos règlements via virement bancaire ou services de transfert au Maroc.
            </p>
          </div>

          {/* Quick Demo Switcher for Admin verification testing */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant={adminSimulationMode ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setAdminSimulationMode(!adminSimulationMode)}
              className="text-xs flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              {adminSimulationMode ? "Quitter le mode Admin" : "Tester en mode Admin"}
            </Button>
          </div>
        </div>

        {/* Global Feedback notification if copied */}
        {copyFeedbackMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-forest dark:bg-dark-card border-2 border-gold text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
            <span className="text-sm font-semibold">{copyFeedbackMessage}</span>
          </div>
        )}

        {/* 1. CURRENT SUBSCRIPTION STATUS CARD */}
        <Card className="p-6 bg-white dark:bg-dark-card border-2 border-forest/20 dark:border-forest/30 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle dark:border-dark-border">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-secondary dark:text-dark-muted">
                {t('billing.currentPlanTitle') || 'Formule active'}
              </span>
              <div className="flex items-center gap-3 mt-0.5">
                <h3 className="text-2xl font-extrabold text-forest dark:text-dark-text font-display">
                  Formule {currentPlanInfo.name}
                </h3>
                <Badge
                  variant={activeRestaurant.subscriptionStatus === 'active' ? 'success' : 'warning'}
                  size="md"
                >
                  {activeRestaurant.subscriptionStatus === 'active' ? 'Abonnement actif' : 'En période d\'essai'}
                </Badge>
              </div>
              <p className="text-xs text-ink-secondary dark:text-dark-secondary mt-1">
                {currentPlanInfo.desc}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-3xl font-black text-forest dark:text-dark-text font-display">
                {formatCurrency(currentPlanInfo.monthlyPrice)}
              </span>
              <span className="text-xs text-ink-secondary dark:text-dark-muted font-medium"> / mois</span>
              <p className="text-[11px] text-forest dark:text-gold font-semibold mt-0.5">
                Facturation locale sans commission
              </p>
            </div>
          </div>

          {/* Entitlements Usage */}
          <div className="pt-2 space-y-3">
            <h4 className="text-xs font-bold text-forest dark:text-dark-text uppercase tracking-wider">
              Services inclus dans votre abonnement
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border flex items-center justify-between">
                <div>
                  <span className="text-ink-secondary dark:text-dark-muted block text-[11px]">Menus publiés</span>
                  <span className="font-extrabold text-sm text-forest dark:text-dark-text">
                    {db.getMenus(activeRestaurant.id).filter(m => m.status === 'published').length} / Illimité
                  </span>
                </div>
                <BadgeCheck className="w-5 h-5 text-forest dark:text-gold" />
              </div>

              <div className="p-3 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border flex items-center justify-between">
                <div>
                  <span className="text-ink-secondary dark:text-dark-muted block text-[11px]">Plats au catalogue</span>
                  <span className="font-extrabold text-sm text-forest dark:text-dark-text">
                    {db.getProducts(activeRestaurant.id).length} plats enregistrés
                  </span>
                </div>
                <BadgeCheck className="w-5 h-5 text-forest dark:text-gold" />
              </div>

              <div className="p-3 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border flex items-center justify-between">
                <div>
                  <span className="text-ink-secondary dark:text-dark-muted block text-[11px]">Alertes commandes WhatsApp</span>
                  <span className="font-extrabold text-sm text-forest dark:text-dark-text">Incluses (Illimitées)</span>
                </div>
                <BadgeCheck className="w-5 h-5 text-forest dark:text-gold" />
              </div>
            </div>
          </div>
        </Card>

        {/* 2. CHOOSE / RENEW SUBSCRIPTION PLAN */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-forest dark:text-dark-text font-display">
                1. Choisissez votre formule ou période de renouvellement
              </h2>
              <p className="text-xs text-ink-secondary dark:text-dark-secondary">
                Sélectionnez le forfait adapté à votre restaurant pour afficher le montant exact à régler.
              </p>
            </div>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center p-1 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border self-start">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-ink-secondary dark:text-dark-muted hover:text-ink-main'
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annual')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'annual'
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-ink-secondary dark:text-dark-muted hover:text-ink-main'
                }`}
              >
                <span>Annuel</span>
                <span className="bg-gold text-forest-dark text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  -15%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['starter', 'growth', 'pro'] as const).map(tierKey => {
              const tier = SUBSCRIPTION_PLAN_PRICING[tierKey];
              const isSelected = selectedPlan === tierKey;
              const isCurrent = currentPlan === tierKey;
              const price = billingPeriod === 'annual' ? tier.annualPrice : tier.monthlyPrice;

              return (
                <div
                  key={tierKey}
                  onClick={() => setSelectedPlan(tierKey)}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-forest dark:border-gold bg-forest/5 dark:bg-forest/10 shadow-soft scale-[1.01]'
                      : 'border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card hover:border-forest/40'
                  }`}
                >
                  {tierKey === 'growth' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forest dark:bg-gold text-white dark:text-forest-dark text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
                      Recommandé
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-forest dark:text-dark-text font-display">
                        {tier.name}
                      </h3>
                      {isCurrent && (
                        <Badge variant="forest" size="sm">
                          Actuelle
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-ink-secondary dark:text-dark-secondary leading-relaxed">
                      {tier.desc}
                    </p>

                    <div className="pt-2 border-t border-border-subtle dark:border-dark-border">
                      <span className="text-2xl font-black text-forest dark:text-dark-text font-display">
                        {formatCurrency(price)}
                      </span>
                      <span className="text-xs text-ink-secondary dark:text-dark-muted font-medium">
                        {billingPeriod === 'annual' ? ' / an' : ' / mois'}
                      </span>
                      {billingPeriod === 'annual' && (
                        <p className="text-[11px] text-forest dark:text-[#4ADE80] font-bold mt-0.5">
                          Économisez ~{Math.round(tier.monthlyPrice * 12 * 0.15)} MAD par an
                        </p>
                      )}
                    </div>

                    <ul className="space-y-1.5 pt-2 text-[11px] text-ink-secondary dark:text-dark-secondary">
                      {tier.features.slice(0, 4).map((f, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-forest dark:text-gold flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 mt-3">
                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full text-xs font-bold"
                    >
                      {isSelected ? "Formule sélectionnée" : "Sélectionner cette formule"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Amount Due Summary Banner */}
          <div className="p-4 rounded-2xl bg-forest/10 dark:bg-gold/10 border border-forest/20 dark:border-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-forest dark:text-gold block">
                Montant total à régler
              </span>
              <p className="text-sm font-semibold text-forest dark:text-dark-text">
                Formule {planConfig.name} ({billingPeriod === 'annual' ? 'Abonnement 1 an' : 'Abonnement 1 mois'})
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-3xl font-black text-forest dark:text-gold font-display">
                {amountDue} MAD
              </span>
              <span className="text-xs text-forest dark:text-gold font-semibold ml-1">
                ({amountDue} Dirhams Marocains)
              </span>
            </div>
          </div>
        </div>

        {/* 3. MOROCCAN PAYMENT METHODS SECTION */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-forest dark:text-dark-text font-display">
              2. Choisissez votre mode de paiement au Maroc
            </h2>
            <p className="text-xs text-ink-secondary dark:text-dark-secondary">
              Virement bancaire direct (CIH Bank, Attijariwafa bank) ou services de transfert (Cash Plus, Western Union, MoneyGram, Ria).
            </p>
          </div>

          {/* Payment Method Selector Tabs - Fully Responsive 6 Methods */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
            {/* CIH Bank */}
            <button
              type="button"
              onClick={() => setSelectedMethod('cih_bank')}
              className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                selectedMethod === 'cih_bank'
                  ? 'border-[#E0311D] bg-[#E0311D]/5 dark:bg-[#E0311D]/10 shadow-soft'
                  : 'border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card hover:border-[#E0311D]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E0311D]" />
                <span className="text-[9px] font-bold uppercase text-[#E0311D]">Virement</span>
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-forest dark:text-dark-text truncate">CIH Bank</h4>
                <p className="text-[10px] text-ink-secondary dark:text-dark-muted truncate">RIB & QR CIH</p>
              </div>
            </button>

            {/* Attijariwafa bank */}
            <button
              type="button"
              onClick={() => setSelectedMethod('attijariwafa_bank')}
              className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                selectedMethod === 'attijariwafa_bank'
                  ? 'border-[#D38800] bg-[#D38800]/5 dark:bg-[#D38800]/10 shadow-soft'
                  : 'border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card hover:border-[#D38800]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D38800]" />
                <span className="text-[9px] font-bold uppercase text-[#D38800]">Virement</span>
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-forest dark:text-dark-text truncate">Attijariwafa</h4>
                <p className="text-[10px] text-ink-secondary dark:text-dark-muted truncate">RIB & SmartPay</p>
              </div>
            </button>

            {/* Cash Plus */}
            <button
              type="button"
              onClick={() => setSelectedMethod('cash_plus')}
              className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                selectedMethod === 'cash_plus'
                  ? 'border-[#008850] bg-[#008850]/5 dark:bg-[#008850]/10 shadow-soft'
                  : 'border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card hover:border-[#008850]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#008850]" />
                <span className="text-[9px] font-bold uppercase text-[#008850]">Transfert</span>
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-forest dark:text-dark-text truncate">Cash Plus</h4>
                <p className="text-[10px] text-ink-secondary dark:text-dark-muted truncate">Agence & App</p>
              </div>
            </button>

            {/* Western Union */}
            <button
              type="button"
              onClick={() => setSelectedMethod('western_union')}
              className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                selectedMethod === 'western_union'
                  ? 'border-[#EAB308] bg-[#EAB308]/10 shadow-soft'
                  : 'border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card hover:border-[#EAB308]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] border border-black/20" />
                <span className="text-[9px] font-bold uppercase text-amber-700 dark:text-yellow-400">Transfert</span>
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-forest dark:text-dark-text truncate">Western Union</h4>
                <p className="text-[10px] text-ink-secondary dark:text-dark-muted truncate">Code MTCN</p>
              </div>
            </button>

            {/* MoneyGram */}
            <button
              type="button"
              onClick={() => setSelectedMethod('moneygram')}
              className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                selectedMethod === 'moneygram'
                  ? 'border-[#C01025] bg-[#C01025]/5 dark:bg-[#C01025]/10 shadow-soft'
                  : 'border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card hover:border-[#C01025]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C01025]" />
                <span className="text-[9px] font-bold uppercase text-[#C01025]">Transfert</span>
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-forest dark:text-dark-text truncate">MoneyGram</h4>
                <p className="text-[10px] text-ink-secondary dark:text-dark-muted truncate">Réf. 8 chiffres</p>
              </div>
            </button>

            {/* Ria Money Transfer */}
            <button
              type="button"
              onClick={() => setSelectedMethod('ria')}
              className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                selectedMethod === 'ria'
                  ? 'border-[#F15A24] bg-[#F15A24]/5 dark:bg-[#F15A24]/10 shadow-soft'
                  : 'border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card hover:border-[#F15A24]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F15A24]" />
                <span className="text-[9px] font-bold uppercase text-[#F15A24]">Transfert</span>
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-forest dark:text-dark-text truncate">Ria</h4>
                <p className="text-[10px] text-ink-secondary dark:text-dark-muted truncate">Code PIN / Agence</p>
              </div>
            </button>
          </div>

          {/* =========================================================
              DETAILS CARD FOR SELECTED PAYMENT METHOD
          ========================================================= */}

          {/* METHOD 1: CIH BANK */}
          {selectedMethod === 'cih_bank' && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-dark-card border-2 border-[#E0311D]/30 shadow-soft space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E0311D]/10 text-[#E0311D] flex items-center justify-center font-black text-sm shrink-0">
                    CIH
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-forest dark:text-dark-text font-display">
                      Virement bancaire — CIH Bank
                    </h3>
                    <p className="text-xs text-ink-secondary dark:text-dark-secondary">
                      Effectuez votre virement depuis l'application CIH Mobile ou votre banque marocaine.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy('cih_all', CIH_BANK_CONFIG.fullDetailsFormatted, "Toutes les coordonnées CIH")}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 border ${
                    copiedKey === 'cih_all'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
                      : 'bg-white dark:bg-[#152520] text-forest dark:text-gold border-forest/20 dark:border-forest/40 hover:bg-forest/5 dark:hover:bg-[#1E362D]'
                  }`}
                >
                  {copiedKey === 'cih_all' ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Coordonnées complètes copiées !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier toutes les coordonnées CIH</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Field-by-field responsive copy column */}
                <div className="lg:col-span-2 space-y-3">
                  <ResponsiveCopyRow
                    label="Titulaire du compte"
                    value={CIH_BANK_CONFIG.titulaire!}
                    buttonLabel="Copier le titulaire"
                    copyKey="cih_titulaire"
                    isCopied={copiedKey === 'cih_titulaire'}
                    onCopy={handleCopy}
                    isMonospace={false}
                  />

                  <ResponsiveCopyRow
                    label="RIB (Relevé d'Identité Bancaire — 24 chiffres)"
                    value={CIH_BANK_CONFIG.rib}
                    buttonLabel="Copier le RIB"
                    copyKey="cih_rib"
                    isCopied={copiedKey === 'cih_rib'}
                    onCopy={handleCopy}
                  />

                  <ResponsiveCopyRow
                    label="IBAN International"
                    value={CIH_BANK_CONFIG.iban!}
                    buttonLabel="Copier l'IBAN"
                    copyKey="cih_iban"
                    isCopied={copiedKey === 'cih_iban'}
                    onCopy={handleCopy}
                  />

                  <ResponsiveCopyRow
                    label="Code SWIFT / BIC"
                    value={CIH_BANK_CONFIG.swiftCode}
                    buttonLabel="Copier le code SWIFT"
                    copyKey="cih_swift"
                    isCopied={copiedKey === 'cih_swift'}
                    onCopy={handleCopy}
                  />
                </div>

                {/* CIH QR Code display */}
                <div className="p-4 rounded-xl bg-ivory dark:bg-dark-surface border border-border-subtle dark:border-dark-border flex flex-col items-center justify-between text-center space-y-3">
                  <div>
                    <span className="text-xs font-bold text-forest dark:text-dark-text block">
                      {CIH_BANK_CONFIG.qrCodeLabel}
                    </span>
                    <p className="text-[11px] text-ink-secondary dark:text-dark-muted mt-0.5">
                      Scannez directement depuis votre application CIH Mobile
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setQrModalInfo({
                        title: CIH_BANK_CONFIG.qrCodeLabel,
                        image: CIH_BANK_CONFIG.qrCodeUrl,
                        subtitle: "QR Code officiel CIH Bank — ANAS ZIRAOUI"
                      });
                      setIsQrModalOpen(true);
                    }}
                    className="relative group cursor-pointer p-3 bg-white rounded-2xl border-2 border-[#E0311D]/30 shadow-xs hover:border-[#E0311D] transition-all"
                  >
                    <img
                      src={CIH_BANK_CONFIG.qrCodeUrl}
                      alt="QR Code CIH Bank"
                      className="w-40 h-40 object-contain mx-auto transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-xs gap-1.5">
                      <Maximize2 className="w-4 h-4" />
                      <span>Agrandir</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setQrModalInfo({
                        title: CIH_BANK_CONFIG.qrCodeLabel,
                        image: CIH_BANK_CONFIG.qrCodeUrl,
                        subtitle: "QR Code officiel CIH Bank — ANAS ZIRAOUI"
                      });
                      setIsQrModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-subtle bg-white dark:bg-dark-surface text-xs font-bold text-forest dark:text-gold hover:bg-forest/5"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Agrandir le QR Code</span>
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* METHOD 2: ATTIJARIWAFA BANK */}
          {selectedMethod === 'attijariwafa_bank' && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-dark-card border-2 border-[#D38800]/30 shadow-soft space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D38800]/10 text-[#D38800] flex items-center justify-center font-black text-sm shrink-0">
                    AWB
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-forest dark:text-dark-text font-display">
                      Virement bancaire — Attijariwafa bank
                    </h3>
                    <p className="text-xs text-ink-secondary dark:text-dark-secondary">
                      Effectuez votre virement depuis Attijari Mobile ou scannez le QR code SmartPay.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy('awb_all', ATTIJARIWAFA_BANK_CONFIG.fullDetailsFormatted, "Toutes les coordonnées Attijariwafa")}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 border ${
                    copiedKey === 'awb_all'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
                      : 'bg-white dark:bg-[#152520] text-forest dark:text-gold border-forest/20 dark:border-forest/40 hover:bg-forest/5 dark:hover:bg-[#1E362D]'
                  }`}
                >
                  {copiedKey === 'awb_all' ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Coordonnées complètes copiées !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier toutes les coordonnées Attijariwafa</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Field-by-field responsive copy column */}
                <div className="lg:col-span-2 space-y-3">
                  <ResponsiveCopyRow
                    label="RIB (Relevé d'Identité Bancaire — 24 chiffres)"
                    value={ATTIJARIWAFA_BANK_CONFIG.rib}
                    buttonLabel="Copier le RIB"
                    copyKey="awb_rib"
                    isCopied={copiedKey === 'awb_rib'}
                    onCopy={handleCopy}
                  />

                  <ResponsiveCopyRow
                    label="Numéro de compte (Attijariwafa bank)"
                    value={ATTIJARIWAFA_BANK_CONFIG.accountNumber!}
                    buttonLabel="Copier le numéro de compte"
                    copyKey="awb_num"
                    isCopied={copiedKey === 'awb_num'}
                    onCopy={handleCopy}
                  />

                  <ResponsiveCopyRow
                    label="Code SWIFT / BIC"
                    value={ATTIJARIWAFA_BANK_CONFIG.swiftCode}
                    buttonLabel="Copier le code SWIFT"
                    copyKey="awb_swift"
                    isCopied={copiedKey === 'awb_swift'}
                    onCopy={handleCopy}
                  />
                </div>

                {/* Attijariwafa QR Code display */}
                <div className="p-4 rounded-xl bg-ivory dark:bg-dark-surface border border-border-subtle dark:border-dark-border flex flex-col items-center justify-between text-center space-y-3">
                  <div>
                    <span className="text-xs font-bold text-forest dark:text-dark-text block">
                      {ATTIJARIWAFA_BANK_CONFIG.qrCodeLabel}
                    </span>
                    <p className="text-[11px] text-ink-secondary dark:text-dark-muted mt-0.5">
                      Scannez directement avec l'application Attijari SmartPay
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setQrModalInfo({
                        title: ATTIJARIWAFA_BANK_CONFIG.qrCodeLabel,
                        image: ATTIJARIWAFA_BANK_CONFIG.qrCodeUrl,
                        subtitle: "QR Code officiel Attijariwafa bank SmartPay"
                      });
                      setIsQrModalOpen(true);
                    }}
                    className="relative group cursor-pointer p-3 bg-white rounded-2xl border-2 border-[#D38800]/30 shadow-xs hover:border-[#D38800] transition-all"
                  >
                    <img
                      src={ATTIJARIWAFA_BANK_CONFIG.qrCodeUrl}
                      alt="QR Code Attijariwafa bank"
                      className="w-40 h-40 object-contain mx-auto transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-xs gap-1.5">
                      <Maximize2 className="w-4 h-4" />
                      <span>Agrandir</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setQrModalInfo({
                        title: ATTIJARIWAFA_BANK_CONFIG.qrCodeLabel,
                        image: ATTIJARIWAFA_BANK_CONFIG.qrCodeUrl,
                        subtitle: "QR Code officiel Attijariwafa bank SmartPay"
                      });
                      setIsQrModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border-subtle bg-white dark:bg-dark-surface text-xs font-bold text-forest dark:text-gold hover:bg-forest/5"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Agrandir le QR Code</span>
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* METHOD 3: CASH PLUS */}
          {selectedMethod === 'cash_plus' && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-dark-card border-2 border-[#008850]/30 shadow-soft space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#008850]/10 text-[#008850] flex items-center justify-center font-black text-sm shrink-0">
                    CP
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-forest dark:text-dark-text font-display">
                      Autres moyens de paiement — Cash Plus
                    </h3>
                    <p className="text-xs text-ink-secondary dark:text-dark-secondary">
                      Transfert d'argent national via le réseau d'agences Cash Plus ou l'application Cash Plus Mobile.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy('cp_all', CASH_PLUS_CONFIG.fullDetailsFormatted, "Coordonnées bénéficiaire Cash Plus")}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 border ${
                    copiedKey === 'cp_all'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
                      : 'bg-white dark:bg-[#152520] text-forest dark:text-gold border-forest/20 dark:border-forest/40 hover:bg-forest/5 dark:hover:bg-[#1E362D]'
                  }`}
                >
                  {copiedKey === 'cp_all' ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Coordonnées complètes copiées !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier les coordonnées complètes</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <ResponsiveCopyRow
                  label="Nom du bénéficiaire"
                  value={CASH_PLUS_CONFIG.beneficiaryName}
                  buttonLabel="Copier le bénéficiaire"
                  copyKey="cp_ben"
                  isCopied={copiedKey === 'cp_ben'}
                  onCopy={handleCopy}
                  isMonospace={false}
                />

                <ResponsiveCopyRow
                  label="Téléphone"
                  value={CASH_PLUS_CONFIG.phone}
                  buttonLabel="Copier le téléphone"
                  copyKey="cp_phone"
                  isCopied={copiedKey === 'cp_phone'}
                  onCopy={handleCopy}
                />
              </div>

              <div className="p-4 rounded-xl bg-forest/5 dark:bg-dark-surface border border-forest/15 dark:border-dark-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-forest dark:text-gold">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Modalités de paiement Cash Plus :</span>
                </div>
                <p className="text-xs text-ink-secondary dark:text-dark-secondary leading-relaxed">
                  {CASH_PLUS_CONFIG.instructions.fr}
                </p>
                <p className="text-[11px] text-ink-secondary dark:text-dark-muted">
                  Note : Les frais de transfert éventuels de l'agence restent à la charge de l'émetteur. Assurez-vous de transmettre le montant exact de l'abonnement ({amountDue} MAD).
                </p>
              </div>
            </Card>
          )}

          {/* METHOD 4: WESTERN UNION */}
          {selectedMethod === 'western_union' && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-dark-card border-2 border-yellow-400/40 shadow-soft space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-700 dark:text-yellow-400 flex items-center justify-center font-black text-sm shrink-0">
                    WU
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-forest dark:text-dark-text font-display">
                      Autres moyens de paiement — Western Union
                    </h3>
                    <p className="text-xs text-ink-secondary dark:text-dark-secondary">
                      Transfert d'argent en agence Western Union ou en ligne pour les règlements nationaux et internationaux.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy('wu_all', WESTERN_UNION_CONFIG.fullDetailsFormatted, "Coordonnées bénéficiaire Western Union")}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 border ${
                    copiedKey === 'wu_all'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
                      : 'bg-white dark:bg-[#152520] text-forest dark:text-gold border-forest/20 dark:border-forest/40 hover:bg-forest/5 dark:hover:bg-[#1E362D]'
                  }`}
                >
                  {copiedKey === 'wu_all' ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Coordonnées complètes copiées !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier les coordonnées complètes</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <ResponsiveCopyRow
                  label="Nom du bénéficiaire"
                  value={WESTERN_UNION_CONFIG.beneficiaryName}
                  buttonLabel="Copier le bénéficiaire"
                  copyKey="wu_ben"
                  isCopied={copiedKey === 'wu_ben'}
                  onCopy={handleCopy}
                  isMonospace={false}
                />

                <ResponsiveCopyRow
                  label="Téléphone"
                  value={WESTERN_UNION_CONFIG.phone}
                  buttonLabel="Copier le téléphone"
                  copyKey="wu_phone"
                  isCopied={copiedKey === 'wu_phone'}
                  onCopy={handleCopy}
                />
              </div>

              <div className="p-4 rounded-xl bg-forest/5 dark:bg-dark-surface border border-forest/15 dark:border-dark-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-forest dark:text-gold">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Modalités de paiement Western Union :</span>
                </div>
                <p className="text-xs text-ink-secondary dark:text-dark-secondary leading-relaxed">
                  {WESTERN_UNION_CONFIG.instructions.fr}
                </p>
                <p className="text-[11px] text-ink-secondary dark:text-dark-muted">
                  Important : Renseignez impérativement le numéro de transfert MTCN à 10 chiffres dans le formulaire ci-dessous avec une copie lisible de votre reçu d'envoi.
                </p>
              </div>
            </Card>
          )}

          {/* METHOD 5: MONEYGRAM */}
          {selectedMethod === 'moneygram' && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-dark-card border-2 border-[#C01025]/30 shadow-soft space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C01025]/10 text-[#C01025] flex items-center justify-center font-black text-sm shrink-0">
                    MG
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-forest dark:text-dark-text font-display">
                      Autres moyens de paiement — MoneyGram
                    </h3>
                    <p className="text-xs text-ink-secondary dark:text-dark-secondary">
                      Transfert d'argent en agence MoneyGram, réseau partenaire bancaire (Al Barid Bank, Chaabi Cash) ou en ligne.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy('mg_all', MONEYGRAM_CONFIG.fullDetailsFormatted, "Coordonnées bénéficiaire MoneyGram")}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 border ${
                    copiedKey === 'mg_all'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
                      : 'bg-white dark:bg-[#152520] text-forest dark:text-gold border-forest/20 dark:border-forest/40 hover:bg-forest/5 dark:hover:bg-[#1E362D]'
                  }`}
                >
                  {copiedKey === 'mg_all' ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Coordonnées complètes copiées !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier les coordonnées MoneyGram</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <ResponsiveCopyRow
                  label="Nom du bénéficiaire"
                  value={MONEYGRAM_CONFIG.beneficiaryName}
                  buttonLabel="Copier le bénéficiaire"
                  copyKey="mg_ben"
                  isCopied={copiedKey === 'mg_ben'}
                  onCopy={handleCopy}
                  isMonospace={false}
                />

                <ResponsiveCopyRow
                  label="Téléphone"
                  value={MONEYGRAM_CONFIG.phone}
                  buttonLabel="Copier le téléphone"
                  copyKey="mg_phone"
                  isCopied={copiedKey === 'mg_phone'}
                  onCopy={handleCopy}
                />
              </div>

              <div className="p-4 rounded-xl bg-forest/5 dark:bg-dark-surface border border-forest/15 dark:border-dark-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-forest dark:text-gold">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Modalités de paiement MoneyGram :</span>
                </div>
                <p className="text-xs text-ink-secondary dark:text-dark-secondary leading-relaxed">
                  {MONEYGRAM_CONFIG.instructions.fr}
                </p>
                <p className="text-[11px] text-ink-secondary dark:text-dark-muted">
                  Important : Renseignez impérativement le numéro de référence de transaction à 8 chiffres délivré par MoneyGram dans le champ référence ci-dessous.
                </p>
              </div>
            </Card>
          )}

          {/* METHOD 6: RIA MONEY TRANSFER */}
          {selectedMethod === 'ria' && (
            <Card className="p-5 sm:p-6 bg-white dark:bg-dark-card border-2 border-[#F15A24]/30 shadow-soft space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle dark:border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F15A24]/10 text-[#F15A24] flex items-center justify-center font-black text-sm shrink-0">
                    RIA
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-forest dark:text-dark-text font-display">
                      Autres moyens de paiement — Ria Money Transfer
                    </h3>
                    <p className="text-xs text-ink-secondary dark:text-dark-secondary">
                      Transfert d'argent via les agences Ria, réseau partenaire au Maroc (ex : BMCE, Dirham Express) ou application mobile Ria.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy('ria_all', RIA_CONFIG.fullDetailsFormatted, "Coordonnées bénéficiaire Ria")}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 border ${
                    copiedKey === 'ria_all'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20'
                      : 'bg-white dark:bg-[#152520] text-forest dark:text-gold border-forest/20 dark:border-forest/40 hover:bg-forest/5 dark:hover:bg-[#1E362D]'
                  }`}
                >
                  {copiedKey === 'ria_all' ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Coordonnées complètes copiées !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier les coordonnées Ria</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <ResponsiveCopyRow
                  label="Nom du bénéficiaire"
                  value={RIA_CONFIG.beneficiaryName}
                  buttonLabel="Copier le bénéficiaire"
                  copyKey="ria_ben"
                  isCopied={copiedKey === 'ria_ben'}
                  onCopy={handleCopy}
                  isMonospace={false}
                />

                <ResponsiveCopyRow
                  label="Téléphone"
                  value={RIA_CONFIG.phone}
                  buttonLabel="Copier le téléphone"
                  copyKey="ria_phone"
                  isCopied={copiedKey === 'ria_phone'}
                  onCopy={handleCopy}
                />
              </div>

              <div className="p-4 rounded-xl bg-forest/5 dark:bg-dark-surface border border-forest/15 dark:border-dark-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-forest dark:text-gold">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Modalités de paiement Ria Money Transfer :</span>
                </div>
                <p className="text-xs text-ink-secondary dark:text-dark-secondary leading-relaxed">
                  {RIA_CONFIG.instructions.fr}
                </p>
                <p className="text-[11px] text-ink-secondary dark:text-dark-muted">
                  Important : Renseignez impérativement le numéro d'ordre / code PIN de transfert Ria dans le champ référence ci-dessous et joignez votre reçu.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* 4. PROOF OF PAYMENT SUBMISSION FORM */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-forest dark:text-dark-text font-display">
              3. Soumettez votre justificatif de paiement
            </h2>
            <p className="text-xs text-ink-secondary dark:text-dark-secondary">
              Une fois votre virement ou transfert effectué, renseignez vos coordonnées et joignez le reçu pour validation par nos services.
            </p>
          </div>

          <Card className="p-5 sm:p-6 bg-white dark:bg-dark-card border-2 border-forest/20 dark:border-forest/30 shadow-soft">
            <form onSubmit={handleSubmitProof} className="space-y-5">
              {formSuccessMessage && (
                <Alert type="success">
                  <div className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Confirmation :</strong>
                      {formSuccessMessage}
                    </div>
                  </div>
                </Alert>
              )}

              {formErrorMessage && (
                <Alert type="error">
                  <div className="flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-status-error shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Erreur :</strong>
                      {formErrorMessage}
                    </div>
                  </div>
                </Alert>
              )}

              {/* Readonly Plan & Method recap */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-ivory dark:bg-dark-surface border border-border-subtle dark:border-dark-border text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-secondary dark:text-dark-muted block">
                    Formule & Période
                  </span>
                  <span className="font-extrabold text-forest dark:text-dark-text">
                    {planConfig.name} ({billingPeriod === 'annual' ? 'Annuel' : 'Mensuel'})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-secondary dark:text-dark-muted block">
                    Montant exigible
                  </span>
                  <span className="font-extrabold text-forest dark:text-gold text-sm">
                    {amountDue} MAD
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-secondary dark:text-dark-muted block">
                    Moyen de règlement
                  </span>
                  <span className="font-extrabold text-forest dark:text-dark-text">
                    {getMethodDisplayName(selectedMethod)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transaction Reference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest dark:text-dark-text block">
                    Référence de l'opération / Numéro de virement / Code MTCN, MoneyGram ou Ria <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    placeholder="Ex: VIR-20261022-8941, MTCN ou Réf. transfert"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-surface text-xs text-ink-main dark:text-dark-text focus:outline-hidden focus:ring-2 focus:ring-forest/30 dark:focus:ring-gold/30 font-mono"
                  />
                  <p className="text-[11px] text-ink-secondary dark:text-dark-muted">
                    Numéro figurant sur votre reçu de virement ou bordereau de transfert.
                  </p>
                </div>

                {/* Payer Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest dark:text-dark-text block">
                    Nom et prénom de l'émetteur
                  </label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={e => setPayerName(e.target.value)}
                    placeholder="Ex: Anas Alami"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-surface text-xs text-ink-main dark:text-dark-text focus:outline-hidden focus:ring-2 focus:ring-forest/30 dark:focus:ring-gold/30"
                  />
                  <p className="text-[11px] text-ink-secondary dark:text-dark-muted">
                    Nom du titulaire du compte émetteur ou expéditeur du mandat.
                  </p>
                </div>

                {/* Payer Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest dark:text-dark-text block">
                    Téléphone de contact
                  </label>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={e => setPayerPhone(e.target.value)}
                    placeholder="Ex: +212 6 XX XX XX XX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-surface text-xs text-ink-main dark:text-dark-text focus:outline-hidden focus:ring-2 focus:ring-forest/30 dark:focus:ring-gold/30"
                  />
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest dark:text-dark-text block">
                    Commentaires ou précisions (optionnel)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ex: Virement instantané effectué à 14h30"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-surface text-xs text-ink-main dark:text-dark-text focus:outline-hidden focus:ring-2 focus:ring-forest/30 dark:focus:ring-gold/30"
                  />
                </div>
              </div>

              {/* Receipt File Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-forest dark:text-dark-text block">
                  Reçu / Justificatif de virement (Image ou PDF)
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border-subtle dark:border-dark-border hover:border-forest dark:hover:border-gold rounded-2xl p-6 text-center cursor-pointer transition-colors bg-ivory/50 dark:bg-dark-surface/50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleReceiptFileChange}
                    className="hidden"
                  />

                  {receiptFile ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {receiptPreviewUrl ? (
                        <img
                          src={receiptPreviewUrl}
                          alt="Aperçu du reçu"
                          className="h-28 object-contain rounded-lg border border-border-subtle shadow-xs"
                        />
                      ) : (
                        <FileText className="w-10 h-10 text-forest dark:text-gold" />
                      )}
                      <p className="text-xs font-bold text-forest dark:text-dark-text">
                        {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} Ko)
                      </p>
                      <span className="text-[11px] text-forest dark:text-gold hover:underline">
                        Cliquer pour remplacer le fichier
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-forest dark:text-dark-text">
                          Glissez votre reçu ici ou cliquez pour parcourir
                        </p>
                        <p className="text-[11px] text-ink-secondary dark:text-dark-muted mt-0.5">
                          Formats acceptés : JPG, PNG, WEBP, PDF (Taille maximale : 5 Mo)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Disclaimer Notice */}
              <div className="p-3.5 rounded-xl bg-ivory dark:bg-dark-surface border border-border-subtle dark:border-dark-border flex items-start gap-2.5 text-xs text-ink-secondary dark:text-dark-secondary">
                <ShieldCheck className="w-4 h-4 text-forest dark:text-gold shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Processus de vérification sécurisé :</strong> Conformément à notre politique de conformité, l'activation de votre formule est opérée manuellement par notre équipe dès validation de la réception des fonds sur nos comptes marocains (délai indicatif moyen : 15 min à 2h ouvrées).
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmittingProof}
                  className="font-bold text-xs px-6 py-2.5 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {isSubmittingProof ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Soumettre mon justificatif de paiement</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* 5. USER PAYMENT VERIFICATION STATUS & HISTORY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-forest dark:text-dark-text font-display">
                Suivi de vos demandes de règlement
              </h2>
              <p className="text-xs text-ink-secondary dark:text-dark-secondary">
                Consultez l'état de validation de vos derniers paiements et l'historique d'activation.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRequests}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </Button>
          </div>

          {paymentRequests.length === 0 ? (
            <Card className="p-8 text-center bg-white dark:bg-dark-card border border-border-subtle dark:border-dark-border">
              <Clock className="w-8 h-8 text-ink-secondary dark:text-dark-muted mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-forest dark:text-dark-text">
                Aucune demande de paiement en cours
              </p>
              <p className="text-[11px] text-ink-secondary dark:text-dark-muted mt-1 max-w-sm mx-auto">
                Lorsque vous effectuez un virement et soumettez votre reçu, le statut de traitement s'affichera ici en temps réel.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {paymentRequests.map(req => {
                const getStatusInfo = (status: PaymentVerificationStatus) => {
                  switch (status) {
                    case 'approved':
                      return {
                        variant: 'success' as const,
                        title: 'Paiement confirmé',
                        desc: 'Votre paiement a été confirmé et votre abonnement est activé.',
                        icon: CheckCircle2
                      };
                    case 'under_review':
                      return {
                        variant: 'warning' as const,
                        title: 'En cours de vérification',
                        desc: "Votre justificatif a été reçu. Votre paiement doit être vérifié avant l'activation de l'abonnement.",
                        icon: Clock
                      };
                    case 'rejected':
                      return {
                        variant: 'error' as const,
                        title: 'Paiement refusé',
                        desc: "Votre paiement n'a pas pu être confirmé. Consultez le motif indiqué et contactez-nous si nécessaire.",
                        icon: XCircle
                      };
                    default:
                      return {
                        variant: 'neutral' as const,
                        title: 'En attente de paiement',
                        desc: 'Effectuez le paiement en utilisant les informations fournies.',
                        icon: Clock
                      };
                  }
                };

                const statusInfo = getStatusInfo(req.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card
                    key={req.id}
                    className="p-4 bg-white dark:bg-dark-card border border-border-subtle dark:border-dark-border hover:border-forest/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle dark:border-dark-border">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center font-bold text-xs shrink-0">
                          {req.amount} DH
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-forest dark:text-dark-text capitalize">
                              Formule {req.plan} ({req.billingPeriod === 'annual' ? 'Annuel' : 'Mensuel'})
                            </span>
                            <Badge variant={statusInfo.variant} size="sm">
                              {statusInfo.title}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-ink-secondary dark:text-dark-muted">
                            Mode : <strong className="text-forest dark:text-gold">{getMethodDisplayName(req.paymentMethod)}</strong> • Réf : <strong className="font-mono">{req.transactionReference}</strong> • {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {req.receiptUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingReceiptUrl(req.receiptUrl!)}
                            className="text-xs h-7 px-2.5 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Voir le reçu</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex items-start gap-2 text-xs">
                      <StatusIcon className={`w-4 h-4 shrink-0 mt-0.5 ${
                        req.status === 'approved' ? 'text-status-success' : req.status === 'rejected' ? 'text-status-error' : 'text-amber-500'
                      }`} />
                      <div className="space-y-0.5">
                        <p className="text-ink-secondary dark:text-dark-secondary">
                          {statusInfo.desc}
                        </p>
                        {req.rejectionReason && (
                          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-[11px] font-semibold mt-1">
                            Motif du refus : {req.rejectionReason}
                          </div>
                        )}
                        {req.verifiedBy && (
                          <p className="text-[10px] text-ink-secondary dark:text-dark-muted">
                            Vérifié par {req.verifiedBy} le {req.verifiedAt ? new Date(req.verifiedAt).toLocaleDateString('fr-FR') : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. ADMINISTRATIVE PAYMENT VERIFICATION PANEL (ONLY FOR ADMINS / TEST MODE) */}
        {showAdminSection && (
          <div className="space-y-4 pt-6 border-t-2 border-purple-200 dark:border-purple-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                  <h2 className="text-lg sm:text-xl font-bold text-purple-950 dark:text-purple-200 font-display">
                    Espace Administrateur — Vérification des paiements
                  </h2>
                </div>
                <p className="text-xs text-ink-secondary dark:text-dark-secondary mt-0.5">
                  Vérification financière des virements bancaires et activations sécurisées d'abonnements.
                </p>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                {(['all', 'under_review', 'approved', 'rejected'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setAdminFilter(tab)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      adminFilter === tab
                        ? 'bg-purple-700 text-white'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200'
                    }`}
                  >
                    {tab === 'all' && 'Tous'}
                    {tab === 'under_review' && 'À vérifier'}
                    {tab === 'approved' && 'Validés'}
                    {tab === 'rejected' && 'Refusés'}
                  </button>
                ))}
              </div>
            </div>

            {filteredAdminRequests.length === 0 ? (
              <Card className="p-6 text-center bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50">
                <p className="text-xs text-purple-900 dark:text-purple-300 font-semibold">
                  Aucune demande trouvée avec ce filtre.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredAdminRequests.map(req => (
                  <Card
                    key={req.id}
                    className="p-4 bg-white dark:bg-dark-card border border-purple-200 dark:border-purple-900/40 shadow-xs"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-forest dark:text-dark-text">
                            {req.restaurantName || req.restaurantId}
                          </span>
                          <span className="text-xs text-ink-secondary dark:text-dark-muted">• {req.userName}</span>
                          <Badge
                            variant={
                              req.status === 'approved'
                                ? 'success'
                                : req.status === 'rejected'
                                ? 'error'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {req.status === 'approved' ? 'Validé' : req.status === 'rejected' ? 'Refusé' : 'À vérifier'}
                          </Badge>
                        </div>

                        <div className="text-xs text-ink-secondary dark:text-dark-secondary flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span>Formule : <strong>{req.plan.toUpperCase()}</strong></span>
                          <span>•</span>
                          <span>Montant : <strong className="text-forest dark:text-gold">{req.amount} MAD</strong></span>
                          <span>•</span>
                          <span>Méthode : <strong className="capitalize text-forest dark:text-gold">{getMethodDisplayName(req.paymentMethod)}</strong></span>
                          <span>•</span>
                          <span>Réf : <strong className="font-mono text-ink-main dark:text-dark-text">{req.transactionReference}</strong></span>
                        </div>

                        {req.payerName && (
                          <p className="text-[11px] text-ink-secondary dark:text-dark-muted">
                            Émetteur déclaré : {req.payerName} {req.payerPhone ? `(${req.payerPhone})` : ''}
                          </p>
                        )}
                        {req.notes && (
                          <p className="text-[11px] italic text-ink-secondary dark:text-dark-muted">
                            Note client : "{req.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                        {req.receiptUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingReceiptUrl(req.receiptUrl!)}
                            className="text-xs h-8 px-2.5 flex items-center gap-1 border-purple-300"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Voir le reçu</span>
                          </Button>
                        )}

                        {req.status !== 'approved' && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isProcessingAdminAction}
                            onClick={() => handleAdminApprove(req)}
                            className="text-xs h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approuver le paiement</span>
                          </Button>
                        )}

                        {req.status !== 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isProcessingAdminAction}
                            onClick={() => {
                              setRejectingRequestId(req.id);
                              setRejectionReason('');
                            }}
                            className="text-xs h-8 px-3 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Refuser</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: QR Code Zoom */}
        <Modal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title={qrModalInfo?.title || "Scanner le QR Code"}
          description={qrModalInfo?.subtitle || "Présentez ce QR Code dans votre application bancaire mobile"}
        >
          {qrModalInfo && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-white rounded-2xl border-2 border-forest/20 max-w-sm mx-auto shadow-md">
                <img
                  src={qrModalInfo.image}
                  alt={qrModalInfo.title}
                  className="w-72 h-72 object-contain mx-auto"
                />
              </div>
              <p className="text-xs text-ink-secondary dark:text-dark-muted">
                Ouvrez votre application bancaire (CIH Mobile ou Attijari SmartPay) et utilisez la fonction "Scanner un QR Code de paiement".
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <a
                  href={qrModalInfo.image}
                  download="sofraflow-payment-qr.jpg"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest-light transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger l'image</span>
                </a>
                <Button variant="outline" size="sm" onClick={() => setIsQrModalOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* MODAL: Secure Receipt Viewer */}
        <Modal
          isOpen={!!viewingReceiptUrl}
          onClose={() => setViewingReceiptUrl(null)}
          title="Justificatif de virement bancaire"
          description="Visualisation sécurisée du reçu transmis par le client"
        >
          {viewingReceiptUrl && (
            <div className="space-y-4 text-center">
              <div className="max-h-[60vh] overflow-auto p-2 bg-black/5 dark:bg-white/5 rounded-2xl border border-border-subtle">
                <img
                  src={viewingReceiptUrl}
                  alt="Justificatif de virement"
                  className="max-w-full h-auto mx-auto rounded-lg shadow-xs"
                />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setViewingReceiptUrl(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* MODAL: Admin Rejection with Reason */}
        <Modal
          isOpen={!!rejectingRequestId}
          onClose={() => setRejectingRequestId(null)}
          title="Refuser la demande de paiement"
          description="Indiquez au client le motif du refus afin qu'il puisse corriger son règlement."
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-forest dark:text-dark-text block">
                Motif du refus (visible par le client) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Ex: Virement non réceptionné sur le compte, montant incomplet, ou référence introuvable."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-surface text-xs text-ink-main dark:text-dark-text focus:outline-hidden focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle dark:border-dark-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingRequestId(null)}
                disabled={isProcessingAdminAction}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAdminRejectSubmit}
                disabled={isProcessingAdminAction || !rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {isProcessingAdminAction ? 'Traitement...' : 'Confirmer le refus'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
