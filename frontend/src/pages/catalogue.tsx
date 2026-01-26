import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { articlesApi, Article, Category, FilterParams } from '@/services/articlesApi';

export default function Catalogue() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filtres
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'viewCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadArticles();
  }, [page, selectedCategory, condition, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      const data = await articlesApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const params: FilterParams = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
      };

      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);
      if (condition) params.condition = condition;

      const data = await articlesApi.getArticles(params);
      setArticles(data.articles);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadArticles();
  };

  const getConditionLabel = (cond: string) => {
    const labels: Record<string, string> = {
      new: 'Neuf',
      like_new: 'Comme neuf',
      very_good: 'Très bon état',
      good: 'Bon état',
      acceptable: 'État acceptable',
    };
    return labels[cond] || cond;
  };

  return (
    <>
      <Head>
        <title>Catalogue - Collector.shop</title>
        <meta name="description" content="Browse our collection of collectibles" />
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Catalogue d'objets de collection
          </h1>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Titre, description, tags..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Rechercher
                  </button>
                </div>
              </div>

              {/* Filtres en ligne */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    État
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => {
                      setCondition(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les états</option>
                    <option value="new">Neuf</option>
                    <option value="like_new">Comme neuf</option>
                    <option value="very_good">Très bon état</option>
                    <option value="good">Bon état</option>
                    <option value="acceptable">État acceptable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix min (€)
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix max (€)
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="1000"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Tri */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trier par
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt">Date de création</option>
                    <option value="price">Prix</option>
                    <option value="viewCount">Popularité</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordre
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DESC">Décroissant</option>
                    <option value="ASC">Croissant</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Résultats */}
          <div className="mb-4 text-gray-600">
            {total} article{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
          </div>

          {/* Grille d'articles */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">Aucun article trouvé</p>
              <p className="text-gray-500 mt-2">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Image */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {article.images && article.images.length > 0 ? (
                        <img
                          src={article.images[0]}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">📦</div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>

                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {getConditionLabel(article.condition)}
                        </span>
                      </div>

                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {Number(article.price).toFixed(2)} €
                      </div>

                      <div className="text-sm text-gray-500">
                        + {Number(article.shippingCost).toFixed(2)} € de port
                      </div>

                      {article.category && (
                        <div className="mt-2 text-sm text-gray-600">
                          📁 {article.category.name}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>👁️ {article.viewCount} vues</span>
                        {article.seller && (
                          <span>Par {article.seller.firstName}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>

                  <div className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg">
                    Page {page} sur {totalPages}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
