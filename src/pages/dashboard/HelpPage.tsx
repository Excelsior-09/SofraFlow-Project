import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  QrCode,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/db';

export const HelpPage: React.FC = () => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [resetDone, setResetDone] = useState(false);

  const handleResetData = () => {
    const confirmMsg = isEn
      ? 'Reset all demo data to their initial state for Moroccan restaurants? Your test dishes will be reset.'
      : 'Réinitialiser toutes les données de démonstration à leur état initial pour restaurants marocains ? Vos plats de test seront réinitialisés.';
    if (confirm(confirmMsg)) {
      db.resetToSeed();
      setResetDone(true);
      setTimeout(() => {
        setResetDone(false);
        window.location.reload();
      }, 1500);
    }
  };

  const metaSteps = isEn
    ? [
        {
          title: '1. Create a Meta for Developers account',
          desc: 'Visit developers.facebook.com and register with your professional or business account.'
        },
        {
          title: '2. Create a WhatsApp Business application',
          desc: 'Select the "Business" type and add the WhatsApp product in your Meta developer dashboard.'
        },
        {
          title: '3. Register your kitchen phone number',
          desc: 'Link the official mobile or landline number where the kitchen will receive customer order notifications.'
        },
        {
          title: '4. Configure the notification template',
          desc: 'Create the "sofraflow_order_notification_v1" template with variables for restaurant name, reference, order items, and total amount.'
        },
        {
          title: '5. Enter your credentials in SOFRAFLOW',
          desc: 'Copy your Phone Number ID, WABA ID, and permanent token under the WhatsApp API tab in your dashboard.'
        }
      ]
    : [
        {
          title: '1. Créer un compte Meta for Developers',
          desc: 'Rendez-vous sur developers.facebook.com et inscrivez-vous avec votre compte professionnel.'
        },
        {
          title: '2. Créer une application WhatsApp Business',
          desc: 'Sélectionnez le type "Business" et ajoutez le produit WhatsApp dans votre tableau de bord Meta.'
        },
        {
          title: '3. Enregistrer le numéro de téléphone de la cuisine',
          desc: 'Associez la ligne mobile ou fixe officielle sur laquelle la cuisine recevra les bons de commande.'
        },
        {
          title: '4. Configurer le modèle de notification (Template)',
          desc: 'Créez le modèle "sofraflow_order_notification_v1" avec les variables pour le restaurant, la référence, les articles et le montant.'
        },
        {
          title: '5. Renseigner vos identifiants dans SOFRAFLOW',
          desc: 'Copiez votre Phone Number ID, WABA ID et Jeton permanent sous l’onglet WhatsApp API du tableau de bord.'
        }
      ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-dark-text font-display">
            {t('help.pageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-dark-secondary mt-1">
            {t('help.pageSubtitle')}
          </p>
        </div>

        {resetDone && (
          <Alert type="success">
            {isEn
              ? 'Database has been successfully reset! Reloading...'
              : 'La base de données a été réinitialisée avec succès ! Rechargement en cours…'}
          </Alert>
        )}

        {/* WhatsApp Setup Guide Card */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border-subtle dark:border-dark-border">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#128C7E] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-forest dark:text-dark-text font-display">
                {isEn ? 'Meta WhatsApp Cloud API Connection Guide' : 'Guide de connexion Meta WhatsApp Cloud API'}
              </h3>
              <p className="text-xs text-ink-secondary dark:text-dark-muted">
                {isEn
                  ? 'Follow these 5 steps to move from sandbox mode to live WhatsApp Cloud messaging.'
                  : 'Suivez ces 5 étapes pour passer du mode bac à sable à la messagerie WhatsApp Cloud en direct.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {metaSteps.map((s, idx) => (
              <div key={idx} className="flex items-start gap-3.5 text-xs">
                <span className="w-6 h-6 rounded-full bg-forest text-white font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-forest dark:text-dark-text text-sm">{s.title}</h4>
                  <p className="text-ink-secondary dark:text-dark-muted mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-gold hover:underline"
            >
              <span>
                {isEn
                  ? 'View official Meta WhatsApp Cloud API documentation'
                  : 'Consulter la documentation officielle Meta WhatsApp Cloud API'}
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </Card>

        {/* QR Printing Best Practices */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border-subtle dark:border-dark-border">
            <div className="w-10 h-10 rounded-xl bg-forest/10 dark:bg-forest/20 text-forest dark:text-gold flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-forest dark:text-dark-text font-display">
                {isEn
                  ? 'Printing Best Practices for QR & NFC Table Tents'
                  : "Conseils d'impression pour chevalets de table QR & NFC"}
              </h3>
              <p className="text-xs text-ink-secondary dark:text-dark-muted">
                {isEn
                  ? 'Recommendations for instant scanning even under dim restaurant lighting or outdoor terraces.'
                  : 'Recommandations pour un scan instantané même sous faible éclairage de restaurant ou terrasse.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-ink-secondary dark:text-dark-muted leading-relaxed">
            <div className="p-3 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border space-y-1">
              <h5 className="font-bold text-forest dark:text-dark-text">
                {isEn ? 'Matte Lamination' : 'Pelliculage Mat'}
              </h5>
              <p>
                {isEn
                  ? 'Avoid glossy plastics that reflect spotlights or strong terrace sunlight.'
                  : 'Évitez les plastiques brillants qui reflètent les spots lumineux ou le soleil en terrasse.'}
              </p>
            </div>
            <div className="p-3 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border space-y-1">
              <h5 className="font-bold text-forest dark:text-dark-text">
                {isEn ? 'High Contrast' : 'Contraste Élevé'}
              </h5>
              <p>
                {isEn
                  ? 'Keep a dark QR code on a white or ivory background for immediate camera focus.'
                  : 'Conservez un QR code sombre sur fond blanc ou ivoire pour une mise au point immédiate de la caméra.'}
              </p>
            </div>
            <div className="p-3 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border space-y-1">
              <h5 className="font-bold text-forest dark:text-dark-text">
                {isEn ? 'Format & Scan Distance' : 'Format et Distance de Scan'}
              </h5>
              <p>
                {isEn
                  ? 'A 5cm × 5cm square allows comfortable scanning from 30–50cm away by seated guests.'
                  : 'Un carré de 5cm × 5cm permet un scan confortable à 30–50cm de distance par le client assis.'}
              </p>
            </div>
            <div className="p-3 bg-ivory dark:bg-dark-surface rounded-xl border border-border-subtle dark:border-dark-border space-y-1">
              <h5 className="font-bold text-forest dark:text-dark-text">
                {isEn ? 'Dedicated Table Numbering' : 'Numérotation Dédiée par Table'}
              </h5>
              <p>
                {isEn
                  ? 'Download QR codes assigned to each specific table so staff can serve without hesitation.'
                  : 'Téléchargez des QR codes assignés à chaque table afin que le personnel serve sans hésitation.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Developer / Demo Reset */}
        <Card className="p-6 space-y-3 border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
            <RotateCcw className="w-4 h-4" />
            <h4 className="font-bold text-xs uppercase tracking-wider">
              {isEn ? 'Reset Demo Workspace' : "Réinitialiser l'espace de démonstration"}
            </h4>
          </div>
          <p className="text-xs text-ink-secondary dark:text-dark-muted leading-relaxed">
            {isEn
              ? 'Need to reset your testing environment with typical orders and Marrakech gastronomic catalog?'
              : 'Besoin de réinitialiser votre environnement de test avec les commandes types et le catalogue gastronomique de Marrakech ?'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            onClick={handleResetData}
          >
            {isEn ? 'Reset Demo Data' : 'Réinitialiser les données de démonstration'}
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};
