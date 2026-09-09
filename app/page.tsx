'use client';
import React, { useState, useEffect } from 'react';
import { 
  Calculator, CheckCircle, UploadCloud, Building2, 
  Menu, LayoutDashboard, FileText, LineChart, CalendarOff, 
  Wrench, Zap, Bell, Calendar, Download
} from 'lucide-react';

const AUSSIE_STAFF = [
  { id: 1, name: "Lachlan Kelly", role: "Lead Tech", rate: 42.00, defaultSite: "Sydney CBD", alBalance: 120, sickBalance: 45, toolLoan: 0, weeklyDeduction: 0 },
  { id: 2, name: "Chloe Smith", role: "Technician", rate: 35.00, defaultSite: "Parramatta", alBalance: 85, sickBalance: 30, toolLoan: 450.00, weeklyDeduction: 50.00 },
  { id: 3, name: "Mateo Rossi", role: "Technician", rate: 35.00, defaultSite: "North Sydney", alBalance: 40, sickBalance: 15, toolLoan: 120.50, weeklyDeduction: 25.00 },
  { id: 4, name: "Harper Jones", role: "Apprentice", rate: 28.00, defaultSite: "Bondi Junction", alBalance: 15, sickBalance: 8, toolLoan: 850.00, weeklyDeduction: 100.00 },
  { id: 5, name: "Jackson Williams", role: "Technician", rate: 35.00, defaultSite: "Chatswood", alBalance: 110, sickBalance: 38, toolLoan: 0, weeklyDeduction: 0 },
  { id: 6, name: "Mia Taylor", role: "Technician", rate: 35.00, defaultSite: "Surry Hills", alBalance: 65, sickBalance: 22, toolLoan: 0, weeklyDeduction: 0 },
];

const EMPTY_WEEK = [
  { day: 'Mon', date: '10 Aug', site: '', start: '', end: '', hrs: 0, jobNo: '', details: '', allowance: 0 },
  { day: 'Tue', date: '11 Aug', site: '', start: '', end: '', hrs: 0, jobNo: '', details: '', allowance: 0 },
  { day: 'Wed', date: '12 Aug', site: '', start: '', end: '', hrs: 0, jobNo: '', details: '', allowance: 0 },
  { day: 'Thu', date: '13 Aug', site: '', start: '', end: '', hrs: 0, jobNo: '', details: '', allowance: 0 },
  { day: 'Fri', date: '14 Aug', site: '', start: '', end: '', hrs: 0, jobNo: '', details: '', allowance: 0 },
  { day: 'Sat', date: '15 Aug', site: '', start: '', end: '', hrs: 0, jobNo: '', details: '', allowance: 0 },
  { day: 'Sun', date: '16 Aug', site: '', start: '', end: '', hrs: 0, jobNo: '', details: '', allowance: 0 },
];

