import React, { useEffect, useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const ContentSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      if (res.success && res.data) setSettings(res.data);
    });
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminApi.updateSettings(settings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error('Settings save failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Website Content & Settings</h1>
          <p className="text-xs text-stone-500">Update promotional banners, hero messaging, and contact information without touching source code.</p>
        </div>

        {isSaved && (
          <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Check className="w-4 h-4" /> Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6 text-xs">
        
        {/* Banner Section */}
        <div className="space-y-3 pb-6 border-b border-stone-100">
          <h3 className="font-extrabold text-sm text-stone-900 uppercase tracking-wider">Promotional Announcement Bar</h3>
          <div>
            <label className="font-bold text-stone-700 block mb-1">Banner Text</label>
            <input
              type="text"
              value={settings['announcement_banner_text'] || ''}
              onChange={(e) => handleChange('announcement_banner_text', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
            />
          </div>
        </div>

        {/* Hero Content */}
        <div className="space-y-3 pb-6 border-b border-stone-100">
          <h3 className="font-extrabold text-sm text-stone-900 uppercase tracking-wider">Homepage Hero Section</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Hero Main Title</label>
              <input
                type="text"
                value={settings['hero_title'] || ''}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Hero CTA Text</label>
              <input
                type="text"
                value={settings['hero_cta_text'] || ''}
                onChange={(e) => handleChange('hero_cta_text', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-stone-700 block mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={settings['hero_subtitle'] || ''}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 pb-6 border-b border-stone-100">
          <h3 className="font-extrabold text-sm text-stone-900 uppercase tracking-wider">Delhi NCR Hub & Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Support Email</label>
              <input
                type="email"
                value={settings['business_email'] || ''}
                onChange={(e) => handleChange('business_email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Business Phone</label>
              <input
                type="text"
                value={settings['business_phone'] || ''}
                onChange={(e) => handleChange('business_phone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={settings['business_whatsapp'] || ''}
                onChange={(e) => handleChange('business_whatsapp', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Commerce Rules */}
        <div className="space-y-3 pb-6">
          <h3 className="font-extrabold text-sm text-stone-900 uppercase tracking-wider">Shipping Rules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Default Delivery Charge (₹)</label>
              <input
                type="number"
                value={settings['default_shipping_fee'] || '49'}
                onChange={(e) => handleChange('default_shipping_fee', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                value={settings['free_shipping_threshold'] || '499'}
                onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">GST Tax (%)</label>
              <input
                type="number"
                value={settings['tax_percentage'] || '5'}
                onChange={(e) => handleChange('tax_percentage', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>

      </form>
    </div>
  );
};
