import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { articlesApi, Article } from '@/services/articlesApi';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gérer les tokens JWT reçus après l'authentification Google OAuth
    const { token, refreshToken } = router.query;
    if (token && refreshToken) {
      // Stocker les tockens dans les cookies (cohérent avec auth.service.ts)
      Cookies.set('accessToken', token as string, { expires: 7 });
      Cookies.set('refreshToken', refreshToken as string, { expires: 30 });

      // Nettoyer l'URL et rafraîchir les données utilisateur
      router.replace('/', undefined, { shallow: true }).then(() => {
        refreshUser();
      });
    } else if (router.isReady) {
      // Charger les articles seulement si on n'est pas en train de traiter des tokens
      loadFeaturedArticles();
    }
  }, [router.query, router.isReady]);

  const loadFeaturedArticles = async () => {
    try {
      const response = await articlesApi.getArticles({ limit: 6, sortBy: 'createdAt', sortOrder: 'DESC' });
      setFeaturedArticles(response.articles || []);
    } catch (error) {
      console.error('Error loading featured articles:', error);
      // Le service Articles n'est pas encore disponible, afficher une liste vide
      setFeaturedArticles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Collector.shop - Marketplace pour Collectionneurs</title>
        <meta name="description" content="Achetez et vendez des objets de collection entre particuliers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                Bienvenue sur
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Collector.shop
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
                La marketplace premium pour les collectionneurs. Achetez et vendez des objets de collection entre particuliers en toute sécurité.
              </p>

              {user ? (
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    href="/catalogue"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Parcourir le Catalogue
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-blue-200"
                  >
                    Mon Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    href="/catalogue"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Découvrir le Catalogue
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-blue-200"
                  >
                    S'inscrire Gratuitement
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Pourquoi choisir Collector.shop ?</h2>
              <p className="text-xl text-gray-600">La plateforme de confiance pour tous les collectionneurs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Achetez des Objets Uniques</h3>
                <p className="text-gray-700 leading-relaxed">
                  Parcourez des milliers d'objets de collection authentiques proposés par des vendeurs vérifiés du monde entier.
                </p>
              </div>

              <div className="group p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Vendez Facilement</h3>
                <p className="text-gray-700 leading-relaxed">
                  Créez votre boutique virtuelle en quelques clics et atteignez une communauté passionnée de collectionneurs.
                </p>
              </div>

              <div className="group p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Paiements Sécurisés</h3>
                <p className="text-gray-700 leading-relaxed">
                  Transactions sécurisées et protection acheteur/vendeur pour une expérience d'achat en toute confiance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Articles Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Articles Récents</h2>
                <p className="text-xl text-gray-600">Découvrez les dernières pépites ajoutées</p>
              </div>
              <Link
                href="/catalogue"
                className="hidden md:inline-flex items-center px-6 py-3 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Voir tout
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : featuredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                  >
                    <div className="relative h-64 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      {article.images && article.images.length > 0 ? (
                        <img
                          src={article.images[0]}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-6xl">
                          📦
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                        {Number(article.price).toFixed(2)} €
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {article.description}
                      </p>
                      {article.seller && (
                        <div className="flex items-center text-sm text-gray-500">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-2">
                            {article.seller.firstName[0]}{article.seller.lastName[0]}
                          </div>
                          <span>{article.seller.firstName} {article.seller.lastName}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                Aucun article disponible pour le moment
              </div>
            )}

            <div className="text-center mt-12 md:hidden">
              <Link
                href="/catalogue"
                className="inline-flex items-center px-8 py-4 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Voir tous les articles
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Prêt à commencer votre collection ?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Rejoignez des milliers de collectionneurs passionnés dès aujourd'hui
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Créer un compte gratuit
              </Link>
              <Link
                href="/catalogue"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-transparent rounded-xl hover:bg-white/10 border-2 border-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Explorer le catalogue
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-white text-lg font-bold mb-4">Collector.shop</h3>
                <p className="text-sm">
                  La marketplace premium pour les collectionneurs passionnés.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Navigation</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link></li>
                  <li><Link href="/auth/register" className="hover:text-white transition-colors">S'inscrire</Link></li>
                  <li><Link href="/auth/login" className="hover:text-white transition-colors">Se connecter</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Ressources</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#" className="hover:text-white transition-colors">Aide</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Légal</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="#" className="hover:text-white transition-colors">Conditions d'utilisation</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>&copy; 2024 Collector.shop. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
