import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check, ExternalLink, Save, BookOpen } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Menu, MenuCategory, Product } from '../../types';

export const MenuDetailPage: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const navigate = useNavigate();
  const { activeRestaurant } = useAuth();
  const { t, formatCurrency } = useLanguage();

  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameFr, setCatNameFr] = useState('');
  const [catNameAr, setCatNameAr] = useState('');

  const loadData = () => {
    if (!activeRestaurant || !menuId) return;
    const found = db.getMenuById(menuId, activeRestaurant.id);
    if (!found) {
      return;
    }
    setMenu(found);
    setCategories(db.getCategories(activeRestaurant.id));
    setProducts(db.getProducts(activeRestaurant.id));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return () => unsub();
  }, [activeRestaurant, menuId]);

  if (!activeRestaurant || !menu) {
    return (
      <DashboardLayout>
        <Card className="p-8 text-center space-y-4 max-w-xl mx-auto my-12 border-border-subtle dark:border-[#233831]">
          <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-forest dark:text-[#F0F4F2]">
            Menu introuvable
          </h2>
          <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
            Le menu demandé n'existe pas ou aucun établissement actif n'a été sélectionné.
          </p>
          <div className="pt-2">
            <Link to="/app/menus">
              <Button size="sm" variant="outline">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Retour aux menus
              </Button>
            </Link>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  const handleSave = async () => {
    db.updateMenu(menu);
    if (isSupabaseConfigured) {
      try {
        await supabaseService.updateMenu(menu.id, {
          name: menu.name,
          description: menu.description,
          slug: menu.slug,
          status: menu.status,
          is_published: menu.status === 'published'
        });
      } catch (e) {
        console.warn('[MenuDetailPage] Supabase updateMenu warning:', e);
      }
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameFr.trim() && !catNameEn.trim()) return;

    db.createCategory({
      restaurantId: activeRestaurant.id,
      name: {
        fr: catNameFr || catNameEn,
        en: catNameEn || catNameFr,
        ar: catNameAr || ''
      },
      sortOrder: categories.length + 1
    });

    if (isSupabaseConfigured) {
      try {
        await supabaseService.createCategory(activeRestaurant.id, {
          name: {
            fr: catNameFr || catNameEn,
            en: catNameEn || catNameFr,
            ar: catNameAr || ''
          },
          sort_order: categories.length + 1
        });
      } catch (err) {
        console.warn('[MenuDetailPage] Supabase createCategory warning:', err);
      }
    }

    setCatNameEn('');
    setCatNameFr('');
    setCatNameAr('');
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm('Voulez-vous supprimer cette catégorie ? Les plats resteront dans votre catalogue.')) {
      db.deleteCategory(catId, activeRestaurant.id);
    }
  };

  const toggleProductAssignment = (productId: string) => {
    const current = menu.productIds;
    const updated = current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId];

    setMenu({
      ...menu,
      productIds: updated
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Back and Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/app/menus"
              className="p-2 rounded-xl bg-white dark:bg-[#14241F] border border-border-subtle dark:border-[#233831] hover:bg-ivory dark:hover:bg-[#1B2F29] text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">{menu.name}</h1>
                <Badge variant={menu.status === 'published' ? 'success' : 'warning'}>
                  {menu.status === 'published' ? t('menus.publishedBadge') : t('menus.draftBadge')}
                </Badge>
              </div>
              <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5">
                {t('menus.slugLabel')} : <span className="font-mono text-forest dark:text-gold">/m/{activeRestaurant.slug}/{menu.slug}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/m/${activeRestaurant.slug}/${menu.slug}`}
              target="_blank"
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#14241F] text-forest dark:text-gold hover:bg-ivory dark:hover:bg-[#1B2F29] flex items-center gap-1.5"
            >
              <span>{t('navigation.customerView')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
            >
              {savedSuccess ? t('common.saved') : t('menus.saveMenu')}
            </Button>
          </div>
        </div>

        {/* Menu Meta Settings */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] font-display uppercase tracking-wider">
            Propriétés de la carte
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">{t('menus.nameLabel')}</label>
              <input
                type="text"
                value={menu.name}
                onChange={(e) => setMenu({ ...menu, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-sm focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">{t('menus.slugLabel')}</label>
              <input
                type="text"
                value={menu.slug}
                onChange={(e) => setMenu({ ...menu, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                className="w-full px-3.5 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-sm focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">{t('menus.descLabel')}</label>
            <textarea
              rows={2}
              value={menu.description}
              onChange={(e) => setMenu({ ...menu, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-sm focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
            />
          </div>
        </Card>

        {/* Categories Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] font-display uppercase tracking-wider">
                {t('common.categories')}
              </h3>
              <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5">Organisez les rubriques de votre carte</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsCategoryModalOpen(true)}
            >
              + Ajouter une catégorie
            </Button>
          </div>

          <div className="space-y-2">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-ivory dark:bg-[#152520] border border-border-subtle dark:border-[#233831] text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-white dark:bg-[#101E1A] border border-border-subtle dark:border-[#233831] font-bold text-ink-secondary dark:text-[#97A7A0] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-ink-main dark:text-[#F0F4F2]">{t(cat.name)}</span>
                    {cat.name.ar && (
                      <span className="text-ink-secondary dark:text-[#97A7A0] ml-2 font-arabic" dir="rtl">
                        ({cat.name.ar})
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1.5 text-ink-secondary dark:text-[#97A7A0] hover:text-status-error transition-colors"
                  title={t('common.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Product Items Assignment */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-forest dark:text-[#F0F4F2] font-display uppercase tracking-wider">
              {t('menus.selectProducts')}
            </h3>
            <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5">
              Cochez les plats à inclure sur cette carte en ligne. Les plats décochés restent disponibles dans votre catalogue général.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map((product) => {
              const isIncluded = menu.productIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => toggleProductAssignment(product.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isIncluded
                      ? 'border-forest dark:border-gold bg-forest/5 dark:bg-gold/10 shadow-soft'
                      : 'border-border-subtle dark:border-[#233831] bg-white dark:bg-[#14241F] hover:bg-ivory dark:hover:bg-[#1B2F29]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.imageUrl}
                      alt={t(product.name)}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-ink-main dark:text-[#F0F4F2]">{t(product.name)}</h4>
                      <p className="text-[11px] font-semibold text-forest dark:text-gold">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                      isIncluded
                        ? 'bg-forest dark:bg-gold border-forest dark:border-gold text-white dark:text-forest-dark'
                        : 'border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A]'
                    }`}
                  >
                    {isIncluded && <Check className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Ajouter une catégorie"
        description="Renseignez le nom de la catégorie dans les différentes langues."
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
              Nom de la catégorie (Français) *
            </label>
            <input
              type="text"
              required
              value={catNameFr}
              onChange={(e) => setCatNameFr(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-sm focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              placeholder="ex. Tagines Traditionnels"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
              Nom de la catégorie (Anglais)
            </label>
            <input
              type="text"
              value={catNameEn}
              onChange={(e) => setCatNameEn(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-sm focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              placeholder="ex. Clay-Pot Tagines"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
              Nom de la catégorie (Arabe - العربية)
            </label>
            <input
              type="text"
              dir="rtl"
              value={catNameAr}
              onChange={(e) => setCatNameAr(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-sm focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold text-right font-arabic"
              placeholder="طواجن فخارية تقليدية"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle dark:border-[#233831]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCategoryModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
