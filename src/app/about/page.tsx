'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Compass, Eye, ShieldCheck, Ship, Users } from 'lucide-react';
import { Container, Card, CardContent, Typography, Box } from '@mui/material';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const }
  })
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F9]">
      <Navbar />

      {/* Header Banner */}
      <Box className="bg-[#0A192F] text-white py-16 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-900 to-[#0A192F]" />
        <Container maxWidth="lg" className="relative z-10 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full text-xs font-semibold border border-cyan-400/20"
          >
            <Ship className="h-3 w-3" /> Who We Are
          </motion.div>
          <Typography variant="h3" className="font-extrabold text-3xl sm:text-4xl lg:text-5xl font-sans">
            Moving Cargo with Absolute Security
          </Typography>
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Wide Load Logistics has grown from a regional shipping dispatch center into a trusted worldwide network handling multi-modal supply chains.
          </p>
        </Container>
      </Box>

      {/* Content Section */}
      <Container maxWidth="lg" className="py-20 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Our Vision for Global Supply Chains
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We believe logistics should be completely transparent. Businesses shouldn't have to guess where their shipments are, which is why we built a digital tracking system showing every package's dimensional breakdown, weight, and chronological status updates.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether you are importing medical supplies via air freight, shipping heavy equipment in containers, or coordinating local truckloads, we apply the same rigorous standards of accountability.
            </p>
          </div>
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { count: '10M+', label: 'Tons Transported' },
                { count: '99.9%', label: 'Delivery Accuracy' },
                { count: '24/7', label: 'Support Coverage' },
                { count: '150+', label: 'Countries Covered' }
              ].map((metric, i) => (
                <div key={i} className="bg-white border border-gray-200 p-6 rounded-xl text-center shadow-sm">
                  <div className="text-3xl font-extrabold text-cyan-500 mb-1">{metric.count}</div>
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Our Core Principles</h2>
            <p className="text-gray-500 text-sm mt-2">The guidelines that steer every flight, vessel, and truck we manage.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6 text-cyan-500" />,
                title: 'High-Precision Care',
                desc: 'Every item is recorded and checked against target weights and dimensions to prevent sorting errors.'
              },
              {
                icon: <Compass className="h-6 w-6 text-cyan-500" />,
                title: 'Global Paths',
                desc: 'Optimized routing selecting the most secure and ecological routes across land and sea corridors.'
              },
              {
                icon: <Eye className="h-6 w-6 text-cyan-500" />,
                title: 'Complete Visibility',
                desc: 'Open client tracking dashboards showing detailed timeline updates without requiring account sign-ins.'
              },
              {
                icon: <Users className="h-6 w-6 text-cyan-500" />,
                title: 'Collaborative Networks',
                desc: 'Invited team collaborators share access to create, edit, and dispatch shipments efficiently.'
              }
            ].map((val, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className="border border-gray-200/80 shadow-sm rounded-xl h-full bg-white">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="p-3 bg-cyan-500/10 rounded-full inline-flex">
                      {val.icon}
                    </div>
                    <h3 className="font-bold text-slate-900">{val.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{val.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="space-y-12 mt-24">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">Leadership Team</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Meet Our Executives</h2>
            <p className="text-gray-500 text-sm mt-2">
              The logistics experts driving operational precision and custom supply chain designs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Arthur Jenkins',
                role: 'Chief Executive Officer & Founder',
                image: '/team3.jpeg',
                bio: 'Leading strategic vision and global shipping network expansion.'
              },
              {
                name: 'Robert Vance',
                role: 'Head of Global Operations',
                image: '/team1.jpeg',
                bio: 'Overseeing multi-modal transit pathways and cargo safety.'
              },
              {
                name: 'Michael Rostov',
                role: 'Chief Technology Officer',
                image: '/team2.jpeg',
                bio: 'Designing our digital tracking portal and cloud infrastructure.'
              },
              {
                name: 'Diana Sterling',
                role: 'Director of Client Logistics',
                image: '/team4.jpeg',
                bio: 'Structuring custom supply chain solutions for corporate partners.'
              }
            ].map((member, idx) => (
              <Card key={idx} className="border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col h-full">
                <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardContent className="p-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-800 text-base leading-snug">{member.name}</h3>
                    <p className="text-cyan-600 font-semibold text-xs">{member.role}</p>
                  </div>
                  <p className="text-gray-600 text-xs mt-3 leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Callout */}
        <Box className="mt-20 bg-[#0A192F]/5 border border-[#0A192F]/10 rounded-2xl p-8 text-center space-y-4">
          <Award className="h-10 w-10 text-cyan-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">Direct Support Center</h3>
          <p className="text-gray-600 max-w-lg mx-auto text-sm">
            Have custom cargo requirements or compliance questions? Send documents directly to our logistics team:
          </p>
          <div className="font-bold text-lg text-cyan-600">
            <a href="mailto:wideloadlogistic@gmail.com" className="hover:underline">
              wideloadlogistic@gmail.com
            </a>
          </div>
        </Box>
      </Container>

      <Footer />
    </div>
  );
}
