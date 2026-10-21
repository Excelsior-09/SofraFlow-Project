import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  User,
  ArrowRight,
  ChevronRight,
  Share2,
  Check,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SEO } from '../../components/common/SEO';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { BLOG_ARTICLES, BlogArticle } from '../../data/blogArticles';
import { useLanguage } from '../../context/LanguageContext';
import { analytics } from '../../services/analytics';

export const BlogArticlePage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const { slug } = useParams<{ slug: string }>();

  const article: BlogArticle | undefined = slug ? BLOG_ARTICLES[slug] : undefined;

  useEffect(() => {
    if (article) {
      analytics.track('blog_article_view', {
        slug: article.slug,
        title: article.title,
        category: article.category
      });
      window.scrollTo(0, 0);
    }
  }, [article]);

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  // Structured Data Schema for Article
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Accueil',
          'item': 'https://sofraflow.com/'
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Blog',
          'item': 'https://sofraflow.com/blog'
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': article.title,
          'item': `https://sofraflow.com/blog/${article.slug}`
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.seoTitle,
      'description': article.seoDescription,
      'image': 'https://sofraflow.com/sofraflow-logo.jpg',
      'author': {
        '@type': 'Person',
        'name': article.author.name,
        'jobTitle': article.author.role
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'SOFRAFLOW',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://sofraflow.com/favicon.png'
        }
      },
      'datePublished': '2026-10-15T09:00:00+01:00',
      'dateModified': '2026-10-21T02:00:00+01:00',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `https://sofraflow.com/blog/${article.slug}`
      }
    }
  ];

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      <SEO
        title={article.seoTitle}
        description={article.seoDescription}
        canonical={`/blog/${article.slug}`}
        ogType="article"
        structuredData={structuredData}
      />

      <MarketingNav />

      {/* Breadcrumb Bar */}
      <div className="bg-white/80 border-b border-border-subtle py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-ink-secondary">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Link to="/" className="hover:text-forest transition-colors">Accueil</Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-secondary/50" />
          <Link to="/blog" className="hover:text-forest transition-colors">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-secondary/50" />
          <span className="text-forest font-semibold truncate max-w-xs sm:max-w-md">{article.title}</span>
        </div>
      </div>

      {/* Article Header */}
      <section className="pt-12 pb-10 bg-white border-b border-border-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gold/20 text-gold-hover">
              {article.category}
            </span>
            <span className="text-xs text-ink-secondary flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {article.readTime}
            </span>
            <span className="text-xs text-ink-secondary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {article.publishDate}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-forest font-display leading-[1.2]">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
            {article.excerpt}
          </p>

          {/* Author info snippet */}
          <div className="pt-2 flex items-center justify-between border-t border-border-subtle/80">
            <div className="flex items-center gap-3">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover border border-border-subtle"
              />
              <div>
                <h4 className="text-xs font-bold text-forest">{article.author.name}</h4>
                <p className="text-[11px] text-ink-secondary">{article.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
              <Share2 className="w-4 h-4 text-forest" />
              <span className="hidden sm:inline">Guide vérifié SOFRAFLOW</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="py-12 bg-ivory flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Key Takeaways Callout Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-forest/5 border border-forest/20 shadow-soft space-y-4">
            <div className="flex items-center gap-2 text-forest font-bold text-sm">
              <Sparkles className="w-5 h-5 text-gold" />
              <span>Points Clés à Retenir</span>
            </div>
            <ul className="space-y-2.5">
              {article.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-main">
                  <Check className="w-4 h-4 text-status-success mt-0.5 flex-shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content Sections */}
          <div className="space-y-10">
            {article.sections.map((section, idx) => (
              <section key={idx} className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-xs">
                <h2 className="text-xl sm:text-2xl font-bold text-forest font-display">
                  {section.heading}
                </h2>

                <div className="space-y-3.5 text-sm text-ink-secondary leading-relaxed">
                  {section.paragraphs.map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>

                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="space-y-2 pt-2 border-t border-border-subtle">
                    {section.bulletPoints.map((bp, bpIdx) => (
                      <li key={bpIdx} className="flex items-start gap-2 text-xs sm:text-sm text-ink-main">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.callout && (
                  <div className="mt-4 p-4 rounded-2xl bg-gold/10 border-l-4 border-gold text-xs sm:text-sm text-forest font-medium">
                    {section.callout}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <span className="text-xs font-semibold text-ink-secondary">Thématiques :</span>
            {article.tags.map((tag, idx) => (
              <span key={idx} className="text-xs px-3 py-1 rounded-full bg-white border border-border-subtle text-forest font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Author Card */}
          <div className="p-6 rounded-3xl bg-white border border-border-subtle flex flex-col sm:flex-row items-center gap-5">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-forest"
            />
            <div className="text-center sm:text-left space-y-1">
              <h4 className="font-bold text-forest text-base">{article.author.name}</h4>
              <p className="text-xs text-gold-hover font-semibold">{article.author.role}</p>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Spécialiste de la digitalisation des commerces et de l’expérience client en restauration au Maroc.
              </p>
            </div>
          </div>

          {/* In-article Conversion CTA */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0B132B] text-white shadow-2xl border border-gray-800 text-center space-y-4">
            <h3 className="text-2xl font-black font-display text-white">
              {isEn ? 'Put these insights into action for your venue' : 'Passez de la théorie à l\'action pour votre établissement'}
            </h3>
            <p className="text-white/80 text-sm max-w-lg mx-auto leading-relaxed">
              {isEn
                ? 'Configure your interactive digital menu in 15 minutes, download permanent table QR codes, and start receiving orders on WhatsApp.'
                : 'Configurez votre carte digitale en 10 minutes, téléchargez vos QR codes de table et commencez à recevoir vos commandes sur WhatsApp.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={article.ctaLink || '/signup'}>
                <button className="px-8 py-3.5 rounded-xl bg-[#e35d25] hover:bg-[#cf4f1a] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2">
                  <span>{isEn ? 'Start 14-Day Free Trial' : (article.ctaText || 'Démarrer l’essai gratuit SOFRAFLOW')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/solutions">
                <button className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors">
                  {isEn ? 'Explore Industry Solutions' : 'Explorer les solutions par métier'}
                </button>
              </Link>
            </div>
          </div>

          {/* Related Articles */}
          {article.relatedSlugs && article.relatedSlugs.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-border-subtle">
              <h3 className="text-xl font-bold text-forest font-display">Articles complémentaires</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {article.relatedSlugs.map((rSlug) => {
                  const rel = BLOG_ARTICLES[rSlug];
                  if (!rel) return null;
                  return (
                    <Link
                      key={rSlug}
                      to={`/blog/${rel.slug}`}
                      className="p-5 rounded-2xl bg-white border border-border-subtle hover:border-forest hover:shadow-soft transition-all group space-y-2"
                    >
                      <span className="text-[10px] font-bold text-gold uppercase">{rel.category}</span>
                      <h4 className="font-bold text-sm text-forest group-hover:text-forest-dark line-clamp-2">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-ink-secondary line-clamp-2">{rel.excerpt}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
};
