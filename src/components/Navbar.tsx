'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ship, Menu, X } from 'lucide-react';
import { AppBar, Toolbar, IconButton, Button, Box, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Track Cargo', path: '/tracking' },
  { name: 'Contact', path: '/contact' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const activeStyle = (path: string) => {
    const isActive = pathname === path;
    return isActive 
      ? "text-cyan-400 border-b-2 border-cyan-400" 
      : "text-gray-300 hover:text-white transition-colors duration-200";
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#0A192F', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: 'none' }}>
      <Toolbar className="max-w-7xl w-full mx-auto justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 text-white font-bold text-lg sm:text-xl">
          <Ship className="h-6 w-6 text-cyan-400" />
          <span>Global Load Logistics</span>
        </Link>

        {/* Desktop Menu */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.path} 
              className={`py-2 px-1 font-medium ${activeStyle(item.path)}`}
            >
              {item.name}
            </Link>
          ))}
          <Button 
            component={Link} 
            href="/login" 
            variant="contained" 
            sx={{ 
              bgcolor: '#00F2FE', 
              color: '#0A192F', 
              fontWeight: 'bold',
              textTransform: 'none',
              '&:hover': { bgcolor: '#00cce0' }
            }}
          >
            Dashboard Login
          </Button>
        </Box>

        {/* Mobile Toggle */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ display: { md: 'none' } }}
        >
          <Menu />
        </IconButton>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { sx: { bgcolor: '#0A192F', width: 250, borderLeft: '1px solid rgba(255, 255, 255, 0.1)' } } }}
      >
        <Box onClick={handleDrawerToggle} sx={{ p: 2 }}>
          <Box className="flex justify-end mb-4">
            <IconButton color="inherit" onClick={handleDrawerToggle}>
              <X className="text-white" />
            </IconButton>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton 
                  component={Link} 
                  href={item.path}
                  sx={{ 
                    color: pathname === item.path ? '#00F2FE' : '#d1d5db',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } 
                  }}
                >
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding sx={{ mt: 2, px: 2 }}>
              <Button 
                component={Link} 
                href="/login" 
                fullWidth 
                variant="contained"
                sx={{ 
                  bgcolor: '#00F2FE', 
                  color: '#0A192F', 
                  fontWeight: 'bold',
                  textTransform: 'none'
                }}
              >
                Dashboard Login
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
