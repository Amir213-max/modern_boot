
import React, { useState, useRef } from 'react';
import { db } from '../services/db';
import { Customer } from '../types';

interface LoginProps {
    onLoginSuccess: (customer: Customer) => void;
    onAdminLogin: () => void;
    onBack: () => void;
    isDarkMode: boolean;
    expired?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onAdminLogin, onBack, isDarkMode, expired }) => {
    // Admin Login State NOT used here anymore - moved to Bot Interface
    // We only need basic login state
    const [name, setName] = useState('');
    const [contractNumber, setContractNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const customer = await db.authenticateCustomer(name, contractNumber);
            if (customer) {
                onLoginSuccess(customer);
            } else {
                setError('بيانات الدخول غير صحيحة أو الحساب غير نشط');
            }
        } catch (err) {
            setError('حدث خطأ أثناء تسجيل الدخول');
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
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div
                        className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center mb-4 bg-gradient-to-tr from-blue-600 to-indigo-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        تسجيل الدخول
                    </h2>
                    <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        منطقة العملاء المسجلين فقط
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-6" dir="rtl">
                    <div className="space-y-1 animate-in fade-in slide-in-from-right-4 duration-300">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>اسم العميل</label>
                        <div className="relative group">
                            <svg className={`absolute right-3 top-3 w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full pr-10 pl-4 py-2.5 rounded-lg border outline-none transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900 placeholder-gray-400 shadow-sm focus:shadow-md'}`}
                                placeholder="أدخل الاسم المسجل"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1 animate-in fade-in slide-in-from-right-8 duration-300">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>رقم التعاقد</label>
                        <div className="relative group">
                            <svg className={`absolute right-3 top-3 w-5 h-5 transition-colors ${isDarkMode ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <input
                                type="text"
                                value={contractNumber}
                                onChange={(e) => setContractNumber(e.target.value)}
                                className={`w-full pr-10 pl-4 py-2.5 rounded-lg border outline-none transition-all duration-300 ${isDarkMode ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-900 placeholder-gray-400 shadow-sm focus:shadow-md'}`}
                                placeholder="أدخل رقم التعاقد (مثال: 10052)"
                                required
                            />
                        </div>
                    </div>

                    {expired && !error && (
                        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm text-center font-medium">
                            انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-95 flex justify-center items-center ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/25'}`}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'تسجيل الدخول'}
                    </button>
                </form>

                <div className={`mt-6 text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p>نظام الدعم الفني الذكي © Modern Soft</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
