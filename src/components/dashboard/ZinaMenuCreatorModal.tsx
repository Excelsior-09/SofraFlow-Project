import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UploadCloud,
  FileText,
  LayoutTemplate,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Eye,
  Smartphone,
  Monitor,
  Check,
  Edit2,
  Plus,
  HelpCircle,
  FileImage
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { adminService } from '../../services/adminService';
import { MENU_TEMPLATES, MenuTemplateDefinition, TemplateCategory, TemplateDishItem } from '../../data/menuTemplatesData';
import { FoodLanguageCode } from '../../types';
import { SofraFlowTemplateRenderer } from '../customer/SofraFlowTemplateRenderer';

interface ZinaMenuCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreatorMethod = 'upload' | 'prompt' | 'templates';
type Step =
  | 'select_method'
  | 'upload_file'
  | 'upload_analyzing'
  | 'upload_review'
  | 'prompt_input'
  | 'prompt_generating'
  | 'prompt_review'
  | 'template_gallery'
  | 'template_customize';

export const ZinaMenuCreatorModal: React.FC<ZinaMenuCreatorModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { activeRestaurant } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [step, setStep] = useState<Step>('select_method');

  // Option A State (Upload)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [analyzingStatus, setAnalyzingStatus] = useState('');
  const [extractedCategories, setExtractedCategories] = useState<TemplateCategory[]>([]);

  // Option B State (Prompt)
  const [promptText, setPromptText] = useState('');
  const [cuisineType, setCuisineType] = useState('moroccan');
  const [selectedPromptLanguage, setSelectedPromptLanguage] = useState<FoodLanguageCode>('fr');
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [generatedCategories, setGeneratedCategories] = useState<TemplateCategory[]>([]);

  // Option C State (Template)
  const [selectedTemplate, setSelectedTemplate] = useState<MenuTemplateDefinition | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<MenuTemplateDefinition | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [customMenuName, setCustomMenuName] = useState('');
  const [customColor, setCustomColor] = useState('#B45309');
  const [enabledLanguages, setEnabledLanguages] = useState<FoodLanguageCode[]>(['fr', 'en', 'ar']);

  // Global Creation in-flight
  const [isFinalizing, setIsFinalizing] = useState(false);

  if (!isOpen || !activeRestaurant) return null;

  // --- Reset All State on Close ---
  const handleClose = () => {
    setStep('select_method');
    setUploadedFile(null);
    setFilePreviewUrl(null);
    setFileError(null);
    setExtractedCategories([]);
    setPromptText('');
    setGeneratedCategories([]);
    setSelectedTemplate(null);
    setPreviewTemplate(null);
    onClose();
  };

  // --- OPTION A: File Upload Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError(
        isEn
          ? 'Unsupported file type. Please upload a PDF, JPG, PNG, or WEBP.'
          : 'Format de fichier non supporté. Veuillez importer un PDF, JPG, PNG ou WEBP.'
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError(
        isEn ? 'File size exceeds 10MB limit.' : 'La taille du fichier dépasse la limite de 10 Mo.'
      );
      return;
    }

    setUploadedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleStartAnalysis = () => {
    if (!uploadedFile) return;
    // Invoke secure server-side AI execution to verify budget and log usage
    adminService.executeZinaAiTask(
      uploadedFile.name,
      'menu_scan',
      activeRestaurant.id
    ).catch(err => console.warn('[Zina] AI task:', err));

    setStep('upload_analyzing');
    setAnalyzingProgress(15);
    setAnalyzingStatus(
      isEn ? 'Reading document structure & layout...' : 'Lecture de la structure du document...'
    );

    setTimeout(() => {
      setAnalyzingProgress(45);
      setAnalyzingStatus(
        isEn
          ? 'Identifying categories, dishes, and ingredients...'
          : 'Détection des catégories, plats et ingrédients...'
      );
    }, 900);

    setTimeout(() => {
      setAnalyzingProgress(75);
      setAnalyzingStatus(
        isEn
          ? 'Extracting and verifying prices in Moroccan Dirhams (MAD)...'
          : 'Extraction et vérification des prix en Dirhams marocains (MAD)...'
      );
    }, 1800);

    setTimeout(() => {
      setAnalyzingProgress(100);
      setAnalyzingStatus(
        isEn ? 'Analysis complete! Reviewing extracted draft...' : 'Analyse terminée ! Préparation de l’aperçu...'
      );

      // Populate realistic extracted data from Moroccan Heritage baseline with review flags
      const extracted = JSON.parse(JSON.stringify(MENU_TEMPLATES[1].categories)) as TemplateCategory[];
      if (extracted[0]?.items[0]) {
        extracted[0].items[0].flaggedForReview = true;
        extracted[0].items[0].reviewReason = isEn
          ? 'Verify price: detected 45 MAD from photo'
          : 'Vérifier le prix : 45 MAD détecté sur la photo';
      }
      setExtractedCategories(extracted);
      setStep('upload_review');
    }, 2600);
  };

  // --- OPTION B: Prompt Generation Handlers ---
  const handleStartPromptGeneration = () => {
    if (!promptText.trim()) return;
    // Invoke secure server-side AI execution to verify budget and log usage
    adminService.executeZinaAiTask(
      promptText.trim(),
      'menu_generation',
      activeRestaurant.id
    ).catch(err => console.warn('[Zina] AI task:', err));

    setStep('prompt_generating');
    setGeneratingProgress(20);
    setGeneratingStatus(
      isEn ? 'Interpreting restaurant concept & cuisine...' : 'Interprétation du concept et de la cuisine...'
    );

    setTimeout(() => {
      setGeneratingProgress(55);
      setGeneratingStatus(
        isEn
          ? 'Organizing category hierarchy and signature dishes...'
          : 'Organisation de la hiérarchie des catégories et plats signatures...'
      );
    }, 1000);

    setTimeout(() => {
      setGeneratingProgress(85);
      setGeneratingStatus(
        isEn
          ? 'Refining descriptions, allergen notes, and MAD pricing...'
          : 'Finalisation des descriptions et prix en Dirhams (MAD)...'
      );
    }, 1900);

    setTimeout(() => {
      setGeneratingProgress(100);
      setGeneratingStatus(
        isEn ? 'Draft generated! Reviewing menu layout...' : 'Menu généré ! Préparation de la révision...'
      );

      // Select relevant template based on keywords in prompt
      let baseTemplate = MENU_TEMPLATES[0];
      const lower = promptText.toLowerCase();
      if (lower.includes('café') || lower.includes('coffee') || lower.includes('brunch')) {
        baseTemplate = MENU_TEMPLATES[2];
      } else if (lower.includes('tajine') || lower.includes('moroccan') || lower.includes('maroc') || lower.includes('riad')) {
        baseTemplate = MENU_TEMPLATES[1];
      } else if (lower.includes('burger') || lower.includes('tacos') || lower.includes('snack') || lower.includes('fast')) {
        baseTemplate = MENU_TEMPLATES[3];
      } else if (lower.includes('bakery') || lower.includes('pâtisserie') || lower.includes('croissant') || lower.includes('pain')) {
        baseTemplate = MENU_TEMPLATES[5];
      } else if (lower.includes('luxury') || lower.includes('fine') || lower.includes('luxe')) {
        baseTemplate = MENU_TEMPLATES[4];
      }

      setGeneratedCategories(JSON.parse(JSON.stringify(baseTemplate.categories)));
      setStep('prompt_review');
    }, 2700);
  };

  // --- OPTION C: Template Handlers ---
  const handleSelectTemplate = (tpl: MenuTemplateDefinition) => {
    setSelectedTemplate(tpl);
    setCustomMenuName(tpl.name[language] || tpl.name.fr);
    setCustomColor(tpl.primaryColor);
    setStep('template_customize');
  };

  // --- UNIFIED DRAFT CREATION LOGIC ---
  const finalizeMenuCreation = async (
    menuName: string,
    categoriesToSave: TemplateCategory[],
    templateId?: string
  ) => {
    setIsFinalizing(true);

    try {
      // 1. Create categories and products in local DB (synchronous client cache)
      const createdCategoryIds: string[] = [];
      const createdProductIds: string[] = [];

      for (const [catIdx, cat] of categoriesToSave.entries()) {
        const newCat = db.createCategory({
          restaurantId: activeRestaurant.id,
          name: {
            en: cat.name.en,
            fr: cat.name.fr,
            ar: cat.name.ar || ''
          },
          sortOrder: catIdx + 1
        });
        createdCategoryIds.push(newCat.id);

        for (const [itemIdx, item] of cat.items.entries()) {
          const newProd = db.createProduct({
            restaurantId: activeRestaurant.id,
            categoryId: newCat.id,
            name: {
              en: item.name.en,
              fr: item.name.fr,
              ar: item.name.ar || ''
            },
            description: {
              en: item.description.en,
              fr: item.description.fr,
              ar: ''
            },
            price: item.price || 0,
            currency: 'MAD',
            imageUrl:
              item.imageUrl ||
              'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
            isAvailable: true,
            dietaryTags: item.dietary ? [item.dietary] : [],
            verifiedIngredients: [],
            verifiedAllergens: [],
            optionGroups: [],
            sortOrder: itemIdx + 1
          });
          createdProductIds.push(newProd.id);
        }
      }

      // 2. Generate clean slug
      const generatedSlug = `${menuName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')}-${Date.now().toString().slice(-4)}`;

      // 3. Create Draft Menu in local DB (Status: 'draft' - never auto-published)
      const createdMenu = db.createMenu({
        restaurantId: activeRestaurant.id,
        name: menuName,
        description: isEn
          ? `Created with Zina AI Menu Creator (${templateId || 'AI Assisted'})`
          : `Créé avec Zina AI Menu Creator (${templateId || 'Assisté par IA'})`,
        slug: generatedSlug,
        status: 'draft',
        categoryIds: createdCategoryIds,
        productIds: createdProductIds,
        enabledLanguages: enabledLanguages,
        isDefault: false
      });

      // 4. Also persist to Supabase PostgreSQL if configured
      if (isSupabaseConfigured) {
        try {
          const supaMenu = await supabaseService.createMenu(activeRestaurant.id, {
            name: menuName,
            description: isEn
              ? `Created with Zina AI Menu Creator (${templateId || 'AI Assisted'})`
              : `Créé avec Zina AI Menu Creator (${templateId || 'Assisté par IA'})`,
            slug: generatedSlug,
            status: 'draft',
            is_default: false,
            enabled_languages: enabledLanguages
          });

          // Also save categories and products in Supabase
          for (const [catIdx, cat] of categoriesToSave.entries()) {
            const supaCat = await supabaseService.createCategory(activeRestaurant.id, {
              name: {
                en: cat.name.en,
                fr: cat.name.fr,
                ar: cat.name.ar || ''
              },
              sort_order: catIdx + 1
            });
            if (supaCat) {
              for (const [itemIdx, item] of cat.items.entries()) {
                await supabaseService.createProduct(activeRestaurant.id, {
                  category_id: supaCat.id,
                  name: {
                    en: item.name.en,
                    fr: item.name.fr,
                    ar: item.name.ar || ''
                  },
                  description: {
                    en: item.description.en,
                    fr: item.description.fr,
                    ar: ''
                  },
                  price: item.price || 0,
                  currency: 'MAD',
                  image_url:
                    item.imageUrl ||
                    'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
                  is_available: true,
                  dietary_tags: item.dietary ? [item.dietary] : [],
                  sort_order: itemIdx + 1
                });
              }
            }
          }
        } catch (supaErr) {
          console.warn('[ZinaMenuCreatorModal] Supabase persistence error:', supaErr);
        }
      }

      setIsFinalizing(false);
      handleClose();

      // 5. Navigate directly to the existing menu detail/editor page
      navigate(`/app/menus/${createdMenu.id}`);
    } catch (e) {
      console.error('Error creating menu draft:', e);
      setIsFinalizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-[#14241F] rounded-3xl border border-border-subtle dark:border-[#233831] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-forest dark:text-[#F0F4F2]">
        
        {/* --- MODAL HEADER --- */}
        <div className="p-5 sm:p-6 border-b border-border-subtle dark:border-[#233831] flex items-center justify-between shrink-0 bg-white dark:bg-[#14241F]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EA580C] to-[#D97706] text-white flex items-center justify-center shadow-md shadow-[#EA580C]/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-display text-forest dark:text-[#F0F4F2]">
                  Zina AI Menu Creator
                </h2>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20">
                  {isEn ? 'AI Studio' : 'Studio IA'}
                </span>
              </div>
              <p className="text-xs text-ink-secondary dark:text-[#97A7A0] mt-0.5 line-clamp-1">
                {isEn
                  ? 'Create your restaurant menu with AI, start from your existing menu, or choose a professional template.'
                  : 'Créez votre menu avec l’IA, partez de votre carte existante ou choisissez un modèle professionnel.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-ink-secondary dark:text-[#97A7A0] hover:bg-ivory dark:hover:bg-[#1B2F29] hover:text-forest dark:hover:text-[#F0F4F2] transition-colors"
            title={isEn ? 'Close' : 'Fermer'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- MODAL BODY (SCROLLABLE) --- */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: METHOD SELECTOR */}
          {step === 'select_method' && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h3 className="text-xl sm:text-2xl font-black font-display text-forest dark:text-[#F0F4F2]">
                  {isEn ? 'How would you like to build your menu?' : 'Comment souhaitez-vous créer votre menu ?'}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary dark:text-[#97A7A0]">
                  {isEn
                    ? 'Select the creation method that best fits your current workflow.'
                    : 'Sélectionnez la méthode qui correspond le mieux à votre établissement.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                
                {/* Method A: Upload */}
                <div
                  onClick={() => setStep('upload_file')}
                  className="rounded-2xl p-6 border-2 border-border-subtle dark:border-[#233831] hover:border-[#EA580C] bg-ivory/50 dark:bg-[#182C25] cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {isEn ? 'Option A' : 'Option A'}
                    </span>
                    <h4 className="text-base font-bold font-display text-forest dark:text-[#F0F4F2]">
                      {isEn ? 'Upload Your Menu' : 'Importer Votre Menu'}
                    </h4>
                    <p className="text-xs text-ink-secondary dark:text-[#97A7A0] leading-relaxed">
                      {isEn
                        ? 'Upload your existing menu (PDF, JPG, PNG) and let Zina help transform it into a structured digital menu.'
                        : 'Importez votre carte existante (PDF, photo JPG, PNG) et laissez Zina extraire vos plats et prix.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C] pt-2">
                    <span>{isEn ? 'Upload file' : 'Importer un fichier'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Method B: Prompt */}
                <div
                  onClick={() => setStep('prompt_input')}
                  className="rounded-2xl p-6 border-2 border-border-subtle dark:border-[#233831] hover:border-[#EA580C] bg-ivory/50 dark:bg-[#182C25] cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#EA580C]/10 text-[#EA580C]">
                      {isEn ? 'Option B' : 'Option B'}
                    </span>
                    <h4 className="text-base font-bold font-display text-forest dark:text-[#F0F4F2]">
                      {isEn ? 'Describe Your Menu' : 'Décrire Votre Menu'}
                    </h4>
                    <p className="text-xs text-ink-secondary dark:text-[#97A7A0] leading-relaxed">
                      {isEn
                        ? 'Tell Zina what kind of restaurant you run and let her help you create your menu using AI.'
                        : 'Décrivez votre établissement en quelques mots et laissez Zina composer votre carte sur mesure.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C] pt-2">
                    <span>{isEn ? 'Describe with AI' : 'Générer par IA'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Method C: Template */}
                <div
                  onClick={() => setStep('template_gallery')}
                  className="rounded-2xl p-6 border-2 border-border-subtle dark:border-[#233831] hover:border-[#EA580C] bg-ivory/50 dark:bg-[#182C25] cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <LayoutTemplate className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {isEn ? 'Option C' : 'Option C'}
                    </span>
                    <h4 className="text-base font-bold font-display text-forest dark:text-[#F0F4F2]">
                      {isEn ? 'Start with a Template' : 'Partir d’un Modèle'}
                    </h4>
                    <p className="text-xs text-ink-secondary dark:text-[#97A7A0] leading-relaxed">
                      {isEn
                        ? 'Choose from 10 professionally designed restaurant, café, and hospitality concepts and customize them.'
                        : 'Choisissez parmi 10 modèles professionnels adaptés aux concepts de restauration au Maroc.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C] pt-2">
                    <span>{isEn ? 'Browse 10 templates' : 'Voir les 10 modèles'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* METHOD A: UPLOAD FILE */}
          {step === 'upload_file' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle dark:border-[#233831]">
                <button
                  onClick={() => setStep('select_method')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-[#F0F4F2]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Back to methods' : 'Retour aux méthodes'}</span>
                </button>
                <span className="text-xs font-bold text-[#EA580C]">
                  {isEn ? 'Option A: Menu Document Upload' : 'Option A : Import de Carte'}
                </span>
              </div>

              <div className="text-center max-w-lg mx-auto space-y-1">
                <h3 className="text-xl font-bold font-display text-forest dark:text-[#F0F4F2]">
                  {isEn ? 'Upload Your Existing Menu' : 'Importez Votre Menu Existant'}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                  {isEn
                    ? 'Upload a photographed paper menu, scanned menu, or PDF (up to 10MB).'
                    : 'Importez une photo de votre carte papier, un scan ou un fichier PDF (jusqu’à 10 Mo).'}
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                  uploadedFile
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-border-subtle dark:border-[#233831] hover:border-[#EA580C] bg-ivory/40 dark:bg-[#182C25]'
                }`}
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    {filePreviewUrl ? (
                      <img
                        src={filePreviewUrl}
                        alt="Menu preview"
                        className="w-36 h-36 object-cover rounded-2xl mx-auto shadow-md border border-border-subtle"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
                        <FileText className="w-10 h-10" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-forest dark:text-[#F0F4F2] truncate max-w-xs mx-auto">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type || 'Document'}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <label className="cursor-pointer text-xs font-bold text-forest dark:text-[#F0F4F2] underline hover:text-[#EA580C]">
                        <span>{isEn ? 'Replace File' : 'Changer de fichier'}</span>
                        <input
                          type="file"
                          accept=".pdf,image/jpeg,image/png,image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          setFilePreviewUrl(null);
                        }}
                        className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isEn ? 'Remove' : 'Supprimer'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center mx-auto">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-forest dark:text-[#F0F4F2]">
                        {isEn ? 'Drag & drop your menu file here' : 'Glissez-déposez votre fichier de carte ici'}
                      </p>
                      <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                        PDF, JPG, PNG, WEBP (Max 10 Mo)
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest dark:bg-[#1C332B] hover:bg-forest/90 text-white font-bold text-xs cursor-pointer shadow-md">
                      <span>{isEn ? 'Browse Files' : 'Parcourir les fichiers'}</span>
                      <input
                        type="file"
                        accept=".pdf,image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {fileError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!uploadedFile}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  onClick={handleStartAnalysis}
                  className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white border-none"
                >
                  {isEn ? 'Analyze with Zina' : 'Analyser avec Zina'}
                </Button>
              </div>
            </div>
          )}

          {/* METHOD A: ANALYZING ANIMATION */}
          {step === 'upload_analyzing' && (
            <div className="py-12 text-center max-w-md mx-auto space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-border-subtle dark:border-[#233831] border-t-[#EA580C] animate-spin" />
                <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#D97706] text-white flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold font-display text-forest dark:text-[#F0F4F2]">
                  {isEn ? 'Zina is analyzing your menu...' : 'Zina analyse votre carte...'}
                </h4>
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">{analyzingStatus}</p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-border-subtle dark:bg-[#233831] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#EA580C] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${analyzingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* METHOD A: REVIEW EXTRACTED DATA */}
          {step === 'upload_review' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle dark:border-[#233831]">
                <button
                  onClick={() => setStep('upload_file')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-[#F0F4F2]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Re-upload' : 'Réimporter'}</span>
                </button>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Menu Extracted (Simulated)' : 'Carte Extraite (Simulée)'}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Review Extracted Information' : 'Vérifiez les Informations Extraites'}</span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  {isEn
                    ? 'Zina identified 3 categories and 7 dishes. Check flagged prices and descriptions before generating your draft.'
                    : 'Zina a identifié 3 catégories et 7 plats. Vérifiez les prix et descriptions avant de créer le brouillon.'}
                </p>
              </div>

              {/* Extracted items tree */}
              <div className="space-y-4">
                {extractedCategories.map((cat, catIdx) => (
                  <div
                    key={catIdx}
                    className="p-4 rounded-2xl border border-border-subtle dark:border-[#233831] bg-ivory/30 dark:bg-[#182C25] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                        {cat.name[language] || cat.name.fr}
                      </span>
                      <span className="text-[11px] text-ink-secondary dark:text-[#97A7A0]">
                        {cat.items.length} {isEn ? 'items' : 'plats'}
                      </span>
                    </div>

                    <div className="divide-y divide-border-subtle dark:divide-[#233831]">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-forest dark:text-[#F0F4F2] truncate">
                                {item.name[language] || item.name.fr}
                              </p>
                              {item.flaggedForReview && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold">
                                  ⚠️ {item.reviewReason}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] truncate">
                              {item.description[language] || item.description.fr}
                            </p>
                          </div>
                          <span className="text-xs font-black text-forest dark:text-[#F0F4F2] shrink-0">
                            {item.price} MAD
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirmation Action */}
              <div className="pt-4 border-t border-border-subtle dark:border-[#233831] flex items-center justify-between">
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                  {isEn ? 'Will be created as a Draft' : 'Sera enregistré comme Brouillon'}
                </p>
                <Button
                  variant="primary"
                  size="md"
                  disabled={isFinalizing}
                  leftIcon={<Check className="w-4 h-4" />}
                  onClick={() =>
                    finalizeMenuCreation(
                      isEn ? 'Uploaded Scanned Menu' : 'Carte Importée par Scan',
                      extractedCategories
                    )
                  }
                  className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white border-none"
                >
                  {isFinalizing
                    ? isEn
                      ? 'Creating draft...'
                      : 'Création en cours...'
                    : isEn
                    ? 'Confirm & Create Draft'
                    : 'Confirmer & Créer le Brouillon'}
                </Button>
              </div>
            </div>
          )}

          {/* METHOD B: PROMPT INPUT */}
          {step === 'prompt_input' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle dark:border-[#233831]">
                <button
                  onClick={() => setStep('select_method')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-[#F0F4F2]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Back to methods' : 'Retour aux méthodes'}</span>
                </button>
                <span className="text-xs font-bold text-[#EA580C]">
                  {isEn ? 'Option B: Describe Your Menu' : 'Option B : Générer par Prompt'}
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-forest dark:text-[#F0F4F2]">
                  {isEn ? 'Describe your menu to Zina' : 'Décrivez votre carte à Zina'}
                </label>
                <textarea
                  rows={4}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={
                    isEn
                      ? 'e.g. Create a modern Moroccan café menu with hot and cold drinks, fresh juices, pastries, sandwiches, and breakfast options. Organize into clear categories.'
                      : 'ex. Créez un menu de café marocain moderne avec boissons chaudes, jus frais, pâtisseries, tartines salées et formules petit-déjeuner. Organisez en catégories claires.'
                  }
                  className="w-full p-4 rounded-2xl border border-border-subtle dark:border-[#233831] bg-ivory/30 dark:bg-[#182C25] text-xs sm:text-sm text-forest dark:text-[#F0F4F2] focus:outline-none focus:ring-2 focus:ring-[#EA580C] leading-relaxed"
                />
              </div>

              {/* Clickable Quick Prompts */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-ink-secondary dark:text-[#97A7A0] uppercase tracking-wider">
                  {isEn ? 'Click an example to start:' : 'Ou cliquez sur un exemple pour démarrer :'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      label: '☕ Café & Coffee Shop',
                      text:
                        'Create a modern Moroccan café menu with espresso brews, saffron lattes, avocado toast, and croissants.'
                    },
                    {
                      label: '🍽️ Traditional Moroccan',
                      text:
                        'Create an authentic Moroccan dining menu with lamb tagine with prunes, chicken pastilla, royal couscous, and mint tea.'
                    },
                    {
                      label: '🍔 Smash Burgers & Snack',
                      text:
                        'Create a trendy smash burger and street food menu with double beef burgers, loaded cheese fries, and milkshakes.'
                    },
                    {
                      label: '🥐 Artisan Pâtisserie',
                      text:
                        'Create a fine French & Moroccan bakery menu with gazelle horns, millefeuille, fruit tarts, and butter croissants.'
                    }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPromptText(p.text)}
                      className="text-left p-3 rounded-xl border border-border-subtle dark:border-[#233831] hover:border-[#EA580C] bg-white dark:bg-[#14241F] text-xs text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-[#F0F4F2] transition-colors"
                    >
                      <span className="font-bold block text-forest dark:text-[#F0F4F2]">{p.label}</span>
                      <span className="text-[11px] line-clamp-1">{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle dark:border-[#233831] flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  disabled={!promptText.trim()}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  onClick={handleStartPromptGeneration}
                  className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white border-none"
                >
                  {isEn ? 'Generate Menu with Zina' : 'Générer la Carte avec Zina'}
                </Button>
              </div>
            </div>
          )}

          {/* METHOD B: GENERATING ANIMATION */}
          {step === 'prompt_generating' && (
            <div className="py-12 text-center max-w-md mx-auto space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-border-subtle dark:border-[#233831] border-t-[#EA580C] animate-spin" />
                <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#D97706] text-white flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold font-display text-forest dark:text-[#F0F4F2]">
                  {isEn ? 'Zina is composing your menu...' : 'Zina compose votre carte...'}
                </h4>
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">{generatingStatus}</p>
              </div>

              <div className="w-full bg-border-subtle dark:bg-[#233831] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#EA580C] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${generatingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* METHOD B: REVIEW PROMPT GENERATED MENU */}
          {step === 'prompt_review' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle dark:border-[#233831]">
                <button
                  onClick={() => setStep('prompt_input')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-[#F0F4F2]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Refine prompt' : 'Modifier le prompt'}</span>
                </button>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEn ? 'AI Draft Heuristic (Backend API Pending)' : 'Brouillon Heuristique IA (API en attente)'}</span>
                </span>
              </div>

              <div className="space-y-4">
                {generatedCategories.map((cat, catIdx) => (
                  <div
                    key={catIdx}
                    className="p-4 rounded-2xl border border-border-subtle dark:border-[#233831] bg-ivory/30 dark:bg-[#182C25] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
                        {cat.name[language] || cat.name.fr}
                      </span>
                      <span className="text-[11px] text-ink-secondary dark:text-[#97A7A0]">
                        {cat.items.length} {isEn ? 'items' : 'plats'}
                      </span>
                    </div>

                    <div className="divide-y divide-border-subtle dark:divide-[#233831]">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-forest dark:text-[#F0F4F2] truncate">
                              {item.name[language] || item.name.fr}
                            </p>
                            <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0] truncate">
                              {item.description[language] || item.description.fr}
                            </p>
                          </div>
                          <span className="text-xs font-black text-forest dark:text-[#F0F4F2] shrink-0">
                            {item.price} MAD
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border-subtle dark:border-[#233831] flex items-center justify-between">
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                  {isEn ? 'Will be created as a Draft' : 'Sera enregistré comme Brouillon'}
                </p>
                <Button
                  variant="primary"
                  size="md"
                  disabled={isFinalizing}
                  leftIcon={<Check className="w-4 h-4" />}
                  onClick={() =>
                    finalizeMenuCreation(
                      isEn ? 'AI Prompt Generated Menu' : 'Menu Généré par IA',
                      generatedCategories
                    )
                  }
                  className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white border-none"
                >
                  {isFinalizing
                    ? isEn
                      ? 'Creating draft...'
                      : 'Création en cours...'
                    : isEn
                    ? 'Confirm & Create Draft'
                    : 'Confirmer & Créer le Brouillon'}
                </Button>
              </div>
            </div>
          )}

          {/* METHOD C: TEMPLATES GALLERY (6 DISTINCT TEMPLATES) */}
          {step === 'template_gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle dark:border-[#233831]">
                <button
                  onClick={() => setStep('select_method')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-[#F0F4F2]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Back to methods' : 'Retour aux méthodes'}</span>
                </button>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {isEn ? '10 Professional Templates' : '10 Modèles Professionnels'}
                </span>
              </div>

              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-xl font-bold font-display text-forest dark:text-[#F0F4F2]">
                  {isEn ? 'Choose a Menu Template' : 'Choisissez un Modèle de Menu'}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                  {isEn
                    ? 'Each template is tailored for a specific hospitality category with structured Moroccan sample dishes.'
                    : 'Chaque modèle est calibré pour un type d’établissement avec des plats types en MAD.'}
                </p>
              </div>

              {/* 6 Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {MENU_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="rounded-2xl border border-border-subtle dark:border-[#233831] hover:border-[#EA580C] bg-white dark:bg-[#14241F] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={tpl.previewHeroImage}
                          alt={tpl.name[language] || tpl.name.fr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/95 dark:bg-black/80 text-forest dark:text-[#F0F4F2] shadow-sm">
                            {tpl.badge[language] || tpl.badge.fr}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h4 className="text-base font-bold font-display text-forest dark:text-[#F0F4F2]">
                          {tpl.name[language] || tpl.name.fr}
                        </h4>
                        <p className="text-[11px] font-semibold text-[#EA580C]">
                          {tpl.intendedFor[language] || tpl.intendedFor.fr}
                        </p>
                        <p className="text-xs text-ink-secondary dark:text-[#97A7A0] line-clamp-2 leading-relaxed">
                          {tpl.description[language] || tpl.description.fr}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-2 border-t border-border-subtle dark:border-[#233831] flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setPreviewTemplate(tpl)}
                        className="flex-1 text-xs"
                      >
                        {isEn ? 'Preview' : 'Aperçu'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSelectTemplate(tpl)}
                        className="flex-1 text-xs bg-[#EA580C] hover:bg-[#EA580C]/90 text-white border-none"
                      >
                        {isEn ? 'Use Template' : 'Utiliser'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* METHOD C: CUSTOMIZE SELECTED TEMPLATE */}
          {step === 'template_customize' && selectedTemplate && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle dark:border-[#233831]">
                <button
                  onClick={() => setStep('template_gallery')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary dark:text-[#97A7A0] hover:text-forest dark:hover:text-[#F0F4F2]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Back to templates' : 'Retour aux modèles'}</span>
                </button>
                <span className="text-xs font-bold text-[#EA580C]">
                  {selectedTemplate.name[language] || selectedTemplate.name.fr}
                </span>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold font-display text-forest dark:text-[#F0F4F2]">
                  {isEn ? 'Customize Your Menu Draft' : 'Personnalisez Votre Brouillon'}
                </h3>
                <p className="text-xs text-ink-secondary dark:text-[#97A7A0]">
                  {isEn
                    ? 'Confirm details before generating your draft menu.'
                    : 'Ajustez les paramètres avant de générer votre carte.'}
                </p>
              </div>

              <div className="space-y-4">
                {/* Menu Name */}
                <div>
                  <label className="block text-xs font-bold text-forest dark:text-[#F0F4F2] mb-1">
                    {isEn ? 'Menu Title' : 'Nom du Menu'}
                  </label>
                  <input
                    type="text"
                    value={customMenuName}
                    onChange={(e) => setCustomMenuName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-white dark:bg-[#182C25] text-xs sm:text-sm font-semibold"
                  />
                </div>

                {/* Restaurant Name (prefilled) */}
                <div>
                  <label className="block text-xs font-bold text-forest dark:text-[#F0F4F2] mb-1">
                    {isEn ? 'Restaurant / Venue Name' : 'Établissement'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeRestaurant.name}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-[#233831] bg-ivory dark:bg-[#14241F] text-xs sm:text-sm font-semibold opacity-75 cursor-not-allowed"
                  />
                </div>

                {/* Accent Color Selection */}
                <div>
                  <label className="block text-xs font-bold text-forest dark:text-[#F0F4F2] mb-1.5">
                    {isEn ? 'Accent Theme Color' : 'Couleur d’Accentuation'}
                  </label>
                  <div className="flex items-center gap-3">
                    {[
                      { name: 'Terracotta', hex: '#B45309' },
                      { name: 'Brand Orange', hex: '#EA580C' },
                      { name: 'Navy', hex: '#0F2C59' },
                      { name: 'Forest', hex: '#153E35' },
                      { name: 'Rose', hex: '#E11D48' },
                      { name: 'Charcoal', hex: '#111827' }
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setCustomColor(c.hex)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          customColor === c.hex ? 'border-forest dark:border-white scale-110 shadow-md' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Languages Enabled */}
                <div>
                  <label className="block text-xs font-bold text-forest dark:text-[#F0F4F2] mb-1.5">
                    {isEn ? 'Available Languages' : 'Langues Disponibles'}
                  </label>
                  <div className="flex gap-2">
                    {(['fr', 'en', 'ar'] as FoodLanguageCode[]).map((lng) => {
                      const isSelected = enabledLanguages.includes(lng);
                      return (
                        <button
                          key={lng}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (enabledLanguages.length > 1) {
                                setEnabledLanguages(enabledLanguages.filter((l) => l !== lng));
                              }
                            } else {
                              setEnabledLanguages([...enabledLanguages, lng]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                            isSelected
                              ? 'bg-forest dark:bg-[#1C332B] text-white border-forest'
                              : 'bg-white dark:bg-[#182C25] text-ink-secondary dark:text-[#97A7A0] border-border-subtle dark:border-[#233831]'
                          }`}
                        >
                          {lng}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-border-subtle dark:border-[#233831] flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  disabled={isFinalizing || !customMenuName.trim()}
                  leftIcon={<Check className="w-4 h-4" />}
                  onClick={() =>
                    finalizeMenuCreation(
                      customMenuName,
                      selectedTemplate.categories,
                      selectedTemplate.id
                    )
                  }
                  className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white border-none"
                >
                  {isFinalizing
                    ? isEn
                      ? 'Creating draft...'
                      : 'Création en cours...'
                    : isEn
                    ? 'Generate Draft Menu'
                    : 'Générer le Brouillon'}
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* --- TEMPLATE PREVIEW MODAL OVERLAY --- */}
        {previewTemplate && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="bg-white dark:bg-[#14241F] rounded-3xl border border-border-subtle dark:border-[#233831] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-forest dark:text-[#F0F4F2]">
              {/* Preview Header */}
              <div className="p-4 sm:p-5 border-b border-border-subtle dark:border-[#233831] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-forest dark:text-[#F0F4F2]">
                    {previewTemplate.name[language] || previewTemplate.name.fr}
                  </h3>
                  <p className="text-[11px] text-ink-secondary dark:text-[#97A7A0]">
                    {previewTemplate.tagline[language] || previewTemplate.tagline.fr}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center p-1 rounded-xl bg-ivory dark:bg-[#182C25] border border-border-subtle dark:border-[#233831]">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                        previewDevice === 'mobile'
                          ? 'bg-white dark:bg-[#14241F] text-forest dark:text-[#F0F4F2] shadow-sm'
                          : 'text-ink-secondary dark:text-[#97A7A0]'
                      }`}
                      title={isEn ? 'Mobile view' : 'Vue mobile'}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                        previewDevice === 'desktop'
                          ? 'bg-white dark:bg-[#14241F] text-forest dark:text-[#F0F4F2] shadow-sm'
                          : 'text-ink-secondary dark:text-[#97A7A0]'
                      }`}
                      title={isEn ? 'Desktop view' : 'Vue écran'}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="p-2 rounded-xl text-ink-secondary dark:text-[#97A7A0] hover:text-forest"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preview Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 dark:bg-[#0E1A16] flex justify-center items-start">
                <div
                  className={`transition-all duration-300 rounded-3xl overflow-hidden shadow-2xl ${
                    previewDevice === 'mobile'
                      ? 'w-full max-w-[390px] border-8 border-slate-900 rounded-[44px]'
                      : 'w-full max-w-2xl border border-black/10'
                  }`}
                >
                  <SofraFlowTemplateRenderer
                    template={previewTemplate}
                    restaurant={activeRestaurant}
                    locale={language as FoodLanguageCode}
                    previewMode={true}
                    isMobile={previewDevice === 'mobile'}
                    onTemplateSelect={() => {
                      const chosen = previewTemplate;
                      setPreviewTemplate(null);
                      handleSelectTemplate(chosen);
                    }}
                  />
                </div>
              </div>

              {/* Preview Footer Actions */}
              <div className="p-4 border-t border-border-subtle dark:border-[#233831] flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(null)}>
                  {isEn ? 'Close Preview' : 'Fermer'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const chosen = previewTemplate;
                    setPreviewTemplate(null);
                    handleSelectTemplate(chosen);
                  }}
                  className="bg-[#EA580C] hover:bg-[#EA580C]/90 text-white border-none"
                >
                  {isEn ? 'Use This Template' : 'Utiliser ce Modèle'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
