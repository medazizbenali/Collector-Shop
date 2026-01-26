import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';
import { paymentClient } from '@/lib/api';

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const [countdown, setCountdown] = useState(5);
  const [verifying, setVerifying] = useState(true);

  // Vérifier et mettre à jour le statut de la commande
  useEffect(() => {
    if (session_id) {
      verifyPayment();
    }
  }, [session_id]);

  const verifyPayment = async () => {
    try {
      // Appeler le Payment Service pour vérifier le paiement avec Stripe
      await paymentClient.post('/stripe/verify-session', { sessionId: session_id });
      setVerifying(false);
    } catch (error) {
      console.error('Error verifying payment:', error);
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (!verifying && countdown === 0) {
      router.push('/mes-commandes');
    }

    if (!verifying) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown, router, verifying]);

  return (
    <>
      <Head>
        <title>Paiement réussi - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            {/* Icon de succès */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Message de succès */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Paiement réussi !
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Votre commande a été confirmée et votre paiement a été traité avec succès.
            </p>

            {/* Détails */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-green-800 font-semibold mb-2">Prochaines étapes</p>
                  <ul className="text-green-700 space-y-1 text-sm">
                    <li>• Vous recevrez un email de confirmation</li>
                    <li>• Le vendeur sera notifié de votre commande</li>
                    <li>• Vous pouvez suivre votre commande dans votre espace</li>
                    <li>• Le vendeur recevra 95% du montant (commission 5%)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Redirection automatique */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm">
                Redirection automatique vers vos commandes dans{' '}
                <span className="font-bold text-blue-600">{countdown}</span> secondes...
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/mes-commandes"
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-lg"
              >
                Voir mes commandes
              </Link>
              <Link
                href="/catalogue"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Continuer mes achats
              </Link>
            </div>

            {/* Session ID (pour debug) */}
            {session_id && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  ID de session: {session_id}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
