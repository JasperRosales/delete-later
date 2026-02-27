import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  initializeData,
  getLocation,
  formatCurrency,
  getBranches,
} from "@/lib/salesData";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AnalyticsPanel() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterBranch, setFilterBranch] = React.useState("");
  const [filterYear, setFilterYear] = React.useState("");
  const [filterMonth, setFilterMonth] = React.useState("");

  React.useEffect(() => {
    const loadData = async () => {
      await initializeData();
      // Get the updated data after initialization
      const { getData, getBranches: fetchBranches } = await import("@/lib/salesData");
      setData(getData());
      setLoading(false);
    };
    loadData();
  }, []);

  // Get unique branches for filter dropdown
  const branches = React.useMemo(() => {
    if (!data.length) return [];
    const branchSet = new Set(data.map((sale) => getLocation(sale)));
    return Array.from(branchSet).sort();
  }, [data]);

  // Get unique years for filter dropdown
  const years = React.useMemo(() => {
    if (!data.length) return [];
    const yearSet = new Set(data.map((sale) => sale.year).filter(Boolean));
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [data]);

  // Get unique months for filter dropdown - sorted chronologically
  const months = React.useMemo(() => {
    if (!data.length) return [];
    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthSet = new Set(data.map((sale) => sale.month).filter(Boolean));
    return Array.from(monthSet).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
  }, [data]);

  // Filter data based on selected filters
  const filteredData = React.useMemo(() => {
    let result = data;
    
    if (filterBranch) {
      result = result.filter((sale) => getLocation(sale) === filterBranch);
    }
    
    // Convert filterYear to number for proper comparison
    if (filterYear) {
      result = result.filter((sale) => sale.year === Number(filterYear));
    }
    
    if (filterMonth) {
      result = result.filter((sale) => sale.month === filterMonth);
    }
    
    return result;
  }, [data, filterBranch, filterYear, filterMonth]);

  // Shorten long branch names for chart display
  const shortenBranchName = (name) => {
    if (!name) return name;
    const maxLength = 10;
    if (name.length > maxLength) {
      return name.substring(0, maxLength - 2) + "..";
    }
    return name;
  };

  // Calculate sales by location
  const salesByLocation = React.useMemo(() => {
    const dataMap = {};
    filteredData.forEach((sale) => {
      const location = getLocation(sale);
      if (!dataMap[location]) {
        dataMap[location] = { gross: 0, net: 0, deposit: 0, count: 0 };
      }
      dataMap[location].gross += sale.gross || 0;
      dataMap[location].net += sale.net || 0;
      dataMap[location].deposit += sale.deposit || 0;
      dataMap[location].count += 1;
    });
    return Object.entries(dataMap).map(([name, vals]) => ({
      name: shortenBranchName(name),
      gross: vals.gross,
      net: vals.net,
      deposit: vals.deposit,
      count: vals.count,
    }));
  }, [filteredData]);

  const salesByMonth = React.useMemo(() => {
    const dataMap = {};
    filteredData.forEach((sale) => {
      const month = sale.month || "Unknown";
      if (!dataMap[month]) {
        dataMap[month] = { gross: 0, net: 0, deposit: 0, gcash: 0, count: 0 };
      }
      dataMap[month].gross += sale.gross || 0;
      dataMap[month].net += sale.net || 0;
      dataMap[month].deposit += sale.deposit || 0;
      dataMap[month].gcash += sale.gcash || 0;
      dataMap[month].count += 1;
    });
    return Object.entries(dataMap).map(([name, vals]) => ({
      name,
      gross: vals.gross,
      net: vals.net,
      deposit: vals.deposit,
      gcash: vals.gcash,
      count: vals.count,
    }));
  }, [filteredData]);

  const totalGross = React.useMemo(() => 
    filteredData.reduce((sum, sale) => sum + (sale.gross || 0), 0)
  , [filteredData]);
  
  const totalNet = React.useMemo(() => 
    filteredData.reduce((sum, sale) => sum + (sale.net || 0), 0)
  , [filteredData]);
  
  const totalDeposit = React.useMemo(() => 
    filteredData.reduce((sum, sale) => sum + (sale.deposit || 0), 0)
  , [filteredData]);

  // Calculate tank sales by type
  const tankSalesByType = React.useMemo(() => {
    const tankCounts = {
      "11kg": 0,
      "22kg": 0,
      "27kg": 0,
      "50kg": 0,
    };
    
    filteredData.forEach((sale) => {
      if (sale.tank_sales) {
        tankCounts["11kg"] += sale.tank_sales["11kg"] || 0;
        tankCounts["22kg"] += sale.tank_sales["22kg"] || 0;
        tankCounts["27kg"] += sale.tank_sales["27kg"] || 0;
        tankCounts["50kg"] += sale.tank_sales["50kg"] || 0;
      }
    });
    
    return Object.entries(tankCounts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [filteredData]);

  // Calculate total volume in kg and tons
  const totalVolume = React.useMemo(() => {
    let totalKg = 0;
    
    filteredData.forEach((sale) => {
      if (sale.tank_sales) {
        totalKg += (sale.tank_sales["11kg"] || 0) * 11;
        totalKg += (sale.tank_sales["22kg"] || 0) * 22;
        totalKg += (sale.tank_sales["27kg"] || 0) * 27;
        totalKg += (sale.tank_sales["50kg"] || 0) * 50;
      }
    });
    
    return {
      kg: totalKg,
      tons: totalKg / 1000,
    };
  }, [filteredData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const locationChartConfig = {
    gross: {
      label: "Gross Sales",
      color: "hsl(var(--primary))",
    },
    net: {
      label: "Net Sales",
      color: "hsl(var(--chart-2))",
    },
  };

  const monthChartConfig = {
    gross: {
      label: "Gross Sales",
      color: "hsl(var(--primary))",
    },
    net: {
      label: "Net Sales",
      color: "hsl(var(--chart-2))",
    },
    deposit: {
      label: "Deposit",
      color: "#22c55e",
    },
    gcash: {
      label: "GCash",
      color: "#3b82f6",
    },
  };

  const tankChartConfig = {
    count: {
      label: "Tank Count",
    },
    "11kg": {
      label: "11kg",
      color: "hsl(var(--chart-1))",
    },
    "22kg": {
      label: "22kg",
      color: "hsl(var(--chart-2))",
    },
    "27kg": {
      label: "27kg",
      color: "hsl(var(--chart-3))",
    },
    "50kg": {
      label: "50kg",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeIn}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">
              Visualize sales data and trends.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="flex h-9 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="flex h-9 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="flex h-9 w-full sm:w-50 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div className="grid gap-4 md:grid-cols-4" variants={fadeIn}>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Gross Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalGross)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Net Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalNet)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deposits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalDeposit)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVolume.kg.toLocaleString()} kg
            </div>
            <p className="text-xs text-muted-foreground">
              ({totalVolume.tons.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tons)
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="grid gap-4 md:grid-cols-2" variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle>Sales by Location</CardTitle>
            <CardDescription>
              Distribution of sales across all branches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={locationChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={salesByLocation}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="gross"
                  radius={[4, 4, 0, 0]}
                >
                  {salesByLocation.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={["#ef4444", "#22c55e", "#eab308", "#3b82f6", "#f97316", "#ec4899"][index % 6]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Month</CardTitle>
            <CardDescription>
              Monthly sales trends over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={monthChartConfig}
              className="h-75 w-full"
            >
              <AreaChart data={salesByMonth}>
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={<ChartTooltipContent />}
                />
                <Area
                  type="monotone"
                  dataKey="gross"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGross)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deposit vs GCash</CardTitle>
            <CardDescription>
              Monthly deposit and GCash transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={monthChartConfig}
              className="h-[300px] w-full"
            >
              <BarChart data={salesByMonth}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="deposit"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="gcash"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tank Sales by Type</CardTitle>
            <CardDescription>
              Total count of tanks sold by kilogram size.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={tankChartConfig}
              className="h-[300px] w-full"
            >
              <PieChart>
                <Pie
                  data={tankSalesByType}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {tankSalesByType.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={["#ef4444", "#22c55e", "#3b82f6", "#eab308"][index]} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  content={<ChartTooltipContent />}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
