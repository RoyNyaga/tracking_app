'use client';

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Mail, User, Clock, Trash2, Check, CheckCheck } from 'lucide-react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Chip } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function MessagesInboxPage() {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState<string>('');

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

  // Fetch contact messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Mark as read mutation
  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', companyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', companyId] });
    }
  });

  // Delete message
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', companyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', companyId] });
    }
  });

  return (
    <Box className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Inbound Contacts Inbox</h1>
        <p className="text-gray-500 text-sm">Review questions submitted by clients from the public contact forms.</p>
      </div>

      {companyId ? (
        <Card className="border border-gray-200/80 shadow-sm rounded-xl bg-white overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-gray-500">Loading messages...</div>
          ) : messages && messages.length > 0 ? (
            <List className="divide-y divide-gray-150">
              {messages.map((m: any) => (
                <ListItem key={m.id} className={`p-6 flex flex-col items-start gap-3 ${m.status === 'unread' ? 'bg-cyan-500/5' : 'bg-white'}`}>
                  <Box className="w-full flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">{m.subject}</span>
                        <Chip
                          label={m.status}
                          size="small"
                          className={`text-[9px] font-bold uppercase tracking-wider ${m.status === 'unread' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-700'}`}
                        />
                      </div>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {m.sender_name} ({m.sender_email})</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(m.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <Box className="flex gap-1">
                      {m.status === 'unread' && (
                        <IconButton onClick={() => readMutation.mutate(m.id)} size="small" color="primary" title="Mark as read">
                          <Check className="h-4 w-4" />
                        </IconButton>
                      )}
                      <IconButton onClick={() => deleteMutation.mutate(m.id)} size="small" color="error" title="Delete message">
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography className="text-slate-700 text-sm leading-relaxed whitespace-pre-line mt-2 pl-4 border-l-2 border-gray-200">
                    {m.message}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <div className="py-16 text-center text-gray-500">Inbox is empty.</div>
          )}
        </Card>
      ) : (
        <div className="py-16 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">
          Please create a company workspace in Settings first to monitor messages.
        </div>
      )}
    </Box>
  );
}
