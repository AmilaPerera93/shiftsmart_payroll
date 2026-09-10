'use client';

import React, { useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Edit3,
  FileDown,
  FileText,
  Gauge,
  MapPin,
  RefreshCcw,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Users,
  WalletCards,
} from 'lucide-react';

type Tab =
  | 'dashboard'
  | 'site-capture'
  | 'employee'
  | 'ird'
  | 'company'
  | 'petty-cash';

type Employee = {
  id: number;
  employeeNo: string;
  name: string;
  role: string;
  email: string;
  mobile: string;
  actualRate: number;
  irdRate: number;
  irdWeeklyHours: number;
  employmentType: string;
  bankSuffix: string;
  taxCode: string;
};

type Site = {
  id: number;
  siteCode: string;
  siteName: string;
  client: string;
  address: string;
  supervisor: string;
  supervisorPhone: string;
};

type WorkEntry = {
  id: number;
  employeeId: number;
  date: string;
  day: string;
  siteId: number;
  siteName: string;
  client: string;
  jobNo: string;
  shiftId: string;
  start: string;
  end: string;
  actualHours: number;
  companyHours: number;
  companyRate: number;
  employeeAllowance: number;
  notes: string;
  source: 'Mobile Sync' | 'Admin Entry';
  gpsVerified: boolean;
  approved: boolean;
};

type IrdDay = {
  date: string;
  day: string;
  hours: number;
  rate: number;
  note: string;
};

type Period = {
  id: string;
  label: string;
  start: string;
  end: string;
  week1End: string;
  week2End: string;
};

const fmtMoney = (value: number) =>
  new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
  }).format(value || 0);

