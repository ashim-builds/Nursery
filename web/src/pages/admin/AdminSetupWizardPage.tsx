import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Sprout,
  Building2,
  Phone,
  MapPin,
  FolderTree,
  Package,
  Image as ImageIcon,
  Truck,
  CreditCard,
  Layout,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { LocationPickerMap } from '../../components/common/LocationPickerMap';
import { useUI } from '../../context/UIContext';

export const AdminSetupWizardPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useUI();
  const navigate = useNavigate();

  // Wizard State
  const [formData, setFormData] = useState({
    businessName: 'KtmBotanica Nursery & Florist',
    logo: '',
    shortDescription: 'Nepal’s premier botanical nursery, indoor plants & floral studio.',
    phone: '9800000000',
    email: 'contact@ktmbotanica.com',
    openingHours: 'Sun - Sat: 8:00 AM - 7:00 PM',
    province: 'Bagmati',
    district: 'Kathmandu',
    city: 'Kathmandu',
    area: 'Lazimpat',
    address: 'Lazimpat Botanical Row, Kathmandu, Nepal',
    latitude: 27.7215,
    longitude: 85.3206,
    categories: [
      'Indoor Plants',
      'Outdoor Plants',
      'Flowering Plants',
      'Succulents',
      'Cactus',
      'Flower Bouquets',
      'Pots & Planters',
      'Seeds',
      'Gardening Products',
      'Plant Gifts',
    ],
    firstProductName: 'Swiss Cheese Monstera',
    firstProductPrice: 1050,
    firstProductCategory: 'Indoor Plants',
    firstProductStockStatus: 'IN_STOCK' as 'IN_STOCK' | 'OUT_OF_STOCK',
    productImageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
    deliveryZones: [
      { name: 'Kathmandu Core', fee: 100 },
      { name: 'Lalitpur Core', fee: 100 },
      { name: 'Bhaktapur', fee: 150 },
      { name: 'Outside Valley', fee: 250 },
    ],
    paymentMethods: ['Cash on Delivery (COD)'],
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append('file', file);
    body.append('folder', 'products');

    try {
      const res = await axios.post('/api/upload/image', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data?.url) {
        setFormData((prev) => ({ ...prev, productImageUrl: res.data.data.url }));
        showToast('Product image uploaded to NVMe storage!', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNext = () => {
    // Validations
    if (currentStep === 1 && !formData.businessName.trim()) {
      showToast('Business Name is required', 'error');
      return;
    }
    if (currentStep === 2) {
      if (!/^[9][0-9]{9}$/.test(formData.phone)) {
        showToast('Phone number must be exactly 10 digits and start with 9', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        showToast('Please provide a valid email address', 'error');
        return;
      }
    }
    if (currentStep === 3 && !formData.address.trim()) {
      showToast('Address is required', 'error');
      return;
    }

    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinishSetup = async () => {
    setIsSubmitting(true);
    try {
      await axios.post('/api/site-settings/setup', {
        businessName: formData.businessName,
        logo: formData.logo,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        province: formData.province,
        district: formData.district,
        city: formData.city,
        area: formData.area,
        latitude: formData.latitude,
        longitude: formData.longitude,
        openingHours: formData.openingHours,
      });

      showToast('Nursery configuration completed! Welcome to your Dashboard.', 'success');
      navigate('/admin/dashboard');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save configuration', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { title: 'Business Info', icon: Building2, desc: 'Customers will see this name across the website.' },
    { title: 'Contact Info', icon: Phone, desc: 'Customers will use this phone & email to contact your nursery.' },
    { title: 'Nursery Location', icon: MapPin, desc: 'Set your greenhouse coordinates on the map for delivery references.' },
    { title: 'Categories', icon: FolderTree, desc: 'Botanical collections available for customers to explore.' },
    { title: 'First Product', icon: Package, desc: 'Add the first plant or product you currently sell (In Stock / Out of Stock).' },
    { title: 'Product Images', icon: ImageIcon, desc: 'Upload clear photos saved directly to your NVMe server storage.' },
    { title: 'Delivery Zones', icon: Truck, desc: 'Set the delivery regions and fees across Kathmandu Valley.' },
    { title: 'Payment Options', icon: CreditCard, desc: 'Select payment methods accepted by your nursery.' },
    { title: 'Homepage Setup', icon: Layout, desc: 'Showcase featured plants and curated collections on the homepage.' },
    { title: 'Final Verification', icon: CheckCircle2, desc: 'Review your complete configuration and launch your store.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-forest-100 text-forest-900 px-4 py-1.5 rounded-full text-xs font-bold">
            <Sprout size={16} className="text-forest-700" />
            <span>Nursery Admin Onboarding</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome! Let's set up your nursery.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Step {currentStep} of 10: <span className="font-semibold text-slate-800">{stepsMeta[currentStep - 1].title}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 10) * 100}%` }}
          />
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
          {/* Step Banner */}
          <div className="bg-forest-50/70 border border-forest-100 rounded-2xl p-4 flex items-start gap-3">
            {React.createElement(stepsMeta[currentStep - 1].icon, {
              size: 24,
              className: 'text-forest-700 shrink-0 mt-0.5',
            })}
            <div>
              <h3 className="text-sm font-bold text-forest-950">{stepsMeta[currentStep - 1].title}</h3>
              <p className="text-xs text-forest-800 font-light">{stepsMeta[currentStep - 1].desc}</p>
            </div>
          </div>

          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Nursery Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. KtmBotanica Nursery & Florist"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-forest-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={3}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Describe your nursery and plant offerings..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-forest-200 outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Phone Number <span className="text-rose-500">* (10 digits starting with 9)</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="9800000000"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-forest-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@ktmbotanica.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-forest-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  placeholder="Sun - Sat: 8:00 AM - 7:00 PM"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-forest-200 outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Nursery Location & Map */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Area</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Physical Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Lazimpat Botanical Row, Kathmandu"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none"
                />
              </div>

              {/* Map Component */}
              <LocationPickerMap
                latitude={formData.latitude}
                longitude={formData.longitude}
                onChange={(coords) =>
                  setFormData({ ...formData, latitude: coords.latitude, longitude: coords.longitude })
                }
                onAddressFound={(address) =>
                  setFormData((current) => ({
                    ...current,
                    address: address.formatted || address.street,
                    city: address.city || current.city,
                  }))
                }
              />
            </div>
          )}

          {/* Step 4: Categories */}
          {currentStep === 4 && (
            <div className="space-y-3 animate-in fade-in">
              <p className="text-xs text-slate-500">
                Recommended 10 botanical categories ready to organize your catalog:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {formData.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: First Product */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={formData.firstProductName}
                  onChange={(e) => setFormData({ ...formData, firstProductName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (NPR)</label>
                  <input
                    type="number"
                    value={formData.firstProductPrice}
                    onChange={(e) => setFormData({ ...formData, firstProductPrice: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Availability</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, firstProductStockStatus: 'IN_STOCK' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                        formData.firstProductStockStatus === 'IN_STOCK'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      IN STOCK
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, firstProductStockStatus: 'OUT_OF_STOCK' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                        formData.firstProductStockStatus === 'OUT_OF_STOCK'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      OUT OF STOCK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Product Images */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center space-y-3 bg-slate-50/50">
                {formData.productImageUrl ? (
                  <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                    <img
                      src={formData.productImageUrl}
                      alt="Uploaded Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Upload size={32} className="text-slate-400" />
                )}

                <label className="cursor-pointer bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2 transition-colors">
                  {uploadingImage ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving to NVMe...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Upload Product Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="text-[11px] text-slate-500">Supported formats: WebP, PNG, JPEG. Max 10MB.</p>
              </div>
            </div>
          )}

          {/* Step 7: Delivery Zones */}
          {currentStep === 7 && (
            <div className="space-y-3 animate-in fade-in">
              <p className="text-xs text-slate-500">Configured delivery zones and standard charges:</p>
              <div className="space-y-2">
                {formData.deliveryZones.map((zone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    <span className="text-slate-800 font-semibold">{zone.name}</span>
                    <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-forest-800 font-bold">
                      रू {zone.fee}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Payment Methods */}
          {currentStep === 8 && (
            <div className="space-y-3 animate-in fade-in">
              <p className="text-xs text-slate-500">Active payment options for customers:</p>
              <div className="grid grid-cols-2 gap-2">
                {formData.paymentMethods.map((pm, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-semibold text-slate-800"
                  >
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{pm}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Homepage */}
          {currentStep === 9 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-emerald-800">✓ Homepage Dynamic Collections Linked</span>
                <p className="text-[11px] text-emerald-700">
                  Featured cards showcase plants with care guide badges, high-resolution botanical visuals, and zero price tags on showcase cards.
                </p>
              </div>
            </div>
          )}

          {/* Step 10: Final Verification */}
          {currentStep === 10 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center py-2 space-y-2">
                <Sparkles size={36} className="text-emerald-500 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-slate-900">Your nursery is ready!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All foundational business settings, contact channels, map coordinates, and catalog structures are configured.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Business:</span>
                  <span className="font-semibold">{formData.businessName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold">+977 {formData.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold">{formData.city}, {formData.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Categories:</span>
                  <span className="font-semibold">{formData.categories.length} Collections</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < 10 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl inline-flex items-center gap-2 transition-colors shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishSetup}
                disabled={isSubmitting}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-7 py-3 rounded-xl inline-flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Launching Dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Go to Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
