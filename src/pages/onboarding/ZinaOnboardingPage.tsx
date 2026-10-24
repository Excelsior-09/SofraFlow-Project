import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Store,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Target,
  CheckCircle2,
  Edit2,
  UtensilsCrossed,
  Coffee,
  Sandwich,
  Cake,
  HelpCircle,
  Check,
  Building,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Logo } from '../../components/common/Logo';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeSwitcher } from '../../components/common/ThemeSwitcher';
import { SEO } from '../../components/common/SEO';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { BusinessSector, ZinaOnboardingState } from '../../types';
import { isValidPhoneNumber } from '../../utils/phoneValidation';

export const ZinaOnboardingPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, user, createBusiness, updateUserProfile } = useAuth();
  const isEn = language === 'en';
  const navigate = useNavigate();
  const hasCreatedBusinessRef = useRef(false);

  // Typed Onboarding State
  const [formData, setFormData] = useState<ZinaOnboardingState>({
    currentStep: 1,
    restaurantName: '',
    managerName: '',
    businessType: 'restaurant',
    customBusinessType: '',
    city: 'Casablanca',
    area: '',
    street: '',
    businessEmail: '',
    whatsappPhone: '',
    preferredLanguage: language,
    goals: ['digitize', 'qr_order', 'upsell'],
    isCompleted: false
  });

  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBusinessRecord, setCreatedBusinessRecord] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Step 9 Inline Editing States
  type EditableSection = 'restaurant' | 'manager' | 'location' | 'contact' | null;
  const [editingSection, setEditingSection] = useState<EditableSection>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);

  const [draftRestaurant, setDraftRestaurant] = useState<{
    restaurantName: string;
    businessType: BusinessSector;
    customBusinessType: string;
  }>({
    restaurantName: '',
    businessType: 'restaurant',
    customBusinessType: ''
  });

  const [draftManager, setDraftManager] = useState<{
    managerName: string;
  }>({ managerName: '' });

  const [draftLocation, setDraftLocation] = useState<{
    city: string;
    area: string;
    street: string;
  }>({ city: '', area: '', street: '' });

  const [draftContact, setDraftContact] = useState<{
    whatsappPhone: string;
    businessEmail: string;
  }>({ whatsappPhone: '', businessEmail: '' });

  const startEditSection = (section: EditableSection) => {
    setSectionError(null);
    setValidationError(null);
    if (section === 'restaurant') {
      setDraftRestaurant({
        restaurantName: formData.restaurantName,
        businessType: formData.businessType,
        customBusinessType: formData.customBusinessType || ''
      });
    } else if (section === 'manager') {
      setDraftManager({
        managerName: formData.managerName
      });
    } else if (section === 'location') {
      setDraftLocation({
        city: formData.city,
        area: formData.area || '',
        street: formData.street || ''
      });
    } else if (section === 'contact') {
      setDraftContact({
        whatsappPhone: formData.whatsappPhone,
        businessEmail: formData.businessEmail || ''
      });
    }
    setEditingSection(section);
  };

  const cancelEditSection = () => {
    setEditingSection(null);
    setSectionError(null);
  };

  const saveEditRestaurant = () => {
    if (!draftRestaurant.restaurantName.trim()) {
      setSectionError(isEn ? 'Please enter your establishment name.' : 'Veuillez saisir le nom de l’établissement.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      restaurantName: draftRestaurant.restaurantName.trim(),
      businessType: draftRestaurant.businessType,
      customBusinessType: draftRestaurant.customBusinessType.trim()
    }));
    setEditingSection(null);
    setSectionError(null);
  };

  const saveEditManager = () => {
    if (!draftManager.managerName.trim()) {
      setSectionError(isEn ? 'Please enter your name.' : 'Veuillez indiquer votre prénom ou nom.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      managerName: draftManager.managerName.trim()
    }));
    setEditingSection(null);
    setSectionError(null);
  };

  const saveEditLocation = () => {
    if (!draftLocation.city.trim()) {
      setSectionError(isEn ? 'Please enter the city.' : 'Veuillez indiquer la ville.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      city: draftLocation.city.trim(),
      area: draftLocation.area.trim(),
      street: draftLocation.street.trim()
    }));
    setEditingSection(null);
    setSectionError(null);
  };

  const saveEditContact = () => {
    const phone = draftContact.whatsappPhone.trim();
    if (!phone) {
      setSectionError(isEn ? 'Please provide a valid WhatsApp phone number.' : 'Veuillez indiquer un numéro WhatsApp valide.');
      return;
    }
    if (!isValidPhoneNumber(phone)) {
      setSectionError(isEn ? 'Invalid WhatsApp phone format (e.g. +212 600 000 000).' : 'Format de numéro WhatsApp invalide (ex. +212 600 000 000 ou 06 12 34 56 78).');
      return;
    }
    const email = draftContact.businessEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSectionError(isEn ? 'Please enter a valid establishment contact email address.' : 'Veuillez saisir une adresse e-mail de contact valide.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      whatsappPhone: phone,
      businessEmail: email
    }));
    setEditingSection(null);
    setSectionError(null);
  };

  // Synchronize language selection
  useEffect(() => {
    setFormData(prev => ({ ...prev, preferredLanguage: language }));
  }, [language]);

  const updateField = <K extends keyof ZinaOnboardingState>(field: K, value: ZinaOnboardingState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const handleNextStep = () => {
    setValidationError(null);

    // Step-by-step validations
    if (formData.currentStep === 2 && !formData.restaurantName.trim()) {
      setValidationError(isEn ? 'Please enter your establishment name to continue.' : 'Veuillez saisir le nom de votre établissement pour continuer.');
      return;
    }
    if (formData.currentStep === 3 && !formData.managerName.trim()) {
      setValidationError(isEn ? 'Please provide your name so Zina knows how to address you.' : 'Veuillez indiquer votre prénom ou nom afin que Zina puisse s’adresser à vous.');
      return;
    }
    if (formData.currentStep === 5 && !formData.city.trim()) {
      setValidationError(isEn ? 'Please enter the city where your establishment is located.' : 'Veuillez indiquer la ville où se situe votre établissement.');
      return;
    }
    if (formData.currentStep === 6 && !formData.whatsappPhone.trim()) {
      setValidationError(isEn ? 'Please provide a valid WhatsApp phone number for kitchen order dispatch.' : 'Veuillez indiquer un numéro WhatsApp valide pour la transmission des commandes.');
      return;
    }

    if (formData.currentStep === 9) {
      handleFinalSubmit();
      return;
    }

    if (formData.currentStep < 9) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setFormData(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
      }, 300);
    }
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setValidationError(null);

    if (!formData.restaurantName.trim()) {
      setValidationError(isEn ? 'Please enter your establishment name.' : 'Veuillez saisir le nom de votre établissement.');
      jumpToStep(2);
      return;
    }
    if (!formData.city.trim()) {
      setValidationError(isEn ? 'Please enter the city.' : 'Veuillez indiquer la ville.');
      jumpToStep(5);
      return;
    }
    if (!formData.whatsappPhone.trim()) {
      setValidationError(isEn ? 'Please provide a valid WhatsApp phone number.' : 'Veuillez indiquer un numéro WhatsApp valide.');
      jumpToStep(6);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isAuthenticated && user) {
        // Sync owner manager name if provided and modified
        if (formData.managerName.trim() && formData.managerName.trim() !== user.fullName) {
          try {
            await updateUserProfile({ fullName: formData.managerName.trim() });
          } catch (syncErr) {
            console.warn('[ZinaOnboarding] Failed to sync owner profile name:', syncErr);
          }
        }
        // Safe slug generation
        const baseSlug = formData.restaurantName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'mon-etablissement';

        const finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
        const fullAddress = [formData.street, formData.area, formData.city].filter(Boolean).join(', ');

        const res = await createBusiness({
          name: formData.restaurantName.trim(),
          slug: finalSlug,
          phone: formData.whatsappPhone.trim(),
          city: formData.city.trim(),
          address: fullAddress,
          businessType: formData.businessType === 'other' ? (formData.customBusinessType || 'restaurant') : formData.businessType,
          contactEmail: formData.businessEmail.trim() || user.email || undefined,
          description: `Establishment: ${formData.restaurantName}. Type: ${formData.businessType}. Manager: ${formData.managerName || 'Owner'}.`
        });

        if (!res) {
          throw new Error(isEn ? 'Failed to create establishment in database. Please verify your connection and try again.' : 'Échec de la création de l’établissement dans la base de données. Veuillez réessayer.');
        }

        setCreatedBusinessRecord(res);
      }

      // Explicitly advance to celebration step after successful database save
      setFormData(prev => ({ ...prev, currentStep: 10, isCompleted: true }));

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch (err: any) {
      console.error('[ZinaOnboarding] Persistence error:', err);
      const msg = err?.message || (isEn ? 'Failed to persist establishment. Please try again.' : 'Échec de l’enregistrement de votre établissement. Veuillez réessayer.');
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevStep = () => {
    if (formData.currentStep > 1) {
      setValidationError(null);
      setFormData(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const jumpToStep = (stepNumber: number) => {
    setFormData(prev => ({ ...prev, currentStep: stepNumber }));
  };

  const toggleGoal = (goalKey: string) => {
    setFormData(prev => {
      const exists = prev.goals.includes(goalKey);
      const updated = exists ? prev.goals.filter(g => g !== goalKey) : [...prev.goals, goalKey];
      return { ...prev, goals: updated };
    });
  };

  // Business sector cards list
  const businessSectors: Array<{ id: BusinessSector; label: string; icon: React.ReactNode }> = [
    { id: 'restaurant', label: t('zina.step4.types.restaurant'), icon: <UtensilsCrossed className="w-5 h-5 text-brand-orange" /> },
    { id: 'cafe', label: t('zina.step4.types.cafe'), icon: <Coffee className="w-5 h-5 text-amber-600" /> },
    { id: 'snack', label: t('zina.step4.types.snack'), icon: <Sandwich className="w-5 h-5 text-red-500" /> },
    { id: 'bakery', label: t('zina.step4.types.bakery'), icon: <Cake className="w-5 h-5 text-yellow-600" /> },
    { id: 'other', label: t('zina.step4.types.other'), icon: <Store className="w-5 h-5 text-blue-500" /> }
  ];

  // Business goals options
  const goalOptions = [
    { key: 'digitize', label: t('zina.step8.goals.digitize') },
    { key: 'qr_order', label: t('zina.step8.goals.qr_order') },
    { key: 'upsell', label: t('zina.step8.goals.upsell') },
    { key: 'analytics', label: t('zina.step8.goals.analytics') },
    { key: 'margins', label: t('zina.step8.goals.margins') },
    { key: 'reviews', label: t('zina.step8.goals.reviews') }
  ];

  const totalSteps = 10;
  const progressPercent = Math.round((formData.currentStep / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-ivory dark:bg-dark-page text-ink-main dark:text-dark-text flex flex-col font-sans transition-colors duration-200">
      <SEO
        title={`${t('zina.badge')} | SofraFlow`}
        description={isEn ? "Conversational setup assistant for Moroccan restaurants and cafes." : "Assistante de configuration conversationnelle pour restaurants et cafés au Maroc."}
        noindex={true}
      />

      {/* Top Header */}
      <header className="h-18 px-4 sm:px-8 border-b border-border-subtle dark:border-dark-border bg-white/80 dark:bg-dark-card/80 backdrop-blur-md flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Logo showTagline={false} size="sm" />
          </Link>
          <span className="hidden sm:inline-block w-px h-5 bg-border-subtle dark:bg-dark-border mx-1" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/40 text-brand-orange text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('zina.badge')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher compact={true} />
          <LanguageSelector variant="compact" />
          <Link
            to="/"
            className="text-xs text-ink-secondary dark:text-dark-secondary hover:text-brand-orange ml-2"
          >
            {isEn ? 'Exit' : 'Quitter'}
          </Link>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full bg-border-subtle dark:bg-dark-border h-1.5">
        <div
          className="bg-gradient-to-r from-brand-orange via-amber-500 to-emerald-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Conversational Layout */}
      <main className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Step Counter & Back action */}
        <div className="flex items-center justify-between mb-4 text-xs font-semibold text-ink-secondary dark:text-dark-muted">
          <div className="flex items-center gap-2">
            {formData.currentStep > 1 && formData.currentStep < 10 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-dark-card border border-border-subtle dark:border-dark-border text-ink-main dark:text-dark-text hover:text-brand-orange transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('zina.backBtn')}</span>
              </button>
            )}
            <span>{t('zina.stepCounter', { current: formData.currentStep, total: totalSteps })}</span>
          </div>

          {/* Skip for optional steps */}
          {(formData.currentStep === 5 || formData.currentStep === 8) && (
            <button
              type="button"
              onClick={handleNextStep}
              className="text-xs text-ink-secondary hover:text-brand-orange underline"
            >
              {t('zina.skipBtn')}
            </button>
          )}
        </div>

        {/* Assistant Chat Card */}
        <div className="bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-8 border border-border-subtle dark:border-dark-border shadow-card dark:shadow-none space-y-6 animate-in fade-in duration-200">
          
          {/* Zina Avatar Header */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-orange-500/20">
                Z
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-dark-card flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-brand-navy dark:text-dark-text">Zina</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-brand-orange">
                  SofraFlow AI
                </span>
              </div>
              <p className="text-xs text-ink-secondary dark:text-dark-muted">
                {t('zina.subtitle')}
              </p>
            </div>
          </div>

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-ivory dark:bg-dark-surface w-24">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-bounce [animation-delay:0.3s]" />
            </div>
          )}

          {/* STEP 1: Welcome */}
          {formData.currentStep === 1 && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-ivory dark:bg-dark-surface border border-border-subtle dark:border-dark-border">
                <h3 className="text-lg sm:text-xl font-extrabold text-brand-navy dark:text-dark-text font-display mb-2">
                  {t('zina.step1.title')}
                </h3>
                <p className="text-sm text-ink-secondary dark:text-dark-secondary leading-relaxed">
                  {t('zina.step1.message')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 text-ink-secondary dark:text-dark-secondary">
                  <span className="font-bold text-brand-orange block mb-1">1. {isEn ? 'Personalized' : 'Personnalisé'}</span>
                  {isEn ? 'Tailored to Moroccan dining & cafes' : 'Adapté aux habitudes de restauration au Maroc'}
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-ink-secondary dark:text-dark-secondary">
                  <span className="font-bold text-amber-600 block mb-1">2. {isEn ? 'Effortless' : 'Sans friction'}</span>
                  {isEn ? 'Quick conversational questions' : 'Questions simples et directes'}
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-ink-secondary dark:text-dark-secondary">
                  <span className="font-bold text-emerald-600 block mb-1">3. {isEn ? 'Zero Commitment' : 'Sans engagement'}</span>
                  {isEn ? 'Free trial, no credit card needed' : 'Essai gratuit sans carte bancaire'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-4 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-extrabold text-sm shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
              >
                <span>{t('zina.step1.cta')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Restaurant Name */}
          {formData.currentStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-brand-navy dark:text-dark-text">
                  {t('zina.step2.question')}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-dark-muted">
                  {t('zina.step2.subtitle')}
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={formData.restaurantName}
                  onChange={(e) => updateField('restaurantName', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                  placeholder={t('zina.step2.placeholder')}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface text-ink-main dark:text-dark-text font-bold text-base focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>

              {/* Dynamic Live Preview Card */}
              {formData.restaurantName.trim() && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-navy to-slate-900 text-white shadow-soft">
                  <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold mb-1">
                    <span>{t('zina.step2.previewBadge')}</span>
                    <span>sofraflow.com/m/{formData.restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}</span>
                  </div>
                  <h4 className="text-xl font-black font-display tracking-tight text-white">
                    {formData.restaurantName}
                  </h4>
                  <p className="text-xs text-white/70 mt-0.5">
                    {isEn ? 'Digital Menu & QR Table Ordering' : 'Menu Digital & Commande par QR Code'}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('zina.continueBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Manager Name */}
          {formData.currentStep === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-brand-navy dark:text-dark-text">
                  {t('zina.step3.question')}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-dark-muted">
                  {t('zina.step3.subtitle')}
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={formData.managerName}
                  onChange={(e) => updateField('managerName', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                  placeholder={t('zina.step3.placeholder')}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface text-ink-main dark:text-dark-text font-bold text-base focus:border-brand-orange focus:outline-none transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('zina.continueBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 4: Business Type */}
          {formData.currentStep === 4 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-brand-navy dark:text-dark-text">
                  {isEn ? `What type of venue is ${formData.restaurantName || 'your business'}?` : `Quel est le type d'établissement pour ${formData.restaurantName || 'votre activité'} ?`}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-dark-muted">
                  {t('zina.step4.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {businessSectors.map((sector) => {
                  const isSelected = formData.businessType === sector.id;
                  return (
                    <button
                      key={sector.id}
                      type="button"
                      onClick={() => updateField('businessType', sector.id)}
                      className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-brand-orange bg-orange-50/50 dark:bg-orange-950/30 text-brand-navy dark:text-dark-text shadow-sm'
                          : 'border-border-subtle dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-surface text-ink-secondary dark:text-dark-secondary'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-orange-100 dark:bg-orange-900/60' : 'bg-ivory dark:bg-dark-surface'}`}>
                        {sector.icon}
                      </div>
                      <span className="font-bold text-xs sm:text-sm">{sector.label}</span>
                    </button>
                  );
                })}
              </div>

              {formData.businessType === 'other' && (
                <input
                  type="text"
                  value={formData.customBusinessType || ''}
                  onChange={(e) => updateField('customBusinessType', e.target.value)}
                  placeholder={t('zina.step4.otherPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface text-xs focus:outline-none focus:border-brand-orange"
                />
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('zina.continueBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 5: Restaurant Address */}
          {formData.currentStep === 5 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-brand-navy dark:text-dark-text">
                  {t('zina.step5.question')}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-dark-muted">
                  {t('zina.step5.subtitle')}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-brand-navy dark:text-dark-text mb-1">
                    {t('zina.step5.cityLabel')} *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder={t('zina.step5.cityPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-brand-navy dark:text-dark-text mb-1">
                      {t('zina.step5.areaLabel')}
                    </label>
                    <input
                      type="text"
                      value={formData.area || ''}
                      onChange={(e) => updateField('area', e.target.value)}
                      placeholder={t('zina.step5.areaPlaceholder')}
                      className="w-full px-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy dark:text-dark-text mb-1">
                      {t('zina.step5.streetLabel')}
                    </label>
                    <input
                      type="text"
                      value={formData.street || ''}
                      onChange={(e) => updateField('street', e.target.value)}
                      placeholder={t('zina.step5.streetPlaceholder')}
                      className="w-full px-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('zina.continueBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 6: Contact Details */}
          {formData.currentStep === 6 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-brand-navy dark:text-dark-text">
                  {t('zina.step6.question')}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-dark-muted">
                  {t('zina.step6.subtitle')}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-brand-navy dark:text-dark-text mb-1">
                    {t('zina.step6.phoneLabel')} *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      autoFocus
                      value={formData.whatsappPhone}
                      onChange={(e) => updateField('whatsappPhone', e.target.value)}
                      placeholder={t('zina.step6.phonePlaceholder')}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                    />
                    <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3.5" />
                  </div>
                  <span className="text-[11px] text-ink-secondary dark:text-dark-muted mt-1 block">
                    {t('zina.step6.phoneHelp')}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-navy dark:text-dark-text mb-1">
                    {t('zina.step6.emailLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => updateField('businessEmail', e.target.value)}
                      placeholder={t('zina.step6.emailPlaceholder')}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                    />
                    <Mail className="w-4 h-4 text-ink-secondary absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('zina.continueBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 7: Language Preference */}
          {formData.currentStep === 7 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-brand-navy dark:text-dark-text">
                  {t('zina.step7.question')}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-dark-muted">
                  {t('zina.step7.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('fr');
                    updateField('preferredLanguage', 'fr');
                  }}
                  className={`p-5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                    language === 'fr'
                      ? 'border-brand-orange bg-orange-50/60 dark:bg-orange-950/40 text-brand-navy dark:text-dark-text shadow-sm'
                      : 'border-border-subtle dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-surface'
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-sm text-brand-navy dark:text-dark-text">{t('zina.step7.frOption')}</h4>
                    <p className="text-xs text-ink-secondary dark:text-dark-muted mt-0.5">Interface & notifications en français</p>
                  </div>
                  {language === 'fr' && <Check className="w-5 h-5 text-brand-orange" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    updateField('preferredLanguage', 'en');
                  }}
                  className={`p-5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                    language === 'en'
                      ? 'border-brand-orange bg-orange-50/60 dark:bg-orange-950/40 text-brand-navy dark:text-dark-text shadow-sm'
                      : 'border-border-subtle dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-surface'
                  }`}
                >
                  <div>
                    <h4 className="font-extrabold text-sm text-brand-navy dark:text-dark-text">{t('zina.step7.enOption')}</h4>
                    <p className="text-xs text-ink-secondary dark:text-dark-muted mt-0.5">English interface & ordering</p>
                  </div>
                  {language === 'en' && <Check className="w-5 h-5 text-brand-orange" />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('zina.continueBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 8: Business Goals */}
          {formData.currentStep === 8 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-brand-navy dark:text-dark-text">
                  {t('zina.step8.question')}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-dark-muted">
                  {t('zina.step8.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {goalOptions.map((opt) => {
                  const isChecked = formData.goals.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => toggleGoal(opt.key)}
                      className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                        isChecked
                          ? 'border-brand-orange bg-orange-50/60 dark:bg-orange-950/40 text-brand-navy dark:text-dark-text'
                          : 'border-border-subtle dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-surface text-ink-secondary dark:text-dark-secondary'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        isChecked ? 'bg-brand-orange text-white' : 'border border-gray-300 dark:border-dark-border'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-semibold leading-snug">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3.5 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('zina.continueBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 9: Summary & Confirmation */}
          {formData.currentStep === 9 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-brand-navy dark:text-dark-text">
                  {t('zina.step9.title')}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-dark-muted">
                  {t('zina.step9.subtitle')}
                </p>
              </div>

              <div className="space-y-4 divide-y divide-border-subtle dark:divide-dark-border">
                {/* 1. Restaurant Section */}
                <div className="pt-2">
                  {editingSection === 'restaurant' ? (
                    <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-brand-orange/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-orange uppercase tracking-wider flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5" />
                          {t('zina.step9.restaurantCard')}
                        </span>
                        <button
                          type="button"
                          onClick={cancelEditSection}
                          className="text-ink-secondary dark:text-dark-muted hover:text-ink-main p-1"
                          title={isEn ? "Cancel" : "Annuler"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-ink-secondary dark:text-dark-muted mb-1">
                          {isEn ? "Establishment Name" : "Nom de l'établissement"} *
                        </label>
                        <input
                          type="text"
                          value={draftRestaurant.restaurantName}
                          onChange={(e) => setDraftRestaurant(prev => ({ ...prev, restaurantName: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text font-bold focus:ring-2 focus:ring-brand-orange"
                          placeholder={isEn ? "e.g. Café Atlas Artisan" : "ex: Café Atlas Artisan"}
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-ink-secondary dark:text-dark-muted mb-1">
                          {isEn ? "Activity Type" : "Type d'activité"}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {businessSectors.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setDraftRestaurant(prev => ({ ...prev, businessType: s.id }))}
                              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                                draftRestaurant.businessType === s.id
                                  ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                                  : 'bg-white dark:bg-dark-card border-border-subtle dark:border-dark-border text-ink-main dark:text-dark-text hover:border-brand-orange/50'
                              }`}
                            >
                              <span className="shrink-0">{s.icon}</span>
                              <span className="truncate">{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {draftRestaurant.businessType === 'other' && (
                        <div>
                          <label className="block text-[11px] font-bold text-ink-secondary dark:text-dark-muted mb-1">
                            {isEn ? "Specify Sector" : "Précisez votre secteur"}
                          </label>
                          <input
                            type="text"
                            value={draftRestaurant.customBusinessType}
                            onChange={(e) => setDraftRestaurant(prev => ({ ...prev, customBusinessType: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text font-medium focus:ring-2 focus:ring-brand-orange"
                            placeholder={isEn ? "e.g. Food Truck, Ice Cream Parlor..." : "ex: Food Truck, Glacier..."}
                          />
                        </div>
                      )}

                      {sectionError && (
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{sectionError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditSection}
                          className="px-3 py-1.5 rounded-xl border border-border-subtle dark:border-dark-border text-ink-secondary dark:text-dark-muted hover:bg-neutral-100 dark:hover:bg-dark-border text-xs font-bold"
                        >
                          {isEn ? "Cancel" : "Annuler"}
                        </button>
                        <button
                          type="button"
                          onClick={saveEditRestaurant}
                          className="px-4 py-1.5 rounded-xl bg-brand-orange hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isEn ? "Save" : "Enregistrer"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-ink-secondary dark:text-dark-muted uppercase tracking-wider text-[10px]">
                          {t('zina.step9.restaurantCard')}
                        </span>
                        <p className="font-bold text-brand-navy dark:text-dark-text text-sm">
                          {formData.restaurantName || '—'}
                        </p>
                        <p className="text-ink-secondary dark:text-dark-muted capitalize">
                          {businessSectors.find(s => s.id === formData.businessType)?.label || formData.businessType}
                          {formData.businessType === 'other' && formData.customBusinessType ? ` (${formData.customBusinessType})` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditSection('restaurant')}
                        className="p-1.5 rounded-lg text-brand-orange hover:bg-orange-50 dark:hover:bg-orange-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title={isEn ? "Edit restaurant details" : "Modifier l'établissement"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{t('zina.editStep')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Manager Section */}
                <div className="pt-3">
                  {editingSection === 'manager' ? (
                    <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-brand-orange/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-orange uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {t('zina.step9.managerCard')}
                        </span>
                        <button
                          type="button"
                          onClick={cancelEditSection}
                          className="text-ink-secondary dark:text-dark-muted hover:text-ink-main p-1"
                          title={isEn ? "Cancel" : "Annuler"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-ink-secondary dark:text-dark-muted mb-1">
                          {isEn ? "Owner / Manager Full Name" : "Nom & Prénom du Gérant / Propriétaire"} *
                        </label>
                        <input
                          type="text"
                          value={draftManager.managerName}
                          onChange={(e) => setDraftManager({ managerName: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text font-bold focus:ring-2 focus:ring-brand-orange"
                          placeholder={isEn ? "e.g. Youssef Bennani" : "ex: Youssef Bennani"}
                          autoFocus
                        />
                        <p className="text-[10px] text-ink-secondary dark:text-dark-muted mt-1">
                          {isEn
                            ? "This represents your personal account identity as establishment owner."
                            : "Ceci représente votre identité personnelle en tant que propriétaire du compte."}
                        </p>
                      </div>

                      {sectionError && (
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{sectionError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditSection}
                          className="px-3 py-1.5 rounded-xl border border-border-subtle dark:border-dark-border text-ink-secondary dark:text-dark-muted hover:bg-neutral-100 dark:hover:bg-dark-border text-xs font-bold"
                        >
                          {isEn ? "Cancel" : "Annuler"}
                        </button>
                        <button
                          type="button"
                          onClick={saveEditManager}
                          className="px-4 py-1.5 rounded-xl bg-brand-orange hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isEn ? "Save" : "Enregistrer"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-ink-secondary dark:text-dark-muted uppercase tracking-wider text-[10px]">
                          {t('zina.step9.managerCard')}
                        </span>
                        <p className="font-bold text-brand-navy dark:text-dark-text text-sm">
                          {formData.managerName || '—'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditSection('manager')}
                        className="p-1.5 rounded-lg text-brand-orange hover:bg-orange-50 dark:hover:bg-orange-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title={isEn ? "Edit manager name" : "Modifier le responsable"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{t('zina.editStep')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Location Section */}
                <div className="pt-3">
                  {editingSection === 'location' ? (
                    <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-brand-orange/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-orange uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {t('zina.step9.locationCard')}
                        </span>
                        <button
                          type="button"
                          onClick={cancelEditSection}
                          className="text-ink-secondary dark:text-dark-muted hover:text-ink-main p-1"
                          title={isEn ? "Cancel" : "Annuler"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-ink-secondary dark:text-dark-muted mb-1">
                            {isEn ? "City" : "Ville"} *
                          </label>
                          <input
                            type="text"
                            value={draftLocation.city}
                            onChange={(e) => setDraftLocation(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text font-bold focus:ring-2 focus:ring-brand-orange"
                            placeholder="Casablanca, Marrakech..."
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-ink-secondary dark:text-dark-muted mb-1">
                            {isEn ? "Neighborhood / Area" : "Quartier / Secteur"}
                          </label>
                          <input
                            type="text"
                            value={draftLocation.area}
                            onChange={(e) => setDraftLocation(prev => ({ ...prev, area: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text font-medium focus:ring-2 focus:ring-brand-orange"
                            placeholder="Maârif, Guéliz, Agdal..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-ink-secondary dark:text-dark-muted mb-1">
                          {isEn ? "Street Address" : "Adresse / Rue"}
                        </label>
                        <input
                          type="text"
                          value={draftLocation.street}
                          onChange={(e) => setDraftLocation(prev => ({ ...prev, street: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text font-medium focus:ring-2 focus:ring-brand-orange"
                          placeholder="12 Rue de la Liberté"
                        />
                      </div>

                      {sectionError && (
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{sectionError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditSection}
                          className="px-3 py-1.5 rounded-xl border border-border-subtle dark:border-dark-border text-ink-secondary dark:text-dark-muted hover:bg-neutral-100 dark:hover:bg-dark-border text-xs font-bold"
                        >
                          {isEn ? "Cancel" : "Annuler"}
                        </button>
                        <button
                          type="button"
                          onClick={saveEditLocation}
                          className="px-4 py-1.5 rounded-xl bg-brand-orange hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isEn ? "Save" : "Enregistrer"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-ink-secondary dark:text-dark-muted uppercase tracking-wider text-[10px]">
                          {t('zina.step9.locationCard')}
                        </span>
                        <p className="font-bold text-brand-navy dark:text-dark-text text-sm">
                          {formData.city} {formData.area ? `(${formData.area})` : ''}
                        </p>
                        {formData.street && <p className="text-ink-secondary dark:text-dark-muted">{formData.street}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditSection('location')}
                        className="p-1.5 rounded-lg text-brand-orange hover:bg-orange-50 dark:hover:bg-orange-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title={isEn ? "Edit location" : "Modifier l'adresse"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{t('zina.editStep')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Contact Section */}
                <div className="pt-3">
                  {editingSection === 'contact' ? (
                    <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-brand-orange/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-orange uppercase tracking-wider flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {t('zina.step9.contactCard')}
                        </span>
                        <button
                          type="button"
                          onClick={cancelEditSection}
                          className="text-ink-secondary dark:text-dark-muted hover:text-ink-main p-1"
                          title={isEn ? "Cancel" : "Annuler"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-ink-secondary dark:text-dark-muted mb-1">
                          {isEn ? "WhatsApp Phone Number (for order dispatch)" : "Numéro WhatsApp (transmission des commandes)"} *
                        </label>
                        <input
                          type="tel"
                          value={draftContact.whatsappPhone}
                          onChange={(e) => setDraftContact(prev => ({ ...prev, whatsappPhone: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text font-bold focus:ring-2 focus:ring-brand-orange font-mono"
                          placeholder="+212 600 000 000"
                          autoFocus
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-ink-secondary dark:text-dark-muted">
                            {isEn ? "Establishment Contact Email (Public)" : "E-mail de Contact de l'Établissement (Public)"}
                          </label>
                          <span className="text-[10px] text-brand-orange font-semibold">
                            {isEn ? "Public Contact" : "Contact Public"}
                          </span>
                        </div>
                        <input
                          type="email"
                          value={draftContact.businessEmail}
                          onChange={(e) => setDraftContact(prev => ({ ...prev, businessEmail: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card text-brand-navy dark:text-dark-text font-medium focus:ring-2 focus:ring-brand-orange"
                          placeholder="contact@votre-restaurant.ma"
                        />
                        <p className="text-[10px] text-ink-secondary dark:text-dark-muted mt-1">
                          {isEn
                            ? "Note: This email is displayed on customer receipts and menus. It does not alter your personal account login email."
                            : "Note : Cet e-mail est affiché sur les reçus clients et menus QR. Il ne modifie pas l'e-mail de connexion à votre compte personnel."}
                        </p>
                      </div>

                      {sectionError && (
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{sectionError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditSection}
                          className="px-3 py-1.5 rounded-xl border border-border-subtle dark:border-dark-border text-ink-secondary dark:text-dark-muted hover:bg-neutral-100 dark:hover:bg-dark-border text-xs font-bold"
                        >
                          {isEn ? "Cancel" : "Annuler"}
                        </button>
                        <button
                          type="button"
                          onClick={saveEditContact}
                          className="px-4 py-1.5 rounded-xl bg-brand-orange hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isEn ? "Save" : "Enregistrer"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-ink-secondary dark:text-dark-muted uppercase tracking-wider text-[10px]">
                          {t('zina.step9.contactCard')}
                        </span>
                        <p className="font-bold text-brand-navy dark:text-dark-text text-sm">
                          WhatsApp: {formData.whatsappPhone || '—'}
                        </p>
                        {formData.businessEmail && (
                          <p className="text-ink-secondary dark:text-dark-muted">{formData.businessEmail}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditSection('contact')}
                        className="p-1.5 rounded-lg text-brand-orange hover:bg-orange-50 dark:hover:bg-orange-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title={isEn ? "Edit contact details" : "Modifier les coordonnées"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{t('zina.editStep')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-brand-orange hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isEn ? 'Saving your establishment...' : 'Enregistrement de votre établissement...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('zina.confirmBtn')}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 10: Celebration Completion */}
          {formData.currentStep === 10 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-soft">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
                  {t('zina.step10.statusNotice')}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-dark-text font-display">
                  {t('zina.step10.congrats')}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary dark:text-dark-secondary max-w-lg mx-auto leading-relaxed">
                  {t('zina.step10.message', {
                    name: formData.managerName || 'Gérant',
                    restaurant: formData.restaurantName || 'Votre Établissement'
                  })}
                </p>
              </div>

              {/* Profile Card Preview */}
              <div className="p-4 rounded-2xl bg-ivory dark:bg-dark-surface border border-border-subtle dark:border-dark-border text-left max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-brand-navy dark:text-dark-text">{formData.restaurantName}</span>
                  <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[10px]">
                    {isEn ? 'Ready for Activation' : 'Prêt pour activation'}
                  </span>
                </div>
                <div className="text-[11px] text-ink-secondary dark:text-dark-muted space-y-0.5">
                  <p>{isEn ? 'Location:' : 'Localisation :'} {formData.city} {formData.area ? `(${formData.area})` : ''}</p>
                  <p>{isEn ? 'Kitchen WhatsApp:' : 'WhatsApp Cuisine :'} {formData.whatsappPhone}</p>
                  <p>{isEn ? 'Assigned Assistant:' : 'Assistante Dédiée :'} Zina by SofraFlow</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {isAuthenticated ? (
                  <Link
                    to="/app/overview"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{isEn ? 'Go to My Dashboard' : 'Accéder à mon tableau de bord'}</span>
                  </Link>
                ) : (
                  <a
                    href="/#demo"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-orange hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{t('zina.step10.exploreDemoBtn')}</span>
                  </a>
                )}

                <Link
                  to="/"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-dark-card border border-border-subtle dark:border-dark-border hover:bg-ivory dark:hover:bg-dark-surface text-ink-main dark:text-dark-text font-bold text-xs sm:text-sm transition-colors flex items-center justify-center"
                >
                  <span>{t('zina.step10.backHomeBtn')}</span>
                </Link>
              </div>
            </div>
          )}

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium animate-in fade-in">
              {validationError}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
