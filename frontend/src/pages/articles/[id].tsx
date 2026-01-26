import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { articlesApi, Article } from '@/services/articlesApi';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user.types';

export default function ArticleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [article, setArticle] = useState<Article | null>(null);
  const [similarArticles, setSimilarArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const hasIncrementedView = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (id && typeof id === 'string' && !isLoadingRef.current) {
      loadArticle(id);
      loadSimilarArticles(id);
    }
  }, [id]);

  const loadArticle = async (articleId: string) => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    try {
      // Only increment view once per article ID
      const shouldIncrementView = hasIncrementedView.current !== articleId;
      const data = await articlesApi.getArticle(articleId, shouldIncrementView);
      setArticle(data);
      if (shouldIncrementView) {
        hasIncrementedView.current = articleId;
      }
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const loadSimilarArticles = async (articleId: string) => {
    try {
      const data = await articlesApi.getSimilarArticles(articleId, 4);
      setSimilarArticles(data);
    } catch (error) {
      console.error('Error loading similar articles:', error);
    }
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

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!article) return;

    try {
      setAddingToCart(true);
      await addToCart({ articleId: article.id, quantity: 1 });
      alert('Article ajouté au panier !');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!article) return;

    try {
      setAddingToCart(true);
      await addToCart({ articleId: article.id, quantity: 1 });
      router.push('/panier');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Erreur lors de l\'ajout au panier');
      setAddingToCart(false);
    }
  };

  const getConditionColor = (cond: string) => {
    const colors: Record<string, string> = {
      new: 'bg-green-100 text-green-800',
      like_new: 'bg-blue-100 text-blue-800',
      very_good: 'bg-cyan-100 text-cyan-800',
      good: 'bg-yellow-100 text-yellow-800',
      acceptable: 'bg-orange-100 text-orange-800',
    };
    return colors[cond] || 'bg-gray-100 text-gray-800';
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

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <Link href="/catalogue" className="text-blue-600 hover:underline">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} - Collector.shop</title>
        <meta name="description" content={article.description.substring(0, 160)} />
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600">
            <Link href="/catalogue" className="hover:text-blue-600">
              Catalogue
            </Link>
            {article.category && (
              <>
                <span className="mx-2">›</span>
                <span>{article.category.name}</span>
              </>
            )}
            <span className="mx-2">›</span>
            <span className="text-gray-900">{article.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne gauche - Images et infos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Images */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Image principale */}
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  {article.images && article.images.length > 0 ? (
                    <img
                      src={article.images[selectedImage]}
                      alt={article.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-6xl">📦</div>
                  )}
                </div>

                {/* Miniatures */}
                {article.images && article.images.length > 1 && (
                  <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                    {article.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === idx
                            ? 'border-blue-600'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img src={img} alt={`${article.title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {article.description}
                </p>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Détails */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4">
                  {article.brand && (
                    <div>
                      <span className="text-sm text-gray-600">Marque</span>
                      <p className="font-medium text-gray-900">{article.brand}</p>
                    </div>
                  )}
                  {article.year && (
                    <div>
                      <span className="text-sm text-gray-600">Année</span>
                      <p className="font-medium text-gray-900">{article.year}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">Quantité</span>
                    <p className="font-medium text-gray-900">{article.quantity}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Vues</span>
                    <p className="font-medium text-gray-900">👁️ {article.viewCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Achat */}
            <div className="space-y-6">
              {/* Prix et achat */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {article.title}
                </h1>

                {/* État */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(article.condition)}`}>
                    {getConditionLabel(article.condition)}
                  </span>
                </div>

                {/* Prix */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {Number(article.price).toFixed(2)} €
                  </div>
                  <div className="text-sm text-gray-600">
                    + {Number(article.shippingCost).toFixed(2)} € de frais de port
                  </div>
                  <div className="text-lg font-medium text-gray-900 mt-2 pt-2 border-t">
                    Total: {(Number(article.price) + Number(article.shippingCost)).toFixed(2)} €
                  </div>
                </div>

                {/* Bouton achat */}
                {user?.id === article.sellerId ? (
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-gray-700 font-medium">
                      Ceci est votre article
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Vous ne pouvez pas acheter vos propres articles
                    </p>
                  </div>
                ) : user?.role === UserRole.ADMIN ? (
                  <div className="bg-purple-100 rounded-lg p-4 text-center">
                    <p className="text-purple-700 font-medium">
                      Mode administrateur
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      Les administrateurs ne peuvent pas acheter d'articles
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleBuyNow}
                      disabled={addingToCart}
                      className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart ? 'Chargement...' : 'Acheter maintenant'}
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="w-full py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ajouter au panier
                    </button>
                  </>
                )}

                {/* Vendeur */}
                {article.seller && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Vendeur</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                        {article.seller.firstName[0]}{article.seller.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {article.seller.firstName} {article.seller.lastName}
                        </p>
                        <p className="text-sm text-gray-600">Vendeur vérifié</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Catégorie */}
                {article.category && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Catégorie</h3>
                    <Link
                      href={`/catalogue?categoryId=${article.category.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      📁 {article.category.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Articles similaires */}
          {similarArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Articles similaires
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarArticles.map((sim) => (
                  <Link
                    key={sim.id}
                    href={`/articles/${sim.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {sim.images && sim.images.length > 0 ? (
                        <img
                          src={sim.images[0]}
                          alt={sim.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">📦</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {sim.title}
                      </h3>
                      <div className="text-xl font-bold text-blue-600">
                        {Number(sim.price).toFixed(2)} €
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