const fmtDate = (date: string) =>
  new Intl.DateTimeFormat('en-NZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

const PERIODS: Period[] = [
  {
    id: '2026-08-24_2026-09-06',
    label: '24 Aug - 06 Sep 2026 · Fortnightly',
    start: '2026-08-24',
    end: '2026-09-06',
    week1End: '2026-08-30',
    week2End: '2026-09-06',
  },
  {
    id: '2026-08-10_2026-08-23',
    label: '10 Aug - 23 Aug 2026 · Fortnightly',
    start: '2026-08-10',
    end: '2026-08-23',
    week1End: '2026-08-16',
    week2End: '2026-08-23',
  },
  {
    id: '2026-07-27_2026-08-09',
    label: '27 Jul - 09 Aug 2026 · Fortnightly',
    start: '2026-07-27',
    end: '2026-08-09',
    week1End: '2026-08-02',
    week2End: '2026-08-09',
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    employeeNo: 'EMP-0018',
    name: 'Arjun Perera',
    role: 'Site Technician',
    email: 'arjun@demo.co.nz',
    mobile: '+64 21 555 018',
    actualRate: 27,
    irdRate: 35,
    irdWeeklyHours: 30,
    employmentType: 'Full Time',
    bankSuffix: '•••• 1842',
    taxCode: 'M',
  },
  {
    id: 2,
    employeeNo: 'EMP-0024',
    name: 'Daniel Fernando',
    role: 'Site Technician',
    email: 'daniel@demo.co.nz',
    mobile: '+64 21 555 024',
    actualRate: 29,
    irdRate: 35,
    irdWeeklyHours: 30,
    employmentType: 'Full Time',
    bankSuffix: '•••• 9401',
    taxCode: 'M',
  },
  {
    id: 3,
    employeeNo: 'EMP-0031',
    name: 'Mia Thompson',
    role: 'Team Lead',
    email: 'mia@demo.co.nz',
    mobile: '+64 21 555 031',
    actualRate: 32,
    irdRate: 38,
    irdWeeklyHours: 30,
    employmentType: 'Full Time',
    bankSuffix: '•••• 2730',
    taxCode: 'ME',
  },
];

const SITES: Site[] = [
  {
    id: 1,
    siteCode: 'AKL-CBD-01',
    siteName: 'Queen Street Tower',
    client: 'Auckland Facilities Ltd',
    address: '120 Queen Street, Auckland CBD',
    supervisor: 'James Walker',
    supervisorPhone: '+64 21 840 102',
  },
  {
    id: 2,
    siteCode: 'MAN-IND-04',
    siteName: 'Manukau Industrial Hub',
    client: 'Pacific Property Services',
    address: '18 Cavendish Drive, Manukau',
    supervisor: 'Oliver Chen',
    supervisorPhone: '+64 21 841 245',
  },
  {
    id: 3,
    siteCode: 'MTW-RET-02',
    siteName: 'Mount Wellington Retail Centre',
    client: 'Metro Retail Group',
    address: '286 Mount Wellington Highway, Auckland',
    supervisor: 'Sophie Martin',
    supervisorPhone: '+64 21 845 906',
  },
];

const INITIAL_WORK_ENTRIES: WorkEntry[] = [
  { id: 1, employeeId: 1, date: '2026-08-24', day: 'Mon', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-91001', start: '07:30', end: '12:30', actualHours: 5, companyHours: 5, companyRate: 40, employeeAllowance: 0, notes: 'Morning maintenance works', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 2, employeeId: 1, date: '2026-08-24', day: 'Mon', siteId: 2, siteName: 'Manukau Industrial Hub', client: 'Pacific Property Services', jobNo: 'JOB-4926', shiftId: 'SH-91002', start: '13:30', end: '16:30', actualHours: 3, companyHours: 3, companyRate: 40, employeeAllowance: 12, notes: 'Afternoon call-out · second site', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 3, employeeId: 1, date: '2026-08-25', day: 'Tue', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-91021', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 40, employeeAllowance: 0, notes: 'Scheduled site works', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 4, employeeId: 1, date: '2026-08-26', day: 'Wed', siteId: 3, siteName: 'Mount Wellington Retail Centre', client: 'Metro Retail Group', jobNo: 'JOB-4970', shiftId: 'SH-91044', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 40, employeeAllowance: 8, notes: 'Retail centre maintenance', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 5, employeeId: 1, date: '2026-08-27', day: 'Thu', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-91068', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 40, employeeAllowance: 0, notes: 'Scheduled site works', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 6, employeeId: 1, date: '2026-08-28', day: 'Fri', siteId: 2, siteName: 'Manukau Industrial Hub', client: 'Pacific Property Services', jobNo: 'JOB-4926', shiftId: 'SH-91089', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 40, employeeAllowance: 0, notes: 'Scheduled site works', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 7, employeeId: 1, date: '2026-08-31', day: 'Mon', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-91142', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 40, employeeAllowance: 0, notes: 'Scheduled site works', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 8, employeeId: 1, date: '2026-09-01', day: 'Tue', siteId: 3, siteName: 'Mount Wellington Retail Centre', client: 'Metro Retail Group', jobNo: 'JOB-4970', shiftId: 'SH-91160', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 40, employeeAllowance: 10, notes: 'Scheduled site works', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 9, employeeId: 1, date: '2026-09-02', day: 'Wed', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-91184', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 40, employeeAllowance: 0, notes: 'Scheduled site works', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 10, employeeId: 1, date: '2026-09-03', day: 'Thu', siteId: 2, siteName: 'Manukau Industrial Hub', client: 'Pacific Property Services', jobNo: 'JOB-4926', shiftId: 'SH-91206', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 40, employeeAllowance: 0, notes: 'Scheduled site works', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 11, employeeId: 1, date: '2026-09-04', day: 'Fri', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-91225', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 40, employeeAllowance: 0, notes: 'Scheduled site works', source: 'Mobile Sync', gpsVerified: true, approved: true },

  { id: 12, employeeId: 2, date: '2026-08-24', day: 'Mon', siteId: 2, siteName: 'Manukau Industrial Hub', client: 'Pacific Property Services', jobNo: 'JOB-4926', shiftId: 'SH-92001', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 43, employeeAllowance: 0, notes: 'Scheduled shift', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 13, employeeId: 2, date: '2026-08-25', day: 'Tue', siteId: 2, siteName: 'Manukau Industrial Hub', client: 'Pacific Property Services', jobNo: 'JOB-4926', shiftId: 'SH-92018', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 43, employeeAllowance: 0, notes: 'Scheduled shift', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 14, employeeId: 2, date: '2026-08-26', day: 'Wed', siteId: 3, siteName: 'Mount Wellington Retail Centre', client: 'Metro Retail Group', jobNo: 'JOB-4970', shiftId: 'SH-92035', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 43, employeeAllowance: 0, notes: 'Scheduled shift', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 15, employeeId: 2, date: '2026-08-27', day: 'Thu', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-92059', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 43, employeeAllowance: 0, notes: 'Scheduled shift', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 16, employeeId: 2, date: '2026-08-28', day: 'Fri', siteId: 2, siteName: 'Manukau Industrial Hub', client: 'Pacific Property Services', jobNo: 'JOB-4926', shiftId: 'SH-92078', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 43, employeeAllowance: 0, notes: 'Scheduled shift', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 17, employeeId: 2, date: '2026-08-31', day: 'Mon', siteId: 2, siteName: 'Manukau Industrial Hub', client: 'Pacific Property Services', jobNo: 'JOB-4926', shiftId: 'SH-92120', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 43, employeeAllowance: 0, notes: 'Scheduled shift', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 18, employeeId: 2, date: '2026-09-01', day: 'Tue', siteId: 2, siteName: 'Manukau Industrial Hub', client: 'Pacific Property Services', jobNo: 'JOB-4926', shiftId: 'SH-92139', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 43, employeeAllowance: 0, notes: 'Scheduled shift', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 19, employeeId: 2, date: '2026-09-02', day: 'Wed', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-92158', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 43, employeeAllowance: 0, notes: 'Scheduled shift', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 20, employeeId: 2, date: '2026-09-03', day: 'Thu', siteId: 3, siteName: 'Mount Wellington Retail Centre', client: 'Metro Retail Group', jobNo: 'JOB-4970', shiftId: 'SH-92176', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 43, employeeAllowance: 0, notes: 'Scheduled shift', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 21, employeeId: 2, date: '2026-09-04', day: 'Fri', siteId: 2, siteName: 'Manukau Industrial Hub', client: 'Pacific Property Services', jobNo: 'JOB-4926', shiftId: 'SH-92195', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 43, employeeAllowance: 0, notes: 'Scheduled shift', source: 'Mobile Sync', gpsVerified: true, approved: true },

  { id: 22, employeeId: 3, date: '2026-08-24', day: 'Mon', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-93001', start: '07:30', end: '16:00', actualHours: 8.5, companyHours: 8.5, companyRate: 48, employeeAllowance: 15, notes: 'Team lead coverage', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 23, employeeId: 3, date: '2026-08-25', day: 'Tue', siteId: 3, siteName: 'Mount Wellington Retail Centre', client: 'Metro Retail Group', jobNo: 'JOB-4970', shiftId: 'SH-93017', start: '08:00', end: '16:30', actualHours: 8.5, companyHours: 8.5, companyRate: 48, employeeAllowance: 0, notes: 'Team lead coverage', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 24, employeeId: 3, date: '2026-08-26', day: 'Wed', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-93035', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 48, employeeAllowance: 0, notes: 'Team lead coverage', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 25, employeeId: 3, date: '2026-08-27', day: 'Thu', siteId: 2, siteName: 'Manukau Industrial Hub', client: 'Pacific Property Services', jobNo: 'JOB-4926', shiftId: 'SH-93053', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 48, employeeAllowance: 0, notes: 'Team lead coverage', source: 'Mobile Sync', gpsVerified: true, approved: true },
  { id: 26, employeeId: 3, date: '2026-08-28', day: 'Fri', siteId: 1, siteName: 'Queen Street Tower', client: 'Auckland Facilities Ltd', jobNo: 'JOB-4811', shiftId: 'SH-93071', start: '08:00', end: '16:00', actualHours: 8, companyHours: 8, companyRate: 48, employeeAllowance: 0, notes: 'Team lead coverage', source: 'Mobile Sync', gpsVerified: true, approved: true },
];

const getDates = (start: string, end: string) => {
  const dates: { date: string; day: string }[] = [];
  const cursor = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);

  while (cursor <= last) {
    dates.push({
      date: cursor.toISOString().slice(0, 10),
      day: cursor.toLocaleDateString('en-NZ', { weekday: 'short' }),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};

const createIrdDays = (period: Period, employee: Employee): IrdDay[] =>
  getDates(period.start, period.end).map(({ date, day }) => ({
    date,
    day,
    hours: ['Sat', 'Sun'].includes(day) ? 0 : employee.irdWeeklyHours / 5,
    rate: employee.irdRate,
    note: ['Sat', 'Sun'].includes(day) ? 'Weekend' : 'Standard IRD/accounting allocation',
  }));

const weekEndingFor = (date: string, period: Period) =>
  date <= period.week1End ? period.week1End : period.week2End;

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [periodId, setPeriodId] = useState(PERIODS[0].id);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [entries, setEntries] = useState<WorkEntry[]>(INITIAL_WORK_ENTRIES);
  const [activeEmployeeId, setActiveEmployeeId] = useState(1);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [irdByEmployee, setIrdByEmployee] = useState<Record<number, IrdDay[]>>(() => {
    const base: Record<number, IrdDay[]> = {};
    INITIAL_EMPLOYEES.forEach((employee) => {
      base[employee.id] = createIrdDays(PERIODS[0], employee);
    });
    return base;
  });
  const [pettyAdjustments, setPettyAdjustments] = useState<Record<number, number>>({});
  const [pettyNotes, setPettyNotes] = useState<Record<number, string>>({});
  const [companyAdjustments, setCompanyAdjustments] = useState<Record<string, number>>({});

  const period = PERIODS.find((p) => p.id === periodId) || PERIODS[0];
  const activeEmployee = employees.find((e) => e.id === activeEmployeeId) || employees[0];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  const changePeriod = (nextId: string) => {
    const nextPeriod = PERIODS.find((p) => p.id === nextId) || PERIODS[0];
    setPeriodId(nextId);
    const nextIrd: Record<number, IrdDay[]> = {};
    employees.forEach((employee) => {
      nextIrd[employee.id] = createIrdDays(nextPeriod, employee);
    });
    setIrdByEmployee(nextIrd);
    showToast(`Loaded ${nextPeriod.label}`);
  };

  const filteredEntries = useMemo(
    () =>
      entries.filter(
        (entry) => entry.date >= period.start && entry.date <= period.end,
      ),
    [entries, period],
  );

  const employeeEntries = useMemo(
    () => filteredEntries.filter((entry) => entry.employeeId === activeEmployeeId),
    [filteredEntries, activeEmployeeId],
  );

  const actualSummary = useMemo(() => {
    const map: Record<number, { hours: number; allowances: number; wages: number }> = {};
    employees.forEach((employee) => {
      const rows = filteredEntries.filter((entry) => entry.employeeId === employee.id);
      const hours = rows.reduce((sum, row) => sum + Number(row.actualHours || 0), 0);
      const allowances = rows.reduce((sum, row) => sum + Number(row.employeeAllowance || 0), 0);
      map[employee.id] = {
        hours,
        allowances,
        wages: hours * employee.actualRate + allowances,
      };
    });
    return map;
  }, [employees, filteredEntries]);

  const irdSummary = useMemo(() => {
    const map: Record<number, { hours: number; wages: number }> = {};
    employees.forEach((employee) => {
      const rows = irdByEmployee[employee.id] || [];
      const hours = rows.reduce((sum, row) => sum + Number(row.hours || 0), 0);
      const wages = rows.reduce((sum, row) => sum + Number(row.hours || 0) * Number(row.rate || 0), 0);
      map[employee.id] = { hours, wages };
    });
    return map;
  }, [employees, irdByEmployee]);

  const pettySummary = useMemo(() => {
    const map: Record<
      number,
      { actual: number; ird: number; adjustment: number; balance: number; direction: string }
    > = {};

    employees.forEach((employee) => {
      const actual = actualSummary[employee.id]?.wages || 0;
      const ird = irdSummary[employee.id]?.wages || 0;
      const adjustment = Number(pettyAdjustments[employee.id] || 0);
      const balance = actual - ird + adjustment;
      map[employee.id] = {
        actual,
        ird,
        adjustment,
        balance,
        direction:
          balance > 0.005
            ? 'Pay employee from petty cash'
            : balance < -0.005
              ? 'Employee returns to petty cash'
              : 'Balanced',
      };
    });

    return map;
  }, [employees, actualSummary, irdSummary, pettyAdjustments]);

  const companyInvoices = useMemo(() => {
    const grouped = new Map<
      string,
      {
        key: string;
        weekEnding: string;
        client: string;
        jobNo: string;
        siteNames: Set<string>;
        hours: number;
        amount: number;
        employeeIds: Set<number>;
        lineCount: number;
      }
    >();

    filteredEntries.forEach((entry) => {
      const weekEnding = weekEndingFor(entry.date, period);
      const key = `${weekEnding}|${entry.client}|${entry.jobNo}`;
      const existing = grouped.get(key) || {
        key,
        weekEnding,
        client: entry.client,
        jobNo: entry.jobNo,
        siteNames: new Set<string>(),
        hours: 0,
        amount: 0,
        employeeIds: new Set<number>(),
        lineCount: 0,
      };

      existing.siteNames.add(entry.siteName);
      existing.hours += Number(entry.companyHours || 0);
      existing.amount += Number(entry.companyHours || 0) * Number(entry.companyRate || 0);
      existing.employeeIds.add(entry.employeeId);
      existing.lineCount += 1;
      grouped.set(key, existing);
    });

    return Array.from(grouped.values())
      .map((invoice) => ({
        ...invoice,
        siteNames: Array.from(invoice.siteNames),
        employeeIds: Array.from(invoice.employeeIds),
        adjustment: Number(companyAdjustments[invoice.key] || 0),
        total: invoice.amount + Number(companyAdjustments[invoice.key] || 0),
        invoiceNo: `INV-${invoice.jobNo.replace('JOB-', '')}-${invoice.weekEnding.replaceAll('-', '')}`,
      }))
      .sort((a, b) => a.weekEnding.localeCompare(b.weekEnding) || a.jobNo.localeCompare(b.jobNo));
  }, [filteredEntries, period, companyAdjustments]);

  const activeActual = actualSummary[activeEmployeeId] || { hours: 0, allowances: 0, wages: 0 };
  const activeIrd = irdSummary[activeEmployeeId] || { hours: 0, wages: 0 };
  const activePetty = pettySummary[activeEmployeeId] || {
    actual: 0,
    ird: 0,
    adjustment: 0,
    balance: 0,
    direction: 'Balanced',
  };

  const totalActualPayroll = Object.values(actualSummary).reduce((sum, row) => sum + row.wages, 0);
  const totalIrdPayroll = Object.values(irdSummary).reduce((sum, row) => sum + row.wages, 0);
  const totalCompanyBilling = companyInvoices.reduce((sum, row) => sum + row.total, 0);
  const totalPettyCash = Object.values(pettySummary).reduce((sum, row) => sum + row.balance, 0);

  const updateEntry = (id: number, field: keyof WorkEntry, value: string | number | boolean) => {
    setEntries((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const updateEmployee = (id: number, field: keyof Employee, value: string | number) => {
    setEmployees((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const updateIrdDay = (employeeId: number, index: number, field: keyof IrdDay, value: string | number) => {
    setIrdByEmployee((prev) => {
      const rows = [...(prev[employeeId] || [])];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, [employeeId]: rows };
    });
  };

  const resetIrdStandard = () => {
    setIrdByEmployee((prev) => ({
      ...prev,
      [activeEmployeeId]: createIrdDays(period, activeEmployee),
    }));
    showToast('IRD/accounting hours reset to the configured standard allocation');
  };

  const addJobRow = () => {
    const firstSite = SITES[0];
    const nextId = Math.max(...entries.map((row) => row.id), 0) + 1;
    setEntries((prev) => [
      ...prev,
      {
        id: nextId,
        employeeId: activeEmployeeId,
        date: period.start,
        day: new Date(`${period.start}T00:00:00`).toLocaleDateString('en-NZ', { weekday: 'short' }),
        siteId: firstSite.id,
        siteName: firstSite.siteName,
        client: firstSite.client,
        jobNo: 'JOB-NEW',
        shiftId: `ADMIN-${nextId}`,
        start: '08:00',
        end: '16:00',
        actualHours: 8,
        companyHours: 8,
        companyRate: 40,
        employeeAllowance: 0,
        notes: 'Admin-added job row',
        source: 'Admin Entry',
        gpsVerified: false,
        approved: false,
      },
    ]);
    showToast('New editable job row added');
  };

  const syncMobileData = () => {
    showToast('ShiftSmart workforce + mobile site/shift data synced');
  };

  const printSection = (label: string) => {
    showToast(`${label} opened for PDF/print export`);
    window.setTimeout(() => window.print(), 250);
  };

  const downloadCsv = (filename: string, rows: (string | number)[][]) => {
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast(`${filename} downloaded`);
  };

  const filteredMobileRows = filteredEntries.filter((entry) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const employee = employees.find((e) => e.id === entry.employeeId);
    return [entry.siteName, entry.client, entry.jobNo, entry.shiftId, employee?.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
  });

  const navItems: { id: Tab; label: string; sub: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Control Dashboard', sub: 'Payroll + billing overview', icon: Gauge },
    { id: 'site-capture', label: 'Mobile Site Capture', sub: 'ShiftSmart + mobile sync', icon: Smartphone },
    { id: 'employee', label: 'Employee Payroll', sub: 'Actual hours & payout', icon: Users },
    { id: 'ird', label: 'IRD / Accounting', sub: 'Separate editable record', icon: ShieldCheck },
    { id: 'company', label: 'Company Invoices', sub: 'Weekly · one per job no.', icon: Building2 },
    { id: 'petty-cash', label: 'Petty Cash', sub: 'Reconcile the difference', icon: WalletCards },
  ];

  const SummaryCard = ({
    title,
    value,
    helper,
    icon: Icon,
  }: {
    title: string;
    value: string;
    helper: string;
    icon: React.ElementType;
  }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  const EmployeePicker = () => (
    <select
      value={activeEmployeeId}
      onChange={(e) => setActiveEmployeeId(Number(e.target.value))}
      className="min-w-[260px] rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    >
      {employees.map((employee) => (
        <option key={employee.id} value={employee.id}>
          {employee.name} · {employee.employeeNo}
        </option>
      ))}
    </select>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          title="Employee payout"
          value={fmtMoney(totalActualPayroll)}
          helper="Actual worked hours × employee rates + allowances"
          icon={BadgeDollarSign}
        />
        <SummaryCard
          title="IRD / accounting record"
          value={fmtMoney(totalIrdPayroll)}
          helper="Independent editable reporting record for this fortnight"
          icon={ShieldCheck}
        />
        <SummaryCard
          title="Company billing"
          value={fmtMoney(totalCompanyBilling)}
          helper={`${companyInvoices.length} weekly job-number invoices generated`}
          icon={Building2}
        />
        <SummaryCard
          title="Petty cash net"
          value={fmtMoney(totalPettyCash)}
          helper="Positive = petty cash pays employees · negative = employees return cash"
          icon={WalletCards}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        <div className="2xl:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Fortnight Reconciliation</h3>
              <p className="mt-1 text-xs text-slate-500">Side-by-side view of the three financial records and the petty-cash difference.</p>
            </div>
            <button
              onClick={() => setActiveTab('employee')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              Review payroll <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-white text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3 text-right">Actual hrs</th>
                  <th className="px-5 py-3 text-right">Employee payout</th>
                  <th className="px-5 py-3 text-right">IRD hrs</th>
                  <th className="px-5 py-3 text-right">IRD record</th>
                  <th className="px-5 py-3 text-right">Petty cash</th>
                  <th className="px-5 py-3">Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => {
                  const actual = actualSummary[employee.id] || { hours: 0, wages: 0 };
                  const ird = irdSummary[employee.id] || { hours: 0, wages: 0 };
                  const petty = pettySummary[employee.id];
                  return (
                    <tr key={employee.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <button
                          onClick={() => {
                            setActiveEmployeeId(employee.id);
                            setActiveTab('employee');
                          }}
                          className="text-left"
                        >
                          <p className="font-bold text-slate-900">{employee.name}</p>
                          <p className="text-xs text-slate-500">{employee.employeeNo} · {employee.role}</p>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold">{actual.hours.toFixed(1)}</td>
                      <td className="px-5 py-4 text-right font-bold text-emerald-700">{fmtMoney(actual.wages)}</td>
                      <td className="px-5 py-4 text-right font-semibold">{ird.hours.toFixed(1)}</td>
                      <td className="px-5 py-4 text-right font-bold text-indigo-700">{fmtMoney(ird.wages)}</td>
                      <td className={`px-5 py-4 text-right font-black ${petty.balance >= 0 ? 'text-amber-700' : 'text-rose-700'}`}>
                        {fmtMoney(Math.abs(petty.balance))}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-600">{petty.direction}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">Automation schedule</p>
                <h3 className="mt-2 text-xl font-black">Weekly invoices + fortnightly pay</h3>
              </div>
              <CalendarDays className="h-8 w-8 text-indigo-400" />
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm font-bold">Every Sunday</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Create a separate company invoice for every client + job number for that week.</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm font-bold">Every 2 weeks</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Review actual employee payout, IRD/accounting record and petty-cash reconciliation.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-black text-amber-900">Configuration note</p>
            <p className="mt-2 text-xs leading-5 text-amber-800">
              The IRD/accounting rate and 30-hour weekly allocation are implemented as editable business rules in this prototype. Confirm the final payroll/tax treatment with the organisation’s New Zealand accountant before production use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSiteCapture = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><RefreshCcw className="h-4 w-4" /></div>
                <h3 className="font-black text-slate-900">ShiftSmart Workforce Sync</h3>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Employee profile, assigned site and scheduled shift come from the existing ShiftSmart workforce-management system. When the employee logs into the mobile app, the app captures their individual site/shift confirmation and check-in details and pulls them into this reconciliation workspace.
              </p>
            </div>
            <button
              onClick={syncMobileData}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              <RefreshCcw className="h-4 w-4" /> Sync now
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Captured this period</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-2xl font-black text-slate-900">{filteredEntries.length}</p>
              <p className="text-xs text-slate-500">Shift/job rows</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-2xl font-black text-slate-900">{filteredEntries.filter((r) => r.gpsVerified).length}</p>
              <p className="text-xs text-slate-500">GPS verified</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-black text-slate-900">Individual mobile site records</h3>
            <p className="mt-1 text-xs text-slate-500">One person can have multiple job numbers/sites on the same day.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee, site, job no..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Site / client</th>
                <th className="px-4 py-3">Job no.</th>
                <th className="px-4 py-3">Shift ID</th>
                <th className="px-4 py-3">Mobile in/out</th>
                <th className="px-4 py-3 text-right">Hours</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMobileRows.map((entry) => {
                const employee = employees.find((e) => e.id === entry.employeeId)!;
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{employee.name}</p>
                      <p className="text-xs text-slate-500">{employee.employeeNo}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{fmtDate(entry.date)}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{entry.siteName}</p>
                      <p className="text-xs text-slate-500">{entry.client}</p>
                    </td>
                    <td className="px-4 py-4"><span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">{entry.jobNo}</span></td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-600">{entry.shiftId}</td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-700">{entry.start} → {entry.end}</td>
                    <td className="px-4 py-4 text-right font-black">{entry.actualHours.toFixed(1)}</td>
                    <td className="px-4 py-4 text-xs font-semibold text-slate-600">{entry.source}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${entry.gpsVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {entry.gpsVerified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                        {entry.gpsVerified ? 'GPS verified' : 'Admin entry'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEmployee = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <EmployeePicker />
          <div>
            <p className="text-sm font-black text-slate-900">Actual Employee Payroll</p>
            <p className="text-xs text-slate-500">Editable actual hours from mobile/site records · paid fortnightly</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={addJobRow} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">+ Add job row</button>
          <button
            onClick={() =>
              downloadCsv(`employee-${activeEmployee.employeeNo}-${period.id}.csv`, [
                ['Date', 'Site', 'Client', 'Job No', 'Hours', 'Employee Rate', 'Allowance', 'Line Payout'],
                ...employeeEntries.map((row) => [
                  row.date,
                  row.siteName,
                  row.client,
                  row.jobNo,
                  row.actualHours,
                  activeEmployee.actualRate,
                  row.employeeAllowance,
                  row.actualHours * activeEmployee.actualRate + row.employeeAllowance,
                ]),
              ])
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
          >
            <Download className="h-4 w-4" /> Export employee record
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard title="Actual hours" value={`${activeActual.hours.toFixed(1)} h`} helper="Sum of all jobs/sites in the selected period" icon={Clock3} />
        <SummaryCard title="Employee rate" value={`${fmtMoney(activeEmployee.actualRate)}/h`} helper="Editable actual pay rate" icon={CircleDollarSign} />
        <SummaryCard title="Allowances" value={fmtMoney(activeActual.allowances)} helper="Travel, fuel or manual allowances" icon={Banknote} />
        <SummaryCard title="Fortnight payout" value={fmtMoney(activeActual.wages)} helper="Actual hours × rate + allowances" icon={BadgeDollarSign} />
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-4">
        <div className="2xl:col-span-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4">
            <h3 className="font-black text-slate-900">Daily actual hours · multiple job rows supported</h3>
            <p className="mt-1 text-xs text-slate-500">Each site/job is its own line, even when the employee attends two or more sites on the same day.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left text-sm">
              <thead className="bg-white text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Site</th>
                  <th className="px-3 py-3">Client</th>
                  <th className="px-3 py-3">Job no.</th>
                  <th className="px-3 py-3">Start</th>
                  <th className="px-3 py-3">End</th>
                  <th className="px-3 py-3">Actual hrs</th>
                  <th className="px-3 py-3">Allowance</th>
                  <th className="px-3 py-3">Notes</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employeeEntries.map((row) => (
                  <tr key={row.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-3 py-3">
                      <input type="date" value={row.date} onChange={(e) => updateEntry(row.id, 'date', e.target.value)} className="w-36 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold" />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={row.siteId}
                        onChange={(e) => {
                          const site = SITES.find((s) => s.id === Number(e.target.value));
                          if (!site) return;
                          updateEntry(row.id, 'siteId', site.id);
                          updateEntry(row.id, 'siteName', site.siteName);
                          updateEntry(row.id, 'client', site.client);
                        }}
                        className="w-52 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold"
                      >
                        {SITES.map((site) => <option key={site.id} value={site.id}>{site.siteName}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3"><input value={row.client} onChange={(e) => updateEntry(row.id, 'client', e.target.value)} className="w-48 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs" /></td>
                    <td className="px-3 py-3"><input value={row.jobNo} onChange={(e) => updateEntry(row.id, 'jobNo', e.target.value)} className="w-28 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1.5 text-xs font-black text-indigo-700" /></td>
                    <td className="px-3 py-3"><input type="time" value={row.start} onChange={(e) => updateEntry(row.id, 'start', e.target.value)} className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs" /></td>
                    <td className="px-3 py-3"><input type="time" value={row.end} onChange={(e) => updateEntry(row.id, 'end', e.target.value)} className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs" /></td>
                    <td className="px-3 py-3"><input type="number" step="0.25" value={row.actualHours} onChange={(e) => updateEntry(row.id, 'actualHours', Number(e.target.value))} className="w-24 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-right text-xs font-black text-emerald-700" /></td>
                    <td className="px-3 py-3"><input type="number" step="0.01" value={row.employeeAllowance} onChange={(e) => updateEntry(row.id, 'employeeAllowance', Number(e.target.value))} className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right text-xs" /></td>
                    <td className="px-3 py-3"><input value={row.notes} onChange={(e) => updateEntry(row.id, 'notes', e.target.value)} className="w-64 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs" /></td>
                    <td className="px-3 py-3">
                      <button onClick={() => updateEntry(row.id, 'approved', !row.approved)} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${row.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {row.approved && <Check className="h-3.5 w-3.5" />} {row.approved ? 'Approved' : 'Review'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900">Employee settings</h3>
              <Edit3 className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-bold text-slate-500">
                Actual pay rate
                <div className="mt-1 flex items-center rounded-xl border border-slate-300 bg-slate-50 px-3">
                  <span className="text-slate-400">$</span>
                  <input type="number" step="0.01" value={activeEmployee.actualRate} onChange={(e) => updateEmployee(activeEmployee.id, 'actualRate', Number(e.target.value))} className="w-full bg-transparent px-2 py-2.5 font-black outline-none" />
                </div>
              </label>
              <label className="block text-xs font-bold text-slate-500">
                Employment type
                <input value={activeEmployee.employmentType} onChange={(e) => updateEmployee(activeEmployee.id, 'employmentType', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold" />
              </label>
              <div className="rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                <p><span className="font-bold">Email:</span> {activeEmployee.email}</p>
                <p><span className="font-bold">Mobile:</span> {activeEmployee.mobile}</p>
                <p><span className="font-bold">Bank:</span> {activeEmployee.bankSuffix}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-950 p-5 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Employee payment</p>
            <p className="mt-2 text-3xl font-black">{fmtMoney(activeActual.wages)}</p>
            <p className="mt-2 text-xs leading-5 text-emerald-100/70">{activeActual.hours.toFixed(1)} actual hours × {fmtMoney(activeEmployee.actualRate)} + {fmtMoney(activeActual.allowances)} allowances</p>
            <button onClick={() => showToast(`Fortnightly payment marked ready for ${activeEmployee.name}`)} className="mt-5 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-black text-emerald-950">Mark ready for payment</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIrd = () => {
    const rows = irdByEmployee[activeEmployeeId] || [];
    const targetHours = activeEmployee.irdWeeklyHours * 2;

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <EmployeePicker />
            <div>
              <p className="font-black text-indigo-950">IRD / Accounting Record</p>
              <p className="text-xs leading-5 text-indigo-700">Separate from actual employee payroll. Default: 6 hours × 5 weekdays = 30 hours/week; every day, hour and rate remains editable.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={resetIrdStandard} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-700"><RefreshCcw className="h-4 w-4" /> Reset standard</button>
            <button onClick={() => printSection('IRD PDF')} className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-800"><FileDown className="h-4 w-4" /> Download IRD PDF</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard title="Target fortnight hours" value={`${targetHours.toFixed(1)} h`} helper={`${activeEmployee.irdWeeklyHours.toFixed(1)} hours per week configuration`} icon={CalendarDays} />
          <SummaryCard title="Current IRD hours" value={`${activeIrd.hours.toFixed(1)} h`} helper="Editable day-by-day total" icon={Clock3} />
          <SummaryCard title="IRD rate" value={`${fmtMoney(activeEmployee.irdRate)}/h`} helper="Editable accounting/reporting rate" icon={CircleDollarSign} />
          <SummaryCard title="IRD gross record" value={fmtMoney(activeIrd.wages)} helper="Current IRD hours × day-specific rates" icon={ShieldCheck} />
        </div>

        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-4">
          <div className="2xl:col-span-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-black text-slate-900">IRD daily allocation · selected fortnight</h3>
              <p className="mt-1 text-xs text-slate-500">This table is intentionally independent from actual site/job hours.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Day</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">IRD hours</th>
                    <th className="px-5 py-3">IRD rate</th>
                    <th className="px-5 py-3 text-right">Recorded gross</th>
                    <th className="px-5 py-3">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, index) => (
                    <tr key={row.date} className={['Sat', 'Sun'].includes(row.day) ? 'bg-slate-50/70' : 'hover:bg-indigo-50/30'}>
                      <td className="px-5 py-3 font-black text-slate-700">{row.day}</td>
                      <td className="px-5 py-3 font-semibold text-slate-700">{fmtDate(row.date)}</td>
                      <td className="px-5 py-3"><input type="number" step="0.25" value={row.hours} onChange={(e) => updateIrdDay(activeEmployeeId, index, 'hours', Number(e.target.value))} className="w-28 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-right font-black text-indigo-700" /></td>
                      <td className="px-5 py-3"><input type="number" step="0.01" value={row.rate} onChange={(e) => updateIrdDay(activeEmployeeId, index, 'rate', Number(e.target.value))} className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right font-bold" /></td>
                      <td className="px-5 py-3 text-right font-black text-slate-900">{fmtMoney(row.hours * row.rate)}</td>
                      <td className="px-5 py-3"><input value={row.note} onChange={(e) => updateIrdDay(activeEmployeeId, index, 'note', e.target.value)} className="w-full min-w-[240px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-black text-slate-900">IRD employee profile</h3>
              <div className="mt-4 space-y-4">
                <label className="block text-xs font-bold text-slate-500">Standard weekly hours<input type="number" step="0.5" value={activeEmployee.irdWeeklyHours} onChange={(e) => updateEmployee(activeEmployee.id, 'irdWeeklyHours', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-black" /></label>
                <label className="block text-xs font-bold text-slate-500">Standard IRD rate<input type="number" step="0.01" value={activeEmployee.irdRate} onChange={(e) => updateEmployee(activeEmployee.id, 'irdRate', Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-black" /></label>
                <label className="block text-xs font-bold text-slate-500">Tax code<input value={activeEmployee.taxCode} onChange={(e) => updateEmployee(activeEmployee.id, 'taxCode', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-black" /></label>
                <button onClick={resetIrdStandard} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">Apply settings to fortnight</button>
              </div>
            </div>

            <div className={`rounded-2xl border p-5 ${Math.abs(activeIrd.hours - targetHours) < 0.01 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Validation</p>
              <p className="mt-2 font-black text-slate-900">{Math.abs(activeIrd.hours - targetHours) < 0.01 ? 'Hours match configured target' : 'Hours differ from configured target'}</p>
              <p className="mt-1 text-xs text-slate-600">Target {targetHours.toFixed(1)}h · current {activeIrd.hours.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCompany = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-black text-slate-900">Weekly Company Invoicing</h3>
            <p className="mt-1 text-sm text-slate-500">Every Sunday, generate <span className="font-bold text-slate-700">one invoice per client + job number</span>. If a worker visits two jobs in one day, the hours remain separated by job number.</p>
          </div>
          <button
            onClick={() =>
              downloadCsv(`company-invoices-${period.id}.csv`, [
                ['Invoice No', 'Week Ending', 'Client', 'Job No', 'Sites', 'Hours', 'Base Amount', 'Adjustment', 'Total'],
                ...companyInvoices.map((invoice) => [invoice.invoiceNo, invoice.weekEnding, invoice.client, invoice.jobNo, invoice.siteNames.join(' / '), invoice.hours, invoice.amount, invoice.adjustment, invoice.total]),
              ])
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            <Download className="h-4 w-4" /> Export invoice register
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard title="Weekly invoices" value={String(companyInvoices.length)} helper="One record for each week + client + job number" icon={FileText} />
        <SummaryCard title="Company billing total" value={fmtMoney(totalCompanyBilling)} helper="Editable billed hours × company rate + adjustments" icon={Building2} />
        <SummaryCard title="Average invoice" value={fmtMoney(companyInvoices.length ? totalCompanyBilling / companyInvoices.length : 0)} helper="Across both Sundays in the selected fortnight" icon={BadgeDollarSign} />
      </div>

      <div className="space-y-4">
        {companyInvoices.map((invoice) => {
          const relatedRows = filteredEntries.filter(
            (row) => row.client === invoice.client && row.jobNo === invoice.jobNo && weekEndingFor(row.date, period) === invoice.weekEnding,
          );

          return (
            <div key={invoice.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/70 p-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-black text-white">{invoice.invoiceNo}</span>
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">{invoice.jobNo}</span>
                    <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Invoice Sunday: {fmtDate(invoice.weekEnding)}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-slate-900">{invoice.client}</h3>
                  <p className="mt-1 text-xs text-slate-500">{invoice.siteNames.join(' · ')} · {invoice.employeeIds.length} employee(s) · {invoice.lineCount} shift/job line(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Invoice total</p>
                    <p className="text-2xl font-black text-slate-900">{fmtMoney(invoice.total)}</p>
                  </div>
                  <button onClick={() => printSection(invoice.invoiceNo)} className="rounded-xl bg-indigo-600 p-3 text-white hover:bg-indigo-700"><FileDown className="h-5 w-5" /></button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Site</th>
                      <th className="px-4 py-3">Billed hours</th>
                      <th className="px-4 py-3">Company rate</th>
                      <th className="px-4 py-3 text-right">Line total</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {relatedRows.map((row) => {
                      const employee = employees.find((e) => e.id === row.employeeId)!;
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-semibold">{fmtDate(row.date)}</td>
                          <td className="px-4 py-3"><p className="font-bold text-slate-900">{employee.name}</p><p className="text-xs text-slate-500">{employee.employeeNo}</p></td>
                          <td className="px-4 py-3 text-slate-700">{row.siteName}</td>
                          <td className="px-4 py-3"><input type="number" step="0.25" value={row.companyHours} onChange={(e) => updateEntry(row.id, 'companyHours', Number(e.target.value))} className="w-24 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1.5 text-right font-black text-indigo-700" /></td>
                          <td className="px-4 py-3"><input type="number" step="0.01" value={row.companyRate} onChange={(e) => updateEntry(row.id, 'companyRate', Number(e.target.value))} className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right font-bold" /></td>
                          <td className="px-4 py-3 text-right font-black text-slate-900">{fmtMoney(row.companyHours * row.companyRate)}</td>
                          <td className="px-4 py-3"><input value={row.notes} onChange={(e) => updateEntry(row.id, 'notes', e.target.value)} className="w-64 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-end">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  Invoice adjustment
                  <input type="number" step="0.01" value={companyAdjustments[invoice.key] || 0} onChange={(e) => setCompanyAdjustments((prev) => ({ ...prev, [invoice.key]: Number(e.target.value) }))} className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right text-sm font-bold text-slate-900" />
                </label>
                <span className="text-sm font-black text-slate-900">Final: {fmtMoney(invoice.total)}</span>
                <button onClick={() => showToast(`${invoice.invoiceNo} marked ready to send to ${invoice.client}`)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">Approve invoice</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPettyCash = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-black text-slate-900">Petty Cash Reconciliation</h3>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">Formula used in this prototype: <span className="font-bold text-slate-700">actual employee payout − IRD/accounting gross + manual petty-cash adjustment</span>. Positive balance means the petty-cash custodian pays the employee; negative means the employee returns the absolute balance to petty cash.</p>
          </div>
          <button
            onClick={() =>
              downloadCsv(`petty-cash-${period.id}.csv`, [
                ['Employee', 'Actual Employee Payout', 'IRD/Accounting Record', 'Manual Adjustment', 'Petty Cash Balance', 'Direction', 'Notes'],
                ...employees.map((employee) => {
                  const row = pettySummary[employee.id];
                  return [employee.name, row.actual, row.ird, row.adjustment, row.balance, row.direction, pettyNotes[employee.id] || ''];
                }),
              ])
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            <Download className="h-4 w-4" /> Export petty-cash register
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard title="Net petty cash" value={fmtMoney(Math.abs(totalPettyCash))} helper={totalPettyCash >= 0 ? 'Net amount payable out to employees' : 'Net amount returnable by employees'} icon={WalletCards} />
        <SummaryCard title="Positive balances" value={String(Object.values(pettySummary).filter((row) => row.balance > 0.005).length)} helper="Employees to receive cash/allowance" icon={Banknote} />
        <SummaryCard title="Negative balances" value={String(Object.values(pettySummary).filter((row) => row.balance < -0.005).length)} helper="Employees to return money to petty cash" icon={CircleDollarSign} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3 text-right">Actual employee payout</th>
                <th className="px-5 py-3 text-right">IRD / accounting record</th>
                <th className="px-5 py-3">Manual adjustment</th>
                <th className="px-5 py-3 text-right">Balance</th>
                <th className="px-5 py-3">Direction</th>
                <th className="px-5 py-3">Notes</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((employee) => {
                const row = pettySummary[employee.id];
                return (
                  <tr key={employee.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4"><p className="font-black text-slate-900">{employee.name}</p><p className="text-xs text-slate-500">{employee.employeeNo}</p></td>
                    <td className="px-5 py-4 text-right font-black text-emerald-700">{fmtMoney(row.actual)}</td>
                    <td className="px-5 py-4 text-right font-black text-indigo-700">{fmtMoney(row.ird)}</td>
                    <td className="px-5 py-4"><input type="number" step="0.01" value={pettyAdjustments[employee.id] || 0} onChange={(e) => setPettyAdjustments((prev) => ({ ...prev, [employee.id]: Number(e.target.value) }))} className="w-32 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-right font-bold" /></td>
                    <td className={`px-5 py-4 text-right text-lg font-black ${row.balance > 0.005 ? 'text-amber-700' : row.balance < -0.005 ? 'text-rose-700' : 'text-emerald-700'}`}>{fmtMoney(Math.abs(row.balance))}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${row.balance > 0.005 ? 'bg-amber-50 text-amber-800' : row.balance < -0.005 ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}>{row.direction}</span></td>
                    <td className="px-5 py-4"><input value={pettyNotes[employee.id] || ''} onChange={(e) => setPettyNotes((prev) => ({ ...prev, [employee.id]: e.target.value }))} placeholder="Reference / cash handler note" className="w-64 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs" /></td>
                    <td className="px-5 py-4"><button onClick={() => showToast(`Petty-cash transaction recorded for ${employee.name}`)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Mark settled</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">Worked example · {activeEmployee.name}</p>
            <h3 className="mt-2 text-xl font-black">{fmtMoney(activeActual.wages)} actual − {fmtMoney(activeIrd.wages)} IRD = {fmtMoney(activePetty.balance)}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">Actual: {activeActual.hours.toFixed(1)}h × {fmtMoney(activeEmployee.actualRate)} + allowances. IRD: {activeIrd.hours.toFixed(1)}h at the editable IRD day rates.</p>
          </div>
          <EmployeePicker />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {toast && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}

      <div className="flex min-h-screen">
        <aside className="hidden w-80 shrink-0 bg-slate-950 text-slate-300 xl:flex xl:flex-col">
          <div className="border-b border-slate-800 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-600 p-2.5 text-white"><Building2 className="h-6 w-6" /></div>
              <div>
                <h1 className="text-xl font-black text-white">ShiftSmart</h1>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">Payroll & Billing Hub</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">Reconciliation modules</p>
            <nav className="space-y-1">
              {navItems.map(({ id, label, sub, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} className={`w-full rounded-xl px-3 py-3 text-left transition ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-black">{label}</p>
                      <p className={`mt-0.5 text-[11px] ${activeTab === id ? 'text-indigo-100' : 'text-slate-600'}`}>{sub}</p>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-slate-800 p-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-black">ShiftSmart connected</span></div>
              <p className="mt-2 text-xs leading-5 text-slate-500">Employee, site and shift master data available for mobile reconciliation.</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">New Zealand workforce reconciliation</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{navItems.find((item) => item.id === activeTab)?.label}</h2>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                  <select value={periodId} onChange={(e) => changePeriod(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none">
                    {PERIODS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </div>
                <button onClick={syncMobileData} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><RefreshCcw className="h-4 w-4" /> Sync</button>
                <button onClick={() => showToast('Settings opened')} className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-600 hover:bg-slate-50"><Settings2 className="h-4 w-4" /></button>
                <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black">AD</div>
                  <div className="pr-1"><p className="text-xs font-black">Admin User</p><p className="text-[10px] text-slate-400">Payroll Manager</p></div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-5 py-2 xl:hidden">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${activeTab === id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon className="h-3.5 w-3.5" />{label}</button>
              ))}
            </div>
          </header>

          <div className="p-5 lg:p-7">
            <div className="mx-auto max-w-[1700px]">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'site-capture' && renderSiteCapture()}
              {activeTab === 'employee' && renderEmployee()}
              {activeTab === 'ird' && renderIrd()}
              {activeTab === 'company' && renderCompany()}
              {activeTab === 'petty-cash' && renderPettyCash()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
