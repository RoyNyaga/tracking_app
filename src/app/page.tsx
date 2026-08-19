'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Globe, Clock, BarChart3, Truck, Plane, Anchor, Navigation, Warehouse, Star, User } from 'lucide-react';
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
                Wide Load Logistics connects supply chains worldwide. Real-time multi-package tracking, state-of-the-art warehousing, and optimized freight paths designed to move your business forward.
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
              Why Partner with Wide Load Logistics?
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

      {/* Services Portfolio Section */}
      <Box className="bg-white py-24 border-b border-gray-150">
        <Container maxWidth="lg" className="space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">Services</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Full-Scale Cargo Operations
            </h2>
            <p className="text-gray-600">
              We coordinate logistics channels across all transit types, securing safe dispatching for both heavy loads and express packages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Anchor className="h-6 w-6 text-cyan-600" />,
                title: 'Ocean Freight Forwarding',
                desc: 'Full Container Load (FCL) and Less than Container Load (LCL) consolidation routes across international waters.'
              },
              {
                icon: <Plane className="h-6 w-6 text-cyan-600" />,
                title: 'Air Cargo Dispatch',
                desc: 'Priority air pathways for time-critical, high-value components or temperature-controlled goods.'
              },
              {
                icon: <Navigation className="h-6 w-6 text-cyan-600" />,
                title: 'Overland Logistics',
                desc: 'Express domestic trucking corridors offering full truckload (TL) shipping and regional distribution.'
              },
              {
                icon: <Warehouse className="h-6 w-6 text-cyan-600" />,
                title: 'Audited Warehousing',
                desc: 'Secure sorting hubs with integrated scale weighing, volume sizing, and cross-docking services.'
              }
            ].map((srv, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/65 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl inline-flex">
                    {srv.icon}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{srv.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Box>

      {/* How We Work Section */}
      <Box className="bg-[#0A192F] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/10 via-slate-900 to-[#0A192F] pointer-events-none" />
        <Container maxWidth="lg" className="relative z-10 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">Our Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Smarter Logistics in 4 Steps
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              We audit, secure, and monitor your cargo at every step of its journey, ensuring absolute transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Shipment Booking',
                desc: 'Admins register shipment parameters, details, and dynamic package dimensions in the dashboard.'
              },
              {
                step: '02',
                title: 'Weight & Size Audit',
                desc: 'Packages are measured and checked in at the hub to verify declared dimensions before loading.'
              },
              {
                step: '03',
                title: 'Route Dispatch',
                desc: 'Optimal pathways are selected for shipping via ocean, air, or land to minimize transit times.'
              },
              {
                step: '04',
                title: 'Real-time Tracking',
                desc: 'Clients instantly check cargo status, physical hubs, and timelines using their reference code.'
              }
            ].map((step, idx) => (
              <div key={idx} className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-sm space-y-4 hover:border-cyan-400/50 transition-colors">
                <span className="text-3xl font-black text-cyan-400/30 font-sans block">{step.step}</span>
                <h3 className="font-extrabold text-white text-lg">{step.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box className="bg-[#F4F6F9] py-24 border-b border-gray-150">
        <Container maxWidth="lg" className="space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trusted by Leading Manufacturers & Distributors
            </h2>
            <p className="text-gray-600">
              Discover why supply chain managers rely on Wide Load Logistics to move critical cargo worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Marcus Vance',
                role: 'VP of Supply Chain, Core Energy Group',
                text: 'Wide Load Logistics handled our heavy turbine imports with zero delays. Their real-time timeline check-ins gave our engineers absolute peace of mind during transit.',
                rating: 5,
                initials: 'MV'
              },
              {
                name: 'Elena Rostova',
                role: 'Operations Director, Apex Automotive',
                text: 'The multi-package dimension breakdowns are a game-changer. We can track weights and length limits on each part crate without calling dispatchers.',
                rating: 5,
                initials: 'ER'
              },
              {
                name: 'David Sterling',
                role: 'Logistics Manager, West Coast Pharma',
                text: 'Priority dispatching is always handled with extreme care. The temperature-controlled air freight arrived perfectly on time and in perfect condition.',
                rating: 5,
                initials: 'DS'
              }
            ].map((test, idx) => (
              <Card key={idx} className="border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow rounded-2xl bg-white flex flex-col justify-between">
                <CardContent className="p-6 space-y-6">
                  {/* Rating Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed italic">
                    "{test.text}"
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    {/* Photo / Avatar Placeholder */}
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 flex items-center justify-center font-extrabold text-xs shrink-0 overflow-hidden relative">
                      {/* Drop-in support for photos: <img src="/testimonials/client.jpg" className="w-full h-full object-cover" /> */}
                      <User className="h-4 w-4 absolute text-cyan-600 opacity-20 animate-pulse" />
                      <span className="relative z-10">{test.initials}</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{test.name}</h4>
                      <p className="text-gray-500 text-[11px] font-medium leading-tight">{test.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box className="bg-[#0A192F] text-white py-16 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none" />
        <Container maxWidth="md" className="relative z-10 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to Streamline Your Supply Chain?
          </h2>
          <p className="text-gray-300 max-w-lg mx-auto text-sm">
            Let's discuss custom shipping routes, oversized cargo operations, or register your tracking dashboard account today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button
              component={Link}
              href="/contact"
              variant="contained"
              sx={{
                bgcolor: '#00F2FE',
                color: '#0A192F',
                fontWeight: 'bold',
                px: 4,
                py: 1.2,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { bgcolor: '#00cce0' }
              }}
            >
              Contact Our Team
            </Button>
            <Button
              component={Link}
              href="/tracking"
              variant="outlined"
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.3)',
                fontWeight: 'bold',
                px: 4,
                py: 1.2,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              Track Cargo
            </Button>
          </div>
        </Container>
      </Box>

      <Footer />
    </div>
  );
}