export default function ShiftSmartUltimate() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timesheets' | 'analytics' | 'leave' | 'deductions'>('dashboard');
  const [activeEmployeeId, setActiveEmployeeId] = useState(1);
  const [timesheets, setTimesheets] = useState<Record<number, typeof EMPTY_WEEK>>({});
  const [staffData, setStaffData] = useState(AUSSIE_STAFF);
  const [notification, setNotification] = useState('');
  const [exportModal, setExportModal] = useState(false);
  const [payPeriod, setPayPeriod] = useState('3 Aug - 16 Aug 2026 (Fortnightly)');

  useEffect(() => {
    if (Object.keys(timesheets).length === 0) {
      const initial: Record<number, typeof EMPTY_WEEK> = {};
      staffData.forEach(staff => { initial[staff.id] = JSON.parse(JSON.stringify(EMPTY_WEEK)); });
      setTimesheets(initial);
    }
  }, [staffData, timesheets]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleBulkFillAll = () => {
    const updated = { ...timesheets };
    staffData.forEach(staff => {
      const newSheet = [...(updated[staff.id] || EMPTY_WEEK)];
      for (let i = 0; i < 5; i++) {
        newSheet[i] = { ...newSheet[i], site: newSheet[i].site || staff.defaultSite, start: '08:00', end: '16:30', hrs: 8.0, details: newSheet[i].details || 'Standard site works' };
      }
      updated[staff.id] = newSheet;
    });
    setTimesheets(updated);
    showToast("⚡ Standard Week applied to all active staff");
  };

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let diff = (eH + eM / 60) - (sH + sM / 60);
    if (diff > 5) diff -= 0.5;
    return Math.max(0, diff);
  };

  const handleUpdateRow = (empId: number, index: number, field: string, value: string | number) => {
    const newSheet = [...(timesheets[empId] || EMPTY_WEEK)];
    newSheet[index] = { ...newSheet[index], [field]: value };
    if (field === 'start' || field === 'end') {
      newSheet[index].hrs = calculateHours(newSheet[index].start, newSheet[index].end);
    }
    setTimesheets(prev => ({ ...prev, [empId]: newSheet }));
  };

  const handleUpdateToolLoan = (empId: number, newLoan: number) => {
    setStaffData(prev => prev.map(s => s.id === empId ? { ...s, toolLoan: newLoan } : s));
    showToast("Outstanding Tool Loan updated successfully");
  };

  const handleUpdateWeeklyDeduction = (empId: number, newDeduction: number) => {
    setStaffData(prev => prev.map(s => s.id === empId ? { ...s, weeklyDeduction: newDeduction } : s));
    showToast("Weekly Deduction updated successfully");
  };

  const getStaffTotals = (id: number) => {
    const sheet = timesheets[id] || EMPTY_WEEK;
    const hrs = sheet.reduce((sum, row) => sum + (row.hrs || 0), 0);
    const allowances = sheet.reduce((sum, row) => sum + (Number(row.allowance) || 0), 0);
    const emp = staffData.find(e => e.id === id)!;
    const base = hrs * emp.rate;
    const holidayPay = base * 0.08;
    
    const weeklyLoanDeduction = emp.toolLoan > 0 ? Math.min(emp.toolLoan, emp.weeklyDeduction) : 0;
    const gross = base + holidayPay + allowances - weeklyLoanDeduction;
    
    return { hrs, base, holidayPay, allowances, weeklyLoanDeduction, gross };
  };

  const dashboardStats = staffData.map(staff => ({ ...staff, ...getStaffTotals(staff.id) }));
  const totalFleetHours = dashboardStats.reduce((sum, s) => sum + s.hrs, 0);
  const totalFleetGross = dashboardStats.reduce((sum, s) => sum + s.gross, 0);

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500 font-medium">Active Fleet</p><p className="text-3xl font-bold text-slate-800">{staffData.length}</p></div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500 font-medium">Total Period Hours</p><p className="text-3xl font-bold text-indigo-600">{totalFleetHours.toFixed(1)}h</p></div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500 font-medium">Est. Net Liability</p><p className="text-3xl font-bold text-emerald-600">${totalFleetGross.toFixed(2)}</p></div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><p className="text-sm text-slate-500 font-medium">Pay Period</p><p className="text-sm font-bold text-slate-700 mt-2">{payPeriod}</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800">Payroll Master Summary</h3>
            <select 
              value={payPeriod} 
              onChange={(e) => setPayPeriod(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              <option>3 Aug - 16 Aug 2026 (Fortnightly)</option>
              <option>19 Jul - 1 Aug 2026 (Fortnightly)</option>
              <option>5 Jul - 18 Jul 2026 (Fortnightly)</option>
            </select>
          </div>
          <button onClick={() => setExportModal(true)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800">
            <UploadCloud className="h-4 w-4" /> Process & Export
          </button>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
            <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4 text-center">Hours</th><th className="px-6 py-4">Base Rate</th><th className="px-6 py-4">+8% Holiday Pay</th><th className="px-6 py-4 text-right">Net Payout</th><th className="px-6 py-4 text-center">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dashboardStats.map(staff => (
              <tr key={staff.id} className="hover:bg-slate-50">
                <td className="px-6 py-4"><p className="font-bold text-slate-800">{staff.name}</p><p className="text-xs text-slate-500">{staff.role}</p></td>
                <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${staff.hrs > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{staff.hrs.toFixed(1)}h</span></td>
                <td className="px-6 py-4">${staff.rate.toFixed(2)}</td>
                <td className="px-6 py-4 text-emerald-600 font-medium">+${staff.holidayPay.toFixed(2)}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-800">${staff.gross.toFixed(2)}</td>
                <td className="px-6 py-4 text-center"><button onClick={() => { setActiveEmployeeId(staff.id); setActiveTab('timesheets'); }} className="text-indigo-600 font-medium text-sm hover:underline">Edit Sheet</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTimesheets = () => {
    const emp = staffData.find(e => e.id === activeEmployeeId)!;
    const sheet = timesheets[activeEmployeeId] || EMPTY_WEEK;
    const totals = getStaffTotals(activeEmployeeId);

    return (
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <select 
                  value={activeEmployeeId} 
                  onChange={(e) => setActiveEmployeeId(Number(e.target.value))}
                  className="bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {staffData.map(s => <option key={s.id} value={s.id}>{s.name} - {s.role}</option>)}
                </select>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">Pay Period: {payPeriod.split(' ')[0]} - {payPeriod.split(' ')[2]}</span>
              </div>
              <button onClick={handleBulkFillAll} className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded text-sm font-medium flex items-center gap-2 hover:bg-indigo-100"><Zap className="h-4 w-4"/> Auto-Fill Standard Week</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
                  <tr><th className="px-4 py-3">Day</th><th className="px-4 py-3">Site/Job</th><th className="px-4 py-3">In</th><th className="px-4 py-3">Out</th><th className="px-4 py-3 text-center">Hrs</th><th className="px-4 py-3">Allowances ($)</th><th className="px-4 py-3 w-1/3">Job Details</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sheet.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-700 w-24">{row.day} <span className="text-slate-400 text-xs ml-1">{row.date}</span></td>
                      <td className="px-2 py-2"><input type="text" value={row.site} onChange={(e) => handleUpdateRow(activeEmployeeId, i, 'site', e.target.value)} className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded px-2 py-1 text-sm" placeholder="Location/Job#" /></td>
                      <td className="px-2 py-2"><input type="time" value={row.start} onChange={(e) => handleUpdateRow(activeEmployeeId, i, 'start', e.target.value)} className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-2 py-2"><input type="time" value={row.end} onChange={(e) => handleUpdateRow(activeEmployeeId, i, 'end', e.target.value)} className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded px-2 py-1 text-sm" /></td>
                      <td className="px-4 py-3 text-center font-bold text-indigo-600 bg-indigo-50/30">{row.hrs ? row.hrs.toFixed(2) : '-'}</td>
                      <td className="px-2 py-2"><input type="number" value={row.allowance || ''} onChange={(e) => handleUpdateRow(activeEmployeeId, i, 'allowance', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-300 rounded px-2 py-1 text-sm text-emerald-700 font-medium" placeholder="Fuel/Travel" /></td>
                      <td className="px-2 py-2"><input type="text" value={row.details} onChange={(e) => handleUpdateRow(activeEmployeeId, i, 'details', e.target.value)} className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded px-2 py-1 text-sm" placeholder="Work performed..." /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6 text-white">
            <h3 className="font-bold text-lg text-slate-100 mb-6 flex items-center gap-2"><Calculator className="h-5 w-5 text-indigo-400" /> Payslip Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-300 border-b border-slate-700 pb-2"><span>Base Wages ({totals.hrs.toFixed(1)}h)</span><span className="font-medium">${totals.base.toFixed(2)}</span></div>
              <div className="flex justify-between items-center text-emerald-300 border-b border-slate-700 pb-2"><span>+ 8% Holiday Pay</span><span className="font-medium">+${totals.holidayPay.toFixed(2)}</span></div>
              <div className="flex justify-between items-center text-emerald-300 border-b border-slate-700 pb-2"><span>+ Allowances</span><span className="font-medium">+${totals.allowances.toFixed(2)}</span></div>
              {emp.toolLoan > 0 && (
                <div className="flex justify-between items-center text-rose-300 border-b border-slate-700 pb-2"><span>- Tool Loan Repayment</span><span>-${totals.weeklyLoanDeduction.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between items-center text-slate-200 pt-2 text-lg"><span>Net Payout</span><span className="font-bold text-emerald-400">${totals.gross.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-indigo-500"/> Job Costing & Margins (Mock)</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium">Job #88231 (Sydney CBD)</span><span className="text-slate-500">Cost: $2,450 / Sell: $3,800</span></div>
              <div className="w-full bg-slate-100 rounded-full h-3"><div className="bg-emerald-500 h-3 rounded-full" style={{width: '64%'}}></div></div>
              <p className="text-xs text-emerald-600 mt-1 font-bold">36% Margin</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium">Job #88232 (Parramatta)</span><span className="text-slate-500">Cost: $1,200 / Sell: $1,400</span></div>
              <div className="w-full bg-slate-100 rounded-full h-3"><div className="bg-amber-500 h-3 rounded-full" style={{width: '85%'}}></div></div>
              <p className="text-xs text-amber-600 mt-1 font-bold">14% Margin (Warning)</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><LineChart className="h-5 w-5 text-indigo-500"/> Overtime Tracking</h3>
          <div className="flex items-end gap-2 h-40 mt-6 border-b border-slate-200 pb-2">
            {[12, 8, 15, 22, 10, 5, 2].map((val, i) => (
              <div key={i} className="w-full bg-indigo-100 rounded-t relative group">
                <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t transition-all" style={{height: `${(val/25)*100}%`}}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeave = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-slate-200"><h3 className="font-bold text-slate-800 flex items-center gap-2"><CalendarOff className="h-5 w-5 text-indigo-500"/> Leave Balances (AL & Sick)</h3></div>
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase">
          <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4">Annual Leave (Hrs)</th><th className="px-6 py-4">Sick Leave (Hrs)</th><th className="px-6 py-4">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {staffData.map(staff => (
            <tr key={staff.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-bold text-slate-800">{staff.name}</td>
              <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${staff.alBalance > 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{staff.alBalance}</span></td>
              <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{staff.sickBalance}</span></td>
              <td className="px-6 py-4"><button onClick={() => showToast(`Leave application opened for ${staff.name}`)} className="text-indigo-600 font-medium hover:underline text-xs">Record Leave</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDeductions = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Wrench className="h-5 w-5 text-indigo-500"/> Tool Loans & Deductions Manager</h3>
        <p className="text-xs text-slate-500 font-medium">Changes apply immediately to payroll calculations.</p>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase">
          <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4">Outstanding Tool Loan ($)</th><th className="px-6 py-4">Weekly Deduction ($)</th><th className="px-6 py-4 text-center">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {staffData.map(staff => (
            <tr key={staff.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-bold text-slate-800">{staff.name}</td>
              <td className="px-6 py-4">
                <input 
                  type="number" 
                  value={staff.toolLoan} 
                  onChange={(e) => handleUpdateToolLoan(staff.id, parseFloat(e.target.value) || 0)}
                  className="w-32 bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-sm font-mono font-bold text-rose-600 focus:bg-white focus:border-indigo-500" 
                />
              </td>
              <td className="px-6 py-4">
                <input 
                  type="number" 
                  value={staff.weeklyDeduction} 
                  onChange={(e) => handleUpdateWeeklyDeduction(staff.id, parseFloat(e.target.value) || 0)}
                  disabled={staff.toolLoan <= 0}
                  className={`w-32 border rounded px-3 py-1.5 text-sm font-mono focus:bg-white focus:border-indigo-500 ${staff.toolLoan > 0 ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed'}`} 
                />
              </td>
              <td className="px-6 py-4 text-center">
                {staff.toolLoan > 0 
                  ? <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Active Recovery</span>
                  : <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">Settled</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      {notification && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium animate-bounce">
          <Bell className="h-5 w-5" />{notification}
        </div>
      )}

      {exportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 text-white p-6 text-center">
              <UploadCloud className="h-12 w-12 mx-auto mb-2 text-indigo-400" />
              <h2 className="text-xl font-bold">Process Pay Period</h2>
              <p className="text-sm text-slate-400">Target Period: {payPeriod}</p>
            </div>
            <div className="p-6 space-y-3">
              <button onClick={() => { showToast("Successfully synced to Xero Payroll!"); setExportModal(false); }} className="w-full p-4 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3"><div className="h-8 w-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-black">X</div><span className="font-bold text-slate-700">Push to Xero</span></div><CheckCircle className="h-5 w-5 text-emerald-600" />
              </button>
              <button onClick={() => setExportModal(false)} className="w-full py-3 mt-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="w-72 bg-slate-900 flex flex-col shrink-0 text-slate-300 h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><Building2 className="h-6 w-6 text-indigo-500" /> ShiftSmart</h2>
          <p className="text-xs text-indigo-400 font-medium tracking-wide mt-1 uppercase">Command Center</p>
        </div>
        
        <div className="p-4 space-y-1 border-b border-slate-800">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Modules</p>
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Master Dashboard' },
            { id: 'timesheets', icon: FileText, label: 'Timesheet Entry' },
            { id: 'analytics', icon: LineChart, label: 'Job Analytics' },
            { id: 'leave', icon: CalendarOff, label: 'Leave Tracking' },
            { id: 'deductions', icon: Wrench, label: 'Tool Loans & Deductions' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <tab.icon className="h-5 w-5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-indigo-500" /> Selected Period: <span className="font-bold text-slate-700">{payPeriod}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
              <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">AD</div>
              <span className="text-sm font-bold text-slate-700 pr-2">Admin User</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'timesheets' && renderTimesheets()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'leave' && renderLeave()}
            {activeTab === 'deductions' && renderDeductions()}
          </div>
        </div>
      </div>
    </div>
  );
}