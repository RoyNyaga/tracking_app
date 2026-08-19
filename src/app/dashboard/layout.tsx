'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Ship, LayoutDashboard, Truck, Users, MessageSquare, Settings, LogOut, Loader2, Building, Menu } from 'lucide-react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Button, IconButton, Select, MenuItem, FormControl, Divider } from '@mui/material';
import { supabase } from '@/lib/supabase';

const drawerWidth = 260;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeCompany, setActiveCompany] = useState<string>('');
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (!session) {
        router.push('/login');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Load active company from localStorage on mount & listen to changes
  useEffect(() => {
    const stored = localStorage.getItem('active_company_id');
    if (stored) setActiveCompany(stored);

    const handleStorageChange = () => {
      const updated = localStorage.getItem('active_company_id');
      setActiveCompany(updated || '');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch companies associated with user
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['user-companies', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('company_collaborators')
        .select(`
          company_id,
          companies (id, name, tenant_slug)
        `)
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      const mapped = data.map((item: any) => item.companies).filter(Boolean);
      return mapped;
    },
    enabled: !!session?.user?.id,
  });

  // Redirect to workspace selector if accessing any dashboard page without a valid active company
  useEffect(() => {
    if (!companiesLoading && !authLoading) {
      if (!activeCompany) {
        router.push('/companies');
      } else if (companies) {
        const hasAccess = companies.some((c: any) => c.id === activeCompany);
        if (!hasAccess) {
          localStorage.removeItem('active_company_id');
          setActiveCompany('');
          router.push('/companies');
        }
      }
    }
  }, [activeCompany, companies, companiesLoading, authLoading, router]);

  const handleCompanyChange = (id: string) => {
    setActiveCompany(id);
    localStorage.setItem('active_company_id', id);
    window.dispatchEvent(new Event('storage'));
  };

  const handleSwitchWorkspace = () => {
    setActiveCompany('');
    localStorage.removeItem('active_company_id');
    window.dispatchEvent(new Event('storage'));
    setMobileOpen(false);
    router.push('/companies');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('active_company_id');
    router.push('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard' },
    { text: 'Shipments', icon: <Truck className="h-5 w-5" />, path: '/dashboard/shipments' },
    { text: 'Collaborators', icon: <Users className="h-5 w-5" />, path: '/dashboard/collaborators' },
    { text: 'Contact Inbox', icon: <MessageSquare className="h-5 w-5" />, path: '/dashboard/messages' },
    { text: 'Workspace Settings', icon: <Settings className="h-5 w-5" />, path: '/dashboard/settings' },
  ];

  const activeCompanyData = companies?.find((c: any) => c.id === activeCompany);

  // Sidebar content (reused for desktop permanent & mobile temporary drawers)
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box className="p-6 border-b border-white/5 space-y-2">
        <Link href="/" className="flex items-center space-x-3 text-white font-black text-lg">
          <img src="/main-logo.png" alt="Wide Load Logistics Logo" className="h-8 w-auto object-contain bg-slate-900/50 p-1 rounded" />
          <span>WLL Panel</span>
        </Link>
        {activeCompanyData?.name && (
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded inline-block max-w-full truncate">
            {activeCompanyData.name}
          </div>
        )}
      </Box>
      <List className="px-4 py-6 space-y-1 flex-grow">
        {menuItems.map((item) => {
          const active = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                  color: active ? '#00F2FE' : '#d1d5db',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white'
                  },
                  mb: 0.5
                }}
              >
                <ListItemIcon sx={{ color: active ? '#00F2FE' : '#d1d5db', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={<span className="text-sm font-medium">{item.text}</span>} />
              </ListItemButton>
            </ListItem>
          );
        })}

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 2 }} />

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleSwitchWorkspace}
            sx={{
              borderRadius: 2,
              color: '#d1d5db',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                color: 'white'
              }
            }}
          >
            <ListItemIcon sx={{ color: '#d1d5db', minWidth: 40 }}>
              <Building className="h-5 w-5" />
            </ListItemIcon>
            <ListItemText primary={<span className="text-sm font-medium">Switch Workspace</span>} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (authLoading || (session && companiesLoading)) {
    return (
      <Box className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-[#0A192F] animate-spin" />
        <Typography className="text-gray-600 font-medium animate-pulse">Loading workspace...</Typography>
      </Box>
    );
  }

  if (!session) return null;

  const showSidebar = !!activeCompany;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6F9' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: showSidebar ? { sm: `calc(100% - ${drawerWidth}px)` } : '100%',
          ml: showSidebar ? { sm: `${drawerWidth}px` } : '0px',
          bgcolor: 'white',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: 'none',
          color: '#0A192F',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar className="justify-between">
          <Box className="flex items-center">
            {showSidebar && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <Menu className="h-6 w-6" />
              </IconButton>
            )}
            {!showSidebar && (
               <img src="/main-logo.png" alt="Wide Load Logistics Logo" className="h-6 w-auto object-contain mr-2" />
             )}
            <Typography variant="h6" noWrap component="div" className="font-bold text-slate-800 text-base sm:text-lg">
              {showSidebar ? 'Control Center' : 'Wide Load Logistics'}
            </Typography>
          </Box>

          <Box className="flex items-center gap-2 sm:gap-4">
            {showSidebar && companies && companies.length > 0 && (
              <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 180 } }}>
                <Select
                  value={activeCompany}
                  onChange={(e) => handleCompanyChange(e.target.value as string)}
                  displayEmpty
                  sx={{ borderRadius: 2, fontSize: '0.85rem' }}
                >
                  {companies.map((c: any) => (
                    <MenuItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-1.5 text-xs font-semibold">
                        <Building className="h-4 w-4 text-cyan-600" /> {c.name}
                      </span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              onClick={handleLogout}
              variant="text"
              color="inherit"
              size="small"
              startIcon={<LogOut className="h-4 w-4 text-red-500" />}
              sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '0.85rem' }}
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Sidebar Drawer */}
      {showSidebar && (
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          {/* Mobile temporary drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth, 
                bgcolor: '#0A192F', 
                color: 'white',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)'
              },
            }}
          >
            {drawerContent}
          </Drawer>

          {/* Desktop permanent drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth, 
                bgcolor: '#0A192F', 
                color: 'white',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)'
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: showSidebar ? { sm: `calc(100% - ${drawerWidth}px)` } : '100%',
          mt: '64px',
          bgcolor: '#F4F6F9',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
