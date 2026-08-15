'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      const validated = loginSchema.parse(formData);

      // Sign in
      const result = await signIn('credentials', {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || 'Giriş başarısız oldu');
        return;
      }

      if (result?.ok) {
        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
        router.push(callbackUrl);
      }
    } catch (err: any) {
      if (err.errors?.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError('Giriş sırasında bir hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            ERP Field Sales
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sistem yönetim paneline hoşgeldiniz
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={cn(
                  'mt-1 w-full px-4 py-2 border border-slate-300 rounded-md',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'disabled:bg-slate-50 disabled:text-slate-500',
                  'transition-colors'
                )}
                placeholder="user@example.com"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={cn(
                  'mt-1 w-full px-4 py-2 border border-slate-300 rounded-md',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'disabled:bg-slate-50 disabled:text-slate-500',
                  'transition-colors'
                )}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'disabled:bg-slate-400 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500 text-center mb-2">Demo Hesapları:</p>
            <div className="space-y-1 text-xs text-slate-600">
              <p>📧 admin@erp.local / 12345678</p>
              <p>📧 fieldRep@erp.local / 12345678</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
