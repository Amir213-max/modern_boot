
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { LandingConfig, Product } from '../types';

interface ModernSoftLandingProps {
  onOpenChat: () => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

type View = 'HOME' | 'PRODUCTS' | 'ABOUT' | 'CONTACT';

const ModernSoftLanding: React.FC<ModernSoftLandingProps> = ({ onOpenChat, isDarkMode, toggleTheme }) => {
  const [config, setConfig] = useState<LandingConfig | null>(null);
  const [currentView, setCurrentView] = useState<View>('HOME');
  
  // Edit & Auth State
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeEditTab, setActiveEditTab] = useState<'HOME' | 'PRODUCTS' | 'ABOUT' | 'CONTACT' | 'FOOTER'>('HOME');
  const [logoClicks, setLogoClicks] = useState(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Edit Form State
  const [editForm, setEditForm] = useState<LandingConfig | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const data = await db.getLandingConfig();
      setConfig(data);
    };
    loadConfig();
  }, []);

  const handleSecretClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    if (newCount >= 10) {
      setLogoClicks(0);
      setShowPasswordPrompt(true);
    } else {
      clickTimeoutRef.current = setTimeout(() => setLogoClicks(0), 2000);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = await db.getAdminPassword();
    if (passwordInput === adminPass) {
        setEditForm(config);
        setIsEditing(true);
        setShowPasswordPrompt(false);
        setPasswordInput('');
        setLoginError('');
    } else {
        setLoginError('كلمة المرور غير صحيحة');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm) {
      try {
        await db.saveLandingConfig(editForm);
        setConfig(editForm);
        setIsEditing(false);
        alert('تم حفظ التعديلات بنجاح!');
      } catch (error: any) {
        console.error(error);
        alert(`حدث خطأ أثناء الحفظ: ${error.message}`);
      }
    }
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    if (!editForm) return;
    const newFeatures = [...editForm.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setEditForm({ ...editForm, features: newFeatures });
  };

  const handleProductChange = (index: number, field: keyof Product, value: string) => {
    if (!editForm) return;
    const newProducts = [...editForm.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setEditForm({ ...editForm, products: newProducts });
  };

  // Resize and compress image to avoid Firestore 1MB limit
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }
        
        // Max dimensions (e.g., 800x800 is usually sufficient for web)
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = error => reject(error);
    });
  };

  const handleProductImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
          // Resize before saving
          const resizedBase64 = await resizeImage(file);
          handleProductChange(index, 'image', resizedBase64);
      } catch (error) {
          console.error("Image resize failed", error);
          alert("حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.");
      }
    }
  };

  const addProduct = () => {
      if (!editForm) return;
      const newProduct: Product = {
          id: Date.now().toString(),
          name: 'منتج جديد',
          description: 'وصف المنتج...',
          image: '',
          price: ''
      };
      setEditForm({ ...editForm, products: [...editForm.products, newProduct] });
  };

  const removeProduct = (index: number) => {
      if (!editForm) return;
      const newProducts = editForm.products.filter((_, i) => i !== index);
      setEditForm({ ...editForm, products: newProducts });
  };

  if (!config) return null; // or a loader

  // --- Render Views ---

  const renderHome = () => (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-orange-50/50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 pb-24 lg:pt-32 lg:pb-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-6 whitespace-pre-wrap">
              {config.heroTitle}
              <span className="text-[#F7941D] hidden">.</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-300 leading-relaxed mb-10 font-medium">
              {config.heroSubtitle}
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={onOpenChat}
                className="px-8 py-4 bg-black dark:bg-gray-700 text-white rounded-xl font-bold shadow-xl hover:bg-[#F7941D] dark:hover:bg-[#F7941D] hover:scale-105 transition-all flex items-center gap-2 group"
              >
                {config.heroButtonText}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:animate-bounce">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </button>
              <button 
                onClick={() => setCurrentView('PRODUCTS')}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:text-[#F7941D] hover:border-[#F7941D]"
              >
                تعرف على منتجاتنا
              </button>
            </div>
          </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 opacity-30 dark:opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-10 left-10 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{config.featuresTitle}</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">{config.featuresSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.features.map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-xl shadow-sm flex items-center justify-center text-3xl mb-6 border border-gray-100 dark:border-gray-600 group-hover:border-[#F7941D]/30 group-hover:bg-orange-50 dark:group-hover:bg-gray-600 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#F7941D] transition-colors">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderProducts = () => (
      <div className="py-24 bg-gray-50 dark:bg-gray-800 min-h-[70vh] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{config.productsTitle}</h2>
                  <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">{config.productsSubtitle}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {config.products.map((product) => (
                      <div key={product.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group">
                          <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                              <img 
                                src={product.image || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"} 
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";
                                }}
                                alt={product.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                          </div>
                          <div className="p-6">
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{product.name}</h3>
                                  {product.price && <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full">{product.price}</span>}
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">{product.description}</p>
                              <button 
                                onClick={() => {
                                    const message = `أنا مهتم بمنتج: ${product.name}`;
                                    const url = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
                                    window.open(url, '_blank');
                                }} 
                                className="w-full py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg font-bold hover:bg-[#25D366] dark:hover:bg-[#25D366] transition-colors text-sm flex items-center justify-center gap-2"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                  </svg>
                                  اطلب ديمو الآن
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderAbout = () => (
      <div className="py-24 bg-white dark:bg-gray-900 min-h-[70vh] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{config.aboutPageTitle}</h2>
                      <div className="prose prose-lg text-gray-600 dark:text-gray-300 whitespace-pre-line">
                          {config.aboutPageContent}
                      </div>
                      <div className="mt-8 flex gap-4">
                          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                              <span className="block text-3xl font-bold text-[#F7941D]">10+</span>
                              <span className="text-sm text-gray-600 dark:text-gray-300 font-bold">سنوات خبرة</span>
                          </div>
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                              <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400">1K+</span>
                              <span className="text-sm text-gray-600 dark:text-gray-300 font-bold">عميل سعيد</span>
                          </div>
                      </div>
                  </div>
                  <div className="order-1 lg:order-2 h-96 lg:h-auto bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
                      {config.aboutPageImage ? (
                          <img src={config.aboutPageImage} alt="About Modern Soft" className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">صورة الشركة</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderContact = () => (
      <div className="py-24 bg-gray-50 dark:bg-gray-800 min-h-[70vh] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{config.contactPageTitle}</h2>
                  <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">نحن هنا لمساعدتك. تواصل معنا في أي وقت.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Contact Info Cards */}
                  <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-900 dark:text-white mb-1">العنوان</h4>
                              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{config.contactAddress}</p>
                          </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                              </svg>
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-900 dark:text-white mb-1">الهاتف</h4>
                              <p className="text-gray-600 dark:text-gray-300 text-sm" dir="ltr">{config.contactPhone}</p>
                          </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                              </svg>
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-900 dark:text-white mb-1">البريد الإلكتروني</h4>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">{config.contactEmail}</p>
                          </div>
                      </div>
                  </div>

                  {/* Map Only */}
                  <div className="lg:col-span-2 space-y-8 h-full min-h-[400px]">
                      {config.contactMapUrl ? (
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden h-full border border-gray-100 dark:border-gray-600 shadow-sm">
                               <iframe 
                                    src={config.contactMapUrl} 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="map"
                                ></iframe>
                          </div>
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400">
                             لم يتم تعيين خريطة
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-full flex flex-col bg-white dark:bg-gray-900 font-sans transition-colors duration-300" dir="rtl">
      
      {/* --- Password Prompt Modal --- */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
                 <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">الدخول لإعدادات الموقع</h3>
                 <form onSubmit={handlePasswordSubmit} className="space-y-4">
                     <input 
                        type="password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="كلمة مرور المسؤول"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-center text-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-[#F7941D] outline-none placeholder-gray-400 dark:placeholder-gray-500"
                        autoFocus
                     />
                     {loginError && <p className="text-red-500 text-sm font-bold">{loginError}</p>}
                     <div className="flex gap-2">
                        <button 
                            type="button" 
                            onClick={() => { setShowPasswordPrompt(false); setPasswordInput(''); setLoginError(''); }}
                            className="flex-1 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            إلغاء
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-[#F7941D] hover:bg-[#d67e15] shadow-lg"
                        >
                            دخول
                        </button>
                     </div>
                 </form>
             </div>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {isEditing && editForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
               <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 <span className="bg-orange-100 dark:bg-orange-900/30 text-[#F7941D] p-2 rounded-lg">⚙️</span>
                 إدارة محتوى الموقع
               </h2>
               <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 overflow-x-auto">
                {['HOME', 'PRODUCTS', 'ABOUT', 'CONTACT', 'FOOTER'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveEditTab(tab as any)}
                        className={`py-4 px-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeEditTab === tab ? 'border-[#F7941D] text-[#F7941D]' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        {tab === 'HOME' ? 'الرئيسية' : tab === 'PRODUCTS' ? 'المنتجات' : tab === 'ABOUT' ? 'عن الشركة' : tab === 'CONTACT' ? 'اتصل بنا' : 'بيانات عامة'}
                    </button>
                ))}
            </div>
            
            <div className="overflow-y-auto p-6 flex-1 bg-gray-50/50 dark:bg-gray-800/50">
               <form id="landing-form" onSubmit={handleSaveConfig} className="space-y-8 max-w-4xl mx-auto">
                  
                  {/* --- HOME TAB --- */}
                  {activeEditTab === 'HOME' && (
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 relative group shadow-sm">
                            <span className="absolute -top-3 right-4 bg-[#F7941D] px-2 text-sm font-bold text-white rounded">القسم الرئيسي (Hero)</span>
                            <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">العنوان الرئيسي</label>
                                <textarea rows={2} value={editForm.heroTitle} onChange={e => setEditForm({...editForm, heroTitle: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">الوصف</label>
                                <textarea rows={2} value={editForm.heroSubtitle} onChange={e => setEditForm({...editForm, heroSubtitle: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">نص الزر</label>
                                <input type="text" value={editForm.heroButtonText} onChange={e => setEditForm({...editForm, heroButtonText: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                            </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 relative shadow-sm">
                            <span className="absolute -top-3 right-4 bg-white dark:bg-gray-800 px-2 text-sm font-bold text-[#F7941D]">قسم المميزات</span>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">عنوان القسم</label>
                                    <input type="text" value={editForm.featuresTitle} onChange={e => setEditForm({...editForm, featuresTitle: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">وصف القسم</label>
                                    <input type="text" value={editForm.featuresSubtitle} onChange={e => setEditForm({...editForm, featuresSubtitle: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                {editForm.features.map((feature, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 flex gap-4 items-start">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex gap-2">
                                                <input placeholder="الأيقونة" value={feature.icon} onChange={e => handleFeatureChange(idx, 'icon', e.target.value)} className="w-16 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded text-center focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                                <input placeholder="العنوان" value={feature.title} onChange={e => handleFeatureChange(idx, 'title', e.target.value)} className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded font-bold focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                            </div>
                                            <textarea placeholder="الوصف" value={feature.desc} onChange={e => handleFeatureChange(idx, 'desc', e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded resize-none text-sm focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" rows={2} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                  )}

                  {/* --- PRODUCTS TAB --- */}
                  {activeEditTab === 'PRODUCTS' && (
                      <div className="space-y-6">
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 relative shadow-sm">
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">عنوان صفحة المنتجات</label>
                                      <input type="text" value={editForm.productsTitle} onChange={e => setEditForm({...editForm, productsTitle: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">الوصف الفرعي</label>
                                      <input type="text" value={editForm.productsSubtitle} onChange={e => setEditForm({...editForm, productsSubtitle: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                  </div>
                              </div>
                              
                              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-6">
                                  <label className="block text-sm font-bold text-green-800 dark:text-green-400 mb-1">رقم الواتساب (لطلب الديمو)</label>
                                  <input 
                                    type="text" 
                                    value={editForm.whatsappNumber} 
                                    onChange={e => setEditForm({...editForm, whatsappNumber: e.target.value})} 
                                    className="w-full p-3 bg-white dark:bg-gray-700 border border-green-300 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-900 dark:text-white" 
                                    placeholder="مثال: 201xxxxxxxxx"
                                    dir="ltr"
                                  />
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">أدخل الرقم مع كود الدولة وبدون علامة + (مثال: 201012345678)</p>
                              </div>
                              
                              <div className="space-y-4">
                                  {editForm.products.map((product, idx) => (
                                      <div key={product.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 relative">
                                          <button type="button" onClick={() => removeProduct(idx)} className="absolute top-2 left-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 p-1 rounded">🗑️ حذف</button>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                  <input placeholder="اسم المنتج" value={product.name} onChange={e => handleProductChange(idx, 'name', e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded font-bold focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                                  <input placeholder="السعر (اختياري)" value={product.price} onChange={e => handleProductChange(idx, 'price', e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded text-sm focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                                  
                                                  {/* Image Inputs */}
                                                  <div className="space-y-1">
                                                      <input placeholder="رابط الصورة (URL)" value={product.image} onChange={e => handleProductChange(idx, 'image', e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded text-sm dir-ltr focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" dir="ltr" />
                                                      <div className="flex items-center gap-2">
                                                          <label className="cursor-pointer bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 w-fit">
                                                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                                  <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                                                              </svg>
                                                              رفع صورة من الجهاز
                                                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProductImageUpload(idx, e)} />
                                                          </label>
                                                          <span className="text-[10px] text-gray-400 dark:text-gray-500">سيتم ضغط الصورة تلقائياً</span>
                                                      </div>
                                                  </div>
                                              </div>
                                              <div>
                                                  <textarea placeholder="وصف المنتج" value={product.description} onChange={e => handleProductChange(idx, 'description', e.target.value)} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded h-full resize-none focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                                  <button type="button" onClick={addProduct} className="w-full py-3 border-2 border-dashed border-[#F7941D]/30 text-[#F7941D] rounded-xl font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">+ إضافة منتج جديد</button>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* --- ABOUT TAB --- */}
                  {activeEditTab === 'ABOUT' && (
                      <div className="space-y-6">
                           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 relative shadow-sm space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">عنوان الصفحة</label>
                                    <input type="text" value={editForm.aboutPageTitle} onChange={e => setEditForm({...editForm, aboutPageTitle: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">محتوى "من نحن"</label>
                                    <textarea rows={8} value={editForm.aboutPageContent} onChange={e => setEditForm({...editForm, aboutPageContent: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">رابط الصورة (URL)</label>
                                    <input type="text" value={editForm.aboutPageImage} onChange={e => setEditForm({...editForm, aboutPageImage: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" dir="ltr" />
                                </div>
                           </div>
                      </div>
                  )}

                  {/* --- CONTACT TAB --- */}
                  {activeEditTab === 'CONTACT' && (
                      <div className="space-y-6">
                           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 relative shadow-sm space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">عنوان الصفحة</label>
                                    <input type="text" value={editForm.contactPageTitle} onChange={e => setEditForm({...editForm, contactPageTitle: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">العنوان (المقر)</label>
                                    <input type="text" value={editForm.contactAddress} onChange={e => setEditForm({...editForm, contactAddress: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">رابط الخريطة (Embed URL)</label>
                                    <input type="text" value={editForm.contactMapUrl} onChange={e => setEditForm({...editForm, contactMapUrl: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" dir="ltr" />
                                    <p className="text-xs text-gray-400 mt-1">يمكنك استخدام رابط Google Maps Embed هنا.</p>
                                </div>
                           </div>
                      </div>
                  )}

                  {/* --- FOOTER / GENERAL TAB --- */}
                  {activeEditTab === 'FOOTER' && (
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 relative shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">عن الشركة (النص المختصر في الفوتر)</label>
                                <textarea rows={2} value={editForm.aboutCompanyText} onChange={e => setEditForm({...editForm, aboutCompanyText: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                                    <input type="text" value={editForm.contactEmail} onChange={e => setEditForm({...editForm, contactEmail: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف (الخط الساخن)</label>
                                    <input type="text" value={editForm.contactPhone} onChange={e => setEditForm({...editForm, contactPhone: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                                    </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">نص الحقوق (Copyright)</label>
                                <input type="text" value={editForm.footerText} onChange={e => setEditForm({...editForm, footerText: e.target.value})} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#F7941D] outline-none text-gray-900 dark:text-white" />
                            </div>
                        </div>
                      </div>
                  )}

               </form>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
               <button 
                 type="button" 
                 onClick={() => setIsEditing(false)} 
                 className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
               >
                 إلغاء
               </button>
               <button 
                 type="submit" 
                 form="landing-form"
                 className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#F7941D] hover:bg-[#d67e15] shadow-lg transition transform active:scale-95"
               >
                 حفظ التعديلات
               </button>
            </div>
          </div>
        </div>
      )}


      {/* Navbar */}
      <nav className="border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Brand Logo - Forced LTR to prevent reversed text in Arabic layout */}
            <div 
              className="flex items-center gap-3 group cursor-pointer select-none" 
              dir="ltr"
              onClick={handleSecretClick}
              title="Modern Soft"
            >
              {/* MS Icon SVG */}
              <div className="w-14 h-14 relative flex items-center justify-center transition-transform group-hover:scale-105">
                 <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                    {/* Abstract Shield/Book Shape */}
                    <path d="M15 25 Q 50 5 85 25 V 85 Q 50 95 15 85 Z" fill={isDarkMode ? "white" : "black"} className="transition-colors" />
                    {/* MS Monogram */}
                    <text x="50" y="65" fontSize="45" fontWeight="bold" fontFamily="serif" textAnchor="middle" fill={isDarkMode ? "black" : "white"} className="transition-colors">MS</text>
                 </svg>
              </div>
              
              {/* Text Logo */}
              <div className="flex flex-col justify-center -space-y-1 select-none">
                 <div className="flex items-baseline gap-0.5">
                    <span className="text-3xl font-black tracking-tighter text-[#F7941D]">Modern</span>
                    <span className="text-3xl font-black tracking-tighter text-black dark:text-white transition-colors">Soft</span>
                 </div>
                 <span className="text-[10px] text-gray-800 dark:text-gray-300 font-bold tracking-[0.2em] text-center w-full border-t border-gray-200 dark:border-gray-700 mt-1 pt-0.5 transition-colors">
                    For Programming
                 </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 space-x-reverse text-sm font-bold text-gray-600 dark:text-gray-300">
              <button 
                onClick={() => setCurrentView('HOME')} 
                className={`transition-colors py-2 border-b-2 ${currentView === 'HOME' ? 'text-[#F7941D] border-[#F7941D]' : 'border-transparent hover:text-[#F7941D] hover:border-[#F7941D]'}`}
              >
                  الرئيسية
              </button>
              <button 
                onClick={() => setCurrentView('PRODUCTS')} 
                className={`transition-colors py-2 border-b-2 ${currentView === 'PRODUCTS' ? 'text-[#F7941D] border-[#F7941D]' : 'border-transparent hover:text-[#F7941D] hover:border-[#F7941D]'}`}
              >
                  منتجاتنا
              </button>
              <button 
                onClick={() => setCurrentView('ABOUT')} 
                className={`transition-colors py-2 border-b-2 ${currentView === 'ABOUT' ? 'text-[#F7941D] border-[#F7941D]' : 'border-transparent hover:text-[#F7941D] hover:border-[#F7941D]'}`}
              >
                  عن الشركة
              </button>
              <button 
                onClick={() => setCurrentView('CONTACT')} 
                className="text-white bg-black dark:bg-gray-700 hover:bg-[#F7941D] dark:hover:bg-[#F7941D] px-5 py-2 rounded-lg transition-all shadow-md"
              >
                  اتصل بنا
              </button>

               {/* Theme Toggle Button */}
               {toggleTheme && (
                  <button 
                      onClick={toggleTheme}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition-colors"
                      title="تغيير المظهر (داكن/فاتح)"
                  >
                      {isDarkMode ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                          </svg>
                      )}
                  </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area (Dynamic based on currentView) */}
      <div className="flex-1 animate-in fade-in duration-300">
          {currentView === 'HOME' && renderHome()}
          {currentView === 'PRODUCTS' && renderProducts()}
          {currentView === 'ABOUT' && renderAbout()}
          {currentView === 'CONTACT' && renderContact()}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto border-t-4 border-[#F7941D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-right">
              {/* Footer Logo - Forced LTR */}
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3" dir="ltr">
                 <div className="w-8 h-8">
                    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 25 Q 50 5 85 25 V 85 Q 50 95 15 85 Z" fill="white" />
                        <text x="50" y="65" fontSize="45" fontWeight="bold" fontFamily="serif" textAnchor="middle" fill="black">MS</text>
                    </svg>
                 </div>
                 <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-black text-[#F7941D]">Modern</span>
                    <span className="text-xl font-black text-white">Soft</span>
                 </div>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">{config.aboutCompanyText}</p>
              <div className="mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span>📧 {config.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                    <span>📞 {config.contactPhone}</span>
                  </div>
              </div>
            </div>
            
            <div className="flex gap-6 text-sm font-medium">
                <button onClick={() => setCurrentView('PRODUCTS')} className="hover:text-[#F7941D] transition-colors">منتجاتنا</button>
                <button onClick={() => setCurrentView('ABOUT')} className="hover:text-[#F7941D] transition-colors">عن الشركة</button>
                <button onClick={() => setCurrentView('CONTACT')} className="hover:text-[#F7941D] transition-colors">الدعم الفني</button>
            </div>

            <div className="text-gray-500 text-sm text-center md:text-left">
              {config.footerText}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button (FAB) for Chat */}
      <button 
        onClick={onOpenChat}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-black hover:bg-[#F7941D] dark:bg-gray-700 dark:hover:bg-[#F7941D] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group border-2 border-white/10"
        title="تحدث مع مساعد"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F7941D] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F7941D]"></span>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 group-hover:rotate-12 transition-transform">
           <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </button>
    </div>
  );
};

export default ModernSoftLanding;
