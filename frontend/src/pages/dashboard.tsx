import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
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
        <title>Dashboard - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Bienvenue, {user.firstName} {user.lastName}!
          </h1>

          {/* User Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Type de compte</h2>
              <p className="text-2xl font-bold text-indigo-600 capitalize">
                {user.role?.toUpperCase() === 'ADMIN' ? 'Administrateur' : user.role?.toUpperCase() === 'SELLER' ? 'Vendeur' : 'Acheteur'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Dernière connexion</h2>
              <p className="text-sm text-gray-900">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString('fr-FR')
                  : 'Première connexion'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Actions pour SELLERS uniquement - pas pour admins */}
            {user.role === 'seller' && (
              <>
                <Link href="/mes-articles" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Mes Articles</h2>
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Gérez vos articles en vente</p>
                </Link>

                <Link href="/mes-boutiques" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Mes Boutiques</h2>
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Gérez vos boutiques virtuelles</p>
                </Link>
              </>
            )}

            {/* Actions pour ADMINS uniquement */}
            {user.role === 'admin' && (
              <>
                <Link href="/admin/articles" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Valider Articles</h2>
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Approuver ou rejeter les articles</p>
                </Link>

                <Link href="/admin/categories" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Catégories</h2>
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Gérer les catégories du site</p>
                </Link>

                <Link href="/admin/sellers" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border-2 border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Gérer Vendeurs</h2>
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Gérer les comptes vendeurs</p>
                </Link>
              </>
            )}

            {/* Actions communes à tous */}
            <Link href="/catalogue" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Catalogue</h2>
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-600">Parcourir tous les articles</p>
            </Link>

            <Link href="/profile" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Mon Profil</h2>
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-600">Modifier mes informations</p>
            </Link>
          </div>

          {/* User Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vos centres d'intérêt</h2>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
