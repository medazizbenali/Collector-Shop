import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, Order, OrderStatus } from '@/services/ordersApi';

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (id && user) {
      loadOrder();
    }
  }, [id, user]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getOrderById(id as string);
      setOrder(data);
    } catch (err: any) {
      console.error('Error loading order:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement de la commande');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      [OrderStatus.PENDING]: 'En attente',
      [OrderStatus.PAID]: 'Payée',
      [OrderStatus.SHIPPED]: 'Expédiée',
      [OrderStatus.DELIVERED]: 'Livrée',
      [OrderStatus.CANCELLED]: 'Annulée',
    };
    return labels[status];
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.PAID]: 'bg-green-100 text-green-800',
      [OrderStatus.SHIPPED]: 'bg-blue-100 text-blue-800',
      [OrderStatus.DELIVERED]: 'bg-purple-100 text-purple-800',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };
    return colors[status];
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

  if (error || !order) {
    return (
      <>
        <Head>
          <title>Erreur - Commande</title>
        </Head>
        <Navigation />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Erreur</h2>
              <p className="text-red-600">{error || 'Commande introuvable'}</p>
              <Link href="/mes-commandes" className="mt-4 inline-block text-blue-600 hover:underline">
                ← Retour à mes commandes
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Commande #{order.id.substring(0, 8)} - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <Link href="/mes-commandes" className="text-blue-600 hover:underline mb-4 inline-block">
              ← Retour à mes commandes
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Commande #{order.id.substring(0, 8)}
                </h1>
                <p className="text-gray-600 mt-1">
                  Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Articles de la commande */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Articles commandés</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                      {item.article.images && item.article.images.length > 0 && (
                        <img
                          src={item.article.images[0]}
                          alt={item.article.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <Link
                          href={`/articles/${item.article.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {item.article.title}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.article.condition} • {item.article.category?.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{item.price.toFixed(2)} €</p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-500">{(item.price / item.quantity).toFixed(2)} € / unité</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Résumé et informations */}
            <div className="space-y-6">
              {/* Résumé de la commande */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{order.totalAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frais de livraison</span>
                    <span>{order.shippingCost.toFixed(2)} €</span>
                  </div>
                  {order.platformFee > 0 && (
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Commission plateforme (5%)</span>
                      <span>{order.platformFee.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>{(order.totalAmount + order.shippingCost).toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                {order.paidAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-green-600 font-semibold">
                      ✓ Payée le {new Date(order.paidAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Adresse de livraison */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Livraison</h2>
                <div className="text-gray-600 whitespace-pre-line">
                  {order.shippingAddress}
                </div>
              </div>

              {/* Méthode de paiement */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Paiement</h2>
                <p className="text-gray-600 capitalize">{order.paymentMethod}</p>
                {order.stripeSessionId && (
                  <p className="text-xs text-gray-400 mt-2">
                    Session: {order.stripeSessionId.substring(0, 20)}...
                  </p>
                )}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
                  <p className="text-gray-600 whitespace-pre-line">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
