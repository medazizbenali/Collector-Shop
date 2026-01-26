import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user.types';
import { shopsApi, CreateShopDto } from '@/services/shopsApi';

export default function CreerBoutique() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateShopDto>({
    name: '',
    slug: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    returnPolicy: '',
    shippingPolicy: '',
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== UserRole.SELLER && user.role !== UserRole.ADMIN) {
      router.push('/dashboard');
      return;
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-generate slug from name
    if (name === 'name' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Pour l'instant, on utilise une URL placeholder si une image est uploadée
      // TODO: Implémenter l'upload d'image vers un service de stockage
      const shopData: any = {
        name: formData.name,
        slug: formData.slug,
      };

      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (formData.description?.trim()) shopData.description = formData.description;
      if (formData.contactEmail?.trim()) shopData.contactEmail = formData.contactEmail;
      if (formData.contactPhone?.trim()) shopData.contactPhone = formData.contactPhone;
      if (formData.website?.trim()) shopData.website = formData.website;
      if (formData.address?.trim()) shopData.address = formData.address;
      if (formData.city?.trim()) shopData.city = formData.city;
      if (formData.postalCode?.trim()) shopData.postalCode = formData.postalCode;
      if (formData.country?.trim()) shopData.country = formData.country;
      if (formData.returnPolicy?.trim()) shopData.returnPolicy = formData.returnPolicy;
      if (formData.shippingPolicy?.trim()) shopData.shippingPolicy = formData.shippingPolicy;

      const shop = await shopsApi.createShop(shopData);
      alert('Boutique créée avec succès !');
      router.push('/mes-boutiques');
    } catch (err: any) {
      console.error('❌ Erreur création boutique:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création de la boutique');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
        <title>Créer une Boutique - Collector.shop</title>
      </Head>

      <Navigation />

      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Créer une boutique</h1>
          <p className="mt-2 text-gray-600">
            Créez votre boutique virtuelle pour organiser vos articles par thème
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Informations de base */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de base</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom de la boutique <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ex: Manga Collection Pro"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    /boutiques/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    required
                    value={formData.slug}
                    onChange={handleChange}
                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="manga-collection-pro"
                    title="Seulement des lettres minuscules, chiffres et tirets"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  URL unique pour votre boutique (lettres minuscules, chiffres et tirets uniquement)
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Décrivez votre boutique et ce que vous vendez..."
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de contact</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Email de contact
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="contact@exemple.com"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Site web
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="https://www.exemple.com"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="123 Rue de la Paix"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Ville
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Code postal
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="75001"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Pays
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Politiques */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Politiques</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="returnPolicy" className="block text-sm font-medium text-gray-700">
                  Politique de retour
                </label>
                <textarea
                  id="returnPolicy"
                  name="returnPolicy"
                  rows={3}
                  value={formData.returnPolicy}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ex: Retours acceptés sous 14 jours si l'article n'a pas été ouvert..."
                />
              </div>

              <div>
                <label htmlFor="shippingPolicy" className="block text-sm font-medium text-gray-700">
                  Politique d'expédition
                </label>
                <textarea
                  id="shippingPolicy"
                  name="shippingPolicy"
                  rows={3}
                  value={formData.shippingPolicy}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ex: Expédition sous 48h en colissimo suivi. Livraison gratuite dès 50€..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-6 flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer la boutique'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
