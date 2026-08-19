'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building, Plus, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function WorkspaceSettingsPage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  
  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });

    const stored = localStorage.getItem('active_company_id');
    if (stored) setCompanyId(stored);

    const handleStorageChange = () => {
      const updated = localStorage.getItem('active_company_id');
      if (updated) setCompanyId(updated);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch active company details
  const { data: company, isLoading } = useQuery({
    queryKey: ['company-details', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  useEffect(() => {
    if (company) {
      setName(company.name || '');
      setSlug(company.tenant_slug || '');
    }
  }, [company]);

  // Create company workspace mutation
  const createCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!name || !slug || !userId) throw new Error('Name and URL slug are required.');

      // Write company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name,
          tenant_slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
          created_by: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Add user as owner collaborator
      const { error: collabError } = await supabase
        .from('company_collaborators')
        .insert({
          company_id: newCompany.id,
          user_id: userId,
          invited_email: (await supabase.auth.getUser()).data.user?.email || '',
          role: 'owner',
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (collabError) throw collabError;

      return newCompany;
    },
    onSuccess: (newComp) => {
      queryClient.invalidateQueries({ queryKey: ['user-companies', userId] });
      // Set as active
      localStorage.setItem('active_company_id', newComp.id);
      setCompanyId(newComp.id);
      // Reload layouts
      window.location.reload();
    }
  });

  // Edit existing company details
  const editCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!name || !slug || !companyId) throw new Error('Company fields are invalid.');
      const { error } = await supabase
        .from('companies')
        .update({
          name,
          tenant_slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
        })
        .eq('id', companyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-details', companyId] });
      queryClient.invalidateQueries({ queryKey: ['user-companies', userId] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyId) {
      editCompanyMutation.mutate();
    } else {
      createCompanyMutation.mutate();
    }
  };

  return (
    <Box className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Workspace Settings</h1>
        <p className="text-gray-500 text-sm">Configure your company profile and client-portal tenant URLs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7">
          <Card className="border border-gray-200/80 shadow-sm rounded-xl bg-white">
            <CardContent className="p-6">
              <Typography className="font-extrabold text-slate-800 border-b border-gray-100 pb-2 mb-6 flex items-center gap-2">
                <Building className="h-5 w-5 text-cyan-600" />
                {companyId ? 'Company Profile' : 'Register New Company Workspace'}
              </Typography>

              {isLoading ? (
                <div className="py-6 text-center text-gray-500">Loading configurations...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Company Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                      placeholder="e.g. Wide Load Logistics"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Client URL Slug (lowercase alphanumeric)</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                      placeholder="e.g. wideloadlogistics"
                    />
                    {slug && (
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">
                        Your tracking portal tenant address: <span className="text-cyan-600 font-bold">/tracking?tenant={slug.toLowerCase().replace(/[^a-z0-9-]/g, '')}</span>
                      </p>
                    )}
                  </div>

                  {/* Notifications */}
                  {createCompanyMutation.isSuccess && (
                    <Alert severity="success" icon={<CheckCircle className="h-4 w-4" />}>
                      Workspace registered and activated!
                    </Alert>
                  )}
                  {editCompanyMutation.isSuccess && (
                    <Alert severity="success" icon={<CheckCircle className="h-4 w-4" />}>
                      Workspace settings updated successfully!
                    </Alert>
                  )}
                  {(createCompanyMutation.isError || editCompanyMutation.isError) && (
                    <Alert severity="error" icon={<AlertCircle className="h-4 w-4" />}>
                      Workspace operation failed: {createCompanyMutation.error?.message || editCompanyMutation.error?.message}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createCompanyMutation.isPending || editCompanyMutation.isPending}
                    startIcon={<Save className="h-4 w-4" />}
                    sx={{
                      bgcolor: '#0A192F',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#12253f' }
                    }}
                  >
                    {companyId ? (editCompanyMutation.isPending ? 'Updating...' : 'Save Workspace') : (createCompanyMutation.isPending ? 'Registering...' : 'Create Workspace')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Box>
  );
}
