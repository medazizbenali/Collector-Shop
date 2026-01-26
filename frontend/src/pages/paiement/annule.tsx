import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';

export default function PaymentCancelled() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown === 0) {
      router.push('/panier');
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <>
      <Head>
        <title>Paiement annulé - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            {/* Icon d'avertissement */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-6 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Paiement annulé
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Votre paiement n'a pas été effectué et aucun montant n'a été débité.
            </p>

            {/* Information */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-orange-800 font-semibold mb-2">Que s'est-il passé ?</p>
                  <ul className="text-orange-700 space-y-1 text-sm">
                    <li>• Vous avez annulé le paiement</li>
                    <li>• Votre commande reste en attente de paiement</li>
                    <li>• Les articles sont toujours dans votre panier</li>
                    <li>• Vous pouvez réessayer quand vous le souhaitez</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Questions fréquentes */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Besoin d'aide ?</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Problème avec votre carte bancaire ?</p>
                  <p className="text-gray-600">Vérifiez que votre carte est valide et dispose de fonds suffisants.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Préférez un autre moyen de paiement ?</p>
                  <p className="text-gray-600">Vous pouvez choisir PayPal ou virement bancaire lors de la commande.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Questions sur la sécurité ?</p>
                  <p className="text-gray-600">Tous les paiements sont sécurisés par Stripe, leader mondial du paiement en ligne.</p>
                </div>
              </div>
            </div>

            {/* Redirection automatique */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm">
                Redirection automatique vers votre panier dans{' '}
                <span className="font-bold text-orange-600">{countdown}</span> secondes...
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/panier"
                className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition font-medium shadow-lg"
              >
                Retour au panier
              </Link>
              <Link
                href="/commande"
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
              >
                Réessayer le paiement
              </Link>
              <Link
                href="/catalogue"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
