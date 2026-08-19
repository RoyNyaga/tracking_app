'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Save, ArrowLeft, Plus } from 'lucide-react';
import { Box, Typography, Button, Card, CardContent, IconButton, Alert, Autocomplete, TextField } from '@mui/material';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// List of hardcoded countries for searchable inputs
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe"
];

// Character set to generate reference number (10 characters, excluding I, O, 0, 1, L)
function generateReferenceNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'GL'; // 2 letter prefix + 8 random safe characters = 10 digits
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function NewShipmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('active_company_id');
    if (stored) setCompanyId(stored);
  }, []);

  // Form Fields
  const [shipperName, setShipperName] = useState('');
  const [shipperPhone, setShipperPhone] = useState('');
  const [shipperAddress, setShipperAddress] = useState('');
  const [shipperEmail, setShipperEmail] = useState('');

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');

  const [typeOfShipment, setTypeOfShipment] = useState('international_shipping');
  const [weight, setWeight] = useState('');
  const [courier, setCourier] = useState('');
  const [mode, setMode] = useState('sea_transport');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [totalFreight, setTotalFreight] = useState('');
  const [carrier, setCarrier] = useState('Wide Load Logistics');
  const [departureTime, setDepartureTime] = useState('');
  const [depHour, setDepHour] = useState('08');
  const [depMinute, setDepMinute] = useState('30');
  const [depAmpm, setDepAmpm] = useState('am');

  useEffect(() => {
    setDepartureTime(`${depHour}:${depMinute} ${depAmpm}`);
  }, [depHour, depMinute, depAmpm]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickHour, setPickHour] = useState('10');
  const [pickMinute, setPickMinute] = useState('00');
  const [pickAmpm, setPickAmpm] = useState('am');

  useEffect(() => {
    setPickupTime(`${pickHour}:${pickMinute} ${pickAmpm}`);
  }, [pickHour, pickMinute, pickAmpm]);

  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [comments, setComments] = useState('');
  const [visibilityStatus, setVisibilityStatus] = useState('draft');
  const [location, setLocation] = useState('Pending');
  const [status, setStatus] = useState('pending');

  // Packages array state
  const [packages, setPackages] = useState<any[]>([
    { quantity: 1, piece_type: 'Carton', description: '', length: '', width: '', height: '', weight: '' }
  ]);

  const addPackageRow = () => {
    setPackages([
      ...packages,
      { quantity: 1, piece_type: 'Carton', description: '', length: '', width: '', height: '', weight: '' }
    ]);
  };

  const removePackageRow = (index: number) => {
    if (packages.length > 1) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const handlePackageChange = (index: number, field: string, value: any) => {
    const updated = packages.map((pkg, i) => {
      if (i === index) {
        return { ...pkg, [field]: value };
      }
      return pkg;
    });
    setPackages(updated);
  };

  const createShipmentMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error('Active company workspace missing.');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User session missing.');

      const refNo = generateReferenceNumber();

      // Write shipment
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          company_id: companyId,
          created_by: user.id,
          updated_by: user.id,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          visibility_status: visibilityStatus,
          location: location || 'Pending',
          status,
          
          shipper_name: shipperName,
          shipper_phone_number: shipperPhone,
          shipper_address: shipperAddress,
          shipper_email: shipperEmail,

          receiver_name: receiverName,
          receiver_phone_number: receiverPhone,
          receiver_address: receiverAddress,
          receiver_email: receiverEmail,

          type_of_shipment: typeOfShipment,
          weight: parseFloat(weight) || 0,
          courier,
          mode,
          product,
          quantity: parseInt(quantity) || packages.reduce((acc, curr) => acc + (parseInt(curr.quantity) || 0), 0),
          payment_mode: paymentMode,
          total_freight: parseFloat(totalFreight) || 0,
          carrier,
          carrier_reference_no: refNo,
          departure_time: departureTime,
          origin,
          destination,
          pickup_date: pickupDate || null,
          pickup_time: pickupTime,
          expected_delivery_date: expectedDeliveryDate || null,
          comments
        })
        .select()
        .single();

      if (shipmentError) throw shipmentError;

      // Write packages
      const packagesPayload = packages.map(pkg => ({
        shipment_id: shipment.uuid,
        quantity: parseInt(pkg.quantity) || 1,
        piece_type: pkg.piece_type,
        description: pkg.description,
        length: parseFloat(pkg.length) || 0,
        width: parseFloat(pkg.width) || 0,
        height: parseFloat(pkg.height) || 0,
        weight: parseFloat(pkg.weight) || 0
      }));

      const { error: packagesError } = await supabase.from('packages').insert(packagesPayload);
      if (packagesError) throw packagesError;

      return shipment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments', companyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', companyId] });
      router.push('/dashboard/shipments');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createShipmentMutation.mutate();
  };

  return (
    <Box className="space-y-6">
      <Box className="flex items-center gap-3">
        <IconButton component={Link} href="/dashboard/shipments" color="inherit">
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Register New Shipment</h1>
          <p className="text-gray-500 text-sm">Add shipper, receiver, route details, and dynamic package dimensions.</p>
        </div>
      </Box>

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        {/* Parties Grid (Shipper & Receiver) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipper Card */}
          <Card className="border border-gray-200/80 shadow-sm rounded-xl bg-white">
            <CardContent className="p-6 space-y-4">
              <Typography className="font-extrabold text-slate-800 border-b border-gray-100 pb-2 mb-4">
                Shipper Details
              </Typography>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shipper Name *</label>
                  <input type="text" required value={shipperName} onChange={(e) => setShipperName(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number *</label>
                  <input type="text" required value={shipperPhone} onChange={(e) => setShipperPhone(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input type="email" value={shipperEmail} onChange={(e) => setShipperEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Physical Address *</label>
                  <textarea required rows={2} value={shipperAddress} onChange={(e) => setShipperAddress(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receiver Card */}
          <Card className="border border-gray-200/80 shadow-sm rounded-xl bg-white">
            <CardContent className="p-6 space-y-4">
              <Typography className="font-extrabold text-slate-800 border-b border-gray-100 pb-2 mb-4">
                Receiver Details
              </Typography>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Receiver Name *</label>
                  <input type="text" required value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number *</label>
                  <input type="text" required value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input type="email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Physical Address *</label>
                  <textarea required rows={2} value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Details Card */}
        <Card className="border border-gray-200/80 shadow-sm rounded-xl bg-white">
          <CardContent className="p-6 space-y-6">
            <Typography className="font-extrabold text-slate-800 border-b border-gray-100 pb-2">
              Route & Freight Specifications
            </Typography>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type of Shipment</label>
                <select value={typeOfShipment} onChange={(e) => setTypeOfShipment(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50">
                  <option value="air_freight">Air Freight</option>
                  <option value="international_shipping">International Shipping</option>
                  <option value="truckload">Truckload</option>
                  <option value="van_move">Van Move</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transit Mode</label>
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50">
                  <option value="sea_transport">Sea Transport</option>
                  <option value="land_shipping">Land Shipping</option>
                  <option value="air_freight">Air Freight</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Carrier Company</label>
                <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50">
                  {['Wide Load Logistics', 'Deli Trans', 'DHL', 'USPS', 'FedEx', 'TNT', 'UPS'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Origin Country/City *</label>
                <Autocomplete
                  freeSolo
                  options={COUNTRIES}
                  value={origin}
                  onChange={(event, newValue) => {
                    setOrigin(newValue || '');
                  }}
                  onInputChange={(event, newInputValue) => {
                    setOrigin(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      placeholder="Search country or type city..."
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(249, 250, 251, 0.5)',
                          '& fieldset': {
                            borderColor: '#d1d5db',
                          },
                          '&:hover fieldset': {
                            borderColor: '#00F2FE',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#00F2FE',
                          },
                        },
                      }}
                    />
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Destination Country/City *</label>
                <Autocomplete
                  freeSolo
                  options={COUNTRIES}
                  value={destination}
                  onChange={(event, newValue) => {
                    setDestination(newValue || '');
                  }}
                  onInputChange={(event, newInputValue) => {
                    setDestination(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      placeholder="Search country or type city..."
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: 'rgba(249, 250, 251, 0.5)',
                          '& fieldset': {
                            borderColor: '#d1d5db',
                          },
                          '&:hover fieldset': {
                            borderColor: '#00F2FE',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#00F2FE',
                          },
                        },
                      }}
                    />
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Courier Partner</label>
                <input type="text" value={courier} onChange={(e) => setCourier(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Description *</label>
                <textarea required rows={2} value={product} onChange={(e) => setProduct(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" placeholder="e.g. Industrial Gears, components, and heavy equipment..." />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Declared Weight (kg)</label>
                <input type="number" step="any" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Freight Cost ($)</label>
                <input type="number" step="any" value={totalFreight} onChange={(e) => setTotalFreight(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Mode</label>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50">
                  {['cash', 'cheque', 'zelle', 'CashApp', 'Apple Pay', 'PayPal', 'western Union', 'Money Gram', 'E-Transfer', 'Bank Transfer', 'Gift Card'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Departure Time</label>
                <div className="flex gap-1.5">
                  {/* Hour */}
                  <select
                    value={depHour}
                    onChange={(e) => setDepHour(e.target.value)}
                    className="w-[31%] border border-gray-300 rounded-xl px-2 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50 text-center text-sm font-semibold"
                  >
                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  
                  <span className="text-lg self-center font-bold text-slate-400">:</span>

                  {/* Minute */}
                  <select
                    value={depMinute}
                    onChange={(e) => setDepMinute(e.target.value)}
                    className="w-[31%] border border-gray-300 rounded-xl px-2 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50 text-center text-sm font-semibold"
                  >
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  {/* AM/PM */}
                  <select
                    value={depAmpm}
                    onChange={(e) => setDepAmpm(e.target.value)}
                    className="w-[31%] border border-gray-300 rounded-xl px-2.5 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50 text-center text-sm font-semibold"
                  >
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pickup Date</label>
                <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pickup Time</label>
                <div className="flex gap-1.5">
                  {/* Hour */}
                  <select
                    value={pickHour}
                    onChange={(e) => setPickHour(e.target.value)}
                    className="w-[31%] border border-gray-300 rounded-xl px-2 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50 text-center text-sm font-semibold"
                  >
                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  
                  <span className="text-lg self-center font-bold text-slate-400">:</span>

                  {/* Minute */}
                  <select
                    value={pickMinute}
                    onChange={(e) => setPickMinute(e.target.value)}
                    className="w-[31%] border border-gray-300 rounded-xl px-2 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50 text-center text-sm font-semibold"
                  >
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  {/* AM/PM */}
                  <select
                    value={pickAmpm}
                    onChange={(e) => setPickAmpm(e.target.value)}
                    className="w-[31%] border border-gray-300 rounded-xl px-2.5 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50 text-center text-sm font-semibold"
                  >
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Est. Delivery Date</label>
                <input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visibility Status *</label>
                <select value={visibilityStatus} onChange={(e) => setVisibilityStatus(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50 font-semibold">
                  <option value="draft">Draft (Admin Only)</option>
                  <option value="published">Published (Publicly Trackable)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shipment Status *</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50 font-semibold">
                  <option value="pending">Pending</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="on_hold">On Hold</option>
                  <option value="out_for_deliver">Out for Delivery</option>
                  <option value="in_transit">In Transit</option>
                  <option value="enroute">Enroute</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="delivered">Delivered</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Location *</label>
                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dispatcher Comments</label>
                <textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-cyan-500 bg-gray-50/50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Package Breakdown */}
        <Card className="border border-gray-200/80 shadow-sm rounded-xl bg-white">
          <CardContent className="p-6 space-y-4">
            <Box className="flex justify-between items-center border-b border-gray-100 pb-2">
              <Typography className="font-extrabold text-slate-800">
                Package Breakdown
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Plus className="h-4 w-4" />}
                onClick={addPackageRow}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Add Row
              </Button>
            </Box>

            {/* Desktop View: Table Layout (hidden on mobile) */}
            <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left font-bold text-gray-700">Piece Type</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold text-gray-700 w-20">Qty</th>
                    <th scope="col" className="px-4 py-3 text-left font-bold text-gray-700">Content Description</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold text-gray-700 w-24">L (cm)</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold text-gray-700 w-24">W (cm)</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold text-gray-700 w-24">H (cm)</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold text-gray-700 w-28">Weight (kg)</th>
                    <th scope="col" className="relative px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packages.map((pkg, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">
                        <select
                          value={pkg.piece_type}
                          onChange={(e) => handlePackageChange(idx, 'piece_type', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 bg-white"
                        >
                          {['Carton', 'Pallet', 'Box', 'Crate', 'Container', 'Envelope'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          required
                          value={pkg.quantity}
                          onChange={(e) => handlePackageChange(idx, 'quantity', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={pkg.description}
                          onChange={(e) => handlePackageChange(idx, 'description', e.target.value)}
                          placeholder="e.g. Spare parts"
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="any"
                          value={pkg.length}
                          onChange={(e) => handlePackageChange(idx, 'length', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="any"
                          value={pkg.width}
                          onChange={(e) => handlePackageChange(idx, 'width', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="any"
                          value={pkg.height}
                          onChange={(e) => handlePackageChange(idx, 'height', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="any"
                          value={pkg.weight}
                          onChange={(e) => handlePackageChange(idx, 'weight', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 text-right"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removePackageRow(idx)}
                          disabled={packages.length === 1}
                          className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Stacked Card Layout (only visible on mobile) */}
            <div className="block sm:hidden space-y-4">
              {packages.map((pkg, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/30 relative space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-xs font-extrabold text-slate-800">Package #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePackageRow(idx)}
                      disabled={packages.length === 1}
                      className="text-red-500 hover:text-red-700 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Piece Type</label>
                      <select
                        value={pkg.piece_type}
                        onChange={(e) => handlePackageChange(idx, 'piece_type', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-500 bg-white"
                      >
                        {['Carton', 'Pallet', 'Box', 'Crate', 'Container', 'Envelope'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quantity *</label>
                      <input
                        type="number"
                        required
                        value={pkg.quantity}
                        onChange={(e) => handlePackageChange(idx, 'quantity', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Content Description</label>
                      <input
                        type="text"
                        value={pkg.description}
                        onChange={(e) => handlePackageChange(idx, 'description', e.target.value)}
                        placeholder="e.g. Spare parts"
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Length (cm)</label>
                      <input
                        type="number"
                        step="any"
                        value={pkg.length}
                        onChange={(e) => handlePackageChange(idx, 'length', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-500 text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Width (cm)</label>
                      <input
                        type="number"
                        step="any"
                        value={pkg.width}
                        onChange={(e) => handlePackageChange(idx, 'width', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-500 text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Height (cm)</label>
                      <input
                        type="number"
                        step="any"
                        value={pkg.height}
                        onChange={(e) => handlePackageChange(idx, 'height', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-500 text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Weight (kg)</label>
                      <input
                        type="number"
                        step="any"
                        value={pkg.weight}
                        onChange={(e) => handlePackageChange(idx, 'weight', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-cyan-500 text-right"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Action Buttons */}
        <Box className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button
            component={Link}
            href="/dashboard/shipments"
            variant="outlined"
            size="large"
            sx={{ textTransform: 'none', borderRadius: 2, width: { xs: '100%', sm: 'auto' } }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={createShipmentMutation.isPending}
            startIcon={<Save className="h-4 w-4" />}
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
            {createShipmentMutation.isPending ? 'Registering...' : 'Save Shipment'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
