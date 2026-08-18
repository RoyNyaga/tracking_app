'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Plus, Search, Trash2, Edit, CheckCircle, MapPin, Calendar, Clock, AlertTriangle, Eye, X, Save, ArrowRight, Package, Copy } from 'lucide-react';
import { Button, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Drawer, Tabs, Tab, Divider } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function ShipmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState<string>('');
  const [search, setSearch] = useState('');
  
  // Dialog status states (Quick Check-in)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [newLocation, setNewLocation] = useState('');
  const [newTime, setNewTime] = useState('');

  // Drawer View Panel States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [associatedPackages, setAssociatedPackages] = useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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

  // Fetch shipments
  const { data: shipments, isLoading } = useQuery({
    queryKey: ['shipments', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Delete shipment mutation
  const deleteMutation = useMutation({
    mutationFn: async (uuid: string) => {
      const { error } = await supabase.from('shipments').delete().eq('uuid', uuid);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments', companyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', companyId] });
    }
  });

  // Update status timeline event mutation (Quick Check-in)
  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!selectedShipment) return;
      const { error } = await supabase
        .from('shipments')
        .update({
          location: newLocation,
          time: newTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          updated_at: new Date().toISOString()
        })
        .eq('uuid', selectedShipment.uuid);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments', companyId] });
      setUpdateDialogOpen(false);
      setSelectedShipment(null);
    }
  });

  const openUpdateDialog = (shipment: any) => {
    setSelectedShipment(shipment);
    setNewLocation(shipment.location || '');
    setNewTime(shipment.time || '');
    setUpdateDialogOpen(true);
  };

  const handleOpenDrawer = async (shipment: any) => {
    setSelectedShipment(shipment);
    setActiveTab(0);
    setDrawerOpen(true);

    // Fetch dynamic package breakdown list
    setPackagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('shipment_id', shipment.uuid);
      if (error) throw error;
      setAssociatedPackages(data || []);
    } catch (err) {
      console.error("Failed to load packages for shipment:", err);
    } finally {
      setPackagesLoading(false);
    }
  };

  const filteredShipments = shipments?.filter((s: any) => 
    s.carrier_reference_no?.toLowerCase().includes(search.toLowerCase()) ||
    s.shipper_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.receiver_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.origin?.toLowerCase().includes(search.toLowerCase()) ||
    s.destination?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box className="space-y-6">
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Manage Shipments</h1>
          <p className="text-gray-500 text-sm">Register cargo, dispatch routes, and update transit timelines.</p>
        </div>

        {companyId && (
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
              '&:hover': { bgcolor: '#12253f' }
            }}
          >
            Create Shipment
          </Button>
        )}
      </Box>

      {companyId ? (
        <Card className="border border-gray-200/80 shadow-sm rounded-xl bg-white overflow-hidden">
          <Box className="p-4 bg-gray-50 border-b border-gray-150 flex items-center gap-3">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reference, route, shipper, or receiver name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-slate-800 placeholder-gray-400 focus:outline-none py-1 border-0"
            />
          </Box>

          {isLoading ? (
            <div className="py-16 text-center text-gray-500">Loading shipments...</div>
          ) : filteredShipments && filteredShipments.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead className="bg-[#0A192F]/5">
                  <TableRow>
                    <TableCell className="font-bold text-slate-800">Reference No</TableCell>
                    <TableCell className="font-bold text-slate-800">Route (Origin / Dest)</TableCell>
                    <TableCell className="font-bold text-slate-800">Shipper / Receiver</TableCell>
                    <TableCell className="font-bold text-slate-800">Current Location</TableCell>
                    <TableCell className="font-bold text-slate-800">Visibility</TableCell>
                    <TableCell align="center" className="font-bold text-slate-800">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredShipments.map((s: any) => (
                    <TableRow key={s.uuid} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold text-slate-900">{s.carrier_reference_no}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-800">{s.origin} &rarr; {s.destination}</div>
                        <div className="text-xs text-gray-500">Mode: {s.mode?.replace('_', ' ')}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm"><span className="text-gray-400">From:</span> {s.shipper_name}</div>
                        <div className="text-sm"><span className="text-gray-400">To:</span> {s.receiver_name}</div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800">
                        {s.location || 'Pending'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          s.visibility_status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {s.visibility_status || 'draft'}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <Box className="flex justify-center gap-0.5">
                          <IconButton onClick={() => handleOpenDrawer(s)} size="small" title="View Details">
                            <Eye className="h-4 w-4 text-cyan-600" />
                          </IconButton>
                          <IconButton onClick={() => router.push(`/dashboard/shipments/${s.uuid}/edit`)} size="small" title="Edit Shipment">
                            <Edit className="h-4 w-4 text-emerald-600" />
                          </IconButton>
                          <IconButton onClick={() => openUpdateDialog(s)} size="small" color="primary" title="Quick location check-in">
                            <Clock className="h-4 w-4" />
                          </IconButton>
                          <IconButton onClick={() => deleteMutation.mutate(s.uuid)} size="small" color="error" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <div className="py-16 text-center text-gray-500">No shipments found in this workspace.</div>
          )}
        </Card>
      ) : (
        <div className="py-16 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">
          Please create a company workspace in Settings first to list and manage cargo.
        </div>
      )}

      {/* Dialog for Quick Updating shipment status (Timeline check-in) */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle className="font-extrabold text-slate-800 border-b border-gray-150">
          Quick Location Check-in
        </DialogTitle>
        <DialogContent className="pt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Current Location</label>
            <input
              type="text"
              value={newLocation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLocation(e.target.value)}
              placeholder="e.g. New York Hub, In Transit"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Check-in Time (Optional)</label>
            <input
              type="text"
              value={newTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTime(e.target.value)}
              placeholder="e.g. 12:41 pm (default is current time)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </DialogContent>
        <DialogActions className="border-t border-gray-150 p-4">
          <Button onClick={() => setUpdateDialogOpen(false)} variant="outlined" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={() => updateStatusMutation.mutate()}
            variant="contained"
            disabled={updateStatusMutation.isPending}
            sx={{ bgcolor: '#0A192F', color: '#fff', textTransform: 'none', '&:hover': { bgcolor: '#12253f' } }}
          >
            {updateStatusMutation.isPending ? 'Saving...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Slide-out View Details Drawer Panel (Read-only) */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '90vw',
            maxWidth: '850px',
            bgcolor: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }
        }}
      >
        {selectedShipment && (
          <Box className="h-full flex flex-col">
            {/* Drawer Header */}
            <Box className="p-4 bg-[#0A192F] text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-cyan-400" />
                <div>
                  <Box className="flex items-center gap-1">
                    <Typography variant="h6" className="font-black leading-tight text-sm sm:text-base">
                      Shipment {selectedShipment.carrier_reference_no}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleCopyCode(selectedShipment.carrier_reference_no)}
                      sx={{ color: copiedCode ? '#00F2FE' : '#94a3b8', p: 0.5 }}
                      title="Copy Reference Code"
                    >
                      {copiedCode ? <CheckCircle className="h-4 w-4 text-cyan-400" /> : <Copy className="h-4 w-4" />}
                    </IconButton>
                  </Box>
                  <span className="text-[10px] text-slate-300 font-medium">UUID: {selectedShipment.uuid}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  variant="contained"
                  component={Link}
                  href={`/dashboard/shipments/${selectedShipment.uuid}/edit`}
                  startIcon={<Edit className="h-3 w-3" />}
                  sx={{
                    bgcolor: '#00F2FE',
                    color: '#0A192F',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#00cce0' }
                  }}
                >
                  Edit Shipment
                </Button>
                <IconButton onClick={() => setDrawerOpen(false)} color="inherit" size="small">
                  <X className="h-5 w-5" />
                </IconButton>
              </div>
            </Box>

            {/* Tabs for sections */}
            <Box className="bg-white border-b border-slate-200">
              <Tabs 
                value={activeTab} 
                onChange={(e, val) => setActiveTab(val)}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label={<span className="text-xs font-bold uppercase tracking-wider">Parties</span>} />
                <Tab label={<span className="text-xs font-bold uppercase tracking-wider">Specifications</span>} />
                <Tab label={<span className="text-xs font-bold uppercase tracking-wider">Packages ({associatedPackages.length})</span>} />
              </Tabs>
            </Box>

            {/* Drawer Body area */}
            <Box className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeTab === 0 && (
                /* PARTIES VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipper Details */}
                  <Card className="border border-slate-200/80 shadow-sm rounded-xl bg-white">
                    <CardContent className="p-4 space-y-4">
                      <Typography className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Shipper Details
                      </Typography>
                      <div className="space-y-2 text-xs">
                        <div><span className="font-bold text-slate-500">Name:</span> <span className="font-semibold text-slate-800">{selectedShipment.shipper_name}</span></div>
                        <div><span className="font-bold text-slate-500">Phone:</span> <span className="font-semibold text-slate-800">{selectedShipment.shipper_phone_number}</span></div>
                        <div><span className="font-bold text-slate-500">Email:</span> <span className="font-semibold text-slate-800">{selectedShipment.shipper_email || '-'}</span></div>
                        <div><span className="font-bold text-slate-500">Address:</span> <p className="mt-1 font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">{selectedShipment.shipper_address}</p></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Receiver Details */}
                  <Card className="border border-slate-200/80 shadow-sm rounded-xl bg-white">
                    <CardContent className="p-4 space-y-4">
                      <Typography className="font-extrabold text-slate-800 text-sm border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Receiver Details
                      </Typography>
                      <div className="space-y-2 text-xs">
                        <div><span className="font-bold text-slate-500">Name:</span> <span className="font-semibold text-slate-800">{selectedShipment.receiver_name}</span></div>
                        <div><span className="font-bold text-slate-500">Phone:</span> <span className="font-semibold text-slate-800">{selectedShipment.receiver_phone_number}</span></div>
                        <div><span className="font-bold text-slate-500">Email:</span> <span className="font-semibold text-slate-800">{selectedShipment.receiver_email || '-'}</span></div>
                        <div><span className="font-bold text-slate-500">Address:</span> <p className="mt-1 font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">{selectedShipment.receiver_address}</p></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 1 && (
                /* ROUTE SPECIFICATIONS VIEW */
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Origin', val: selectedShipment.origin },
                      { label: 'Destination', val: selectedShipment.destination },
                      { label: 'Shipment Type', val: selectedShipment.type_of_shipment?.replace('_', ' ') },
                      { label: 'Transit Mode', val: selectedShipment.mode?.replace('_', ' ') },
                      { label: 'Carrier Company', val: selectedShipment.carrier },
                      { label: 'Courier Partner', val: selectedShipment.courier || '-' },
                      { label: 'Declared Weight', val: `${selectedShipment.weight} kg` },
                      { label: 'Freight Cost', val: `$${selectedShipment.total_freight}` },
                      { label: 'Payment Mode', val: selectedShipment.payment_mode },
                      { label: 'Pickup Date', val: selectedShipment.pickup_date || '-' },
                      { label: 'Pickup Time', val: selectedShipment.pickup_time || '-' },
                      { label: 'Departure Time', val: selectedShipment.departure_time || '-' },
                      { label: 'Est. Delivery Date', val: selectedShipment.expected_delivery_date || '-' },
                      { label: 'Current Location', val: selectedShipment.location || 'Pending' },
                      { label: 'Visibility Status', val: selectedShipment.visibility_status || 'draft' },
                    ].map((spec, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/60 rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{spec.label}</span>
                        <span className="text-xs font-extrabold text-slate-800 truncate uppercase mt-1">{spec.val}</span>
                      </div>
                    ))}
                  </div>

                  <Card className="border border-slate-200 shadow-sm rounded-xl">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Typography className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Product Description</Typography>
                        <p className="text-xs font-semibold text-slate-800 mt-1">{selectedShipment.product}</p>
                      </div>
                      <Divider />
                      <div>
                        <Typography className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Comments</Typography>
                        <p className="text-xs font-semibold text-slate-700 mt-1 whitespace-pre-line">{selectedShipment.comments || 'No dispatcher comments.'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 2 && (
                /* PACKAGES LIST VIEW */
                <Card className="border border-slate-200/80 shadow-sm rounded-xl bg-white overflow-hidden">
                  <Box className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                    <Package className="h-5 w-5 text-cyan-600" />
                    <Typography className="font-extrabold text-slate-800 text-sm">Packages breakdown</Typography>
                  </Box>
                  
                  {packagesLoading ? (
                    <div className="py-12 text-center text-xs text-gray-500">Loading cargo components...</div>
                  ) : associatedPackages.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead className="bg-slate-50">
                          <TableRow>
                            <TableCell className="font-bold text-slate-800 text-xs">Piece Type</TableCell>
                            <TableCell align="right" className="font-bold text-slate-800 text-xs">Qty</TableCell>
                            <TableCell className="font-bold text-slate-800 text-xs">Description</TableCell>
                            <TableCell align="right" className="font-bold text-slate-800 text-xs">Length (cm)</TableCell>
                            <TableCell align="right" className="font-bold text-slate-800 text-xs">Width (cm)</TableCell>
                            <TableCell align="right" className="font-bold text-slate-800 text-xs">Height (cm)</TableCell>
                            <TableCell align="right" className="font-bold text-slate-800 text-xs">Weight (kg)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {associatedPackages.map((pkg: any) => (
                            <TableRow key={pkg.id}>
                              <TableCell className="font-bold text-slate-700 text-xs">{pkg.piece_type}</TableCell>
                              <TableCell align="right" className="text-xs font-bold">{pkg.quantity}</TableCell>
                              <TableCell className="text-xs">{pkg.description || '-'}</TableCell>
                              <TableCell align="right" className="text-xs">{pkg.length}</TableCell>
                              <TableCell align="right" className="text-xs">{pkg.width}</TableCell>
                              <TableCell align="right" className="text-xs">{pkg.height}</TableCell>
                              <TableCell align="right" className="text-xs font-bold text-cyan-700">{pkg.weight}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <div className="py-12 text-center text-xs text-gray-500">No packaging items found for this shipment.</div>
                  )}
                </Card>
              )}
            </Box>

            {/* Footer */}
            <Box className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button onClick={() => setDrawerOpen(false)} variant="contained" size="small" sx={{ bgcolor: '#0A192F', color: '#fff', textTransform: 'none', px: 3, '&:hover': { bgcolor: '#12253f' } }}>
                Close Panel
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
