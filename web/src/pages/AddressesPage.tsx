import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { MapPin, Plus, Trash2, Home, Building2, Check, ArrowLeft } from 'lucide-react';

export const AddressesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useUI();

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      label: 'Home (Greenhouse)',
      fullName: user?.fullName || 'Botanica Customer',
      phoneNumber: user?.phoneNumber || '9841000000',
      streetAddress: 'Baluwatar-4, Near Russian Embassy',
      city: 'Kathmandu',
      isDefault: true,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Kathmandu');

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) return;

    const newAddr = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      fullName: newName || user?.fullName || 'Customer',
      phoneNumber: newPhone || user?.phoneNumber || '9800000000',
      streetAddress: newStreet.trim(),
      city: newCity,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    showToast('Delivery address saved', 'success');
    setShowAddModal(false);
    setNewStreet('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 pb-24">
      {/* Back button */}
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-forest-800 min-h-[44px]">
        <ArrowLeft size={16} />
        <span>Back to Account</span>
      </Link>

      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
            <MapPin size={24} className="text-forest-700" />
            <span>Delivery Addresses</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your saved delivery locations for swift plant deliveries across Kathmandu Valley.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-forest-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-forest-900 transition-all min-h-[44px]"
        >
          <Plus size={16} />
          <span>Add Address</span>
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-3.5">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="bg-white rounded-3xl border border-slate-200 p-5 flex items-start justify-between gap-4 shadow-xs"
          >
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{addr.label}</span>
                {addr.isDefault && (
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="font-medium text-slate-800">{addr.fullName} • {addr.phoneNumber}</p>
              <p className="text-slate-600">{addr.streetAddress}, {addr.city}</p>
            </div>

            <button
              onClick={() => {
                setAddresses(addresses.filter((a) => a.id !== addr.id));
                showToast('Address removed', 'info');
              }}
              className="text-slate-400 hover:text-rose-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Delete address"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="font-serif font-bold text-lg text-slate-900">Add Delivery Location</h2>
            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Label</label>
                <select
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl min-h-[44px]"
                >
                  <option value="Home">Home</option>
                  <option value="Office / Greenhouse">Office / Greenhouse</option>
                  <option value="Family / Gift Address">Family / Gift Address</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Street Address / Landmark</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jhamsikhel, Ward 3, Near St. Xavier's"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City / Region</label>
                <select
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl min-h-[44px]"
                >
                  <option value="Kathmandu">Kathmandu</option>
                  <option value="Lalitpur">Lalitpur</option>
                  <option value="Bhaktapur">Bhaktapur</option>
                  <option value="Pokhara">Pokhara</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-forest-800 text-white font-bold py-2.5 rounded-xl min-h-[44px]"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
