import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutTemplate,
  Eye,
  Check,
  Smartphone,
  Monitor,
  X,
  Search,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Store
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { NoActiveRestaurantCard } from '../../components/common/NoActiveRestaurantCard';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { MENU_TEMPLATES, MenuTemplateDefinition } from '../../data/menuTemplatesData';
import { SofraFlowTemplateRenderer } from '../../components/customer/SofraFlowTemplateRenderer';
import { FoodLanguageCode } from '../../types';

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeRestaurant } = useAuth();
  const { language, t } = useLanguage();
  const isEn = language === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<MenuTemplateDefinition | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [previewLocale, setPreviewLocale] = useState<FoodLanguageCode>(language as FoodLanguageCode);
  const [isApplying, setIsApplying] = useState(false);

  if (!activeRestaurant) {
    return (
      <DashboardLayout>
        <NoActiveRestaurantCard
          icon={<LayoutTemplate className="w-8 h-8" />}
          title={isEn ? 'No active establishment' : 'Aucun établissement actif'}
          description={
            isEn
              ? 'Please select or create your establishment to browse and apply digital menu templates.'
              : 'Veuillez sélectionner ou créer votre établissement pour parcourir et appliquer nos templates de menus.'
          }
        />
      </DashboardLayout>
    );
  }

  // Filter templates
  const filteredTemplates = MENU_TEMPLATES.filter(tpl => {
    const name = (tpl.name[language] || tpl.name.fr).toLowerCase();
    const desc = (tpl.description[language] || tpl.description.fr).toLowerCase();
    const intended = (tpl.intendedFor[language] || tpl.intendedFor.fr).toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || name.includes(query) || desc.includes(query) || intended.includes(query);
    return matchesSearch;
  });

  const handleApplyTemplate = async (template: MenuTemplateDefinition) => {
    setIsApplying(true);

    try {
      // 1. Create categories and products in the database from template sample dishes
      const createdCategoryIds: string[] = [];
      const createdProductIds: string[] = [];

      for (const [catIdx, catDef] of template.categories.entries()) {
        const cat = db.createCategory({
          restaurantId: activeRestaurant.id,
          name: {
            fr: catDef.name.fr || catDef.name.en,
            en: catDef.name.en || catDef.name.fr,
            ar: catDef.name.ar || ''
          },
          sortOrder: catIdx + 1
        });
        createdCategoryIds.push(cat.id);

        for (const [itemIdx, itemDef] of catDef.items.entries()) {
          const product = db.createProduct({
            restaurantId: activeRestaurant.id,
            categoryId: cat.id,
            name: {
              fr: itemDef.name.fr || itemDef.name.en,
              en: itemDef.name.en || itemDef.name.fr,
              ar: itemDef.name.ar || ''
            },
            description: {
              fr: itemDef.description.fr || itemDef.description.en,
              en: itemDef.description.en || itemDef.description.fr
            },
            price: itemDef.price,
            currency: 'MAD',
            imageUrl: itemDef.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
            isAvailable: true,
            dietaryTags: itemDef.dietary ? [itemDef.dietary as any] : [],
            verifiedIngredients: [],
            verifiedAllergens: [],
            optionGroups: [],
            sortOrder: itemIdx + 1
          });
          createdProductIds.push(product.id);
        }
      }

      // 2. Create the new Menu
      const menuTitle = isEn
        ? `${template.name.en} Draft`
        : `Carte ${template.name.fr}`;

      const generatedSlug = `${template.id.replace('template_', '')}-${Date.now().toString().slice(-4)}`;

      const newMenu = db.createMenu({
        restaurantId: activeRestaurant.id,
        name: menuTitle,
        description: template.tagline[language] || template.tagline.fr,
        slug: generatedSlug,
        status: 'draft',
        categoryIds: createdCategoryIds,
        productIds: createdProductIds,
        enabledLanguages: ['fr', 'en', 'ar'],
        isDefault: db.getMenus(activeRestaurant.id).length === 0
      });

      // 3. Persist to Supabase if configured
      if (isSupabaseConfigured) {
        try {
          await supabaseService.createMenu(activeRestaurant.id, {
            name: menuTitle,
            description: template.tagline[language] || template.tagline.fr,
            slug: generatedSlug,
            status: 'draft',
            is_default: false,
            enabled_languages: ['fr', 'en', 'ar']
          });

          for (const [catIdx, catDef] of template.categories.entries()) {
            const supaCat = await supabaseService.createCategory(activeRestaurant.id, {
              name: {
                fr: catDef.name.fr || catDef.name.en,
                en: catDef.name.en || catDef.name.fr,
                ar: catDef.name.ar || ''
              },
              sort_order: catIdx + 1
            });
            if (supaCat) {
              for (const [itemIdx, itemDef] of catDef.items.entries()) {
                await supabaseService.createProduct(activeRestaurant.id, {
                  category_id: supaCat.id,
                  name: {
                    fr: itemDef.name.fr || itemDef.name.en,
                    en: itemDef.name.en || itemDef.name.fr,
                    ar: itemDef.name.ar || ''
                  },
                  description: {
                    fr: itemDef.description.fr || itemDef.description.en,
                    en: itemDef.description.en || itemDef.description.fr
                  },
                  price: itemDef.price,
                  currency: 'MAD',
                  image_url: itemDef.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
                  is_available: true,
                  dietary_tags: itemDef.dietary ? [itemDef.dietary as any] : [],
                  sort_order: itemIdx + 1
                });
              }
            }
          }
        } catch (supaErr) {
          console.warn('[TemplatesPage] Supabase persistence error:', supaErr);
        }
      }

      // Navigate to the newly created menu editor
      navigate(`/app/menus/${newMenu.id}`);
    } catch (err) {
      console.error('Failed to apply template:', err);
      setIsApplying(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? '10 Handcrafted Hospitality Archetypes' : '10 Modèles Gastronomiques Prêts à l’Emploi'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
              {isEn ? 'Menu Template Gallery' : 'Galerie de Modèles de Menus'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1 max-w-2xl">
              {isEn
                ? 'Select and customize professional digital menu templates designed for Moroccan & Mediterranean hospitality.'
                : 'Choisissez et personnalisez des modèles de cartes digitales calibrés pour la restauration au Maroc et à l’international.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app/menus')}
              className="text-xs"
            >
              {isEn ? 'View My Menus' : 'Mes Cartes'}
            </Button>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-ink-secondary dark:text-[#97A7A0] pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search templates by style, cuisine or keyword...' : 'Rechercher par style, cuisine ou ambiance...'}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-ivory dark:bg-[#152520] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
            />
          </div>

          <div className="text-xs font-bold text-ink-secondary dark:text-[#97A7A0]">
            <span>{filteredTemplates.length} {isEn ? 'templates available' : 'modèles disponibles'}</span>
          </div>
        </div>

        {/* 10 Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => {
            const tplName = tpl.name[language] || tpl.name.fr;
            const tplDesc = tpl.description[language] || tpl.description.fr;
            const tplIntended = tpl.intendedFor[language] || tpl.intendedFor.fr;
            const tplBadge = tpl.badge[language] || tpl.badge.fr;

            return (
              <div
                key={tpl.id}
                className="rounded-3xl border border-border-subtle dark:border-[#233831] hover:border-[#EA580C] bg-white dark:bg-[#14241F] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition-all group"
              >
                <div>
                  {/* Thumbnail Cover */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={tpl.previewHeroImage}
                      alt={tplName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/95 dark:bg-black/85 text-forest dark:text-[#F0F4F2] shadow-sm backdrop-blur-sm">
                        {tplBadge}
                      </span>
                    </div>

                    {/* Color Swatch Dots */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 rounded-full bg-black/40 backdrop-blur-sm">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm"
                        style={{ backgroundColor: tpl.primaryColor }}
                        title="Primary Color"
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm"
                        style={{ backgroundColor: tpl.accentColor }}
                        title="Accent Color"
                      />
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-[11px] font-bold text-white/90 truncate">
                        {tplIntended}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2.5">
                    <h3 className="text-lg font-black font-display text-forest dark:text-[#F0F4F2] group-hover:text-[#EA580C] transition-colors">
                      {tplName}
                    </h3>
                    <p className="text-xs text-ink-secondary dark:text-[#97A7A0] leading-relaxed line-clamp-2">
                      {tplDesc}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-ink-secondary dark:text-[#97A7A0] border-t border-border-subtle/70 dark:border-[#233831]">
                      <span>{tpl.categories.length} {isEn ? 'categories' : 'rubriques'}</span>
                      <span>
                        {tpl.categories.reduce((sum, c) => sum + c.items.length, 0)} {isEn ? 'sample dishes' : 'plats types'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 pt-2 border-t border-border-subtle dark:border-[#233831] flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setPreviewTemplate(tpl);
                      setPreviewLocale(language as FoodLanguageCode);
                    }}
                    className="flex-1 text-xs"
                  >
                    {isEn ? 'Preview' : 'Aperçu'}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="flex-1 text-xs bg-[#EA580C] hover:bg-[#EA580C]/90 text-white border-none shadow-sm"
                  >
                    {isEn ? 'Use template' : 'Utiliser'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL INTERACTIVE PREVIEW MODAL */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fade-in">
          <div className="bg-white dark:bg-[#14241F] rounded-3xl border border-border-subtle dark:border-[#233831] shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden text-forest dark:text-[#F0F4F2]">
            {/* Modal Control Header */}
            <div className="px-5 py-4 border-b border-border-subtle dark:border-[#233831] flex items-center justify-between gap-4 shrink-0 bg-white dark:bg-[#101E1A]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-forest dark:text-[#F0F4F2]">
                    {previewTemplate.name[language] || previewTemplate.name.fr}
                  </h3>
                  <Badge variant="neutral" size="sm">
                    {previewTemplate.badge[language] || previewTemplate.badge.fr}
                  </Badge>
                </div>
                <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0]">
                  {previewTemplate.intendedFor[language] || previewTemplate.intendedFor.fr}
                </p>
              </div>

              {/* Viewport & Locale Controls */}
              <div className="flex items-center gap-3">
                {/* Device Selector */}
                <div className="flex items-center p-1 rounded-xl bg-ivory dark:bg-[#182C25] border border-border-subtle dark:border-[#233831]">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-[#14241F] text-forest dark:text-[#F0F4F2] shadow-sm'
                        : 'text-ink-secondary dark:text-[#97A7A0]'
                    }`}
                    title={isEn ? 'Mobile device view' : 'Vue mobile'}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">{isEn ? 'Mobile' : 'Mobile'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-[#14241F] text-forest dark:text-[#F0F4F2] shadow-sm'
                        : 'text-ink-secondary dark:text-[#97A7A0]'
                    }`}
                    title={isEn ? 'Desktop browser view' : 'Vue bureau'}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">{isEn ? 'Desktop' : 'Écran'}</span>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 rounded-xl text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#182C25] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Rendered Live Template */}
            <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0C1814] p-3 sm:p-6 flex justify-center items-start">
              <div
                className={`transition-all duration-300 rounded-3xl overflow-hidden shadow-2xl ${
                  previewDevice === 'mobile'
                    ? 'w-full max-w-[390px] border-8 border-slate-900 rounded-[44px]'
                    : 'w-full max-w-4xl border border-black/10'
                }`}
              >
                <SofraFlowTemplateRenderer
                  template={previewTemplate}
                  restaurant={activeRestaurant}
                  locale={previewLocale}
                  previewMode={true}
                  isMobile={previewDevice === 'mobile'}
                  onTemplateSelect={() => {
                    const chosen = previewTemplate;
                    setPreviewTemplate(null);
                    handleApplyTemplate(chosen);
                  }}
                  onCheckout={(cart) => {
                    alert(
                      isEn
                        ? `Order triggered for ${cart.length} items. Bridged to SofraFlow dashboard.`
                        : `Commande déclenchée pour ${cart.length} plats. Transmis au dashboard SofraFlow.`
                    );
                  }}
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 px-6 border-t border-border-subtle dark:border-[#233831] flex items-center justify-between shrink-0 bg-white dark:bg-[#101E1A]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
              >
                {isEn ? 'Close Preview' : 'Fermer l’aperçu'}
              </Button>

              <Button
                variant="primary"
                size="md"
                disabled={isApplying}
                leftIcon={<Check className="w-4 h-4" />}
                onClick={() => {
                  const chosen = previewTemplate;
                  setPreviewTemplate(null);
                  handleApplyTemplate(chosen);
                }}
                className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white border-none shadow-md"
              >
                {isApplying
                  ? isEn
                    ? 'Creating Menu...'
                    : 'Création en cours...'
                  : isEn
                  ? 'Apply & Use This Template'
                  : 'Appliquer ce Modèle'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
