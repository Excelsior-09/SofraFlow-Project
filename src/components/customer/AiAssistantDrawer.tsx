import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, Plus, Check, RefreshCw } from 'lucide-react';
import { AI_CUSTOMER_PROMPTS, DEMO_DISHES } from '../../data/demoData';
import { DemoDish } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (dish: DemoDish) => void;
}

interface Message {
  id: string;
  sender: 'zina' | 'user';
  text: string;
  recommendedDishes?: DemoDish[];
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onAddToCart
}) => {
  const { language, t, formatCurrency } = useLanguage();
  const isEn = language === 'en';

  const defaultGreeting: Message = {
    id: 'welcome',
    sender: 'zina',
    text: isEn
      ? "Hello! I’m Zina, your culinary assistant. Looking for something tailored to your appetite, dietary preferences, or budget today?"
      : "Bonjour ! Je suis Zina, votre assistante culinaire. Cherchez-vous un plat adapté à votre appétit, à un régime particulier ou à votre budget aujourd’hui ?"
  };

  const [messages, setMessages] = useState<Message[]>([defaultGreeting]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSelectPrompt = (promptItem: typeof AI_CUSTOMER_PROMPTS[0]) => {
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: promptItem.prompt[language] || promptItem.prompt.fr
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const matchedDishes = DEMO_DISHES.filter(d => promptItem.recommendedIds.includes(d.id));
      const zinaMsg: Message = {
        id: `z_${Date.now()}`,
        sender: 'zina',
        text: promptItem.response[language] || promptItem.response.fr,
        recommendedDishes: matchedDishes
      };
      setMessages(prev => [...prev, zinaMsg]);
    }, 450);
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lower = userText.toLowerCase();

      // Intelligent simulated matching
      let replyText = '';
      let matched: DemoDish[] = [];

      if (lower.includes('80') || lower.includes('budget') || lower.includes('cheap') || lower.includes('prix')) {
        replyText = isEn
          ? 'Under 80 MAD, I highly recommend our Sourdough Avocado Toast (58 MAD) or Traditional Moroccan Mint Tea (22 MAD) paired with Gazelle Horns (32 MAD)!'
          : 'Pour moins de 80 MAD, je vous recommande vivement notre Toast Avocat au Levain (58 MAD) ou un Thé à la Menthe Fraîche (22 MAD) accompagné de Cornes de Gazelle (32 MAD) !';
        matched = DEMO_DISHES.filter(d => ['dish_avocado_toast', 'dish_the_menthe', 'dish_cornes_gazelle'].includes(d.id));
      } else if (lower.includes('burger') || lower.includes('sandwich') || lower.includes('meat') || lower.includes('viande')) {
        replyText = isEn
          ? 'Our Atlas Gourmet Smash Burger (78 MAD) made with 100% halal beef pairs wonderfully with Hand-Cut Fries (24 MAD) and a cold Mint Lemonade (28 MAD).'
          : 'Notre Smash Burger Gourmet de l’Atlas (78 MAD) à la viande 100% halal s’accorde parfaitement avec des Frites Fraîches (24 MAD) et une Citronnade à la Menthe (28 MAD).';
        matched = DEMO_DISHES.filter(d => ['dish_burger_atlas', 'dish_frites_maison', 'dish_lemonade_menthe'].includes(d.id));
      } else if (lower.includes('veget') || lower.includes('vegan') || lower.includes('salade')) {
        replyText = isEn
          ? 'For vegetarian dining, our Smoked Eggplant Zaalouk (38 MAD) and Sourdough Avocado Toast (58 MAD) are seasonal chef specialties!'
          : 'Pour un repas végétarien savoureux, notre Zaalouk d’Aubergines Fumées (38 MAD) et notre Toast Avocat (58 MAD) sont préparés frais chaque matin !';
        matched = DEMO_DISHES.filter(d => ['dish_zaalouk', 'dish_avocado_toast'].includes(d.id));
      } else {
        replyText = isEn
          ? 'Our signature dish today is the Slow-Cooked Lamb Tagine with Prunes (95 MAD), exquisitely accompanied by our Traditional Mint Tea (22 MAD).'
          : 'Notre spécialité du chef aujourd’hui est le Tajine d’Agneau aux Pruneaux & Amandes (95 MAD), idéalement accompagné de notre Thé à la Menthe Traditionnel (22 MAD).';
        matched = DEMO_DISHES.filter(d => ['dish_tagine_agneau', 'dish_the_menthe'].includes(d.id));
      }

      setMessages(prev => [
        ...prev,
        {
          id: `z_${Date.now()}`,
          sender: 'zina',
          text: replyText,
          recommendedDishes: matched
        }
      ]);
    }, 500);
  };

  const handleAddDish = (dish: DemoDish) => {
    onAddToCart(dish);
    setAddedIds(prev => [...prev, dish.id]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== dish.id));
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card h-full shadow-elevated z-10 flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-orange to-amber-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
              Z
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-brand-navy dark:text-dark-text">
                  {t('aiDemo.headerTitle')}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/80 text-brand-orange">
                  IA
                </span>
              </div>
              <p className="text-[11px] text-ink-secondary dark:text-dark-muted">
                {t('aiDemo.headerSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-secondary dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-card"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 border-b border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card overflow-x-auto">
          <div className="flex items-center gap-2 text-xs">
            {AI_CUSTOMER_PROMPTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPrompt(p)}
                className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-brand-orange border border-orange-200 dark:border-orange-900/50 hover:bg-orange-100 font-medium whitespace-nowrap text-[11px] transition-colors"
              >
                ✨ {p.prompt[language] || p.prompt.fr}
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-navy text-white rounded-br-xs'
                    : 'bg-ivory dark:bg-dark-surface border border-border-subtle dark:border-dark-border text-ink-main dark:text-dark-text rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>

              {/* Recommended Dish Cards inside message */}
              {m.recommendedDishes && m.recommendedDishes.length > 0 && (
                <div className="w-full mt-2 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-secondary dark:text-dark-muted">
                    {isEn ? 'Recommended Items:' : 'Plats recommandés :'}
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {m.recommendedDishes.map((dish) => {
                      const isAdded = addedIds.includes(dish.id);
                      return (
                        <div
                          key={dish.id}
                          className="p-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <img
                              src={dish.imageUrl}
                              alt={dish.name[language] || dish.name.fr}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-bold text-brand-navy dark:text-dark-text truncate">
                                {dish.name[language] || dish.name.fr}
                              </h4>
                              <p className="text-[11px] font-extrabold text-brand-orange">
                                {formatCurrency(dish.price, dish.currency)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddDish(dish)}
                            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all flex-shrink-0 ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-brand-orange hover:bg-orange-700 text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{isEn ? 'Added' : 'Ajouté'}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>{isEn ? 'Add' : 'Ajouter'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-ivory dark:bg-dark-surface w-20">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-bounce [animation-delay:0.15s]" />
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-bounce [animation-delay:0.3s]" />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleCustomSend} className="p-3 border-t border-border-subtle dark:border-dark-border bg-white dark:bg-dark-card flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('aiDemo.inputPlaceholder')}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface text-xs sm:text-sm text-ink-main dark:text-dark-text focus:outline-none focus:border-brand-orange"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-brand-orange hover:bg-orange-700 text-white transition-colors"
            aria-label={t('aiDemo.sendBtn')}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-ivory dark:bg-dark-surface border-t border-border-subtle dark:border-dark-border text-center">
          <span className="text-[10px] text-ink-secondary dark:text-dark-muted">
            {t('aiDemo.disclaimer')}
          </span>
        </div>
      </div>
    </div>
  );
};
