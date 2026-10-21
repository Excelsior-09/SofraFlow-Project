import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Calendar, ArrowRight, BookOpen, Sparkles, User, Tag } from 'lucide-react';
import { MarketingNav } from '../../components/marketing/MarketingNav';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { SEO } from '../../components/common/SEO';
import { Badge } from '../../components/common/Badge';
import { BLOG_ARTICLES, BlogArticle } from '../../data/blogArticles';
import { useLanguage } from '../../context/LanguageContext';
import { analytics } from '../../services/analytics';

export const BlogIndexPage: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    analytics.trackPageView('blog_index', 'blog');
    window.scrollTo(0, 0);
  }, []);

  const articles: BlogArticle[] = Object.values(BLOG_ARTICLES);
  const categories = isEn
    ? ['all', 'Guides & Practice', 'Cafes & Terraces', 'Bakeries', 'WhatsApp & Tech', 'Comparisons']
    : ['all', 'Guides & Pratique', 'Cafés & Salons', 'Boulangeries', 'Technologie & WhatsApp', 'Comparatifs'];

  const filteredArticles = articles.filter(article => {
    const matchesCategory =
      selectedCategory === 'all' ||
      selectedCategory === (isEn ? 'all' : 'all') ||
      article.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = articles[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans text-ink-main selection:bg-[#e35d25] selection:text-white">
      <SEO
        title={isEn ? "Hospitality Blog & Guides: Digital Menus, QR & WhatsApp | SOFRAFLOW" : "Blog & Ressources : Menus Digitaux, QR Code & Restauration au Maroc | SOFRAFLOW"}
        description={isEn ? "Practical guides, setup tutorials, and industry insights for digital menus, WhatsApp ordering, and hospitality growth in Morocco." : "Guides pratiques, astuces d’optimisation et analyses pour digitaliser votre menu, réduire vos coûts d’impression et développer votre activité au Maroc."}
        canonical="/blog"
      />

      <MarketingNav />

      {/* =========================================================
          1. HERO HEADER
      ========================================================= */}
      <section className="relative pt-16 pb-16 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EF] to-[#FAF8F5] border-b border-gray-200/70 text-center">
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-[#e35d25]/10 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e35d25]/10 border border-[#e35d25]/20 text-[#e35d25] text-xs font-bold tracking-wide">
            <BookOpen className="w-4 h-4 text-[#e35d25]" />
            <span>{isEn ? 'Hospitality Growth Hub in Morocco' : 'Centre de Ressources & Guides Pratiques'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-forest font-display tracking-tight leading-[1.15]">
            {isEn ? (
              <>Guides & insights to <span className="text-[#e35d25]">grow your venue</span></>
            ) : (
              <>Conseils & bonnes pratiques pour <span className="text-[#e35d25]">votre établissement</span></>
            )}
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            {isEn
              ? 'Actionable guides on QR menus, WhatsApp ordering workflows, and hospitality operations in Casablanca, Marrakech, Rabat, and beyond.'
              : 'Découvrez nos retours d\'expérience et analyses pour optimiser vos menus QR codes, accélérer le service et ravir vos clients au Maroc.'}
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-ink-secondary absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={isEn ? "Search a guide, industry, or keyword…" : "Rechercher un guide, un secteur ou un mot-clé…"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#e35d25]"
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          2. FEATURED ARTICLE BANNER
      ========================================================= */}
      {featuredArticle && !searchQuery && selectedCategory === 'all' && (
        <section className="py-12 bg-white border-b border-gray-200/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#FAF8F5] rounded-3xl border border-gray-200/90 shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch group">
              <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#e35d25] text-white">
                      {isEn ? 'Featured Guide' : 'Article à la Une'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{featuredArticle.category}</span>
                  </div>

                  <Link to={`/blog/${featuredArticle.slug}`}>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-forest font-display leading-tight group-hover:text-[#e35d25] transition-colors">
                      {featuredArticle.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
                  <div className="flex items-center gap-3 text-xs text-ink-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#e35d25]" /> {featuredArticle.readTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> {featuredArticle.publishDate}
                    </span>
                  </div>

                  <Link to={`/blog/${featuredArticle.slug}`}>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e35d25] hover:text-[#cf4f1a] transition-colors">
                      <span>{isEn ? 'Read article' : 'Lire l’article'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5 relative min-h-[260px] overflow-hidden bg-gray-100">
                <img
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          3. ARTICLES GRID
      ========================================================= */}
      <section className="py-16 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-forest font-display">
              {isEn ? 'All Published Guides' : 'Tous nos Guides & Articles'}
            </h3>
            <span className="text-xs text-gray-500 font-semibold">
              {filteredArticles.length} {isEn ? 'articles available' : 'articles disponibles'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((art) => (
              <div
                key={art.slug}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute top-3.5 right-3.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-forest shadow-xs">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-[#e35d25]" />
                      <span>{art.readTime}</span>
                      <span>•</span>
                      <span>{art.publishDate}</span>
                    </div>

                    <Link to={`/blog/${art.slug}`}>
                      <h4 className="text-base font-bold text-forest font-display leading-snug group-hover:text-[#e35d25] transition-colors line-clamp-2">
                        {art.title}
                      </h4>
                    </Link>

                    <p className="text-xs text-ink-secondary leading-relaxed line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link to={`/blog/${art.slug}`}>
                    <button className="w-full py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                      <span>{isEn ? 'Read Guide' : 'Consulter le guide'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          4. FINAL CTA BANNER
      ========================================================= */}
      <section className="py-20 bg-[#0B132B] text-white text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#e35d25]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black font-display leading-tight text-white">
            {isEn ? 'Ready to apply these practices to your venue?' : 'Prêt à appliquer ces méthodes dans votre salle ?'}
          </h2>
          <p className="text-white/80 text-base max-w-xl mx-auto leading-relaxed">
            {isEn
              ? 'Create your free digital menu in 15 minutes. 14 days free trial without any credit card.'
              : 'Créez votre menu digital gratuit en 15 minutes. 14 jours d’essai sans carte bancaire.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <button className="px-8 py-4 rounded-xl bg-[#e35d25] hover:bg-[#cf4f1a] text-white font-extrabold text-base shadow-lg shadow-[#e35d25]/30 transition-all flex items-center gap-2">
                <span>{isEn ? 'Start 14-Day Free Trial' : 'Créer mon menu digital maintenant'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/solutions">
              <button className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base transition-colors">
                {isEn ? 'Explore Industry Solutions' : 'Découvrir les solutions par métier'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};
