'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Ship, LogIn, AlertCircle } from 'lucide-react';
import { Container, Card, CardContent, Button, Alert } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      router.push('/dashboard');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-900 to-[#0A192F]" />
      
      <Container maxWidth="xs" className="relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2 text-white font-bold text-2xl">
            <Ship className="h-8 w-8 text-cyan-400" />
            <span>Global Load Logistics</span>
          </Link>
          <h2 className="text-xl font-bold text-gray-300">Admin & Collaborator Login</h2>
        </div>

        <div className="border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md text-white shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dark-form-input"
                  placeholder="admin@company.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark-form-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginMutation.isError && (
              <Alert severity="error" icon={<AlertCircle className="h-5 w-5" />} className="bg-red-950/50 border border-red-500/20 text-red-200">
                {loginMutation.error.message || 'Login failed. Please check credentials.'}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loginMutation.isPending}
              startIcon={<LogIn className="h-4 w-4" />}
              sx={{
                bgcolor: '#00F2FE',
                color: '#0A192F',
                fontWeight: 'bold',
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                borderRadius: 2,
                '&:hover': { bgcolor: '#00cce0' }
              }}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            New team member?{' '}
            <Link href="/register" className="text-cyan-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
