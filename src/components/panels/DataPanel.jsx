import * as React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  initializeData,
  getLocation,
  getDate,
  formatCurrency,
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

const ITEMS_PER_PAGE = 10;

export default function DataPanel() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterBranch, setFilterBranch] = React.useState("");
  const [sortOption, setSortOption] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const loadData = async () => {
      await initializeData();
      const { getData, getBranches } = await import("@/lib/salesData");
      setData(getData());
      setLoading(false);
    };
    loadData();
  }, []);

  // Get branches from loaded data
  const branches = React.useMemo(() => {
    if (!data.length) return [];
    const branchSet = new Set(data.map((sale) => getLocation(sale)));
    return Array.from(branchSet).sort();
  }, [data]);

  const filteredData = React.useMemo(() => {
    let dataList = filterBranch 
      ? data.filter((sale) => getLocation(sale) === filterBranch)
      : [...data];

    // Apply sorting
    if (sortOption) {
      const [field, order] = sortOption.split("-");
      
      // Month mapping for date sorting
      const monthReverseMap = {
        Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
        Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
      };

      dataList.sort((a, b) => {
        let valueA, valueB;

        if (field === "date") {
          // Sort by date: create comparable values
          const monthA = monthReverseMap[a.month] || 1;
          const monthB = monthReverseMap[b.month] || 1;
          valueA = a.year * 10000 + monthA * 100 + a.date;
          valueB = b.year * 10000 + monthB * 100 + b.date;
        } else if (field === "expenses") {
          valueA = a.expenses || 0;
          valueB = b.expenses || 0;
        } else if (field === "net") {
          valueA = a.net || 0;
          valueB = b.net || 0;
        }

        if (order === "asc") {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
    }

    return dataList;
  }, [data, filterBranch, sortOption]);

  // Reset to page 1 when filter or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterBranch, sortOption]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading data...</div>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold tracking-tight">Data</h2>
            <p className="text-muted-foreground">
              View and filter sales records by branch.
            </p>
          </div>
          <div className="flex items-center gap-2">
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
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="flex h-9 w-full sm:w-50 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Sort By</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="date-desc">Date (Newest First)</option>
              <option value="expenses-asc">Expenses (Low to High)</option>
              <option value="expenses-desc">Expenses (High to Low)</option>
              <option value="net-asc">Net (Low to High)</option>
              <option value="net-desc">Net (High to Low)</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn}>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Expenses</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Deposit</TableHead>
                  <TableHead>27kg</TableHead>
                  <TableHead>11kg</TableHead>
                  <TableHead>22kg</TableHead>
                  <TableHead>50kg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((sale, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {getDate(sale)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          {getLocation(sale)}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(sale.gross)}</TableCell>
                      <TableCell>{formatCurrency(sale.expenses)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(sale.net)}
                      </TableCell>
                      <TableCell>{formatCurrency(sale.deposit)}</TableCell>
                      <TableCell>{sale.tank_sales?.["27kg"] || 0}</TableCell>
                      <TableCell>{sale.tank_sales?.["11kg"] || 0}</TableCell>
                      <TableCell>{sale.tank_sales?.["22kg"] || 0}</TableCell>
                      <TableCell>{sale.tank_sales?.["50kg"] || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={fadeIn}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{" "}
              {filteredData.length} records
              {filterBranch && ` for ${filterBranch}`}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded-md border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded-md border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {totalPages <= 1 && (
        <motion.div variants={fadeIn}>
          <div className="text-sm text-muted-foreground">
            Showing {filteredData.length} of {data.length} records
            {filterBranch && ` for ${filterBranch}`}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
