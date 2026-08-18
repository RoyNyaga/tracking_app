'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Container, Typography, Button, Box, Alert, Card, CardContent } from '@mui/material';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

// Helper: load the fallback or environment company ID for Global Load Logistics
const GLOBAL_LOGISTICS_COMPANY_ID = process.env.NEXT_PUBLIC_GLOBAL_LOGISTICS_COMPANY_ID || '11111111-1111-1111-1111-111111111111';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const contactMutation = useMutation({
    mutationFn: async () => {
      // Validate inputs
      if (!name || !email || !subject || !message) {
        throw new Error('All fields are required.');
      }

      const { data, error } = await supabase.from('contact_messages').insert({
        company_id: GLOBAL_LOGISTICS_COMPANY_ID,
        sender_name: name,
        sender_email: email,
        subject: subject,
        message: message,
        status: 'unread',
        created_at: new Date().toISOString()
      }).select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Clear form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F9]">
      <Navbar />

      {/* Main Container */}
      <Container maxWidth="lg" className="py-20 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Left Panel: Contact info */}
          <div className="md:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">Contact Us</span>
              <Typography variant="h3" className="font-extrabold text-slate-900 text-3xl sm:text-4xl leading-tight font-sans">
                Let's Talk About Your Logistics Needs
              </Typography>
              <p className="text-gray-600">
                Have questions about custom clearing, global routes, or multi-package freight solutions? Reach out to us directly or fill in the contact form.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-cyan-500/15 rounded-lg text-cyan-600">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-sm">General Inquiries</h4>
                  <a href="mailto:globalloadlogistic@gmail.com" className="text-cyan-600 text-base font-medium hover:underline">
                    globalloadlogistic@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-cyan-500/15 rounded-lg text-cyan-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-sm">Telephone Hotline</h4>
                  <p className="text-gray-600 text-base font-medium">+1 (800) 555-LOAD</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-cyan-500/15 rounded-lg text-cyan-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-sm">Corporate Headquarters</h4>
                  <p className="text-gray-600 text-base leading-relaxed">
                    100 Logistics Blvd, Suite 400,<br />New York, NY 10001
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Floating glassmorphic Contact Form */}
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-gray-200/80 shadow-lg rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Send Message</h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject *</label>
                        <input
                          type="text"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message *</label>
                        <textarea
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50"
                        />
                      </div>
                    </div>

                    {/* Alerts */}
                    <AnimatePresence>
                      {contactMutation.isSuccess && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                          <Alert severity="success" icon={<CheckCircle className="h-4 w-4" />} className="mt-4">
                            Your message has been submitted to Global Load Logistics!
                          </Alert>
                        </motion.div>
                      )}

                      {contactMutation.isError && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                          <Alert severity="error" icon={<AlertCircle className="h-4 w-4" />} className="mt-4">
                            {contactMutation.error.message || 'Submission failed. Please try again.'}
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={contactMutation.isPending}
                      endIcon={<Send className="h-4 w-4" />}
                      sx={{
                        mt: 2,
                        bgcolor: '#0A192F',
                        color: '#fff',
                        fontWeight: 'bold',
                        py: 1.5,
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#12253f' }
                      }}
                    >
                      {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
