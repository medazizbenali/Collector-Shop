import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Panier() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, removeFromCart, updateCartItem, refreshCart } = useCart();

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

  if (authLoading || loading) {
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

  if (!user) {
    return null;
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, { quantity: newQuantity });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (confirm('Êtes-vous sûr de vouloir retirer cet article du panier ?')) {
      try {
        await removeFromCart(itemId);
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
  };

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart?.items?.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) || 0;
  const shippingTotal = cart?.items?.reduce((sum, item) => sum + Number(item.article.shippingCost), 0) || 0;
  const total = subtotal + shippingTotal;

  return (
    <>
      <Head>
        <title>Mon Panier - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>

          {!cart || cart.items.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-600 text-lg mb-4">Votre panier est vide</p>
              <Link
                href="/catalogue"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Continuer mes achats
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Liste des articles */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {item.article.images && item.article.images.length > 0 ? (
                          <img
                            src={item.article.images[0]}
                            alt={item.article.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400 text-3xl">📦</div>
                        )}
                      </div>

                      {/* Détails */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          <Link
                            href={`/articles/${item.article.id}`}
                            className="hover:text-blue-600"
                          >
                            {item.article.title}
                          </Link>
                        </h3>

                        <p className="text-sm text-gray-600 mb-2">
                          Vendu par {item.article.seller.firstName}
                        </p>

                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-xl font-bold text-blue-600">
                            {Number(item.price).toFixed(2)} €
                          </span>
                          <span className="text-sm text-gray-500">
                            + {Number(item.article.shippingCost).toFixed(2)} € de port
                          </span>
                        </div>

                        {/* Quantité */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <span className="px-4 py-1 border-x border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>

                      {/* Total ligne */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {(Number(item.price) * item.quantity + Number(item.article.shippingCost)).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé de la commande */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Résumé de la commande
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Articles ({totalItems})</span>
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

                  <Link
                    href="/commande"
                    className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-medium mb-3"
                  >
                    Passer la commande
                  </Link>

                  <Link
                    href="/catalogue"
                    className="block w-full py-3 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition"
                  >
                    Continuer mes achats
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
