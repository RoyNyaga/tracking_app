'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Users, MessageSquare, Plus, ArrowRight, BarChart, Building, Briefcase, PlusCircle, ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, Typography, Button, Box, Divider, Alert } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  // Creation form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch logged in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || '');
      }
    });
  }, []);

  // Read active company from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('active_company_id');
    if (stored) setCompanyId(stored);

    const handleStorageChange = () => {
      const updated = localStorage.getItem('active_company_id');
      setCompanyId(updated || '');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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

  // Fetch metrics: shipments count for Overview Mode
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', companyId],
    queryFn: async () => {
      if (!companyId) return { shipmentsCount: 0, messagesCount: 0, collaboratorsCount: 0 };
      
      const [shipmentsRes, messagesRes, collabsRes] = await Promise.all([
        supabase.from('shipments').select('uuid', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('company_collaborators').select('id', { count: 'exact', head: true }).eq('company_id', companyId)
      ]);

      return {
        shipmentsCount: shipmentsRes.count || 0,
        messagesCount: messagesRes.count || 0,
        collaboratorsCount: collabsRes.count || 0
      };
    },
    enabled: !!companyId,
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
      // Reset form states
      setCompanyName('');
      setCompanySlug('');
      setErrorMsg('');
      setShowCreateForm(false);
      
      // Auto-enter new company
      handleSelectCompany(newComp.id);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create workspace.');
    }
  });

  const handleSelectCompany = (id: string) => {
    localStorage.setItem('active_company_id', id);
    setCompanyId(id);
    window.dispatchEvent(new Event('storage'));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompanyMutation.mutate();
  };

  const handleSlugAutoFill = (val: string) => {
    setCompanyName(val);
    setCompanySlug(val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  };

  // Loading State
  if (companiesLoading && !userId) {
    return (
      <Box className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-[#0A192F] animate-spin" />
        <p className="text-gray-500 text-sm">Retrieving your workspaces...</p>
      </Box>
    );
  }

  // --- RENDER MODE: SELECTION DASHBOARD (No active company selected) ---
  if (!companyId) {
    return (
      <Box className="max-w-6xl mx-auto space-y-8 py-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Select Your Workspace</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Choose a logistics workspace to manage shipments, track packages, and collaborate with your team.
          </p>
        </div>

        {companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* List existing companies */}
            {companies.map((company: any) => (
              <Card 
                key={company.id} 
                className="border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-cyan-400 rounded-2xl bg-white transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
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
                      <span className="text-xs font-semibold text-gray-400">
                        /{company.tenant_slug}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2">
                    Access cargo tracking, real-time shipments overview, messages inbox, and team member management.
                  </p>
                </CardContent>
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-2xl flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
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
                className="border-2 border-dashed border-slate-300 hover:border-cyan-400 hover:bg-cyan-50/5 rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center p-8 h-full min-h-[180px]"
                onClick={() => setShowCreateForm(true)}
              >
                <div className="text-center space-y-2">
                  <PlusCircle className="h-10 w-10 text-slate-400 mx-auto" />
                  <Typography variant="subtitle1" className="font-bold text-slate-700">
                    Create New Workspace
                  </Typography>
                  <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
                    Setup another logistics company branch or client hub.
                  </p>
                </div>
              </Card>
            ) : (
              /* Embedded Creation Form Card */
              <Card className="border border-cyan-400 shadow-md rounded-2xl bg-white p-6 transition-all duration-300">
                <form onSubmit={handleCreateSubmit} className="space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800">New Logistics Workspace</span>
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
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
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
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
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
              <h2 className="text-xl font-bold text-slate-800">Welcome to Global Load Logistics</h2>
              <p className="text-gray-500 text-sm">
                Get started by creating your first company workspace. This sets up your admin dashboard to track cargo and manage shipments.
              </p>
            </div>

            <Card className="border border-slate-200/80 shadow-md rounded-2xl bg-white p-6">
              <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Name</label>
                  <input 
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => handleSlugAutoFill(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
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
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
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
      </Box>
    );
  }

  // --- RENDER MODE: STANDARD OVERVIEW (Active company is selected) ---
  return (
    <Box className="space-y-6">
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Workspace Overview</h1>
          <p className="text-gray-500 text-sm">Real-time metrics for your active company operations.</p>
        </div>

        <Button
          component={Link}
          href="/dashboard/shipments/new"
          variant="contained"
          startIcon={<Plus className="h-4 w-4" />}
          sx={{
            bgcolor: '#0A192F',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: 2,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': { bgcolor: '#12253f' }
          }}
        >
          New Shipment
        </Button>
      </Box>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Active Shipments',
            val: statsLoading ? '...' : stats?.shipmentsCount,
            icon: <Truck className="h-6 w-6 text-blue-600" />,
            bg: 'bg-blue-500/10',
            link: '/dashboard/shipments'
          },
          {
            title: 'Collaborators',
            val: statsLoading ? '...' : stats?.collaboratorsCount,
            icon: <Users className="h-6 w-6 text-indigo-600" />,
            bg: 'bg-indigo-500/10',
            link: '/dashboard/collaborators'
          },
          {
            title: 'Contact Messages',
            val: statsLoading ? '...' : stats?.messagesCount,
            icon: <MessageSquare className="h-6 w-6 text-emerald-600" />,
            bg: 'bg-emerald-500/10',
            link: '/dashboard/messages'
          }
        ].map((card, idx) => (
          <div key={idx}>
            <Card className="border border-gray-200/80 shadow-sm rounded-xl bg-white h-full hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm font-semibold">{card.title}</span>
                  <div className={`p-2.5 rounded-lg ${card.bg}`}>{card.icon}</div>
                </div>
                <div>
                  <Typography variant="h3" className="font-extrabold text-slate-800 tracking-tight">
                    {card.val}
                  </Typography>
                </div>
                <Divider />
                <Link href={card.link} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700">
                  Manage details <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </Box>
  );
}
