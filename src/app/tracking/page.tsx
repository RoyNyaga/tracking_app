'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ship, AlertCircle, Calendar, MapPin, Package, User, FileText } from 'lucide-react';
import { Container, Button, Box, Typography, Card, CardContent, CircularProgress, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert } from '@mui/material';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

// Helper: load the fallback or environment company ID for Global Load Logistics
const GLOBAL_LOGISTICS_COMPANY_ID = process.env.NEXT_PUBLIC_GLOBAL_LOGISTICS_COMPANY_ID || '11111111-1111-1111-1111-111111111111';

export default function TrackingPage() {
  const [refInput, setRefInput] = useState('');
  const [searchRef, setSearchRef] = useState('');
  const [triggerId, setTriggerId] = useState(0);

  const { data: shipment, isLoading, isError, error } = useQuery({
    queryKey: ['tracking', searchRef, triggerId],
    queryFn: async () => {
      if (!searchRef) return null;
      
      // Query shipment matching reference code and company isolation
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          packages (*)
        `)
        .eq('carrier_reference_no', searchRef)
        .eq('company_id', GLOBAL_LOGISTICS_COMPANY_ID)
        .eq('visibility_status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!searchRef,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = refInput.trim().toUpperCase();
    if (cleanInput) {
      setSearchRef(cleanInput);
      setTriggerId((prev) => prev + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-500 text-white';
      case 'pending': return 'bg-amber-500 text-slate-950';
      case 'picked_up': return 'bg-blue-500 text-white';
      case 'on_hold': return 'bg-orange-500 text-white';
      case 'out_for_deliver': return 'bg-indigo-500 text-white';
      case 'in_transit': return 'bg-sky-500 text-white';
      case 'enroute': return 'bg-violet-500 text-white';
      case 'cancelled': return 'bg-rose-500 text-white';
      case 'returned': return 'bg-slate-500 text-white';
      default: return 'bg-cyan-500 text-white';
    }
  };

  const getActiveStepIndex = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'out_for_deliver') return 3;
    if (s === 'in_transit' || s === 'enroute') return 2;
    if (s === 'picked_up') return 1;
    return 0; // pending, on_hold, cancelled, returned (defaults to 0, or shown in alert)
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F9]">
      <Navbar />

      {/* Hero Banner */}
      <Box className="bg-[#0A192F] text-white py-12 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-900 to-[#0A192F]" />
        <Container maxWidth="md" className="relative z-10 text-center space-y-4">
          <Typography variant="h4" className="font-extrabold text-2xl sm:text-4xl font-sans">
            Real-Time Cargo Tracking
          </Typography>
          <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto">
            Enter your 10-digit carrier reference number below to instantly retrieve the status, route, and specifications of your cargo.
          </p>

          {/* Search Bar Form */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-4">
            <Box className="flex gap-2 bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md items-center">
              <input
                type="text"
                placeholder="Enter Reference (e.g. GL98765432)"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                required
                className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none px-4 py-2 border-0"
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#00F2FE',
                  color: '#0A192F',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#00cce0' }
                }}
                startIcon={<Search className="h-4 w-4" />}
              >
                Track
              </Button>
            </Box>
          </form>
        </Container>
      </Box>

      {/* Main Results Container */}
      <Container maxWidth="lg" className="py-12 flex-grow">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <CircularProgress color="primary" />
            <span className="text-gray-500 font-medium">Fetching shipment details...</span>
          </div>
        )}

        {isError && (
          <Alert severity="error" icon={<AlertCircle className="h-5 w-5" />} className="max-w-xl mx-auto">
            {error instanceof Error ? error.message : 'An error occurred during look up. Please verify your connection.'}
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {/* Case 1: Search completed, but no shipment found */}
          {searchRef && !isLoading && !isError && !shipment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto text-center py-12 px-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4"
            >
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Shipment Not Found</h3>
              <p className="text-gray-600 text-sm max-w-sm mx-auto">
                We could not find any active shipment under reference number <span className="font-semibold text-cyan-600">"{searchRef}"</span> for Wide Load Logistics.
              </p>
            </motion.div>
          )}

          {/* Case 2: Shipment found! Display full details */}
          {shipment && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Top Banner Status */}
              <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
                <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Reference</span>
                    <h2 className="text-2xl font-black text-slate-900">{shipment.carrier_reference_no}</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${getStatusColor(shipment.status)}`}>
                        {shipment.status?.replace('_', ' ') || 'pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location:</span>
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        {shipment.location || 'Pending'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Alert Card (only for Cancelled, On Hold, Returned) */}
              {['cancelled', 'on_hold', 'returned'].includes(shipment.status?.toLowerCase()) && (
                <Card className="border border-amber-200 shadow-sm rounded-xl bg-amber-50/30 overflow-hidden">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-full mt-0.5">
                        <AlertCircle className="h-6 w-6 text-amber-650" />
                      </div>
                      <div className="space-y-3 flex-1">
                        <div>
                          <h3 className="text-base font-extrabold text-amber-900 uppercase tracking-wider">
                            Shipment Status: {shipment.status?.replace('_', ' ')}
                          </h3>
                          <p className="text-amber-700 text-sm mt-1">
                            {shipment.status?.toLowerCase() === 'on_hold' && 'This cargo has been temporarily placed on hold.'}
                            {shipment.status?.toLowerCase() === 'cancelled' && 'This shipment has been cancelled by the operator.'}
                            {shipment.status?.toLowerCase() === 'returned' && 'This cargo was returned to the shipper.'}
                          </p>
                        </div>

                        {/* Reason / Comments at the top when on hold */}
                        <div className="bg-white/80 border border-amber-200/60 rounded-lg p-4 space-y-3 shadow-sm">
                          {shipment.comments && (
                            <div>
                              <span className="text-[10px] font-bold text-amber-900/60 uppercase tracking-wider block mb-0.5">Dispatcher Comments / Reason</span>
                              <span className="text-sm font-semibold text-slate-800 whitespace-pre-line">{shipment.comments}</span>
                            </div>
                          )}
                          {!shipment.comments && (
                            <span className="text-xs text-amber-800 italic">No additional comments or reasons provided.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Main Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Shipment specifications & Timeline */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Shipment Description & Comments */}
                  <Card className="border border-gray-200 shadow-sm rounded-xl bg-white">
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Package className="h-4 w-4 text-cyan-500" /> Shipment Description
                        </h3>
                        <p className="text-slate-800 text-sm font-semibold">
                          {shipment.product || 'No description provided.'}
                        </p>
                      </div>
                      {shipment.comments && (
                        <>
                          <Divider />
                          <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <FileText className="h-4 w-4 text-cyan-500" /> Dispatcher Comments
                            </h3>
                            <p className="text-slate-600 text-sm font-medium whitespace-pre-line">
                              {shipment.comments}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Timeline / Live Status */}
                  <Card className="border border-gray-200 shadow-sm rounded-xl bg-white">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-cyan-500" /> Transit Timeline
                      </h3>
                      
                      <div className="relative pl-6 border-l-2 border-cyan-400/30 space-y-8 ml-2">
                        {/* Current Status Point */}
                        <div className="relative">
                          <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 rounded-full bg-cyan-400 border-2 border-white ring-4 ring-cyan-100" />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                                {shipment.location || 'Pending'}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${getStatusColor(shipment.status)}`}>
                                {shipment.status?.replace('_', ' ') || 'pending'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" /> Current Location Check-in
                            </p>
                            {shipment.time && (
                              <p className="text-gray-400 text-xs flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> Checked in at {shipment.time}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Departure Details */}
                        <div className="relative">
                          <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 rounded-full bg-gray-300 border-2 border-white" />
                          <div className="space-y-1">
                            <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Route Originated</h4>
                            <p className="text-gray-600 text-sm">
                              Origin: {shipment.origin || 'Not specified'}
                            </p>
                            {shipment.pickup_date && (
                              <p className="text-gray-400 text-xs flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> Pickup: {shipment.pickup_date} {shipment.pickup_time ? `@ ${shipment.pickup_time}` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Packages details */}
                  <Card className="border border-gray-200 shadow-sm rounded-xl bg-white">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Package className="h-5 w-5 text-cyan-500" /> Included Packages
                      </h3>

                      {shipment.packages && shipment.packages.length > 0 ? (
                        <TableContainer component={Paper} elevation={0} className="border border-gray-200 rounded-lg">
                          <Table>
                            <TableHead className="bg-[#0A192F]/5">
                              <TableRow>
                                <TableCell className="font-bold text-slate-800">Piece Type</TableCell>
                                <TableCell align="right" className="font-bold text-slate-800">Qty</TableCell>
                                <TableCell className="font-bold text-slate-800">Dimensions (cm)</TableCell>
                                <TableCell align="right" className="font-bold text-slate-800">Weight (kg)</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {shipment.packages.map((pkg: any) => (
                                <TableRow key={pkg.id}>
                                  <TableCell>
                                    <div className="font-semibold text-slate-900">{pkg.piece_type || 'Package'}</div>
                                    <div className="text-xs text-gray-500">{pkg.description || 'No description'}</div>
                                  </TableCell>
                                  <TableCell align="right" className="font-medium">{pkg.quantity || 1}</TableCell>
                                  <TableCell className="text-gray-600 text-sm">
                                    {pkg.length && pkg.width && pkg.height ? `${pkg.length} x ${pkg.width} x ${pkg.height}` : 'N/A'}
                                  </TableCell>
                                  <TableCell align="right" className="font-medium">{pkg.weight || 'N/A'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <p className="text-gray-500 text-sm">No package details associated with this shipment.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Party Details & General Info */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Parties (Shipper & Receiver) */}
                  <Card className="border border-gray-200 shadow-sm rounded-xl bg-white">
                    <CardContent className="p-6 space-y-6">
                      {/* Shipper */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="h-4 w-4 text-cyan-500" /> Shipper Details
                        </h4>
                        <div className="text-slate-900 font-bold text-base">{shipment.shipper_name || 'N/A'}</div>
                        <div className="text-gray-600 text-sm space-y-1">
                          <p>{shipment.shipper_address || 'Address not listed'}</p>
                          {shipment.shipper_phone_number && <p>Tel: {shipment.shipper_phone_number}</p>}
                        </div>
                      </div>

                      <Divider />

                      {/* Receiver */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="h-4 w-4 text-cyan-500" /> Receiver Details
                        </h4>
                        <div className="text-slate-900 font-bold text-base">{shipment.receiver_name || 'N/A'}</div>
                        <div className="text-gray-600 text-sm space-y-1">
                          <p>{shipment.receiver_address || 'Address not listed'}</p>
                          {shipment.receiver_phone_number && <p>Tel: {shipment.receiver_phone_number}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* General Specifications */}
                  <Card className="border border-gray-200 shadow-sm rounded-xl bg-white">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-cyan-500" /> Freight Specifications
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Freight Mode', val: shipment.mode?.replace('_', ' ') },
                          { label: 'Shipment Classification', val: shipment.type_of_shipment?.replace('_', ' ') },
                          { label: 'Courier Partner', val: shipment.courier },
                          { label: 'Carrier Route', val: shipment.carrier },
                          { label: 'Departure Time', val: shipment.departure_time },
                          { label: 'Est. Delivery Date', val: shipment.expected_delivery_date }
                        ].map((spec, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 text-sm">
                            <span className="text-gray-500">{spec.label}</span>
                            <span className="font-semibold text-slate-900 uppercase">{spec.val || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      <Footer />
    </div>
  );
}
