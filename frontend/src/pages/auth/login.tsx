import Head from 'next/head';
import Navigation from '@/components/Navigation';

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8001/auth/google/login';
  };

  return (
    <>
      <Head>
        <title>Connexion - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bon retour !
              </h1>
              <p className="text-gray-600">
                Connectez-vous à votre compte Collector.shop
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 rounded-xl shadow-md hover:shadow-xl bg-white hover:bg-gray-50 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-base font-semibold text-gray-700">
                Se connecter avec Google
              </span>
            </button>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <a
                  href="/auth/register"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Créer un compte gratuitement
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
