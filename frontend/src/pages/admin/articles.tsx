import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user.types';
import { articlesApi, Article } from '@/services/articlesApi';

export default function AdminArticles() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== UserRole.ADMIN) {
      router.push('/dashboard');
      return;
    }

    loadArticles();
  }, [user, authLoading, router, filter]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (filter !== 'all') {
        params.status = filter === 'pending' ? 'pending_approval' : filter;
      }

      const response = await articlesApi.getArticles(params);
      setArticles(response.articles || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      alert('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cet article ?')) {
      return;
    }

    try {
      await articlesApi.approveArticle(id);
      alert('Article approuvé avec succès');
      loadArticles();
      setSelectedArticle(null);
    } catch (error: any) {
      console.error('Error approving article:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      alert('Veuillez fournir une raison de rejet');
      return;
    }

    try {
      await articlesApi.rejectArticle(id, rejectReason);
      alert('Article rejeté avec succès');
      loadArticles();
      setSelectedArticle(null);
      setRejectReason('');
    } catch (error: any) {
      console.error('Error rejecting article:', error);
      alert(error.response?.data?.message || 'Erreur lors du rejet');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-800' },
      pending_approval: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approuvé', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeté', className: 'bg-red-100 text-red-800' },
      sold: { label: 'Vendu', className: 'bg-blue-100 text-blue-800' },
      archived: { label: 'Archivé', className: 'bg-gray-100 text-gray-600' },
    };

    const badge = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const getConditionLabel = (condition: string) => {
    const conditionMap: Record<string, string> = {
      new: 'Neuf',
      like_new: 'Comme neuf',
      very_good: 'Très bon état',
      good: 'Bon état',
      acceptable: 'État acceptable',
    };
    return conditionMap[condition] || condition;
  };

  if (authLoading || loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - Validation des Articles | Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Validation des Articles</h1>
            <p className="mt-2 text-gray-600">
              Approuver ou rejeter les articles soumis par les vendeurs
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'approved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Approuvés
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'rejected'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Rejetés
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Tous
            </button>
          </div>

          {/* Articles Grid */}
          {articles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">Aucun article à afficher</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                  {/* Image */}
                  {article.images && article.images.length > 0 ? (
                    <img
                      src={article.images[0]}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Pas d'image</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                      {getStatusBadge(article.status)}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {article.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Prix:</span>
                        <span className="font-semibold">{article.price} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">État:</span>
                        <span>{getConditionLabel(article.condition)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Vendeur:</span>
                        <span>
                          {article.seller?.firstName} {article.seller?.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Catégorie:</span>
                        <span>{article.category?.name}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Voir détails
                      </button>
                      {article.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleApprove(article.id)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setSelectedArticle(article)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            ✗
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal détails article */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                <button
                  onClick={() => {
                    setSelectedArticle(null);
                    setRejectReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Images */}
              {selectedArticle.images && selectedArticle.images.length > 0 && (
                <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedArticle.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${selectedArticle.title} ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Détails */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedArticle.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Prix</h3>
                    <p className="text-2xl font-bold text-blue-600">{selectedArticle.price} €</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Frais de port</h3>
                    <p className="text-xl text-gray-900">{selectedArticle.shippingCost} €</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">État</h3>
                    <p className="text-gray-900">{getConditionLabel(selectedArticle.condition)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Quantité</h3>
                    <p className="text-gray-900">{selectedArticle.quantity}</p>
                  </div>
                  {selectedArticle.brand && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Marque</h3>
                      <p className="text-gray-900">{selectedArticle.brand}</p>
                    </div>
                  )}
                  {selectedArticle.year && (
                    <div>
                      <h3 className="font-semibold text-gray-700">Année</h3>
                      <p className="text-gray-900">{selectedArticle.year}</p>
                    </div>
                  )}
                </div>

                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-700">Vendeur</h3>
                  <p className="text-gray-900">
                    {selectedArticle.seller?.firstName} {selectedArticle.seller?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedArticle.seller?.email}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">Statut</h3>
                  {getStatusBadge(selectedArticle.status)}
                </div>
              </div>

              {/* Actions */}
              {selectedArticle.status === 'pending_approval' && (
                <div className="border-t pt-6">
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => handleApprove(selectedArticle.id)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      ✓ Approuver l'article
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison du rejet
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="Expliquez pourquoi cet article est rejeté..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={() => handleReject(selectedArticle.id)}
                      className="mt-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      ✗ Rejeter l'article
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
