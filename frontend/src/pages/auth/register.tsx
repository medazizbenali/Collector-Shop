import { useState } from 'react';
import Head from 'next/head';
import Navigation from '@/components/Navigation';

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller' | null>(null);

  const handleRoleSelection = (role: 'buyer' | 'seller') => {
    setSelectedRole(role);
    // Rediriger vers Google OAuth avec le rôle en query parameter
    window.location.href = `http://localhost:8001/auth/google/login?role=${role}`;
  };

  return (
    <>
      <Head>
        <title>Inscription - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Créer un compte
              </h1>
              <p className="text-gray-600">
                Choisissez votre type de compte pour commencer
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Option Acheteur */}
              <div
                onClick={() => handleRoleSelection('buyer')}
                className="cursor-pointer group relative bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-8 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Acheteur
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Parcourez et achetez des objets de collection
                  </p>
                  <ul className="text-left text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Parcourir le catalogue
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Paiement sécurisé
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Suivi des commandes
                    </li>
                  </ul>
                </div>
              </div>

              {/* Option Vendeur */}
              <div
                onClick={() => handleRoleSelection('seller')}
                className="cursor-pointer group relative bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-400 rounded-2xl p-8 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Vendeur
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Vendez vos objets de collection
                  </p>
                  <ul className="text-left text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Créer votre boutique
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Publier des annonces
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Commission 5%
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                En vous inscrivant, vous acceptez nos conditions d'utilisation
              </p>
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <a
                  href="/auth/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Se connecter
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
