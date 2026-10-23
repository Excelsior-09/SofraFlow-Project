import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, ExternalLink, Sparkles, ArrowRight, LayoutTemplate, AlertCircle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { NoActiveRestaurantCard } from '../../components/common/NoActiveRestaurantCard';
import { ZinaMenuCreatorModal } from '../../components/dashboard/ZinaMenuCreatorModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Menu } from '../../types';

export const MenusPage: React.FC = () => {
  const { activeRestaurant, user } = useAuth();
  const { language, t } = useLanguage();
  const isEn = language === 'en';
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isZinaCreatorOpen, setIsZinaCreatorOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuDesc, setNewMenuDesc] = useState('');
  const [newMenuSlug, setNewMenuSlug] = useState('');

  const loadMenus = async () => {
    if (!activeRestaurant) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (isSupabaseConfigured) {
        const supaMenus = await supabaseService.getMenusForRestaurant(activeRestaurant.id);
        setMenus(supaMenus);
      } else {
        setMenus(db.getMenus(activeRestaurant.id));
      }
    } catch (err: any) {
      console.error('[MenusPage] Failed to fetch menus:', err);
      setErrorMessage(err?.message || (isEn ? 'Failed to load menus' : 'Échec du chargement des menus'));
      setMenus([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
    const unsub = db.subscribe(() => {
      loadMenus();
    });
    return () => unsub();
  }, [activeRestaurant]);

  if (!activeRestaurant) {
    return (
      <DashboardLayout>
        <NoActiveRestaurantCard
          icon={<LayoutTemplate className="w-8 h-8" />}
          title={isEn ? 'No restaurant profile selected' : 'Aucun établissement sélectionné'}
          description={
            isEn
              ? 'Please select or register a restaurant to manage digital menus.'
              : 'Veuillez sélectionner ou créer votre établissement pour gérer vos cartes et menus.'
          }
        />
      </DashboardLayout>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;

    const slug = newMenuSlug.trim() || newMenuName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const categories = db.getCategories(activeRestaurant.id);
    const products = db.getProducts(activeRestaurant.id);

    // 1. Sync to local DB for immediate UI update
    db.createMenu({
      restaurantId: activeRestaurant.id,
      name: newMenuName,
      description: newMenuDesc || 'Carte restaurant',
      slug,
      status: 'published',
      categoryIds: categories.map(c => c.id),
      productIds: products.map(p => p.id),
      enabledLanguages: ['fr', 'en', 'ar'],
      isDefault: menus.length === 0
    });

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabaseService.createMenu(activeRestaurant.id, {
          name: newMenuName,
          description: newMenuDesc || 'Carte restaurant',
          slug,
          status: 'published',
          is_default: menus.length === 0,
          enabled_languages: ['fr', 'en', 'ar']
        });
      } catch (err) {
        console.warn('[MenusPage] Supabase menu persistence warning:', err);
      }
    }

    setNewMenuName('');
    setNewMenuDesc('');
    setNewMenuSlug('');
    setIsCreateModalOpen(false);
    await loadMenus();
  };

  const handleTogglePublish = async (menu: Menu) => {
    const nextStatus = menu.status === 'published' ? 'draft' : 'published';
    db.updateMenu({
      ...menu,
      status: nextStatus
    });

    if (isSupabaseConfigured) {
      try {
        await supabaseService.updateMenu(menu.id, {
          status: nextStatus,
          is_published: nextStatus === 'published'
        });
      } catch (err) {
        console.warn('[MenusPage] Supabase updateMenu warning:', err);
      }
    }
    await loadMenus();
  };

  const handleDuplicate = async (menu: Menu) => {
    const dupName = `${menu.name} (Copie)`;
    const dupSlug = `${menu.slug}-copie-${Date.now().toString().slice(-4)}`;

    db.createMenu({
      restaurantId: menu.restaurantId,
      name: dupName,
      description: menu.description,
      slug: dupSlug,
      status: 'draft',
      categoryIds: [...menu.categoryIds],
      productIds: [...menu.productIds],
      enabledLanguages: [...menu.enabledLanguages],
      isDefault: false
    });

    if (isSupabaseConfigured) {
      try {
        await supabaseService.createMenu(activeRestaurant.id, {
          name: dupName,
          description: menu.description,
          slug: dupSlug,
          status: 'draft',
          is_default: false,
          enabled_languages: [...menu.enabledLanguages]
        });
      } catch (err) {
        console.warn('[MenusPage] Supabase duplicate menu warning:', err);
      }
    }
    await loadMenus();
  };

  const handleArchive = async (menu: Menu) => {
    const nextStatus = menu.status === 'archived' ? 'draft' : 'archived';
    db.updateMenu({
      ...menu,
      status: nextStatus
    });

    if (isSupabaseConfigured) {
      try {
        await supabaseService.updateMenu(menu.id, {
          status: nextStatus,
          is_published: false
        });
      } catch (err) {
        console.warn('[MenusPage] Supabase archive warning:', err);
      }
    }
    await loadMenus();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
              {t('menus.pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
              {t('menus.pageSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs"
            >
              {isEn ? 'Manual Menu' : 'Créer manuellement'}
            </Button>

            <button
              onClick={() => setIsZinaCreatorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#D97706] hover:from-[#EA580C]/90 hover:to-[#D97706]/90 text-white font-bold text-xs shadow-md shadow-[#EA580C]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Zina AI Menu Creator</span>
            </button>
          </div>
        </div>

        {/* Prominent Zina AI Menu Creator Banner Card */}
        <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#0F2C59] via-[#163666] to-[#0A1D3B] text-white border border-white/10 shadow-xl relative overflow-hidden">
          {/* Ambient decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#EA580C]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>{isEn ? 'Smart Menu Engineering' : 'Menu Engineering par IA'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                Zina AI Menu Creator
              </h2>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {isEn
                  ? 'Create your restaurant menu with AI, start from your existing menu, or choose a professional template.'
                  : 'Créez votre carte avec l’IA, partez de votre carte existante ou choisissez un modèle professionnel.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-white/70">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]" />
                  <span>{isEn ? 'Upload PDF or photo' : 'Import PDF ou photo'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                  <span>{isEn ? 'Describe with AI prompt' : 'Génération par prompt IA'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{isEn ? '6 Moroccan hospitality templates' : '6 modèles gastronomiques'}</span>
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => setIsZinaCreatorOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#EA580C]/90 text-white font-black text-xs sm:text-sm shadow-xl shadow-[#EA580C]/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Zina AI Menu Creator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-center py-6 text-xs text-ink-secondary dark:text-[#97A7A0] gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-forest dark:text-gold" />
            <span>{isEn ? 'Synchronizing digital menus...' : 'Synchronisation des menus...'}</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && menus.length === 0 && (
          <Card className="p-10 text-center space-y-4 border-dashed border-2 border-border-subtle dark:border-[#233831] bg-white/50 dark:bg-[#14241F]/50">
            <div className="w-14 h-14 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-forest dark:text-[#F0F4F2]">
                {isEn ? 'No digital menus yet' : 'Aucun menu créé pour le moment'}
              </h3>
              <p className="text-xs text-ink-secondary dark:text-[#97A7A0] max-w-md mx-auto">
                {isEn
                  ? 'Generate your first digital menu with Zina AI Menu Creator in seconds, or create a blank manual menu.'
                  : 'Générez votre première carte digitale avec Zina AI Menu Creator en quelques secondes, ou commencez par une carte manuelle.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsZinaCreatorOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#D97706] text-white font-bold text-xs shadow-md shadow-[#EA580C]/25"
              >
                <Sparkles className="w-4 h-4" />
                <span>Zina AI Menu Creator</span>
              </button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCreateModalOpen(true)}
                className="text-xs"
              >
                {isEn ? 'Manual Menu' : 'Créer manuellement'}
              </Button>
            </div>
          </Card>
        )}

        {/* Menu Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <Card key={menu.id} className="p-6 flex flex-col justify-between space-y-6 relative group border border-border-subtle dark:border-[#233831]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge
                    variant={
                      menu.status === 'published'
                        ? 'success'
                        : menu.status === 'draft'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {menu.status === 'published'
                      ? t('menus.publishedBadge')
                      : menu.status === 'draft'
                      ? t('menus.draftBadge')
                      : t('menus.archivedBadge')}
                  </Badge>

                  {menu.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-light dark:bg-[#1C332B] text-forest dark:text-gold border border-forest/10 dark:border-gold/20">
                      {t('menus.defaultBadge')}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-forest dark:text-[#F0F4F2] font-display">{menu.name}</h3>
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-1 line-clamp-2">{menu.description}</p>

                <div className="mt-4 pt-4 border-t border-border-subtle dark:border-[#233831] space-y-2 text-xs">
                  <div className="flex justify-between text-ink-secondary dark:text-[#97A7A0]">
                    <span>{t('menus.slugLabel')} :</span>
                    <span className="font-mono text-forest dark:text-gold font-semibold truncate max-w-[160px]">
                      /m/{activeRestaurant.slug}/{menu.slug}
                    </span>
                  </div>

                  <div className="flex justify-between text-ink-secondary dark:text-[#97A7A0]">
                    <span>{t('menus.productsAssigned', { count: menu.productIds.length })}</span>
                  </div>

                  <div className="flex justify-between text-ink-secondary dark:text-[#97A7A0]">
                    <span>{t('menus.availableLanguages')} :</span>
                    <div className="flex gap-1">
                      {menu.enabledLanguages.map(l => (
                        <span key={l} className="uppercase font-bold text-[10px] px-1.5 py-0.5 rounded bg-ivory dark:bg-[#152520] text-forest dark:text-gold border border-border-subtle dark:border-[#233831]">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border-subtle dark:border-[#233831] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Link to={`/app/menus/${menu.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      {t('menus.viewDetails')}
                    </Button>
                  </Link>

                  <Link
                    to={`/m/${activeRestaurant.slug}/${menu.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#14241F] hover:bg-ivory dark:hover:bg-[#1B2F29] text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-gold transition-colors"
                    title={t('navigation.customerView')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDuplicate(menu)}
                    className="p-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#14241F] hover:bg-ivory dark:hover:bg-[#1B2F29] text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-gold transition-colors"
                    title={t('common.copy')}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => handleTogglePublish(menu)}
                    className="font-semibold text-forest dark:text-gold hover:underline"
                  >
                    {menu.status === 'published' ? 'Passer en brouillon' : 'Publier pour les clients'}
                  </button>

                  <button
                    onClick={() => handleArchive(menu)}
                    className="text-ink-secondary dark:text-[#97A7A0] hover:text-status-error"
                  >
                    {menu.status === 'archived' ? 'Désarchiver' : 'Archiver'}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Menu Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('menus.createMenuTitle')}
        description={t('menus.pageSubtitle')}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
              {t('menus.nameLabel')} *
            </label>
            <input
              type="text"
              required
              value={newMenuName}
              onChange={(e) => {
                setNewMenuName(e.target.value);
                setNewMenuSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-sm focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              placeholder={t('menus.namePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
              {t('menus.descLabel')}
            </label>
            <textarea
              rows={2}
              value={newMenuDesc}
              onChange={(e) => setNewMenuDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-sm focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              placeholder={t('menus.descPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
              {t('menus.slugLabel')}
            </label>
            <div className="flex items-center rounded-xl border border-border-subtle dark:border-[#233831] overflow-hidden text-xs">
              <span className="bg-ivory dark:bg-[#152520] px-3 py-2.5 text-ink-secondary dark:text-[#97A7A0] border-r border-border-subtle dark:border-[#233831]">
                /m/{activeRestaurant.slug}/
              </span>
              <input
                type="text"
                value={newMenuSlug}
                onChange={(e) => setNewMenuSlug(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] focus:outline-none font-mono"
                placeholder="carte-soiree"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle dark:border-[#233831]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Zina AI Menu Creator Modal */}
      <ZinaMenuCreatorModal
        isOpen={isZinaCreatorOpen}
        onClose={() => setIsZinaCreatorOpen(false)}
      />
    </DashboardLayout>
  );
};
