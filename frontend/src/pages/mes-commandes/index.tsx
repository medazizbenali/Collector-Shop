import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, Order, OrderStatus } from '@/services/ordersApi';

export default function MesCommandes() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid'>('paid');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
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
      [OrderStatus.PAID]: 'bg-blue-100 text-blue-800',
      [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
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

  const filteredOrders = filter === 'paid'
    ? orders.filter(order => order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CANCELLED)
    : orders;

  return (
    <>
      <Head>
        <title>Mes Commandes - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>

            {/* Filtre */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'paid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Commandes payées
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Toutes
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">Vous n'avez pas encore de commandes</p>
              <Link
                href="/catalogue"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Parcourir le catalogue
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Commande #{order.id.substring(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  {/* Articles */}
                  <div className="space-y-4 mb-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                          {item.article.images && item.article.images.length > 0 ? (
                            <img
                              src={item.article.images[0]}
                              alt={item.article.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="text-gray-400 text-2xl">📦</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.article.title}</h4>
                          <p className="text-sm text-gray-500">
                            Vendu par {item.seller.firstName}
                          </p>
                          <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {Number(item.price).toFixed(2)} €
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">
                          Total (frais de port inclus: {Number(order.shippingCost).toFixed(2)} €)
                        </p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {(Number(order.totalPrice) + Number(order.shippingCost)).toFixed(2)} €
                      </p>
                    </div>
                  </div>

                  {/* Bouton détails */}
                  <div className="mt-4">
                    <Link
                      href={`/mes-commandes/${order.id}`}
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
