import React, { useState, useEffect, useRef } from 'react';
import { User, FMSRow, AppStage, STAGE_NAMES } from '../types';
import { googleSheetService } from '../services/googleSheetService';
import { 
  CheckCircle2, Search, Calendar, Upload, 
  RefreshCw, X, Save, Loader2, Info
} from 'lucide-react';

interface FmsTableProps {
  user: User;
  targetStage: AppStage;
}

const FmsTable: React.FC<FmsTableProps> = ({ user, targetStage }) => {
  const [data, setData] = useState<FMSRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState<FMSRow | null>(null);
  const [stepData, setStepData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, [targetStage]);

  const loadData = async () => {
    setLoading(true);
    const result = await googleSheetService.fetchData();
    setData(result);
    setLoading(false);
  };

  const formatToHHMM = (timeStr: string): string => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        const hours = String(d.getUTCHours()).padStart(2, '0');
        const minutes = String(d.getUTCMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    } catch {}
    return timeStr;
  };

  const formatToDDMMYYYY = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch {}
    return dateStr;
  };

  const handleOpenUpdate = (row: FMSRow) => {
    setShowModal(row);
    const autoTrp = `TRP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (targetStage === 1) setStepData({
      trpNo: autoTrp,
      personName: row.headTraveler ?? '',
      noOfPersons: String(row.noOfTickets ?? '1'),
      from: '',
      to: '',
      typeOfTravel: (row as any).typeOfBooking ?? 'Normal',
      departureDate: formatToDDMMYYYY(row.flightDate ?? ''),
      reason: '',
    });
    if (targetStage === 2) setStepData({
      travelsName1: (row as any).travelsName1 ?? '',
      perTicketAmount1: '',
      totalAmount1: '',
      status1: 'Booked',
    });
    if (targetStage === 3) setStepData({
      statusOfTravel: 'Travelled',            // AK — Status Of Travel
      travelsName2: (row as any).travelsName2 ?? (row as any).travelsName1 ?? '', // AL — Travels Name
      perTicketAmount2: '',                   // AM — Per Ticket Amount
      totalAmount2: '',                       // AN — Total Amount
      billNumber: '',                         // AO — Bill Number
      typeOfBill: 'Common',                    // AP — Type of Bill (default to Common to hide extra fields)
      charges: '0',                            // AR — Charges
    });
    if (targetStage === 4) setStepData({ status2: 'Paid', amountPaid: '' });
    if (targetStage === 5) setStepData({ status3: 'Entered', remark: '' });
  };

  const handleUpdateSubmit = async () => {
    if (!showModal) return;
    setUpdating(showModal.bookingNo);
    const success = await googleSheetService.updateStep(showModal.bookingNo, targetStage, stepData);
    if (success) {
      setShowModal(null);
      await loadData();
    }
    setUpdating(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && showModal) {
      setUpdating(showModal.bookingNo);
      const url = await googleSheetService.uploadFile(showModal.bookingNo, targetStage, file);
      if (url) alert("File uploaded successfully.");
      setUpdating(null);
    }
  };

  const filtered = data.filter(row => {
    const matchesSearch = row.bookingNo.toLowerCase().includes(search.toLowerCase()) || 
                          row.headTraveler.toLowerCase().includes(search.toLowerCase());
    const isFirmMatch = user.firmName === 'All' || row.firmName === user.firmName;
    if (!matchesSearch || !isFirmMatch) return false;
    
    const planned = (row as any)[`planned${targetStage}`];
    const actual = (row as any)[`actual${targetStage}`];
    return planned && !actual;
  });

  const stageColors: Record<AppStage, { btn: string, header: string, badge: string }> = {
    1: { btn: 'bg-emerald-600 hover:bg-emerald-700', header: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    2: { btn: 'bg-green-600 hover:bg-green-700', header: 'bg-green-600', badge: 'bg-green-100 text-green-700' },
    3: { btn: 'bg-teal-600 hover:bg-teal-700', header: 'bg-teal-600', badge: 'bg-teal-100 text-teal-700' },
    4: { btn: 'bg-cyan-700 hover:bg-cyan-800', header: 'bg-cyan-700', badge: 'bg-cyan-100 text-cyan-700' },
    5: { btn: 'bg-slate-700 hover:bg-slate-800', header: 'bg-slate-700', badge: 'bg-slate-100 text-slate-700' },
  };

  const sc = stageColors[targetStage];

  const emptyColspan = targetStage === 1 ? 16 : targetStage === 2 ? 20 : targetStage === 3 ? 26 : 5;

  return (
    <div className="p-8 h-full flex flex-col space-y-6 bg-[#F5F7F5]">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      {/* Search & Refresh Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder={`Search in ${STAGE_NAMES[targetStage]} queue...`}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all font-medium text-slate-700 placeholder:text-slate-300 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={loadData} 
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw className={`text-slate-400 hover:text-emerald-600 ${loading ? 'animate-spin text-emerald-600' : ''}`} size={20} />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              {targetStage === 1 ? (
                <tr>
                  <th className="th-cell">#</th>
                  <th className="th-cell">Booking No.</th>
                  <th className="th-cell">Firm Name</th>
                  <th className="th-cell">Head Traveler</th>
                  <th className="th-cell">Other Travelers</th>
                  <th className="th-cell">Flight Date</th>
                  <th className="th-cell">Flight Time</th>
                  <th className="th-cell">No. of Tickets</th>
                  <th className="th-cell">Type of Booking</th>
                  <th className="th-cell">Booked By</th>
                  <th className="th-cell">Agent Name</th>
                  <th className="th-cell">Agent Rate</th>
                  <th className="th-cell">Self Name</th>
                  <th className="th-cell">Self Rate</th>
                  <th className="th-cell">Planned Date</th>
                  <th className="th-cell">Action</th>
                </tr>
              ) : targetStage === 2 ? (
                <tr>
                  <th className="th-cell">#</th>
                  <th className="th-cell">Booking No.</th>
                  <th className="th-cell">Firm Name</th>
                  <th className="th-cell">Flight Date</th>
                  <th className="th-cell">Flight Time</th>
                  <th className="th-cell">No. of Tickets</th>
                  <th className="th-cell">Type of Booking</th>
                  <th className="th-cell">Agent Name</th>
                  <th className="th-cell">Agent Rate</th>
                  <th className="th-cell">Self Name</th>
                  <th className="th-cell">Self Rate</th>
                  <th className="th-cell">TRP No.</th>
                  <th className="th-cell">Person Name</th>
                  <th className="th-cell">From</th>
                  <th className="th-cell">To</th>
                  <th className="th-cell">Type of Travel / Stay</th>
                  <th className="th-cell">Departure Date</th>
                  <th className="th-cell">Reason</th>
                  <th className="th-cell">Cleartrip Photo</th>
                  <th className="th-cell">Action</th>
                </tr>
              ) : targetStage === 3 ? (
                <tr>
                  <th className="th-cell">#</th>
                  <th className="th-cell">Booking No.</th>
                  <th className="th-cell">Firm Name</th>
                  <th className="th-cell">Flight Date</th>
                  <th className="th-cell">Flight Time</th>
                  <th className="th-cell">No. of Tickets</th>
                  <th className="th-cell">Type of Booking</th>
                  <th className="th-cell">Agent Name</th>
                  <th className="th-cell">Agent Rate</th>
                  <th className="th-cell">Self Name</th>
                  <th className="th-cell">Self Rate</th>
                  <th className="th-cell">TRP No.</th>
                  <th className="th-cell">Person Name</th>
                  <th className="th-cell">No. of Persons</th>
                  <th className="th-cell">From</th>
                  <th className="th-cell">To</th>
                  <th className="th-cell">Type of Travel / Stay</th>
                  <th className="th-cell">Departure Date</th>
                  <th className="th-cell">Reason</th>
                  <th className="th-cell">Photo of Cleartrip</th>
                  <th className="th-cell">Travels Name</th>
                  <th className="th-cell">Per Ticket Amount</th>
                  <th className="th-cell">Total Amount</th>
                  <th className="th-cell">Status 1</th>
                  <th className="th-cell">Planned Date</th>
                  <th className="th-cell">Action</th>
                </tr>
              ) : (
                <tr>
                  <th className="th-cell">Reference ID</th>
                  <th className="th-cell">Firm</th>
                  <th className="th-cell">Primary Traveler</th>
                  <th className="th-cell">Planned Date</th>
                  <th className="th-cell">Action</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={emptyColspan} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Synchronizing Data...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={emptyColspan} className="py-24 text-center">
                    <Info className="mx-auto mb-3 text-slate-300" size={36} />
                    <p className="text-sm font-semibold text-slate-400">Queue is currently empty</p>
                    <p className="text-xs text-slate-300 mt-1">No records available for this stage.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((row, index) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    {targetStage === 1 ? (
                      <>
                        <td className="td-cell text-xs text-slate-400 font-semibold">{index + 1}</td>
                        <td className="td-cell">
                          <span className="font-bold text-slate-800 text-sm">#{row.bookingNo}</span>
                        </td>
                        <td className="td-cell">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${sc.badge}`}>
                            {row.firmName}
                          </span>
                        </td>
                        <td className="td-cell">
                          <p className="font-semibold text-slate-800 text-sm whitespace-nowrap">{row.headTraveler}</p>
                        </td>
                        <td className="td-cell">
                          {(row as any).otherTravelers ? (
                            <p className="text-xs text-slate-500 max-w-[140px] truncate" title={(row as any).otherTravelers}>
                              {(row as any).otherTravelers}
                            </p>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="td-cell">
                          <p className="font-semibold text-slate-700 text-sm whitespace-nowrap">{formatToDDMMYYYY(row.flightDate ?? '')}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm text-slate-600 whitespace-nowrap">{formatToHHMM(row.flightTime ?? '')}</p>
                        </td>
                        <td className="td-cell text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
                            {row.noOfTickets}
                          </span>
                        </td>
                        <td className="td-cell">
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                            {(row as any).typeOfBooking ?? '—'}
                          </span>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs text-slate-500 whitespace-nowrap">{row.bookedBy}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs font-medium text-slate-600 whitespace-nowrap">
                            {(row as any).agentName ?? '—'}
                          </p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">₹{row.agentRate}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs font-medium text-slate-600 whitespace-nowrap">
                            {(row as any).selfName ?? '—'}
                          </p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-emerald-600 whitespace-nowrap">₹{row.selfRate}</p>
                        </td>
                        <td className="td-cell">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg w-fit border border-slate-200 whitespace-nowrap mx-auto">
                            <Calendar size={13} className="text-emerald-600" />
                            {formatToDDMMYYYY((row as any).planned1 ?? '')}
                          </div>
                        </td>
                      </>
                    ) : targetStage === 2 ? (
                      <>
                        <td className="td-cell text-xs text-slate-400 font-semibold">{index + 1}</td>
                        <td className="td-cell">
                          <span className="font-bold text-slate-800 text-sm">#{row.bookingNo}</span>
                        </td>
                        <td className="td-cell">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${sc.badge}`}>{row.firmName}</span>
                        </td>
                        <td className="td-cell">
                          <p className="font-semibold text-slate-700 text-sm whitespace-nowrap">{formatToDDMMYYYY(row.flightDate ?? '')}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm text-slate-600 whitespace-nowrap">{formatToHHMM(row.flightTime ?? '')}</p>
                        </td>
                        <td className="td-cell">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm mx-auto">
                            {row.noOfTickets}
                          </span>
                        </td>
                        <td className="td-cell">
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{(row as any).typeOfBooking ?? '—'}</span>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs font-medium text-slate-600 whitespace-nowrap">{(row as any).agentName ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">₹{row.agentRate}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs font-medium text-slate-600 whitespace-nowrap">{(row as any).selfName ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-emerald-600 whitespace-nowrap">₹{row.selfRate}</p>
                        </td>
                        <td className="td-cell">
                          <span className="text-xs font-mono font-bold text-slate-500 whitespace-nowrap">{(row as any).trpNo ?? '—'}</span>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">{(row as any).personName ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs text-slate-600 whitespace-nowrap">{(row as any).from ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs text-slate-600 whitespace-nowrap">{(row as any).to ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{(row as any).typeOfTravel ?? '—'}</span>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">{(row as any).departureDate ? formatToDDMMYYYY((row as any).departureDate) : '—'}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs text-slate-500 max-w-[160px] truncate" title={(row as any).reason ?? ''}>{(row as any).reason ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          {(row as any).cleartripPhotoUrl ? (
                            <a href={(row as any).cleartripPhotoUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 underline underline-offset-2">
                              View
                            </a>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </>
                    ) : targetStage === 3 ? (
                      <>
                        <td className="td-cell text-xs text-slate-400 font-semibold">{index + 1}</td>
                        <td className="td-cell">
                          <span className="font-bold text-slate-800 text-sm">#{row.bookingNo}</span>
                        </td>
                        <td className="td-cell">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${sc.badge}`}>{row.firmName}</span>
                        </td>
                        <td className="td-cell">
                          <p className="font-semibold text-slate-700 text-sm whitespace-nowrap">{formatToDDMMYYYY(row.flightDate ?? '')}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm text-slate-600 whitespace-nowrap">{formatToHHMM(row.flightTime ?? '')}</p>
                        </td>
                        <td className="td-cell">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm mx-auto">
                            {row.noOfTickets}
                          </span>
                        </td>
                        <td className="td-cell">
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{(row as any).typeOfBooking ?? '—'}</span>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs font-medium text-slate-600 whitespace-nowrap">{(row as any).agentName ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">₹{row.agentRate}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs font-medium text-slate-600 whitespace-nowrap">{(row as any).selfName ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-emerald-600 whitespace-nowrap">₹{row.selfRate}</p>
                        </td>
                        <td className="td-cell">
                          <span className="text-xs font-mono font-bold text-slate-500 whitespace-nowrap">{(row as any).trpNo ?? '—'}</span>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">{(row as any).personName ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm mx-auto">
                            {(row as any).noOfPersons ?? row.noOfTickets ?? '—'}
                          </span>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs text-slate-600 whitespace-nowrap">{(row as any).from ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs text-slate-600 whitespace-nowrap">{(row as any).to ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{(row as any).typeOfTravel ?? '—'}</span>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                            {(row as any).departureDate ? formatToDDMMYYYY((row as any).departureDate) : '—'}
                          </p>
                        </td>
                        <td className="td-cell">
                          <p className="text-xs text-slate-500 max-w-[160px] truncate" title={(row as any).reason ?? ''}>
                            {(row as any).reason ?? '—'}
                          </p>
                        </td>
                        <td className="td-cell">
                          {(row as any).cleartripPhotoUrl ? (
                            <a href={(row as any).cleartripPhotoUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 underline underline-offset-2">
                              View
                            </a>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="td-cell">
                          <p className="text-xs font-medium text-slate-600 whitespace-nowrap">{(row as any).travelsName1 ?? '—'}</p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                            {(row as any).perTicketAmount1 ? `₹${(row as any).perTicketAmount1}` : '—'}
                          </p>
                        </td>
                        <td className="td-cell">
                          <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                            {(row as any).totalAmount1 ? `₹${(row as any).totalAmount1}` : '—'}
                          </p>
                        </td>
                        <td className="td-cell">
                          {(row as any).status1 ? (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${sc.badge}`}>
                              {(row as any).status1}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="td-cell">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg w-fit border border-slate-200 whitespace-nowrap mx-auto">
                            <Calendar size={13} className="text-emerald-600" />
                            {formatToDDMMYYYY((row as any).planned3 ?? '')}
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="td-cell font-bold text-slate-800">#{row.bookingNo}</td>
                        <td className="td-cell">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${sc.badge}`}>{row.firmName}</span>
                        </td>
                        <td className="td-cell font-semibold text-slate-800 text-sm">{row.headTraveler}</td>
                        <td className="td-cell">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg w-fit border border-slate-200">
                            <Calendar size={13} className="text-emerald-600" />
                            {formatToDDMMYYYY((row as any)[`planned${targetStage}`] ?? '')}
                          </div>
                        </td>
                      </>
                    )}

                    {/* Action Button */}
                    <td className="td-cell">
                      <button
                        onClick={() => handleOpenUpdate(row)}
                        className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-all active:scale-95 inline-flex items-center gap-2 shadow-sm whitespace-nowrap ${sc.btn}`}
                      >
                        <CheckCircle2 size={14} /> Update Actual
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`px-8 py-6 text-white flex justify-between items-center ${sc.header}`}>
              <div>
                <h3 className="text-xl font-black tracking-tight">{STAGE_NAMES[targetStage]} — Action</h3>
                <p className="text-white/70 text-xs font-semibold mt-0.5 uppercase tracking-widest">Reference #{showModal.bookingNo}</p>
              </div>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-5 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {targetStage === 1 && (
                  <>
                    <div className="md:col-span-2">
                      <label className="field-label">TRP Number (System Generated)</label>
                      <input type="text" readOnly className="field-input bg-slate-50 text-slate-400 cursor-not-allowed" value={stepData.trpNo} />
                    </div>
                    <div>
                      <label className="field-label">Person Name</label>
                      <input type="text" className="field-input" value={stepData.personName} onChange={e => setStepData({...stepData, personName: e.target.value})} placeholder="Full Name" />
                    </div>
                    <div>
                      <label className="field-label">Number of Persons</label>
                      <input type="number" className="field-input" value={stepData.noOfPersons} onChange={e => setStepData({...stepData, noOfPersons: e.target.value})} min="1" />
                    </div>
                    <div>
                      <label className="field-label">Departure From</label>
                      <input type="text" className="field-input" value={stepData.from} onChange={e => setStepData({...stepData, from: e.target.value})} placeholder="City / Airport" />
                    </div>
                    <div>
                      <label className="field-label">Arrival To</label>
                      <input type="text" className="field-input" value={stepData.to} onChange={e => setStepData({...stepData, to: e.target.value})} placeholder="City / Airport" />
                    </div>
                    <div>
                      <label className="field-label">Departure Date</label>
                      <input type="text" className="field-input" value={stepData.departureDate} onChange={e => setStepData({...stepData, departureDate: e.target.value})} placeholder="dd/mm/yyyy" />
                    </div>
                    <div>
                      <label className="field-label">Travel Category</label>
                      <select className="field-input" value={stepData.typeOfTravel} onChange={e => setStepData({...stepData, typeOfTravel: e.target.value})}>
                        <option>Normal</option>
                        <option>Stay Included</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="field-label">Operational Reason</label>
                      <textarea className="field-input h-24 resize-none" value={stepData.reason} onChange={e => setStepData({...stepData, reason: e.target.value})} placeholder="Brief reason for travel..." />
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="md:col-span-2 p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-3 text-slate-500 font-semibold text-sm hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all">
                      <Upload size={18} /> Upload Cleartrip Confirmation
                    </button>
                  </>
                )}

                {targetStage === 2 && (
                  <>
                    <div className="md:col-span-2">
                      <label className="field-label">Travel Agency Name</label>
                      <input
                        type="text"
                        className="field-input"
                        value={stepData.travelsName1}
                        onChange={e => setStepData({...stepData, travelsName1: e.target.value})}
                        placeholder="Agency Name"
                      />
                    </div>
                    <div>
                      <label className="field-label">Per Ticket Price (₹)</label>
                      <input type="number" className="field-input" value={stepData.perTicketAmount1} onChange={e => setStepData({...stepData, perTicketAmount1: e.target.value})} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="field-label">Total Amount (₹)</label>
                      <input type="number" className="field-input" value={stepData.totalAmount1} onChange={e => setStepData({...stepData, totalAmount1: e.target.value})} placeholder="0.00" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="field-label">Ticket Status</label>
                      <select className="field-input" value={stepData.status1} onChange={e => setStepData({...stepData, status1: e.target.value})}>
                        <option>Booked</option>
                        <option>Booked And Cancel</option>
                      </select>
                    </div>
                  </>
                )}

                {/* ── STAGE 3 — All 8 fields (AK → AR) ── */}
                {targetStage === 3 && (
                  <>
                    {/* AK — Status Of Travel */}
                    <div>
                      <label className="field-label">Status Of Travel</label>
                      <select
                        className="field-input"
                        value={stepData.statusOfTravel}
                        onChange={e => setStepData({...stepData, statusOfTravel: e.target.value})}
                      >
                        <option>Travelled</option>
                        <option>Rescheduled</option>
                        <option>Cancelled</option>
                      </select>
                    </div>

                    {/* AL — Travels Name */}
                    <div>
                      <label className="field-label">Travels Name</label>
                      <input
                        type="text"
                        className="field-input"
                        value={stepData.travelsName2}
                        onChange={e => setStepData({...stepData, travelsName2: e.target.value})}
                        placeholder="Travel Agency Name"
                      />
                    </div>

                    {/* AM — Per Ticket Amount */}
                    <div>
                      <label className="field-label">Per Ticket Amount (₹)</label>
                      <input
                        type="number"
                        className="field-input"
                        value={stepData.perTicketAmount2}
                        onChange={e => setStepData({...stepData, perTicketAmount2: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>

                    {/* AN — Total Amount */}
                    <div>
                      <label className="field-label">Total Amount (₹)</label>
                      <input
                        type="number"
                        className="field-input"
                        value={stepData.totalAmount2}
                        onChange={e => setStepData({...stepData, totalAmount2: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>

                    {/* AO — Bill Number */}
                    <div>
                      <label className="field-label">Bill Number</label>
                      <input
                        type="text"
                        className="field-input"
                        value={stepData.billNumber}
                        onChange={e => setStepData({...stepData, billNumber: e.target.value})}
                        placeholder="Bill / Invoice No."
                      />
                    </div>

                    {/* AP — Type of Bill */}
                    <div>
                      <label className="field-label">Type of Bill</label>
                      <select
                        className="field-input"
                        value={stepData.typeOfBill}
                        onChange={e => setStepData({...stepData, typeOfBill: e.target.value})}
                      >
                        <option>Independent</option>
                        <option>Common</option>
                      </select>
                    </div>

                    {/* AR — Charges (only shown if Independent) */}
                    {stepData.typeOfBill === 'Independent' && (
                      <div>
                        <label className="field-label">Charges (₹)</label>
                        <input
                          type="number"
                          className="field-input"
                          value={stepData.charges}
                          onChange={e => setStepData({...stepData, charges: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    )}

                    {/* AQ — Copy Of Bill (file upload) — only shown if Independent */}
                    {stepData.typeOfBill === 'Independent' && (
                      <div>
                        <label className="field-label">Copy Of Bill</label>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full p-3.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-500 font-semibold text-sm hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                        >
                          <Upload size={16} /> Upload Bill Copy
                        </button>
                      </div>
                    )}
                  </>
                )}

                {targetStage === 4 && (
                  <>
                    <div>
                      <label className="field-label">Payment Status</label>
                      <select className="field-input" value={stepData.status2} onChange={e => setStepData({...stepData, status2: e.target.value})}>
                        <option>Paid</option>
                        <option>Partial</option>
                        <option>Pending</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Amount Paid (₹)</label>
                      <input type="number" className="field-input" value={stepData.amountPaid} onChange={e => setStepData({...stepData, amountPaid: e.target.value})} placeholder="0.00" />
                    </div>
                  </>
                )}

                {targetStage === 5 && (
                  <>
                    <div className="md:col-span-2">
                      <label className="field-label">Tally Ledger Status</label>
                      <select className="field-input" value={stepData.status3} onChange={e => setStepData({...stepData, status3: e.target.value})}>
                        <option>Entered</option>
                        <option>Review Required</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="field-label">Accounting Remark</label>
                      <textarea className="field-input h-36 resize-none" value={stepData.remark} onChange={e => setStepData({...stepData, remark: e.target.value})} placeholder="Enter accounting remarks here..." />
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-4">
              <button onClick={() => setShowModal(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                Discard Changes
              </button>
              <button
                onClick={handleUpdateSubmit}
                disabled={updating !== null}
                className={`px-8 py-2.5 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-60 ${sc.btn}`}
              >
                {updating ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Commit Actual
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .th-cell {
          padding: 1rem 1.25rem;
          font-weight: 700;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
          text-align: center;
        }
        .td-cell {
          padding: 1rem 1.25rem;
          text-align: center;
        }
        .field-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          font-weight: 500;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
        }
        .field-input:focus {
          background: white;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default FmsTable;