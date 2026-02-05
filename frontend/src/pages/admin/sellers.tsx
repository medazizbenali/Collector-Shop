import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user.types';
import { authClient, shopsClient } from '@/lib/api';
import axios from "axios";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isVerified: boolean;
  totalSales: number;
  totalRevenue: string;
}

export default function AdminSellers() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState<User | null>(null);
  const [sellerShops, setSellerShops] = useState<Shop[]>([]);
  const [sellerStats, setSellerStats] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== UserRole.ADMIN) {
      router.push('/dashboard');
      return;
    }

    loadSellers();
  }, [user, authLoading, router]);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await authClient.get('/auth/users');
      const allUsers = response.data;
      const sellerUsers = allUsers.filter(
        (u: User) => u.role === UserRole.SELLER || u.role === UserRole.ADMIN
      );
      setSellers(sellerUsers);
    } catch (error: any) {
      console.error('Error loading sellers:', error);
      if (error.response?.status === 404) {
        console.log('Users API not implemented yet');
        setSellers([]);
      } else {
        alert('Erreur lors du chargement des vendeurs');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSellerDetails = async (sellerId: string) => {
    try {
      const shopsResponse = await shopsClient.get('/shops', { params: { sellerId } });
      setSellerShops(shopsResponse.data || []);

      const statsResponse = await authClient.get('/articles/stats', { params: { sellerId } });
      setSellerStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading seller details:', error);
    }
  };

  const handleViewSeller = async (seller: User) => {
    setSelectedSeller(seller);
    await loadSellerDetails(seller.id);
  };

  const handleToggleActive = async (sellerId: string, currentStatus: boolean) => {
    if (!confirm(`Êtes-vous sûr de vouloir ${currentStatus ? 'désactiver' : 'activer'} ce vendeur ?`)) {
      return;
    }

    try {
      await authClient.patch(`/auth/users/${sellerId}`, { isActive: !currentStatus });
      alert('Statut du vendeur mis à jour');
      loadSellers();
    } catch (error: any) {
      console.error('Error toggling seller status:', error);
      alert(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteSeller = async (sellerId: string, sellerName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le vendeur "${sellerName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/auth/users/${sellerId}`, {
        headers: getAuthHeader(),
      });
      alert('Vendeur supprimé avec succès');
      loadSellers();
      setSelectedSeller(null);
    } catch (error: any) {
      console.error('Error deleting seller:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
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

  return (
    <>
      <Head>
        <title>Admin - Gestion des Vendeurs | Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Vendeurs</h1>
            <p className="mt-2 text-gray-600">
              Gérer les comptes vendeurs et leurs boutiques
            </p>
          </div>

          {/* Sellers Table */}
          {sellers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">Aucun vendeur trouvé</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inscription
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellers.map((seller) => (
                    <tr key={seller.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {seller.firstName.charAt(0)}{seller.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {seller.firstName} {seller.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{seller.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          seller.role === UserRole.ADMIN
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {seller.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          seller.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {seller.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(seller.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewSeller(seller)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Voir détails
                        </button>
                        <button
                          onClick={() => handleToggleActive(seller.id, seller.isActive)}
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                        >
                          {seller.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleDeleteSeller(seller.id, `${seller.firstName} ${seller.lastName}`)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal détails vendeur */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSeller.firstName} {selectedSeller.lastName}
                </h2>
                <button
                  onClick={() => setSelectedSeller(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Informations personnelles */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{selectedSeller.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="text-gray-900">{selectedSeller.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="text-gray-900">{selectedSeller.address || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ville</p>
                    <p className="text-gray-900">{selectedSeller.city || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Code postal</p>
                    <p className="text-gray-900">{selectedSeller.postalCode || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pays</p>
                    <p className="text-gray-900">{selectedSeller.country || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rôle</p>
                    <p className="text-gray-900">{selectedSeller.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedSeller.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedSeller.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Boutiques */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Boutiques ({sellerShops.length})
                </h3>
                {sellerShops.length === 0 ? (
                  <p className="text-gray-500">Aucune boutique</p>
                ) : (
                  <div className="space-y-3">
                    {sellerShops.map((shop) => (
                      <div key={shop.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {shop.name}
                              {shop.isVerified && (
                                <span className="ml-2 text-blue-500">✓</span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-500">/{shop.slug}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            shop.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {shop.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="mt-2 flex gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Ventes:</span>
                            <span className="ml-1 font-semibold">{shop.totalSales}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Revenus:</span>
                            <span className="ml-1 font-semibold">{Number(shop.totalRevenue).toFixed(2)} €</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Statistiques */}
              {sellerStats && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des articles</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{sellerStats.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600">Approuvés</p>
                      <p className="text-2xl font-bold text-green-900">{sellerStats.approved}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-yellow-600">En attente</p>
                      <p className="text-2xl font-bold text-yellow-900">{sellerStats.pending}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-purple-600">Vendus</p>
                      <p className="text-2xl font-bold text-purple-900">{sellerStats.sold}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleToggleActive(selectedSeller.id, selectedSeller.isActive)}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    selectedSeller.isActive
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {selectedSeller.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                </button>
                <button
                  onClick={() => handleDeleteSeller(selectedSeller.id, `${selectedSeller.firstName} ${selectedSeller.lastName}`)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Supprimer le compte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
