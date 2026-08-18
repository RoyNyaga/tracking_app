'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Trash2, Mail, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, Typography, Button, Box, Divider, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Alert, Chip } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function CollaboratorsPage() {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [role, setRole] = useState<'collaborator' | 'owner'>('collaborator');

  useEffect(() => {
    const stored = localStorage.getItem('active_company_id');
    if (stored) setCompanyId(stored);

    const handleStorageChange = () => {
      const updated = localStorage.getItem('active_company_id');
      if (updated) setCompanyId(updated);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch collaborators
  const { data: collaborators, isLoading } = useQuery({
    queryKey: ['collaborators', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('company_collaborators')
        .select(`
          id,
          invited_email,
          role,
          status,
          user_id,
          profiles (full_name, email, avatar_url)
        `)
        .eq('company_id', companyId);
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Invite collaborator mutation
  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!inviteEmail.trim() || !companyId) return;
      const { data, error } = await supabase
        .from('company_collaborators')
        .insert({
          company_id: companyId,
          invited_email: inviteEmail.trim(),
          role: role,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['collaborators', companyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', companyId] });
    }
  });

  // Revoke access / delete invite
  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('company_collaborators').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', companyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', companyId] });
    }
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate();
  };

  return (
    <Box className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Team Collaborators</h1>
        <p className="text-gray-500 text-sm">Add teammates to help manage shipments and track operations.</p>
      </div>

      {companyId ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* List panel */}
          <div className="md:col-span-7">
            <Card className="border border-gray-200/80 shadow-sm rounded-xl bg-white h-full">
              <CardContent className="p-6">
                <Typography className="font-extrabold text-slate-800 border-b border-gray-100 pb-2 mb-4">
                  Active Team Members & Pending Invites
                </Typography>

                {isLoading ? (
                  <div className="py-8 text-center text-gray-500">Loading team...</div>
                ) : collaborators && collaborators.length > 0 ? (
                  <List className="divide-y divide-gray-100">
                    {collaborators.map((c: any) => (
                      <ListItem key={c.id} className="py-3 px-0">
                        <ListItemText
                          primary={
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">
                                {c.profiles?.full_name || c.invited_email}
                              </span>
                              <Chip
                                label={c.role}
                                size="small"
                                className={`text-[10px] font-bold uppercase ${c.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                              />
                              <Chip
                                label={c.status}
                                size="small"
                                icon={c.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                className={`text-[10px] font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                              />
                            </div>
                          }
                          secondary={c.profiles?.email || c.invited_email}
                        />
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => revokeMutation.mutate(c.id)} color="error" size="small" title="Revoke access">
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <div className="py-8 text-center text-gray-500">No collaborators configured.</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form panel */}
          <div className="md:col-span-5">
            <Card className="border border-gray-200/80 shadow-sm rounded-xl bg-white">
              <CardContent className="p-6">
                <Typography className="font-extrabold text-slate-800 border-b border-gray-100 pb-2 mb-4 animate-none">
                  Invite Teammate
                </Typography>

                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="teammate@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50"
                    />
                  </div>

                  {inviteMutation.isSuccess && (
                    <Alert severity="success">Invitation registered successfully!</Alert>
                  )}
                  {inviteMutation.isError && (
                    <Alert severity="error">Invite failed: {inviteMutation.error.message}</Alert>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={inviteMutation.isPending}
                    startIcon={<UserPlus className="h-4 w-4" />}
                    sx={{
                      bgcolor: '#0A192F',
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      '&:hover': { bgcolor: '#12253f' }
                    }}
                  >
                    {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">
          Please create a company workspace in Settings first to list and invite collaborators.
        </div>
      )}
    </Box>
  );
}
