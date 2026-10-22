import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, SlidersHorizontal, UtensilsCrossed } from 'lucide-react';
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
import { MenuCategory, Product } from '../../types';

export const ProductsPage: React.FC = () => {
  const { activeRestaurant } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [nameFr, setNameFr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descFr, setDescFr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [price, setPrice] = useState<number>(50);
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [dietaryTags, setDietaryTags] = useState<Product['dietaryTags']>(['halal']);
  const [ingredientsStr, setIngredientsStr] = useState('');
  const [allergensStr, setAllergensStr] = useState('');

  const loadData = () => {
    if (activeRestaurant) {
      setProducts(db.getProducts(activeRestaurant.id));
      setCategories(db.getCategories(activeRestaurant.id));
    } else {
      setProducts([]);
      setCategories([]);
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
        <Card className="p-8 text-center space-y-4 max-w-xl mx-auto my-12 border-border-subtle dark:border-[#233831]">
          <div className="w-12 h-12 rounded-2xl bg-forest/10 dark:bg-gold/15 text-forest dark:text-gold flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-forest dark:text-[#F0F4F2]">
            Aucun établissement actif
          </h2>
          <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
            Veuillez sélectionner ou créer votre établissement pour gérer vos produits et plats.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setNameFr('');
    setNameEn('');
    setNameAr('');
    setDescFr('');
    setDescEn('');
    setDescAr('');
    setPrice(60);
    setCategoryId(categories[0]?.id || '');
    setImageUrl('https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80');
    setIsAvailable(true);
    setDietaryTags(['halal']);
    setIngredientsStr('');
    setAllergensStr('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setNameFr(p.name.fr || p.name.en || '');
    setNameEn(p.name.en || '');
    setNameAr(p.name.ar || '');
    setDescFr(p.description.fr || p.description.en || '');
    setDescEn(p.description.en || '');
    setDescAr(p.description.ar || '');
    setPrice(p.price);
    setCategoryId(p.categoryId);
    setImageUrl(p.imageUrl);
    setIsAvailable(p.isAvailable);
    setDietaryTags(p.dietaryTags);
    setIngredientsStr(p.verifiedIngredients.join(', '));
    setAllergensStr(p.verifiedAllergens.join(', '));
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFr.trim() && !nameEn.trim()) return;

    const parsedIngredients = ingredientsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedAllergens = allergensStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingProduct) {
      db.updateProduct({
        ...editingProduct,
        categoryId: categoryId || categories[0]?.id || 'cat_default',
        name: { fr: nameFr || nameEn, en: nameEn || nameFr, ar: nameAr },
        description: { fr: descFr, en: descEn, ar: descAr },
        price: Number(price),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
        isAvailable,
        dietaryTags,
        verifiedIngredients: parsedIngredients,
        verifiedAllergens: parsedAllergens
      });

      if (isSupabaseConfigured) {
        supabaseService.updateProduct(editingProduct.id, {
          category_id: categoryId || categories[0]?.id || undefined,
          name: { fr: nameFr || nameEn, en: nameEn || nameFr, ar: nameAr },
          description: { fr: descFr, en: descEn, ar: descAr },
          price: Number(price),
          image_url: imageUrl.trim() || undefined,
          is_available: isAvailable,
          dietary_tags: dietaryTags
        }).catch(err => console.warn('[ProductsPage] Supabase updateProduct error:', err));
      }
    } else {
      const created = db.createProduct({
        restaurantId: activeRestaurant.id,
        categoryId: categoryId || categories[0]?.id || 'cat_default',
        name: { fr: nameFr || nameEn, en: nameEn || nameFr, ar: nameAr },
        description: { fr: descFr, en: descEn, ar: descAr },
        price: Number(price),
        currency: activeRestaurant?.settings?.currency || 'MAD',
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
        isAvailable,
        dietaryTags,
        verifiedIngredients: parsedIngredients,
        verifiedAllergens: parsedAllergens,
        optionGroups: [],
        sortOrder: products.length + 1
      });

      if (isSupabaseConfigured) {
        supabaseService.createProduct(activeRestaurant.id, {
          category_id: categoryId || categories[0]?.id || 'cat_default',
          name: { fr: nameFr || nameEn, en: nameEn || nameFr, ar: nameAr },
          description: { fr: descFr, en: descEn, ar: descAr },
          price: Number(price),
          currency: activeRestaurant?.settings?.currency || 'MAD',
          image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
          is_available: isAvailable,
          dietary_tags: dietaryTags,
          sort_order: products.length + 1
        }).catch(err => console.warn('[ProductsPage] Supabase createProduct error:', err));
      }
    }

    setIsModalOpen(false);
  };

  const handleToggleAvailability = (product: Product) => {
    const nextVal = !product.isAvailable;
    db.updateProduct({
      ...product,
      isAvailable: nextVal
    });

    if (isSupabaseConfigured) {
      supabaseService.updateProduct(product.id, {
        is_available: nextVal
      }).catch(err => console.warn('[ProductsPage] Supabase updateProduct error:', err));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce plat du catalogue ?')) {
      db.deleteProduct(id, activeRestaurant.id);

      if (isSupabaseConfigured) {
        supabaseService.deleteProduct(id).catch(err =>
          console.warn('[ProductsPage] Supabase deleteProduct error:', err)
        );
      }
    }
  };

  const toggleDietaryTag = (tag: Product['dietaryTags'][number]) => {
    setDietaryTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.fr?.toLowerCase().includes(search.toLowerCase()) ||
      p.name.en?.toLowerCase().includes(search.toLowerCase()) ||
      p.name.ar?.includes(search);
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const dietaryOptions: Array<{ key: Product['dietaryTags'][number]; label: string }> = [
    { key: 'halal', label: t('products.dietaryTags.halal') },
    { key: 'vegetarian', label: t('products.dietaryTags.vegetarian') },
    { key: 'vegan', label: t('products.dietaryTags.vegan') },
    { key: 'gluten_free', label: t('products.dietaryTags.gluten_free') },
    { key: 'spicy', label: t('products.dietaryTags.spicy') },
    { key: 'chef_special', label: t('products.dietaryTags.chef_special') }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-[#F0F4F2] font-display">
              {t('products.pageTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0] mt-1">
              {t('products.pageSubtitle')}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            {t('products.newDishBtn')}
          </Button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#101E1A] p-3.5 rounded-2xl border border-border-subtle dark:border-[#233831] shadow-soft dark:shadow-none">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-secondary dark:text-[#97A7A0] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('products.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-ivory/50 dark:bg-[#152520] border border-border-subtle dark:border-[#233831] text-xs text-ink-main dark:text-[#F0F4F2] focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-gold"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark'
                  : 'bg-ivory dark:bg-[#152520] text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2]'
              }`}
            >
              {t('common.all')} ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark'
                    : 'bg-ivory dark:bg-[#152520] text-ink-secondary dark:text-[#97A7A0] hover:text-ink-main dark:hover:text-[#F0F4F2]'
                }`}
              >
                {t(cat.name)}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const cat = categories.find(c => c.id === p.categoryId);
            return (
              <Card key={p.id} className="p-5 flex flex-col justify-between space-y-4 border border-border-subtle dark:border-[#233831]">
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden h-40 bg-ivory dark:bg-[#152520]">
                    <img
                      src={p.imageUrl}
                      alt={t(p.name)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleAvailability(p)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-soft backdrop-blur-md transition-colors ${
                          p.isAvailable
                            ? 'bg-white/95 dark:bg-[#101E1A]/95 text-status-success dark:text-[#4ADE80]'
                            : 'bg-black/80 text-white'
                        }`}
                      >
                        {p.isAvailable ? `● ${t('products.available')}` : `○ ${t('products.outOfStock')}`}
                      </button>
                    </div>

                    {cat && (
                      <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-forest/80 text-white backdrop-blur-sm">
                        {t(cat.name)}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-forest dark:text-[#F0F4F2] font-display">
                        {t(p.name)}
                      </h3>
                      <span className="text-sm font-extrabold text-forest dark:text-gold whitespace-nowrap">
                        {formatCurrency(p.price)}
                      </span>
                    </div>

                    {p.name.ar && (
                      <p className="text-xs text-ink-secondary dark:text-[#97A7A0] font-arabic mt-0.5" dir="rtl">
                        {p.name.ar}
                      </p>
                    )}

                    <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-1 line-clamp-2">
                      {t(p.description)}
                    </p>
                  </div>

                  {/* Dietary & Allergen Badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.dietaryTags.map(tag => (
                      <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-forest-light dark:bg-[#1C332B] text-forest dark:text-[#E2EBE6]">
                        {t(`products.dietaryTags.${tag}`) || tag}
                      </span>
                    ))}
                    {p.verifiedAllergens.length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-status-warning-bg dark:bg-[#2B2310] text-amber-800 dark:text-[#FBBF24] border border-amber-200 dark:border-amber-800/40">
                        {t('products.allergens')} : {p.verifiedAllergens.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-border-subtle dark:border-[#233831] flex items-center justify-between text-xs">
                  <span className="text-ink-secondary dark:text-[#97A7A0] text-[11px]">
                    {t('products.optionsCount', { count: p.optionGroups.length })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(p)}>
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{t('common.edit')}</span>
                    </Button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-xl text-ink-secondary dark:text-[#97A7A0] hover:text-status-error hover:bg-status-error-bg dark:hover:bg-[#2E1414] transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Edit / Create Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? t('products.editTitle') : t('products.createTitle')}
        description="Configurez les prix en MAD, les noms trilingues, ingrédients et allergènes."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Trilingual Names */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                {t('products.dishNameFr')} *
              </label>
              <input
                type="text"
                required
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                placeholder="ex. Tagine d’Agneau aux Pruneaux"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                {t('products.dishNameEn')}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                placeholder="Royal Lamb Tagine"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1 font-arabic" dir="rtl">
                {t('products.dishNameAr')} (العربية)
              </label>
              <input
                type="text"
                dir="rtl"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold font-arabic text-right"
                placeholder="طاجين البرقوق الملكي"
              />
            </div>
          </div>

          {/* Pricing and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                {t('products.priceLabel')} *
              </label>
              <input
                type="number"
                required
                min={0}
                step={0.5}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                {t('products.category')} *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.name)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                {t('common.status')}
              </label>
              <select
                value={isAvailable ? 'available' : 'unavailable'}
                onChange={(e) => setIsAvailable(e.target.value === 'available')}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              >
                <option value="available">{t('products.available')}</option>
                <option value="unavailable">{t('products.outOfStock')}</option>
              </select>
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
              {t('products.imageUrlLabel')}
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold font-mono"
              placeholder="https://..."
            />
          </div>

          {/* French Description */}
          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
              {t('products.dishDescFr')}
            </label>
            <textarea
              rows={2}
              value={descFr}
              onChange={(e) => setDescFr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              placeholder="Description appétissante du plat en français..."
            />
          </div>

          {/* English Description */}
          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
              {t('products.dishDescEn')}
            </label>
            <textarea
              rows={2}
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
              placeholder="Appetizing English description..."
            />
          </div>

          {/* Arabic Description */}
          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1 font-arabic" dir="rtl">
              {t('products.dishDescAr')}
            </label>
            <textarea
              rows={2}
              dir="rtl"
              value={descAr}
              onChange={(e) => setDescAr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold text-right font-arabic"
              placeholder="وصف الطبق باللغة العربية..."
            />
          </div>

          {/* Dietary tags pills */}
          <div>
            <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1.5">
              {t('products.dietary')}
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((opt) => {
                const isSelected = dietaryTags.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleDietaryTag(opt.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-forest dark:bg-gold text-white dark:text-forest-dark border-forest dark:border-gold'
                        : 'bg-ivory dark:bg-[#152520] text-ink-secondary dark:text-[#97A7A0] border-border-subtle dark:border-[#233831]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingredients & Allergens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                {t('products.ingredients')} (séparés par des virgules)
              </label>
              <input
                type="text"
                value={ingredientsStr}
                onChange={(e) => setIngredientsStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                placeholder="Agneau, Pruneaux, Amandes, Cannelle..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-main dark:text-[#F0F4F2] mb-1">
                {t('products.allergens')} (séparés par des virgules)
              </label>
              <input
                type="text"
                value={allergensStr}
                onChange={(e) => setAllergensStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#101E1A] text-ink-main dark:text-[#F0F4F2] text-xs focus:ring-2 focus:ring-forest dark:focus:ring-gold"
                placeholder="Fruits à coque, Gluten..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle dark:border-[#233831]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
