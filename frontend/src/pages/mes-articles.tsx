import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';
import { articlesApi, Article, Category, CreateArticleDto } from '@/services/articlesApi';
import { shopsApi, Shop } from '@/services/shopsApi';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user.types';

export default function MesArticles() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    sold: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected' | 'sold'>('all');

  // Form state
  const [formData, setFormData] = useState<CreateArticleDto>({
    title: '',
    description: '',
    price: 0,
    shippingCost: 0,
    condition: 'new',
    categoryId: '',
    shopId: undefined,
    brand: '',
    year: new Date().getFullYear(),
    quantity: 1,
    tags: [],
    images: [],
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== UserRole.SELLER && user.role !== UserRole.ADMIN) {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [user, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [articlesData, categoriesData, statsData, shopsData] = await Promise.all([
        articlesApi.getMyArticles(),
        articlesApi.getCategories(),
        articlesApi.getStats(),
        shopsApi.getMyShops(),
      ]);

      console.log('📊 Articles data received:', articlesData);
      console.log('📊 Articles array:', articlesData.articles);
      console.log('📊 Stats data received:', statsData);

      setArticles(articlesData.articles);
      setCategories(categoriesData);
      setStats(statsData);
      setShops(shopsData);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await articlesApi.createArticle(formData);
      alert('Article créé avec succès ! Il sera visible après validation par un administrateur.');
      setShowCreateForm(false);
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: 0,
        shippingCost: 0,
        condition: 'new',
        categoryId: '',
        shopId: undefined,
        brand: '',
        year: new Date().getFullYear(),
        quantity: 1,
        tags: [],
        images: [],
      });
      loadData();
    } catch (error: any) {
      alert('Erreur lors de la création: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      await articlesApi.deleteArticle(id);
      alert('Article supprimé avec succès');
      loadData();
    } catch (error: any) {
      alert('Erreur lors de la suppression: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      description: article.description,
      price: Number(article.price),
      shippingCost: Number(article.shippingCost),
      condition: article.condition,
      categoryId: article.categoryId,
      brand: article.brand || '',
      year: article.year || new Date().getFullYear(),
      quantity: article.quantity || 1,
      tags: article.tags || [],
      images: article.images || [],
    });
    setShowCreateForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    try {
      await articlesApi.updateArticle(editingArticle.id, formData);
      alert('Article modifié avec succès !');
      setShowCreateForm(false);
      setEditingArticle(null);
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: 0,
        shippingCost: 0,
        condition: 'new',
        categoryId: '',
        shopId: undefined,
        brand: '',
        year: new Date().getFullYear(),
        quantity: 1,
        tags: [],
        images: [],
      });
      loadData();
    } catch (error: any) {
      alert('Erreur lors de la modification: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingArticle(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      shippingCost: 0,
      condition: 'new',
      categoryId: '',
      shopId: undefined,
      brand: '',
      year: new Date().getFullYear(),
      quantity: 1,
      tags: [],
      images: [],
    });
  };

  // Filter articles based on status
  const filteredArticles = articles.filter((article) => {
    if (statusFilter === 'all') return true;
    return article.status === statusFilter;
  });

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mes Articles - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50">

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Mes Articles</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              + Créer un article
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total articles</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600 mt-1">Approuvés</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 mt-1">En attente</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-blue-600">{stats.sold}</div>
              <div className="text-sm text-gray-600 mt-1">Vendus</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-purple-600">{Number(stats.totalRevenue).toFixed(2)} €</div>
              <div className="text-sm text-gray-600 mt-1">Revenu total</div>
            </div>
          </div>

          {/* Filter Tabs */}
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
                Tous ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter('pending_approval')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'pending_approval'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En attente ({stats.pending})
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'approved'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approuvés ({stats.approved})
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
                Vendus ({stats.sold})
              </button>
            </div>
          </div>

          {/* Modal de création/modification */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingArticle ? 'Modifier l\'article' : 'Créer un article'}
                    </h2>
                    <button
                      onClick={handleCloseForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={editingArticle ? handleUpdate : handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre *
                      </label>
                      <input
                        type="text"
                        required
                        minLength={5}
                        maxLength={200}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: One Piece Volume 1 - Edition Collector"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description * (min 20 caractères)
                      </label>
                      <textarea
                        required
                        minLength={20}
                        maxLength={5000}
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Décrivez votre article en détail..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix (€) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0.01"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frais de port (€) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.shippingCost}
                          onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          État *
                        </label>
                        <select
                          required
                          value={formData.condition}
                          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="new">Neuf</option>
                          <option value="like_new">Comme neuf</option>
                          <option value="very_good">Très bon état</option>
                          <option value="good">Bon état</option>
                          <option value="acceptable">État acceptable</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catégorie *
                        </label>
                        <select
                          required
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionner...</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Boutique (optionnel)
                      </label>
                      <select
                        value={formData.shopId || ''}
                        onChange={(e) => setFormData({ ...formData, shopId: e.target.value || undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Aucune boutique</option>
                        {shops.filter(s => s.isActive).map((shop) => (
                          <option key={shop.id} value={shop.id}>
                            {shop.name} {shop.isVerified && '✓'}
                          </option>
                        ))}
                      </select>
                      {shops.length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                          Vous n'avez pas encore de boutique. <Link href="/boutiques/creer" className="text-blue-600 hover:underline">Créer une boutique</Link>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marque
                        </label>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Année
                        </label>
                        <input
                          type="number"
                          min="1800"
                          max={new Date().getFullYear()}
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Images
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          const base64Images: string[] = [];

                          for (const file of files) {
                            const reader = new FileReader();
                            const base64 = await new Promise<string>((resolve) => {
                              reader.onloadend = () => resolve(reader.result as string);
                              reader.readAsDataURL(file);
                            });
                            base64Images.push(base64);
                          }

                          setFormData({
                            ...formData,
                            images: [...(formData.images || []), ...base64Images],
                          });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Sélectionnez une ou plusieurs images depuis votre ordinateur
                      </p>

                      {/* Prévisualisation des images */}
                      {formData.images && formData.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {formData.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={img}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    images: formData.images?.filter((_, i) => i !== idx),
                                  });
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseForm}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                      >
                        {editingArticle ? 'Modifier l\'article' : 'Créer l\'article'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Liste des articles */}
          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {articles.length === 0 ? 'Aucun article pour le moment' : 'Aucun article dans cette catégorie'}
              </h3>
              <p className="text-gray-600 mb-6">
                {articles.length === 0
                  ? 'Créez votre premier article pour commencer à vendre'
                  : 'Essayez un autre filtre pour voir vos articles'}
              </p>
              {articles.length === 0 && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Créer un article
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {article.images && article.images.length > 0 ? (
                        <img
                          src={article.images[0]}
                          alt={article.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Image loading error for article:', article.id, 'Image data:', article.images[0]?.substring(0, 100));
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<div class="text-gray-400 text-4xl">📦</div>';
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">📦</div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 line-clamp-2">
                            {article.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(article.status)}
                        </div>
                      </div>

                      {/* Show rejection reason if rejected */}
                      {article.status === 'rejected' && article.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-semibold text-red-900 mb-1">Raison du rejet:</p>
                          <p className="text-sm text-red-800">{article.rejectionReason}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-6 mt-4">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">
                            {Number(article.price).toFixed(2)} €
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          👁️ {article.viewCount} vues
                        </div>
                        {article.category && (
                          <div className="text-sm text-gray-600">
                            📁 {article.category.name}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Link
                          href={`/articles/${article.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          Voir
                        </Link>
                        {article.status !== 'sold' && (
                          <>
                            <button
                              onClick={() => handleEdit(article)}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-sm"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
