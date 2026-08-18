'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Globe, Clock, BarChart3, Truck } from 'lucide-react';
import { Button, Container, Typography, Card, CardContent, Box } from '@mui/material';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } }
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F9]">
      <Navbar />
      
      {/* Hero Section */}
      <Box className="relative bg-[#0A192F] text-white overflow-hidden py-24 sm:py-32 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900 to-[#0A192F] pointer-events-none" />
        <Container maxWidth="lg" className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 mb-4">
                  <Truck className="h-3 w-3 text-cyan-400" /> Global Logistics & Freight Tracking
                </span>
                <Typography variant="h2" className="font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-white font-sans">
                  Global Reach. <span className="text-cyan-400">Absolute Precision.</span> Seamless Logistics.
                </Typography>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-lg text-gray-300 max-w-xl leading-relaxed"
              >
                Global Load Logistics connects supply chains worldwide. Real-time multi-package tracking, state-of-the-art warehousing, and optimized freight paths designed to move your business forward.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <Button 
                  component={Link}
                  href="/tracking"
                  variant="contained" 
                  size="large"
                  endIcon={<ArrowRight className="h-4 w-4" />}
                  sx={{ 
                    bgcolor: '#00F2FE', 
                    color: '#0A192F', 
                    fontWeight: 'bold',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#00cce0' }
                  }}
                >
                  Track Cargo Now
                </Button>
                <Button 
                  component={Link}
                  href="/about"
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    color: '#fff', 
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                  }}
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
            
            {/* Hero Graphic Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-cyan-400" /> Operational Stats
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Active Cargo Routes', val: '1,240+' },
                    { label: 'Countries Covered', val: '150+' },
                    { label: 'On-Time Delivery Rate', val: '99.9%' }
                  ].map((stat, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                      <span className="text-gray-400 text-sm">{stat.label}</span>
                      <span className="text-white font-extrabold">{stat.val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </Box>

      {/* Features Grid */}
      <Box className="bg-[#F4F6F9] py-24 flex-grow">
        <Container maxWidth="lg">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">Features</span>
            <Typography variant="h3" className="font-extrabold text-slate-900 tracking-tight text-3xl sm:text-4xl">
              Why Partner with Global Load Logistics?
            </Typography>
            <p className="text-gray-600">
              We leverage cloud-based tracking and logistics intelligence to manage your shipments with speed and total visibility.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: <Clock className="h-6 w-6 text-[#0A192F]" />, 
                  title: 'Real-time Timelines', 
                  desc: 'Get exact tracking status events with timestamp details from departure to final destination.' 
                },
                { 
                  icon: <Shield className="h-6 w-6 text-[#0A192F]" />, 
                  title: 'Secure Multi-Package tracking', 
                  desc: 'Add size, length, width, and weights for each individual package to be scanned and tracked securely.' 
                },
                { 
                  icon: <Globe className="h-6 w-6 text-[#0A192F]" />, 
                  title: 'Global Supply Paths', 
                  desc: 'Comprehensive land, sea, and air pathways optimizing fuel efficiency and cargo safety across continents.' 
                },
                { 
                  icon: <BarChart3 className="h-6 w-6 text-[#0A192F]" />, 
                  title: 'Admin Workspaces', 
                  desc: 'Manage your teams, invite collaborators, and view complete client contact forms under a unified panel.' 
                }
              ].map((feature, idx) => (
                <motion.div key={idx} variants={itemVariants} className="h-full">
                  <Card className="h-full border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow rounded-xl bg-white">
                    <CardContent className="p-6 flex flex-col items-start gap-4">
                      <div className="p-3 bg-cyan-400/10 rounded-lg inline-flex">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </div>
  );
}

