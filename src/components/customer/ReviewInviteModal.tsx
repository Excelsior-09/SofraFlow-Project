import React, { useState } from 'react';
import { X, Star, ExternalLink, MessageSquare, CheckCircle2, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ReviewInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
}

export const ReviewInviteModal: React.FC<ReviewInviteModalProps> = ({
  isOpen,
  onClose,
  restaurantName
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [rating, setRating] = useState<number>(5);
  const [submittedPrivate, setSubmittedPrivate] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-6 shadow-elevated border border-border-subtle dark:border-dark-border z-10 space-y-5 animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-ink-secondary dark:text-dark-muted hover:bg-ivory dark:hover:bg-dark-surface"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 mx-auto flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <h3 className="text-lg font-extrabold text-brand-navy dark:text-dark-text font-display">
            {isEn ? `How was your visit at ${restaurantName}?` : `Comment s'est passée votre visite chez ${restaurantName} ?`}
          </h3>
          <p className="text-xs text-ink-secondary dark:text-dark-muted max-w-xs mx-auto">
            {isEn
              ? 'Your feedback helps the team improve and guides future food lovers in Morocco!'
              : 'Votre avis aide notre équipe à s’améliorer et guide les gourmets au Maroc !'}
          </p>
        </div>

        {/* 5-Star Selection */}
        <div className="flex items-center justify-center gap-2 py-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 text-amber-400 hover:scale-110 transition-transform focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
              />
            </button>
          ))}
        </div>

        {/* Dual Actions: Public Google Review or Direct Manager Note */}
        {!submittedPrivate ? (
          <div className="space-y-3 pt-2">
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 rounded-2xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>{isEn ? 'Share on Google Reviews' : 'Partager mon avis sur Google'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border-subtle dark:border-dark-border" />
              <span className="flex-shrink mx-2 text-[10px] text-ink-secondary dark:text-dark-muted uppercase font-bold">
                {isEn ? 'Or send private note' : 'Ou message privé au gérant'}
              </span>
              <div className="flex-grow border-t border-border-subtle dark:border-dark-border" />
            </div>

            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isEn ? 'Leave a direct note for the kitchen or manager...' : 'Une suggestion directe pour l’équipe ou la cuisine...'}
              className="w-full p-3 rounded-xl border border-border-subtle dark:border-dark-border bg-ivory dark:bg-dark-surface text-xs focus:outline-none focus:border-brand-orange"
            />

            <button
              type="button"
              onClick={() => setSubmittedPrivate(true)}
              className="w-full py-2.5 rounded-xl border border-border-subtle dark:border-dark-border text-ink-main dark:text-dark-text hover:bg-ivory dark:hover:bg-dark-surface text-xs font-semibold transition-colors"
            >
              {isEn ? 'Send Private Feedback' : 'Envoyer en privé'}
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {isEn ? 'Thank you! Your private feedback has been recorded.' : 'Merci ! Votre retour privé a été transmis au gérant.'}
            </p>
          </div>
        )}

        <div className="pt-2 text-center border-t border-border-subtle dark:border-dark-border">
          <p className="text-[10px] text-ink-secondary dark:text-dark-muted">
            {isEn
              ? 'Demonstration of the post-order review invitation flow. Unbiased & authentic.'
              : 'Démonstration du module d’invitation d’avis après commande. Transparent et authentique.'}
          </p>
        </div>
      </div>
    </div>
  );
};
