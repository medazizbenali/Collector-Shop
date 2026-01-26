import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ordersApi, PaymentMethod } from '@/services/ordersApi';

export default function Commande() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, refreshCart } = useCart();

  // Coordonnées détaillées
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('France');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      refreshCart();
    }
  }, [user, refreshCart]);

  if (authLoading || cartLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user || !cart || cart.items.length === 0) {
    router.push('/panier');
    return null;
  }

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const shippingTotal = cart.items.reduce((sum, item) => sum + Number(item.article.shippingCost), 0);
  const total = subtotal + shippingTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation des champs obligatoires
    if (!firstName.trim() || !lastName.trim()) {
      setError('Veuillez entrer votre nom et prénom');
      return;
    }
    if (!email.trim()) {
      setError('Veuillez entrer votre email');
      return;
    }
    if (!phone.trim()) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }
    if (!address.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      setError('Veuillez remplir tous les champs d\'adresse');
      return;
    }

    try {
      setLoading(true);

      // Construire l'adresse complète
      const shippingAddress = `${firstName} ${lastName}\n${address}\n${postalCode} ${city}\n${country}\nTél: ${phone}\nEmail: ${email}`;

      // Créer la commande
      const order = await ordersApi.createOrder({
        paymentMethod,
        shippingAddress,
        notes,
      });

      // Si paiement par carte, rediriger vers Stripe
      if (paymentMethod === PaymentMethod.CARD) {
        const { url } = await ordersApi.createCheckoutSession(order.id);
        window.location.href = url;
      } else {
        // Pour les autres méthodes de paiement, rediriger vers la page de commande
        router.push(`/mes-commandes/${order.id}`);
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande');
      setLoading(false);
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels = {
      [PaymentMethod.CARD]: 'Carte bancaire',
      [PaymentMethod.PAYPAL]: 'PayPal',
      [PaymentMethod.BANK_TRANSFER]: 'Virement bancaire',
    };
    return labels[method];
  };

  return (
    <>
      <Head>
        <title>Passer commande - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Passer commande</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2 space-y-6">
              {/* Coordonnées personnelles */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Coordonnées personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jean"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jean.dupont@example.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse de livraison */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Adresse de livraison</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 rue de la Paix"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="75001"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Paris"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Canada">Canada</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Méthode de paiement */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Méthode de paiement</h2>
                <div className="space-y-3 mb-4">
                  {Object.values(PaymentMethod).map((method) => (
                    <label
                      key={method}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-3 text-gray-900 font-medium">
                        {getPaymentMethodLabel(method)}
                      </span>
                    </label>
                  ))}
                </div>
                {paymentMethod === PaymentMethod.CARD && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Paiement sécurisé par Stripe</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Vous serez redirigé vers notre page de paiement sécurisée Stripe où vous pourrez entrer les coordonnées de votre carte bancaire. Une commission de 5% est appliquée sur chaque transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {paymentMethod === PaymentMethod.PAYPAL && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Paiement PayPal</p>
                        <p className="text-sm text-blue-700 mt-1">
                          La commande sera créée et en attente de paiement. Le vendeur vous contactera pour finaliser le paiement via PayPal.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {paymentMethod === PaymentMethod.BANK_TRANSFER && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Virement bancaire</p>
                        <p className="text-sm text-blue-700 mt-1">
                          La commande sera créée et en attente de paiement. Le vendeur vous communiquera ses coordonnées bancaires pour effectuer le virement.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Notes (optionnel)
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajoutez des notes ou instructions spéciales pour cette commande"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Récapitulatif */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Récapitulatif
                </h2>

                {/* Articles */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                        {item.article.images && item.article.images.length > 0 ? (
                          <img
                            src={item.article.images[0]}
                            alt={item.article.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="text-gray-400 text-xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.article.title}
                        </p>
                        <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {(Number(item.price) * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totaux */}
                <div className="border-t pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frais de port</span>
                    <span>{shippingTotal.toFixed(2)} €</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>

                {/* Boutons */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Traitement...' : paymentMethod === PaymentMethod.CARD ? 'Procéder au paiement' : 'Confirmer la commande'}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/panier')}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Retour au panier
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
