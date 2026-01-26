import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import { shopsApi, Shop, ShopStats } from '@/services/shopsApi';
import { articlesApi, Article } from '@/services/articlesApi';
import { useAuth } from '@/contexts/AuthContext';

export default function BoutiqueDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'stats' | 'info'>('articles');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected' | 'sold'>('all');

  useEffect(() => {
    if (!id) return;
    loadShopData();
  }, [id, user]); // Reload when user changes (login/logout)

  const loadShopData = async () => {
    try {
      setLoading(true);
      const [shopData, statsData] = await Promise.all([
        shopsApi.getShopById(id as string),
        shopsApi.getShopStats(id as string),
      ]);
      setShop(shopData);
      setStats(statsData);

      // Check if user is owner or admin - if yes, use dedicated endpoint
      if (user && (user.role === 'admin' || shopData.ownerId === user.id)) {
        // Use dedicated endpoint that returns ALL articles for owner/admin
        const articlesData = await shopsApi.getShopArticles(id as string);
        setArticles(articlesData.articles || []);
      } else {
        // Public view - only approved articles
        const articlesData = await articlesApi.getArticles({ shopId: id as string });
        setArticles(articlesData.articles || []);
      }
    } catch (err: any) {
      console.error('Error loading shop data:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de la boutique');
    } finally {
      setLoading(false);
    }
  };

  // Filter articles based on status
  const filteredArticles = articles.filter((article) => {
    if (statusFilter === 'all') return true;
    return article.status === statusFilter;
  });

  // Check if user is owner or admin
  const isOwnerOrAdmin = user && (user.role === 'admin' || (shop && shop.sellerId === user.id));

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; class: string }> = {
      draft: { label: 'Brouillon', class: 'bg-gray-100 text-gray-800' },
      pending_approval: { label: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approuvé', class: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeté', class: 'bg-red-100 text-red-800' },
      sold: { label: 'Vendu', class: 'bg-blue-100 text-blue-800' },
      archived: { label: 'Archivé', class: 'bg-gray-100 text-gray-600' },
    };

    const badge = badges[status] || { label: status, class: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>{error || 'Boutique introuvable'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>{shop.name} - Collector.shop</title>
      </Head>

      <Navigation />

      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        {shop.bannerUrl ? (
          <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${shop.bannerUrl})` }} />
        ) : (
          <div className="h-64 bg-gradient-to-r from-indigo-500 to-purple-600" />
        )}

        {/* Shop Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Logo */}
                {shop.logoUrl ? (
                  <img
                    src={shop.logoUrl}
                    alt={shop.name}
                    className="h-24 w-24 rounded-lg object-cover border-4 border-white shadow"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow">
                    {shop.name.charAt(0)}
                  </div>
                )}

                {/* Info */}
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
                    {shop.isVerified && (
                      <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {!shop.isActive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Désactivée
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-gray-500">/{shop.slug}</p>
                  {shop.description && (
                    <p className="mt-3 text-gray-700 max-w-2xl">{shop.description}</p>
                  )}
                </div>
              </div>

              <Link href="/mes-boutiques" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Retour
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'articles'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Articles ({articles.length})
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Statistiques
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Informations
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6 pb-12">
            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div>
                {/* Filter Tabs - Only show for owner or admin */}
                {isOwnerOrAdmin && (
                  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          statusFilter === 'all'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Tous ({articles.length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('pending_approval')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          statusFilter === 'pending_approval'
                            ? 'bg-yellow-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        En attente ({articles.filter(a => a.status === 'pending_approval').length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('approved')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          statusFilter === 'approved'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Approuvés ({articles.filter(a => a.status === 'approved').length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('rejected')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          statusFilter === 'rejected'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Rejetés ({articles.filter(a => a.status === 'rejected').length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('sold')}
                        className={`px-6 py-2 rounded-lg font-medium transition ${
                          statusFilter === 'sold'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Vendus ({articles.filter(a => a.status === 'sold').length})
                      </button>
                    </div>
                  </div>
                )}

                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {articles.length === 0 ? 'Aucun article' : 'Aucun article dans cette catégorie'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {articles.length === 0
                        ? 'Cette boutique n\'a pas encore d\'articles.'
                        : 'Essayez un autre filtre pour voir les articles.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article) => (
                      <div key={article.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                        <Link href={`/articles/${article.id}`}>
                          <img
                            src={article.images?.[0] || '/placeholder.png'}
                            alt={article.title}
                            className="w-full h-48 object-cover cursor-pointer"
                          />
                        </Link>
                        <div className="p-4">
                          <Link href={`/articles/${article.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:text-indigo-600 cursor-pointer">
                              {article.title}
                            </h3>
                          </Link>
                          <p className="mt-2 text-xl font-bold text-indigo-600">{Number(article.price).toFixed(2)} €</p>
                          <div className="mt-2">
                            {getStatusBadge(article.status)}
                          </div>
                          {article.status === 'rejected' && article.rejectionReason && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-xs font-semibold text-red-900">Raison du rejet:</p>
                              <p className="text-xs text-red-800 mt-1">{article.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500">Articles totaux</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalArticles}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500">Articles approuvés</div>
                  <div className="mt-2 text-3xl font-bold text-green-600">{stats.approvedArticles}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500">Articles vendus</div>
                  <div className="mt-2 text-3xl font-bold text-indigo-600">{stats.soldArticles}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500">Revenus totaux</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{Number(stats.totalRevenue).toFixed(2)} €</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500">Vues moyennes</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{Number(stats.avgViews).toFixed(1)}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500">Note moyenne</div>
                  <div className="mt-2 text-3xl font-bold text-yellow-500">{Number(stats.averageRating).toFixed(1)} / 5</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500">Nombre d'avis</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{stats.reviewCount}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-sm font-medium text-gray-500">Statut</div>
                  <div className="mt-2 flex items-center gap-2">
                    {stats.isVerified && (
                      <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-lg font-semibold">{stats.isVerified ? 'Vérifiée' : 'Non vérifiée'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
                  <dl className="space-y-3">
                    {shop.contactEmail && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{shop.contactEmail}</dd>
                      </div>
                    )}
                    {shop.contactPhone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                        <dd className="mt-1 text-sm text-gray-900">{shop.contactPhone}</dd>
                      </div>
                    )}
                    {shop.website && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Site web</dt>
                        <dd className="mt-1 text-sm text-indigo-600">
                          <a href={shop.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {shop.website}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Address */}
                {(shop.address || shop.city || shop.postalCode || shop.country) && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
                    <address className="text-sm text-gray-700 not-italic">
                      {shop.address && <div>{shop.address}</div>}
                      {(shop.postalCode || shop.city) && (
                        <div>{shop.postalCode} {shop.city}</div>
                      )}
                      {shop.country && <div>{shop.country}</div>}
                    </address>
                  </div>
                )}

                {/* Policies */}
                {shop.returnPolicy && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Politique de retour</h3>
                    <p className="text-sm text-gray-700">{shop.returnPolicy}</p>
                  </div>
                )}

                {shop.shippingPolicy && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Politique d'expédition</h3>
                    <p className="text-sm text-gray-700">{shop.shippingPolicy}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
