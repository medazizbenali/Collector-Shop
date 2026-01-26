import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { UserRole } from '@/types/user.types';

export default function Navigation() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { cartItemCount } = useCart();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return null;
  }

  const isActive = (path: string) => {
    return router.pathname === path
      ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
      : 'text-gray-700 hover:text-blue-600 font-medium transition-all duration-200';
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/catalogue" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
              Collector.shop
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {/* Public Links */}
            <Link href="/catalogue" className={isActive('/catalogue')}>
              Catalogue
            </Link>

            {user ? (
              <>
                {/* Seller Links - Only for sellers, not admins */}
                {user.role?.toUpperCase() === 'SELLER' && (
                  <>
                    <Link href="/mes-articles" className={isActive('/mes-articles')}>
                      Mes Articles
                    </Link>
                    <Link href="/mes-boutiques" className={isActive('/mes-boutiques')}>
                      Mes Boutiques
                    </Link>
                  </>
                )}

                {/* Admin Links */}
                {user.role?.toUpperCase() === 'ADMIN' && (
                  <>
                    <Link href="/admin/categories" className={isActive('/admin/categories')}>
                      Admin Catégories
                    </Link>
                    <Link href="/admin/articles" className={isActive('/admin/articles')}>
                      Admin Articles
                    </Link>
                    <Link href="/admin/sellers" className={isActive('/admin/sellers')}>
                      Admin Vendeurs
                    </Link>
                  </>
                )}

                {/* Common User Links */}
                <Link href="/dashboard" className={isActive('/dashboard')}>
                  Dashboard
                </Link>

                {/* Hide cart and orders for admins and sellers - only for buyers */}
                {user.role?.toUpperCase() === 'BUYER' && (
                  <>
                    <Link href="/mes-commandes" className={isActive('/mes-commandes')}>
                      Mes Commandes
                    </Link>

                    <Link href="/panier" className={`${isActive('/panier')} relative inline-flex items-center`}>
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Panier
                      {cartItemCount > 0 && (
                        <span className="ml-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center animate-pulse">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* User Menu */}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l-2 border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200">
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
