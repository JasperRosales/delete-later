// Helper function to extract data safely and inject parent properties
// Handles both structures: root-level .data and nested .branches[0].data
const extractData = (json) => {
  const rawData = json?.data || json?.branches?.[0]?.data || [];
  const branch = json?.branch || json?.branches?.[0]?.branch || "Unknown";
  const month = json?.month || json?.branches?.[0]?.month || "";
  const year = json?.year || json?.branches?.[0]?.year || "";
  
  // Inject branch, month, year into each data item
  return rawData.map(item => ({
    ...item,
    branch,
    month,
    year,
  }));
};

// In-memory cache for loaded data
let cachedData = null;

// Cache key for localStorage
const CACHE_KEY = 'cjg_sales_data_cache';
const CACHE_TIMESTAMP_KEY = 'cjg_sales_data_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get cached data from localStorage
const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        return JSON.parse(cached);
      }
    }
  } catch (e) {
    console.warn('Failed to read from cache:', e);
  }
  return null;
};

// Save data to localStorage cache
const setCachedData = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn('Failed to save to cache:', e);
  }
};

// Data file mapping
const DATA_FILES = [
  'jan-agoncillo-2026.json',
  'jan-bayan-2026.json',
  'jan-caloocan-2026.json',
  'jan-cuenca-2026.json',
  'jan-gulod-2026.json',
  'jan-stateresita-2026.json',
  'feb-agoncillo-2026.json',
  'feb-bayan-2026.json',
  'feb-caloocan-2026.json',
  'feb-cuenca-2026.json',
  'feb-gulod-2026.json',
  'feb-stateresita-2026.json',
  'nov-agoncillo-2025.json',
  'nov-bayan-2025.json',
  'nov-caloocan-2025.json',
  'nov-cuenca-2025.json',
  'nov-gulod-2025.json',
  'nov-stateresita-2025.json',
  'dec-agoncillo-2025.json',
  'dec-bayan-2025.json',
  'dec-caloocan-2025.json',
  'dec-cuenca-2025.json',
  'dec-gulod-2025.json',
  'dec-stateresita-2025.json',
];

// Fetch a single data file
const fetchDataFile = async (filename) => {
  const response = await fetch(`/data/${filename}`);
  if (!response.ok) {
    console.error(`Failed to fetch ${filename}:`, response.status);
    return [];
  }
  const json = await response.json();
  return extractData(json);
};

// Lazy load all data files and combine them
const loadAllData = async () => {
  // Check in-memory cache first
  if (cachedData) {
    return cachedData;
  }

  // Check localStorage cache
  const localCache = getCachedData();
  if (localCache) {
    cachedData = localCache;
    return cachedData;
  }

  // Fetch all data files sequentially to avoid overwhelming the server
  // Using sequential fetch instead of Promise.all for better server behavior
  const allData = [];
  
  for (const filename of DATA_FILES) {
    const data = await fetchDataFile(filename);
    allData.push(...data);
  }

  cachedData = allData;
  
  // Save to localStorage cache
  setCachedData(cachedData);

  return cachedData;
};

// Fetch data for specific months/branches only (lazy loading)
const loadDataByFilter = async (filters = {}) => {
  const { months = [], branches = [] } = filters;
  
  const allData = [];
  
  for (const filename of DATA_FILES) {
    // Parse filename to get month and branch
    const parts = filename.replace('.json', '').split('-');
    const fileMonth = parts[0];
    const fileBranch = parts.slice(0, -1).join('-'); // e.g., "agoncillo", "sta teresita"
    
    // Check if file matches filters
    const monthMatch = months.length === 0 || months.some(m => 
      fileMonth.toLowerCase().startsWith(m.toLowerCase().substring(0, 3))
    );
    
    const branchMatch = branches.length === 0 || branches.some(b => 
      fileBranch.toLowerCase().includes(b.toLowerCase())
    );
    
    if (monthMatch && branchMatch) {
      const data = await fetchDataFile(filename);
      allData.push(...data);
    }
  }
  
  return allData;
};

// Export a promise that resolves to all data - for use with React Suspense
export const allDataPromise = loadAllData();

// Synchronous access to cached data (will be empty initially until data loads)
export let allData = [];

// Initialize data after mount - this will be called by components
export const initializeData = async () => {
  allData = await loadAllData();
  return allData;
};

// Initialize data with filters (for lazy loading)
export const initializeDataWithFilter = async (filters) => {
  allData = await loadDataByFilter(filters);
  return allData;
};

// For backwards compatibility - get data synchronously (may return empty if not yet loaded)
export const getData = () => allData;

// Clear cache (for forcing refresh)
export const clearCache = () => {
  cachedData = null;
  allData = [];
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (e) {
    console.warn('Failed to clear cache:', e);
  }
};

// Business information
export const businessInfo = {
  name: "CJG LPG TRADING",
  description: "Your trusted partner for quality LPG products. We provide reliable and efficient LPG trading services.",
  contact: "For inquiries, please contact us.",
};

// Get unique branches/locations
export const getBranches = () => {
  const branches = new Set(allData.map((sale) => sale.branch || "Unknown"));
  return Array.from(branches).sort();
};

// Month mapping for proper date formatting
const monthMap = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};

// Extract location from sales data
export const getLocation = (sale) => {
  return sale.branch || "Unknown";
};

// Extract date from sales data
export const getDate = (sale) => {
  const month = monthMap[sale.month] || sale.month || "";
  return `${month} ${sale.date}, ${sale.year}`;
};

// Get formatted currency
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

// Calculate total gross sales
export const calculateTotalGross = () => {
  return allData.reduce((sum, sale) => sum + (sale.gross || 0), 0);
};

// Calculate total net sales
export const calculateTotalNet = () => {
  return allData.reduce((sum, sale) => sum + (sale.net || 0), 0);
};

// Calculate total deposits
export const calculateTotalDeposit = () => {
  return allData.reduce((sum, sale) => sum + (sale.deposit || 0), 0);
};

// Get tank sales as formatted string
export const getTankSales = (sale) => {
  if (!sale.tank_sales) return "-";
  const { "27kg": a27, "11kg": a11, "22kg": a22, "50kg": a50 } = sale.tank_sales;
  return `27kg: ${a27 || 0}, 11kg: ${a11 || 0}, 22kg: ${a22 || 0}, 50kg: ${a50 || 0}`;
};

