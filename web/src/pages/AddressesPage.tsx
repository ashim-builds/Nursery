import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { MapPin, Plus, Trash2, ArrowLeft, X } from 'lucide-react';
import { LocationPickerMap } from '../components/common/LocationPickerMap';

export const AddressesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useUI();

  const [addresses, setAddresses] = useState([
    {
      id: 'addr-1',
      label: 'Home',
      fullName: user?.fullName || 'Botanical Customer',
      phoneNumber: user?.phoneNumber || '9841000000',
      streetAddress: 'Baluwatar-4, Near Russian Embassy',
      city: 'Kathmandu',
      latitude: 27.7215,
      longitude: 85.3206,
      isDefault: true,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newName, setNewName] = useState(user?.fullName || '');
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || '');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Kathmandu');
  const [newCoords, setNewCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 27.7215,
    longitude: 85.3206,
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();

    if (newName && !/^[a-zA-Z\s\.\'-]+$/.test(newName.trim())) {
      showToast('Full Name cannot contain numbers', 'error');
      return;
    }

    if (!/^[9][0-9]{9}$/.test(newPhone.trim())) {
      showToast('Phone number must be exactly 10 digits and start with 9', 'error');
      return;
    }

    if (!newStreet.trim()) {
      showToast('Street address is required', 'error');
      return;
    }

    const newAddr = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      fullName: newName.trim() || user?.fullName || 'Customer',
      phoneNumber: newPhone.trim(),
      streetAddress: newStreet.trim(),
      city: newCity,
      latitude: newCoords.latitude,
      longitude: newCoords.longitude,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    showToast('Delivery address saved successfully!', 'success');
    setShowAddModal(false);
    setNewStreet('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 pb-24">
      {/* Back button */}
      <Link
        to="/profile"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-forest-800 min-h-[44px]"
      >
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
              <p className="font-medium text-slate-800">
                {addr.fullName} • +977 {addr.phoneNumber}
              </p>
              <p className="text-slate-600">
                {addr.streetAddress}, {addr.city}
              </p>
              {addr.latitude && (
                <p className="text-[10px] text-emerald-700 font-mono">
                  GPS: {addr.latitude.toFixed(4)}, {addr.longitude?.toFixed(4)}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setAddresses(addresses.filter((a) => a.id !== addr.id));
                showToast('Address removed', 'info');
              }}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
              title="Delete address"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Add New Delivery Address
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Address Label</label>
                <div className="flex gap-2">
                  {['Home', 'Office', 'Greenhouse', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewLabel(lbl)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                        newLabel === lbl
                          ? 'bg-forest-800 text-white border-forest-800'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value.replace(/[^a-zA-Z\s\.\'-]/g, ''))}
                    placeholder="Recipient Full Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone * (10 digits starting with 9)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Street Address / Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="e.g. Lazimpat-2, near Radisson Hotel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              {/* Map Geolocation Component with Auto-Fill */}
              <LocationPickerMap
                latitude={newCoords.latitude}
                longitude={newCoords.longitude}
                onChange={(coords) => setNewCoords(coords)}
                onAddressFound={(addr) => {
                  if (addr.street && !newStreet) {
                    setNewStreet(addr.street);
                  }
                  if (addr.city) {
                    setNewCity(addr.city);
                  }
                }}
              />

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold shadow-xs"
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
