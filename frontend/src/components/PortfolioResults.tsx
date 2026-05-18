import {
	TrendingUp,
	TrendingDown,
	PieChart,
	Wallet,
	Download,
	Mail,
	Copy,
	Share2,
} from "lucide-react";
import {
	AreaChart,
	Area,
	ResponsiveContainer,
	XAxis,
	YAxis,
	Tooltip,
} from "recharts";
import { useState } from "react";
import StockCard from "./StockCard";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
	generatePortfolioPDF,
	shareViaEmail,
	copyToClipboard,
} from "@/lib/portfolioExport";
import { useToast } from "@/hooks/use-toast";

interface Stock {
	symbol: string;
	name: string;
	allocation: number;
	price: number;
	shares: number;
	value: number;
	change: number;
	weeklyTrend?: { day: string; price: number }[];
	strategy?: string;
}

interface PortfolioResultsProps {
	amount: number;
	strategies: string[];
	stocks: Stock[];
	weeklyTrend: { day: string; value: number }[];
	totalValue: number;
	totalChange: number;
	userName?: string;
}

const PortfolioResults = ({
	amount,
	strategies,
	stocks,
	weeklyTrend,
	totalValue,
	totalChange,
	userName,
}: PortfolioResultsProps) => {
	const { toast } = useToast();
	const [isExporting, setIsExporting] = useState(false);

	const stocksWithTrends = stocks.map((stock) => ({
		...stock,
		weeklyTrend: stock.weeklyTrend?.length
			? stock.weeklyTrend
			: generateStockTrend(stock.price),
	}));

	const portfolioData = {
		amount,
		strategies,
		stocks: stocksWithTrends,
		totalValue,
		totalChange,
		weeklyTrend,
		userName,
	};

	const handleDownloadPDF = () => {
		setIsExporting(true);
		try {
			generatePortfolioPDF(portfolioData);
			toast({
				title: "PDF Downloaded!",
				description: "Your portfolio report has been saved.",
			});
		} catch (error) {
			toast({
				title: "Download Failed",
				description: "There was an error generating the PDF.",
				variant: "destructive",
			});
		} finally {
			setIsExporting(false);
		}
	};

	const handleShareEmail = () => {
		shareViaEmail(portfolioData);
		toast({
			title: "Email Client Opened",
			description: "Your portfolio summary is ready to send.",
		});
	};

	const handleCopyToClipboard = async () => {
		const success = await copyToClipboard(portfolioData);
		if (success) {
			toast({
				title: "Copied to Clipboard!",
				description: "Portfolio summary copied. Paste it anywhere.",
			});
		} else {
			toast({
				title: "Copy Failed",
				description: "Could not copy to clipboard.",
				variant: "destructive",
			});
		}
	};

	const stocksPerStrategy =
		strategies.length > 0
			? Math.ceil(stocksWithTrends.length / strategies.length)
			: 0;

	const strategyValues = strategies.map((strategy, index) => {
		const byName = stocksWithTrends.filter(
			(stock) => stock.strategy === strategy
		);
		const fallbackStart = index * Math.max(stocksPerStrategy, 3);
		const fallbackEnd = (index + 1) * Math.max(stocksPerStrategy, 3);
		const collection = byName.length
			? byName
			: stocksWithTrends.slice(fallbackStart, fallbackEnd);

		return collection.reduce((sum, stock) => sum + (stock.value ?? 0), 0);
	});

	// Calculate Y-axis domain and ticks for the chart
	const chartValues = weeklyTrend.map((t) => t.value);
	const minValue = Math.min(...chartValues);
	const maxValue = Math.max(...chartValues);

	// Calculate range and add small padding (5% on each side or minimum $200)
	const range = maxValue - minValue;
	const padding = Math.max(range * 0.05, 200);

	// Round to nearest $100
	const yAxisMin = Math.floor((minValue - padding) / 100) * 100;
	const yAxisMax = Math.ceil((maxValue + padding) / 100) * 100;

	// Generate ticks with $100 intervals
	const yAxisTicks: number[] = [];
	for (let i = yAxisMin; i <= yAxisMax; i += 100) {
		yAxisTicks.push(i);
	}

	return (
		<div className="space-y-8 fade-in-up">
			{/* Total Portfolio Value Banner */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-primary/60 p-8 glow-primary border border-primary/50">
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
				<div className="relative">
					<p className="text-sm text-primary-foreground/80 mb-2 font-medium">Total Portfolio Value</p>
					<div className="flex items-center justify-between">
						<h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
							$
							{totalValue.toLocaleString(undefined, {
								minimumFractionDigits: 2,
							})}
						</h2>
						{/* Use direct dollar comparison so sub-cent rounding never flips the sign */}
						<div className={`flex flex-col items-end gap-1 ${totalValue >= amount ? "text-emerald-300" : "text-red-300"}`}>
							<div className="flex items-center gap-2">
								{totalValue >= amount ? (
									<TrendingUp className="w-6 h-6" />
								) : (
									<TrendingDown className="w-6 h-6" />
								)}
								<span className="text-2xl font-bold">
									{totalValue > amount ? "+" : totalValue < amount ? "-" : ""}
									{Math.abs(totalChange).toFixed(2)}%
								</span>
							</div>
							<span className="text-xs text-primary-foreground/60 font-normal">vs. invested amount</span>
						</div>
					</div>
				</div>
			</div>

			{/* Export Actions */}
			<div className="flex flex-wrap justify-center gap-3">
				<Button
					onClick={handleDownloadPDF}
					disabled={isExporting}
					className="premium-button-primary gap-2"
				>
					<Download className="w-4 h-4" />
					{isExporting ? "Generating..." : "Download PDF"}
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="gap-2">
							<Share2 className="w-4 h-4" />
							Share
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center">
						<DropdownMenuItem
							onClick={handleShareEmail}
							className="gap-2 cursor-pointer"
						>
							<Mail className="w-4 h-4" />
							Share via Email
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleCopyToClipboard}
							className="gap-2 cursor-pointer"
						>
							<Copy className="w-4 h-4" />
							Copy to Clipboard
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Strategy Sections */}
			{strategies.map((strategy, strategyIndex) => {
				const byName = stocksWithTrends.filter(
					(stock) => stock.strategy === strategy
				);
				const fallbackStart =
					strategyIndex * Math.max(stocksPerStrategy, 3);
				const fallbackEnd =
					(strategyIndex + 1) * Math.max(stocksPerStrategy, 3);
				const strategyStocks = byName.length
					? byName
					: stocksWithTrends.slice(fallbackStart, fallbackEnd);
				const strategyValue =
					strategyValues[strategyIndex] ||
					amount / Math.max(strategies.length, 1);

				if (strategyStocks.length === 0) return null;

				return (
					<div key={strategy} className="space-y-6 fade-in-up" style={{ animationDelay: `${(strategyIndex + 1) * 100}ms` }}>
						{/* Strategy Header */}
						<div className="premium-card text-center">
							<h2 className="text-3xl font-bold text-primary mb-3">
								{strategy}
							</h2>
							<p className="text-sm text-muted-foreground mb-4">Strategy Allocation</p>
							<div className="inline-block">
								<p className="text-3xl font-bold text-foreground">
									${strategyValue.toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{((strategyValue / amount) * 100).toFixed(1)}% of portfolio
								</p>
							</div>
						</div>

						{/* Stock Cards Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
							{strategyStocks.map((stock, idx) => (
								<div key={stock.symbol} className="fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
									<StockCard
										symbol={stock.symbol}
										name={stock.name}
										price={stock.price}
										shares={stock.shares}
										allocation={stock.allocation}
										value={stock.value}
										weeklyTrend={stock.weeklyTrend}
									/>
								</div>
							))}
						</div>
					</div>
				);
			})}

			{/* Portfolio Summary */}
			<div className="premium-card">
				<div className="flex items-center gap-3 mb-6">
					<div className="icon-bg bg-gradient-to-br from-primary/30 to-primary/10">
						<PieChart className="w-5 h-5 text-primary" />
					</div>
					<div>
						<h3 className="text-xl font-bold text-foreground">Portfolio Summary</h3>
						<p className="text-sm text-muted-foreground">Historical performance</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					<div className="glass-card-subtle p-6 rounded-xl">
						<p className="text-sm text-muted-foreground mb-2 font-medium">
							Initial Investment
						</p>
						<p className="text-3xl font-bold text-foreground">
							${amount.toLocaleString()}
						</p>
						<p className="text-xs text-muted-foreground mt-2">Invested</p>
					</div>
					<div className="glass-card-subtle p-6 rounded-xl">
						<p className="text-sm text-muted-foreground mb-2 font-medium">
							Current Value
						</p>
						<p className="text-3xl font-bold text-foreground">
							$
							{totalValue.toLocaleString(undefined, {
								maximumFractionDigits: 2,
							})}
						</p>
						<p className="text-xs text-muted-foreground mt-2">Today</p>
					</div>
					<div className={`glass-card-subtle p-6 rounded-xl border ${totalValue >= amount ? "border-emerald-500/30" : "border-red-500/30"}`}>
						<p className="text-sm text-muted-foreground mb-2 font-medium">
							Total Return
						</p>
						<p
							className={`text-3xl font-bold flex items-center gap-2 ${
								totalValue >= amount
									? "text-emerald-400"
									: "text-red-400"
							}`}
						>
							{totalValue >= amount ? (
								<TrendingUp className="w-6 h-6" />
							) : (
								<TrendingDown className="w-6 h-6" />
							)}
							{totalValue > amount ? "+" : totalValue < amount ? "-" : ""}
							{Math.abs(totalChange).toFixed(2)}%
						</p>
					</div>
				</div>

				{/* Weekly Trend Chart */}
				<div className="h-72 rounded-xl bg-white/5 p-4">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={weeklyTrend}>
							<defs>
								<linearGradient
									id="colorValue"
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="5%"
										stopColor="hsl(142, 76%, 36%)"
										stopOpacity={0.4}
									/>
									<stop
										offset="95%"
										stopColor="hsl(142, 76%, 36%)"
										stopOpacity={0}
									/>
								</linearGradient>
							</defs>
							<XAxis
								dataKey="day"
								stroke="hsl(215, 15%, 60%)"
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								stroke="hsl(215, 15%, 60%)"
								fontSize={12}
								tickLine={false}
								axisLine={false}
								domain={[yAxisMin, yAxisMax]}
								ticks={yAxisTicks}
								tickFormatter={(value) =>
									`$${(value / 1000).toFixed(0)}k`
								}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "hsl(217, 33%, 8%)",
									border: "1px solid hsl(217, 20%, 18%)",
									borderRadius: "12px",
									color: "hsl(210, 40%, 98%)",
									boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
								}}
								formatter={(value: number) => [
									`$${value.toLocaleString(undefined, {
										maximumFractionDigits: 2,
									})}`,
									"Portfolio Value",
								]}
								labelStyle={{
									color: "hsl(210, 40%, 98%)",
									fontSize: 12,
									fontWeight: 500,
								}}
							/>
							<Area
								type="monotone"
								dataKey="value"
								stroke="hsl(142, 76%, 36%)"
								strokeWidth={3}
								fill="url(#colorValue)"
								isAnimationActive
								animationDuration={1000}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
};


// Helper function to generate stock trend data
function generateStockTrend(
	basePrice: number
): { day: string; price: number }[] {
	// Generate proper date labels for the last 5 days
	const today = new Date();
	const days = Array.from({ length: 5 }, (_, i) => {
		const date = new Date(today);
		date.setDate(date.getDate() - (4 - i));
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	});
	let price = basePrice * 0.98;

	return days.map((day) => {
		price += (Math.random() - 0.4) * basePrice * 0.02;
		return {
			day,
			price: Math.round(Math.max(price, basePrice * 0.95) * 100) / 100,
		};
	});
}

export default PortfolioResults;
