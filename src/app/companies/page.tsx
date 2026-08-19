'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ship, Building, Plus, LogOut, ArrowRight, Briefcase, PlusCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Container, Card, CardContent, Typography, Button, Alert, Box } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function CompaniesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);

  // Creation form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Check authentication on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Fetch companies associated with user
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['user-companies-selection', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('company_collaborators')
        .select(`
          company_id,
          companies (id, name, tenant_slug, created_by)
        `)
        .eq('user_id', userId);
        
      if (error) throw error;
      
      const mapped = data.map((item: any) => item.companies).filter(Boolean);
      return mapped;
    },
    enabled: !!userId,
  });

  // Create company workspace mutation
  const createCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!companyName.trim() || !companySlug.trim() || !userId) {
        throw new Error('Workspace name and URL slug are required.');
      }

      const slug = companySlug.toLowerCase().replace(/[^a-z0-9-]/g, '');

      // Create company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName.trim(),
          tenant_slug: slug,
          created_by: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (companyError) {
        if (companyError.code === '23505') {
          throw new Error('This URL slug is already taken. Please try another one.');
        }
        throw companyError;
      }

      // Add user as owner collaborator
      const { error: collabError } = await supabase
        .from('company_collaborators')
        .insert({
          company_id: newCompany.id,
          user_id: userId,
          invited_email: userEmail,
          role: 'owner',
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (collabError) throw collabError;

      return newCompany;
    },
    onSuccess: (newComp) => {
      queryClient.invalidateQueries({ queryKey: ['user-companies-selection', userId] });
      setCompanyName('');
      setCompanySlug('');
      setErrorMsg('');
      setShowCreateForm(false);
      
      // Auto-enter the newly created company
      handleSelectCompany(newComp.id);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create workspace.');
    }
  });

  const handleSelectCompany = (id: string) => {
    localStorage.setItem('active_company_id', id);
    window.dispatchEvent(new Event('storage'));
    router.push('/dashboard');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompanyMutation.mutate();
  };

  const handleSlugAutoFill = (val: string) => {
    setCompanyName(val);
    setCompanySlug(val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('active_company_id');
    router.push('/login');
  };

  // Loading Screens
  if (authLoading || (userId && companiesLoading)) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 text-[#0A192F] animate-spin" />
          <Typography className="text-gray-600 font-semibold animate-pulse">Loading workspaces...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      
      <Container maxWidth="lg" className="space-y-8 flex-grow flex flex-col justify-center">
        {/* Header Branding */}
        <div className="flex justify-between items-center pb-6 border-b border-gray-200">
          <Link href="/" className="inline-flex items-center space-x-3 text-slate-800 font-bold text-2xl">
            <img src="/main-logo.png" alt="Wide Load Logistics Logo" className="h-10 w-auto object-contain" />
            <span>Wide Load Logistics</span>
          </Link>
          <Button
            onClick={handleLogout}
            variant="outlined"
            size="small"
            startIcon={<LogOut className="h-4 w-4" />}
            sx={{
              color: '#0A192F',
              borderColor: 'rgba(10, 25, 47, 0.2)',
              textTransform: 'none',
              fontWeight: 'semibold',
              '&:hover': {
                borderColor: '#0A192F',
                bgcolor: 'rgba(10, 25, 47, 0.05)'
              }
            }}
          >
            Sign Out
          </Button>
        </div>

        {/* Title */}
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Select Your Workspace</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Choose a logistics workspace to manage shipments, track packages, and collaborate with your team.
          </p>
        </div>

        {/* Workspaces List and Creation Form */}
        {companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* List existing companies */}
            {companies.map((company: any) => (
              <Card 
                key={company.id} 
                className="border border-gray-200 shadow-sm hover:shadow-md hover:border-cyan-500 rounded-2xl bg-white transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                onClick={() => handleSelectCompany(company.id)}
              >
                <CardContent className="p-6 space-y-4 flex-grow">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-500/10 rounded-xl">
                      <Building className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <Typography variant="h6" className="font-extrabold text-slate-800 tracking-tight leading-tight">
                        {company.name}
                      </Typography>
                      <span className="text-xs font-semibold text-gray-500 block mt-1">
                        /{company.tenant_slug}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    Access cargo tracking, real-time shipments overview, messages inbox, and team member management.
                  </p>
                </CardContent>
                <div className="p-4 bg-slate-50 border-t border-gray-100 rounded-b-2xl flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {company.created_by === userId ? 'Owner Workspace' : 'Collaborator'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600">
                    Enter <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Card>
            ))}

            {/* In-Grid Create Workspace Toggle */}
            {!showCreateForm ? (
              <Card 
                className="border-2 border-dashed border-gray-300 hover:border-cyan-500 hover:bg-cyan-55/10 rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center p-8 h-full min-h-[180px] bg-white"
                onClick={() => setShowCreateForm(true)}
              >
                <div className="text-center space-y-2">
                  <PlusCircle className="h-10 w-10 text-gray-400 mx-auto" />
                  <Typography variant="subtitle1" className="font-bold text-slate-700">
                    Create New Workspace
                  </Typography>
                  <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                    Setup another logistics company branch or client hub.
                  </p>
                </div>
              </Card>
            ) : (
              /* Embedded Creation Form Card */
              <Card className="border border-cyan-500 shadow-md rounded-2xl bg-white p-6 transition-all duration-300">
                <form onSubmit={handleCreateSubmit} className="space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800">New Workspace</span>
                      <button 
                        type="button" 
                        onClick={() => { setShowCreateForm(false); setErrorMsg(''); }}
                        className="text-xs font-semibold text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                      <input 
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => handleSlugAutoFill(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="Apex Logistics"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">URL Slug (lowercase)</label>
                      <input 
                        type="text"
                        required
                        value={companySlug}
                        onChange={(e) => setCompanySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="apex-logistics"
                      />
                    </div>

                    {errorMsg && (
                      <Alert severity="error" icon={<AlertCircle className="h-4 w-4" />} className="py-0 px-2 text-xs">
                        {errorMsg}
                      </Alert>
                    )}
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={createCompanyMutation.isPending}
                    sx={{
                      mt: 2,
                      bgcolor: '#0A192F',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#12253f' }
                    }}
                  >
                    {createCompanyMutation.isPending ? 'Creating...' : 'Create Workspace'}
                  </Button>
                </form>
              </Card>
            )}
          </div>
        ) : (
          /* Empty State - Create First Company (Center Screen Onboarding) */
          <div className="max-w-md mx-auto text-center space-y-6 py-12">
            <div className="p-4 bg-cyan-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Briefcase className="h-8 w-8 text-cyan-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Welcome to Wide Load Logistics</h2>
              <p className="text-gray-500 text-sm">
                Get started by creating your first company workspace. This sets up your admin dashboard to track cargo and manage shipments.
              </p>
            </div>

            <Card className="border border-gray-200 shadow-md rounded-2xl bg-white p-6">
              <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                  <input 
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => handleSlugAutoFill(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Worldwide Maritime"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">URL Slug (lowercase)</label>
                  <input 
                    type="text"
                    required
                    value={companySlug}
                    onChange={(e) => setCompanySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. worldwide-maritime"
                  />
                </div>

                {errorMsg && (
                  <Alert severity="error" icon={<AlertCircle className="h-4 w-4" />} className="py-1">
                    {errorMsg}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={createCompanyMutation.isPending}
                  sx={{
                    bgcolor: '#0A192F',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    py: 1.2,
                    '&:hover': { bgcolor: '#12253f' }
                  }}
                >
                  {createCompanyMutation.isPending ? 'Creating Workspace...' : 'Create & Enter Workspace'}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
}
