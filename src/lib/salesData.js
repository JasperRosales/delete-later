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

// Cache for loaded data to avoid reloading
let cachedData = null;

// Lazy load all data files and combine them
const loadAllData = async () => {
  if (cachedData) {
    return cachedData;
  }

  // Dynamic imports - files will only be loaded when needed
  const [
    janAgo, janBay, janCal, janCue, janGul, janSta,
    decAgo, decBay, decCal, decCue, decGul, decSta
  ] = await Promise.all([
    import("@/data/jan-agoncillo-2026.json"),
    import("@/data/jan-bayan-2026.json"),
    import("@/data/jan-caloocan-2026.json"),
    import("@/data/jan-cuenca-2026.json"),
    import("@/data/jan-gulod-2026.json"),
    import("@/data/jan-stateresita-2026.json"),
    import("@/data/dec-agoncillo-2025.json"),
    import("@/data/dec-bayan-2025.json"),
    import("@/data/dec-caloocan-2025.json"),
    import("@/data/dec-cuenca-2025.json"),
    import("@/data/dec-gulod-2025.json"),
    import("@/data/dec-stateresita-2025.json"),
  ]);

  cachedData = [
    ...extractData(janAgo),
    ...extractData(janBay),
    ...extractData(janCal),
    ...extractData(janCue),
    ...extractData(janGul),
    ...extractData(janSta),
    ...extractData(decAgo),
    ...extractData(decBay),
    ...extractData(decCal),
    ...extractData(decCue),
    ...extractData(decGul),
    ...extractData(decSta),
  ];

  return cachedData;
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

// For backwards compatibility - get data synchronously (may return empty if not yet loaded)
export const getData = () => allData;

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
