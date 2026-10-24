import React, { useState, useEffect } from 'react';
import { Check, Globe } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { NoActiveRestaurantCard } from '../../components/common/NoActiveRestaurantCard';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Product } from '../../types';

export const LanguagesPage: React.FC = () => {
  const { activeRestaurant } = useAuth();
  const { language, t } = useLanguage();
  const isEn = language === 'en';
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadProducts = async () => {
    if (!activeRestaurant) {
      setProducts([]);
      return;
    }
    if (isSupabaseConfigured) {
      try {
        const remoteProds = await supabaseService.getProductsForRestaurant(activeRestaurant.id);
        setProducts(remoteProds);
        if (remoteProds.length > 0 && !selectedProductId) {
          setSelectedProductId(remoteProds[0].id);
        }
      } catch (e) {
        console.warn('[LanguagesPage] Supabase error:', e);
        setProducts([]);
      }
    } else {
      const prods = db.getProducts(activeRestaurant.id);
      setProducts(prods);
      if (prods.length > 0 && !selectedProductId) {
        setSelectedProductId(prods[0].id);
      }
    }
  };

  useEffect(() => {
    loadProducts();
    const unsub = db.subscribe(loadProducts);
    return () => unsub();
  }, [activeRestaurant]);

  if (!activeRestaurant) {
    return (
      <DashboardLayout>
        <NoActiveRestaurantCard
          icon={<Globe className="w-8 h-8" />}
          title={isEn ? 'No active establishment' : 'Aucun établissement actif'}
          description={
            isEn
              ? 'Please select or create your establishment to manage menu languages and translations.'
              : 'Veuillez sélectionner ou créer votre établissement pour configurer vos langues et traductions.'
          }
        />
      </DashboardLayout>
    );
  }

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handleUpdateCurrentProduct = async (field: 'name' | 'description', lang: 'en' | 'fr' | 'ar', value: string) => {
    if (!currentProduct || !activeRestaurant) return;
    const updated: Product = {
      ...currentProduct,
      [field]: {
        ...currentProduct[field],
        [lang]: value
      }
    };
    if (isSupabaseConfigured) {
      try {
        await supabaseService.updateProduct(activeRestaurant.id, updated);
      } catch (err) {
        console.warn('[LanguagesPage] Remote update product warning:', err);
      }
    }
    db.updateProduct(updated);
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Language completion stats
  const totalItems = products.length;
  const englishCompleted = products.filter(p => p.name.en?.trim()).length;
  const frenchCompleted = products.filter(p => p.name.fr?.trim()).length;
  const arabicCompleted = products.filter(p => p.name.ar?.trim()).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
            {t('languages.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
            {t('languages.pageSubtitle')}
          </p>
        </div>

        {/* Translation Completion Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 space-y-2 border-forest/20 dark:border-[#233831]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-forest dark:text-gold">{t('languages.french')}</span>
              <Badge variant="forest">{Math.round((frenchCompleted / totalItems) * 100)}%</Badge>
            </div>
            <div className="w-full bg-ivory dark:bg-[#152520] rounded-full h-2 overflow-hidden border border-border-subtle dark:border-[#233831]">
              <div
                className="bg-forest dark:bg-gold h-full rounded-full transition-all"
                style={{ width: `${(frenchCompleted / totalItems) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0]">
              {t('languages.dishesTranslated', { count: frenchCompleted, total: totalItems })}
            </p>
          </Card>

          <Card className="p-4 space-y-2 border-forest/20 dark:border-[#233831]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-forest dark:text-gold">{t('languages.english')}</span>
              <Badge variant="forest">{Math.round((englishCompleted / totalItems) * 100)}%</Badge>
            </div>
            <div className="w-full bg-ivory dark:bg-[#152520] rounded-full h-2 overflow-hidden border border-border-subtle dark:border-[#233831]">
              <div
                className="bg-forest dark:bg-gold h-full rounded-full transition-all"
                style={{ width: `${(englishCompleted / totalItems) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0]">
              {t('languages.dishesTranslated', { count: englishCompleted, total: totalItems })}
            </p>
          </Card>

          <Card className="p-4 space-y-2 border-forest/20 dark:border-[#233831]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-forest dark:text-gold font-arabic">{t('languages.arabic')}</span>
              <Badge variant="forest">{Math.round((arabicCompleted / totalItems) * 100)}%</Badge>
            </div>
            <div className="w-full bg-ivory dark:bg-[#152520] rounded-full h-2 overflow-hidden border border-border-subtle dark:border-[#233831]">
              <div
                className="bg-forest dark:bg-gold h-full rounded-full transition-all"
                style={{ width: `${(arabicCompleted / totalItems) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0]">
              {t('languages.dishesTranslated', { count: arabicCompleted, total: totalItems })}
            </p>
          </Card>
        </div>

        {/* Translation Studio Workspace */}
        {currentProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Dish Selector (4 cols) */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-bold text-ink-secondary dark:text-[#97A7A0] uppercase tracking-wider block mb-1">
                {t('languages.selectDishTitle')}
              </span>
              <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`w-full p-3 rounded-2xl text-left transition-all border flex items-center justify-between ${
                      p.id === currentProduct.id
                        ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark border-forest dark:border-gold shadow-soft'
                        : 'bg-white dark:bg-[#14241F] text-ink-main dark:text-[#F0F4F2] border-border-subtle dark:border-[#233831] hover:bg-ivory dark:hover:bg-[#1B2F29]'
                    }`}
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="text-xs font-bold truncate">{t(p.name)}</p>
                      <p className={`text-[10px] truncate ${p.id === currentProduct.id ? 'text-white/70 dark:text-forest-dark/80' : 'text-ink-secondary dark:text-[#97A7A0]'}`}>
                        {p.name.ar || (isEn ? 'Arabic missing' : 'Arabe manquant')}
                      </p>
                    </div>
                    {p.name.ar ? (
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${p.id === currentProduct.id ? 'text-gold dark:text-forest-dark' : 'text-status-success'}`} />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title={isEn ? 'Arabic missing' : 'Arabe manquant'} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Trilingual Editor Columns (8 cols) */}
            <div className="lg:col-span-8">
              <Card className="p-6 space-y-6 border border-border-subtle dark:border-[#233831]">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle dark:border-[#233831]">
                  <div>
                    <h3 className="font-bold text-base text-forest dark:text-[#F0F4F2] font-display">
                      {t(currentProduct.name)}
                    </h3>
                    <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                      {isEn ? 'Refine titles and descriptions across languages' : 'Perfectionnez les titres et descriptions'}
                    </p>
                  </div>
                  {savedSuccess && (
                    <Badge variant="success">{t('languages.savedNotice')}</Badge>
                  )}
                </div>

                {/* French Column */}
                <div className="space-y-3 p-4 bg-ivory/50 dark:bg-[#152520] rounded-2xl border border-border-subtle dark:border-[#233831]">
                  <span className="text-xs font-bold text-forest dark:text-gold uppercase tracking-wider">
                    {t('languages.french')}
                  </span>
                  <div>
                    <label className="text-[11px] text-ink-secondary dark:text-[#97A7A0] block mb-1">{t('languages.nameFr')}</label>
                    <input
                      type="text"
                      value={currentProduct.name.fr || ''}
                      onChange={(e) => handleUpdateCurrentProduct('name', 'fr', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-ink-secondary dark:text-[#97A7A0] block mb-1">{t('languages.descFr')}</label>
                    <textarea
                      rows={2}
                      value={currentProduct.description.fr || ''}
                      onChange={(e) => handleUpdateCurrentProduct('description', 'fr', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                    />
                  </div>
                </div>

                {/* English Column */}
                <div className="space-y-3 p-4 bg-ivory/50 dark:bg-[#152520] rounded-2xl border border-border-subtle dark:border-[#233831]">
                  <span className="text-xs font-bold text-forest dark:text-gold uppercase tracking-wider">
                    {t('languages.english')}
                  </span>
                  <div>
                    <label className="text-[11px] text-ink-secondary dark:text-[#97A7A0] block mb-1">{t('languages.nameEn')}</label>
                    <input
                      type="text"
                      value={currentProduct.name.en || ''}
                      onChange={(e) => handleUpdateCurrentProduct('name', 'en', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-ink-secondary dark:text-[#97A7A0] block mb-1">{t('languages.descEn')}</label>
                    <textarea
                      rows={2}
                      value={currentProduct.description.en || ''}
                      onChange={(e) => handleUpdateCurrentProduct('description', 'en', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                    />
                  </div>
                </div>

                {/* Arabic Column (RTL) */}
                <div className="space-y-3 p-4 bg-amber-50/40 dark:bg-[#2B2310]/30 rounded-2xl border border-amber-200 dark:border-amber-800/40" dir="rtl">
                  <span className="text-xs font-bold text-forest dark:text-[#FBBF24] uppercase tracking-wider font-arabic">
                    {t('languages.arabic')}
                  </span>
                  <div>
                    <label className="text-[11px] text-ink-secondary dark:text-[#97A7A0] block mb-1 font-arabic">{t('languages.nameAr')}</label>
                    <input
                      type="text"
                      value={currentProduct.name.ar || ''}
                      onChange={(e) => handleUpdateCurrentProduct('name', 'ar', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs text-right font-arabic focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                      placeholder="أدخل الاسم بالعربية..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-ink-secondary dark:text-[#97A7A0] block mb-1 font-arabic">{t('languages.descAr')}</label>
                    <textarea
                      rows={2}
                      value={currentProduct.description.ar || ''}
                      onChange={(e) => handleUpdateCurrentProduct('description', 'ar', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs text-right font-arabic focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                      placeholder="أدخل الوصف بالعربية..."
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
