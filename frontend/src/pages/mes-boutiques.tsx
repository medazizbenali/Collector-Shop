import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user.types';
import { shopsApi, Shop } from '@/services/shopsApi';

export default function MesBoutiques() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== UserRole.SELLER && user.role !== UserRole.ADMIN) {
      router.push('/dashboard');
      return;
    }

    loadShops();
  }, [user, authLoading, router]);

  const loadShops = async () => {
    try {
      setLoading(true);
      const data = await shopsApi.getMyShops();
      setShops(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des boutiques');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, shopName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la boutique "${shopName}" ?`)) {
      return;
    }

    try {
      await shopsApi.deleteShop(id);
      setShops(shops.filter(s => s.id !== id));
      alert('Boutique supprimée avec succès');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await shopsApi.updateShop(id, { isActive: !currentStatus });
      setShops(shops.map(s =>
        s.id === id ? { ...s, isActive: !currentStatus } : s
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
    }
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

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={() => loadShops()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </>
    );
  }

  const canCreateMore = shops.length < 3;

  return (
    <>
      <Head>
        <title>Mes Boutiques - Collector.shop</title>
      </Head>

      <Navigation />

      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Boutiques</h1>
            <p className="mt-2 text-gray-600">
              Gérez vos boutiques virtuelles ({shops.length}/3)
            </p>
          </div>

          {canCreateMore && (
            <Link href="/boutiques/creer" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer une boutique
            </Link>
          )}
        </div>

        {/* Limit Warning */}
        {!canCreateMore && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-yellow-700">
                Vous avez atteint la limite de 3 boutiques. Contactez le support pour augmenter cette limite.
              </p>
            </div>
          </div>
        )}

        {/* Shops List */}
        {shops.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune boutique</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez par créer votre première boutique.</p>
            <div className="mt-6">
              <Link href="/boutiques/creer" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer ma première boutique
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                {/* Banner */}
                {shop.bannerUrl ? (
                  <img src={shop.bannerUrl} alt={shop.name} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
                        {shop.isVerified && (
                          <svg className="ml-2 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">/{shop.slug}</p>
                      {shop.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{shop.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Ventes</p>
                      <p className="font-semibold text-gray-900">{shop.totalSales}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenus</p>
                      <p className="font-semibold text-gray-900">{Number(shop.totalRevenue).toFixed(2)} €</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shop.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {shop.isActive ? 'Active' : 'Désactivée'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-2">
                    <Link href={`/boutiques/${shop.id}`} className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Voir
                    </Link>
                    <button
                      onClick={() => toggleActive(shop.id, shop.isActive)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {shop.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => handleDelete(shop.id, shop.name)}
                      className="px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
