'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Truck, Users, MessageSquare, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, Typography, Button, Box, Divider } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [companyId, setCompanyId] = useState<string>('');

  // Read active company from localStorage on mount & listen to changes
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

  // Fetch active company details
  const { data: companyDetails } = useQuery({
    queryKey: ['active-company-details', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  if (!companyId) {
    return (
      <Box className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-[#0A192F] animate-spin" />
        <p className="text-gray-500 text-sm">Verifying active workspace...</p>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <span>Workspace Overview</span>
            {companyDetails?.name && (
              <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {companyDetails.name}
              </span>
            )}
          </h1>
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
