import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

export default function Profile() {
  const router = useRouter();
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    interests: [] as string[],
  });
  const [interestInput, setInterestInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }

    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        interests: user.interests || [],
      });
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()],
      });
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== interest),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
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
        <title>Mon Profil - Collector.shop</title>
      </Head>

      <Navigation />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Profil</h1>

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du compte</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base text-gray-900 mt-1">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rôle</p>
                  <p className="text-base text-gray-900 mt-1 capitalize">
                    {user.role === 'admin' ? 'Administrateur' : user.role === 'seller' ? 'Vendeur' : 'Acheteur'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Membre depuis</p>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Modifier mon profil</h2>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4" role="alert">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4 mb-4" role="alert">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Centres d'intérêt</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                      placeholder="Ajouter un centre d'intérêt"
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(interest)}
                          className="text-indigo-600 hover:text-indigo-900 font-bold"
                          aria-label={`Remove ${interest}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
