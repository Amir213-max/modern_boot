
import React, { useState } from 'react';
import { db } from '../services/db';
import { Customer } from '../types';

interface RegisterProps {
    onRegisterSuccess: (customer: Customer) => void;
    onBack: () => void;
    onGoToLogin: () => void;
    isDarkMode: boolean;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onBack, onGoToLogin, isDarkMode }) => {
    const [name, setName] = useState('');
    const [contractNumber, setContractNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        try {
            const result = await db.registerCustomer(name, contractNumber);
            if (result.success && result.customer) {
                setSuccess(true);
                // Auto login after successful registration
                setTimeout(() => {
                    onRegisterSuccess(result.customer!);
                }, 1500);
            } else {
                setError(result.error || 'حدث خطأ أثناء التسجيل');
            }
        } catch (err) {
            setError('حدث خطأ أثناء التسجيل');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex flex-col items-center justify-center h-full w-full p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>

            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
                    </svg>
                    <span>العودة</span>
                </button>
            </div>

            <div className={`relative w-full max-w-md p-8 rounded-2xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/50'} backdrop-blur-xl transition-all duration-300 transform hover:scale-[1.01]`}>

                {/* Decorative Background Elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div
                        className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center mb-4 bg-gradient-to-tr from-green-600 to-emerald-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg>
                    </div>
                    <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        إنشاء حساب جديد
                    </h2>
                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        سجل الآن للوصول إلى الدعم الفني
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-6" dir="rtl">
                    <div className="space-y-1 animate-in fade-in slide-in-from-right-4 duration-300">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>اسم العميل</label>
                        <div className="relative group">
                            <svg className={`absolute right-3 top-3 w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500 group-focus-within:text-green-400' : 'text-gray-400 group-focus-within:text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full pr-10 pl-4 py-2.5 rounded-lg border outline-none transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 focus:border-green-500 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 focus:border-green-500 text-gray-900 placeholder-gray-400 shadow-sm focus:shadow-md'}`}
                                placeholder="أدخل اسمك الكامل"
                                required
                                disabled={loading || success}
                            />
                        </div>
                    </div>

                    <div className="space-y-1 animate-in fade-in slide-in-from-right-8 duration-300">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>رقم التعاقد</label>
                        <div className="relative group">
                            <svg className={`absolute right-3 top-3 w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500 group-focus-within:text-green-400' : 'text-gray-400 group-focus-within:text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <input
                                type="text"
                                value={contractNumber}
                                onChange={(e) => setContractNumber(e.target.value)}
                                className={`w-full pr-10 pl-4 py-2.5 rounded-lg border outline-none transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 focus:border-green-500 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 focus:border-green-500 text-gray-900 placeholder-gray-400 shadow-sm focus:shadow-md'}`}
                                placeholder="أدخل رقم التعاقد (مثال: 10052)"
                                required
                                disabled={loading || success}
                            />
                        </div>
                    </div>

                    {success && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm text-center font-medium animate-pulse">
                            ✓ تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || success}
                        className={`w-full py-3 px-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95 flex justify-center items-center ${loading || success ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-green-500/25'}`}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : success ? (
                            '✓ تم التسجيل'
                        ) : (
                            'إنشاء الحساب'
                        )}
                    </button>
                </form>

                <div className={`mt-6 text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p className="mb-2">لديك حساب بالفعل؟</p>
                    <button
                        onClick={onGoToLogin}
                        className={`text-sm font-medium underline transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                        تسجيل الدخول
                    </button>
                </div>

                <div className={`mt-4 text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p>نظام الدعم الفني الذكي © Modern Soft</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
