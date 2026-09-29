import React, { useState } from 'react';
import { User } from '../types';
import { googleSheetService } from '../services/googleSheetService';
import { 
  Plane, 
  User as UserIcon, 
  Users, 
  Calendar, 
  Clock, 
  Hash, 
  Tag, 
  Building2, 
  BadgeIndianRupee, 
  Send,
  Loader2,
  CheckCircle,
  PlusCircle,
  X,
  Briefcase,
  IndianRupee
} from 'lucide-react';

interface NewBookingFormProps {
  user: User;
  onComplete: () => void;
}

const NewBookingForm: React.FC<NewBookingFormProps> = ({ user, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedByType, setBookedByType] = useState<'Self' | 'Agent' | 'Both'>('Both');
  const [formData, setFormData] = useState({
    bookingNo: `FMS-${Date.now().toString().slice(-6)}`,
    firmName: user.firmName === 'All' ? '' : user.firmName,
    headTraveler: '',
    otherTravelers: '',
    flightDate: '',
    flightTime: '',
    noOfTickets: '1',
    typeOfBooking: 'Normal',
    bookedBy: user.username,
    agentName: '',
    agentRate: '',
    selfName: '',
    selfRate: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBookedByChange = (type: 'Self' | 'Agent' | 'Both') => {
    setBookedByType(type);
    // Clear irrelevant fields when switching
    if (type === 'Self') {
      setFormData(prev => ({ ...prev, agentName: '', agentRate: '' }));
    } else if (type === 'Agent') {
      setFormData(prev => ({ ...prev, selfName: '', selfRate: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await googleSheetService.createBooking({ ...formData, bookedByType });
    
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      alert("Failed to create booking. Please try again.");
    }
    setLoading(false);
  };

  const showSelf  = bookedByType === 'Self'  || bookedByType === 'Both';
  const showAgent = bookedByType === 'Agent' || bookedByType === 'Both';

  if (success) {
    return (
      <div className="p-20 flex flex-col items-center justify-center bg-[#F0F4F1] min-h-full">
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg p-16 flex flex-col items-center text-center max-w-sm">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-md shadow-emerald-100">
            <CheckCircle size={44} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Booking Created!</h2>
          <p className="text-slate-500 font-medium mt-2 text-sm">Redirecting to Step 1 for verification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F0F4F1] min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Form Header */}
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <PlusCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">New Flight Booking</h2>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5"></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference ID</p>
                <p className="text-sm font-black text-emerald-600">#{formData.bookingNo}</p>
              </div>
              <button onClick={onComplete} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* Section 1: Basic Information */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Building2 size={14} className="text-emerald-500" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Basic Information</h3>
                <div className="flex-1 h-px bg-slate-100 ml-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="form-label">Firm Name</label>
                  <div className="input-wrapper">
                    <Building2 className="input-icon" size={16} />
                    <select
                      name="firmName"
                      value={formData.firmName}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select Firm Name</option>
                      <option value="Pmmpl">Pmmpl</option>
                      <option value="Purab">Purab</option>
                      <option value="Rkl">Rkl</option>
                      <option value="Refrasynth">Refrasynth</option>
                      <option value="Refratech">Refratech</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Booking Type</label>
                  <div className="input-wrapper">
                    <Tag className="input-icon" size={16} />
                    <select name="typeOfBooking" value={formData.typeOfBooking} onChange={handleChange} className="form-input appearance-none">
                      <option>Normal</option>
                      <option>Corporate</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Number of Tickets</label>
                  <div className="input-wrapper">
                    <Hash className="input-icon" size={16} />
                    <input type="number" name="noOfTickets" value={formData.noOfTickets} onChange={handleChange} className="form-input" min="1" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Passenger Details */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Users size={14} className="text-emerald-500" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Passenger Details</h3>
                <div className="flex-1 h-px bg-slate-100 ml-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Head Traveler</label>
                  <div className="input-wrapper">
                    <UserIcon className="input-icon" size={16} />
                    <input name="headTraveler" value={formData.headTraveler} onChange={handleChange} className="form-input" placeholder="Primary Passenger Name" required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Other Travelers</label>
                  <div className="input-wrapper">
                    <Users className="input-icon" size={16} />
                    <input name="otherTravelers" value={formData.otherTravelers} onChange={handleChange} className="form-input" placeholder="Comma separated names (optional)" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Journey Details */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Plane size={14} className="text-emerald-500" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Journey Details</h3>
                <div className="flex-1 h-px bg-slate-100 ml-1"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Flight Date</label>
                  <div className="input-wrapper">
                    <Calendar className="input-icon" size={16} />
                    <input type="date" name="flightDate" value={formData.flightDate} onChange={handleChange} className="form-input" required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Flight Time</label>
                  <div className="input-wrapper">
                    <Clock className="input-icon" size={16} />
                    <input type="time" name="flightTime" value={formData.flightTime} onChange={handleChange} className="form-input" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Rates & Agent Info */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <BadgeIndianRupee size={14} className="text-emerald-500" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Rates & Agent Information</h3>
                <div className="flex-1 h-px bg-slate-100 ml-1"></div>
              </div>

              {/* Booked By Toggle */}
              <div className="mb-6">
                <label className="form-label">Booked By</label>
                <div className="flex gap-2">
                  {(['Self', 'Agent', 'Both'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleBookedByChange(option)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        bookedByType === option
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Rate Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                {showSelf && (
                  <>
                    <div>
                      <label className="form-label">Self Name</label>
                      <div className="input-wrapper">
                        <UserIcon className="input-icon" size={16} />
                        <input
                          name="selfName"
                          value={formData.selfName}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Your Identifier"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Self Rate (₹)</label>
                      <div className="input-wrapper">
                        <IndianRupee className="input-icon" size={16} />
                        <input
                          name="selfRate"
                          value={formData.selfRate}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </>
                )}

                {showAgent && (
                  <>
                    <div>
                      <label className="form-label">Agent Name</label>
                      <div className="input-wrapper">
                        <Briefcase className="input-icon" size={16} />
                        <input
                          name="agentName"
                          value={formData.agentName}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Company / Individual"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Agent Rate (₹)</label>
                      <div className="input-wrapper">
                        <IndianRupee className="input-icon" size={16} />
                        <input
                          name="agentRate"
                          value={formData.agentRate}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onComplete}
                className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-200 flex items-center gap-2.5 transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Initialize Booking
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: #cbd5e1;
          pointer-events: none;
          flex-shrink: 0;
          z-index: 1;
        }
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          font-weight: 500;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
        }
        .form-input:focus {
          background: white;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default NewBookingForm;