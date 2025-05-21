"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
} from "recharts";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";

export function ReportDashboard() {
	const [period, setPeriod] = useState("month");
	const [isLoading, setIsLoading] = useState(true);
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const [data, setData] = useState<any>(null);
	const [date, setDate] = useState<DateRange>({
		from: addDays(new Date(), -30),
		to: new Date(),
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);

			// Simular carregamento de dados
			setTimeout(() => {
				// Dados simulados para demonstração
				const simulatedData = {
					ticketsByStatus: [
						{ name: "Novos", value: 42, color: "#3b82f6" },
						{ name: "Em andamento", value: 28, color: "#f59e0b" },
						{ name: "Resolvidos", value: 63, color: "#10b981" },
						{ name: "Fechados", value: 37, color: "#6b7280" },
					],
					ticketsByCategory: [
						{ name: "Matrícula", value: 35, color: "#8b5cf6" },
						{ name: "Acesso ao Sistema", value: 25, color: "#ec4899" },
						{ name: "Suporte Técnico", value: 18, color: "#14b8a6" },
						{ name: "Financeiro", value: 12, color: "#f97316" },
						{ name: "Outros", value: 10, color: "#6b7280" },
					],
					ticketsByMonth: [
						{ name: "Jan", novos: 12, andamento: 8, resolvidos: 15 },
						{ name: "Fev", novos: 15, andamento: 10, resolvidos: 12 },
						{ name: "Mar", novos: 18, andamento: 12, resolvidos: 20 },
						{ name: "Abr", novos: 22, andamento: 15, resolvidos: 18 },
						{ name: "Mai", novos: 25, andamento: 18, resolvidos: 22 },
						{ name: "Jun", novos: 20, andamento: 15, resolvidos: 25 },
						{ name: "Jul", novos: 18, andamento: 12, resolvidos: 20 },
						{ name: "Ago", novos: 15, andamento: 10, resolvidos: 18 },
						{ name: "Set", novos: 20, andamento: 15, resolvidos: 22 },
						{ name: "Out", novos: 25, andamento: 18, resolvidos: 20 },
						{ name: "Nov", novos: 30, andamento: 20, resolvidos: 25 },
						{ name: "Dez", novos: 35, andamento: 25, resolvidos: 30 },
					],
					averageResolutionTime: 2.5, // em dias
					totalTickets: 170,
					resolvedTickets: 100,
					satisfactionRate: 4.2, // de 5
				};

				setData(simulatedData);
				setIsLoading(false);
			}, 1500);
		};

		fetchData();
	}, [period, date]);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Dashboard de Chamados</CardTitle>
					<CardDescription>Carregando dados...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
							<p className="mt-4 text-muted-foreground">
								Carregando estatísticas...
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
				<div className="flex flex-col sm:flex-row gap-2">
					<Select value={period} onValueChange={setPeriod}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Selecione o período" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="week">Última semana</SelectItem>
							<SelectItem value="month">Último mês</SelectItem>
							<SelectItem value="quarter">Último trimestre</SelectItem>
							<SelectItem value="year">Último ano</SelectItem>
							<SelectItem value="custom">Personalizado</SelectItem>
						</SelectContent>
					</Select>

					{period === "custom" && (
						<DatePickerWithRange date={date} setDate={setDate} />
					)}
				</div>

				<Button variant="outline" size="sm" className="gap-1">
					<Filter className="h-4 w-4" />
					Filtros avançados
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total de Chamados
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.totalTickets}</div>
						<p className="text-xs text-muted-foreground mt-1">
							+12% em relação ao período anterior
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Chamados Resolvidos
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.resolvedTickets}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{Math.round((data.resolvedTickets / data.totalTickets) * 100)}% do
							total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Tempo Médio de Resolução
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.averageResolutionTime} dias
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							-0.5 dias em relação ao período anterior
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Satisfação do Usuário
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.satisfactionRate}/5</div>
						<div className="flex mt-1">
							{Array.from({ length: 5 }).map((_, i) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={i}
									className={`text-sm ${i < Math.floor(data.satisfactionRate) ? "text-yellow-500" : "text-gray-300"}`}
								>
									★
								</span>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Chamados por Status</CardTitle>
						<CardDescription>
							Distribuição de chamados por status atual
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={data.ticketsByStatus}
										cx="50%"
										cy="50%"
										labelLine={false}
										outerRadius={80}
										fill="#8884d8"
										dataKey="value"
										label={({
											name,
											percent,
										}: { name: string; percent: number }) =>
											`${name}: ${(percent * 100).toFixed(0)}%`
										}
									>
										{/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
{data.ticketsByStatus.map((entry: any, index: number) => (
											<Cell key={`cell-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Chamados por Categoria</CardTitle>
						<CardDescription>
							Distribuição de chamados por categoria
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={data.ticketsByCategory}
										cx="50%"
										cy="50%"
										labelLine={false}
										outerRadius={80}
										fill="#8884d8"
										dataKey="value"
										label={({
											name,
											percent,
										}: { name: string; percent: number }) =>
											`${name}: ${(percent * 100).toFixed(0)}%`
										}
									>
										{/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
{data.ticketsByCategory.map((entry: any, index: number) => (
											<Cell key={`cell-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Evolução de Chamados</CardTitle>
					<CardDescription>Número de chamados por mês e status</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={data.ticketsByMonth}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey="novos" name="Novos" fill="#3b82f6" />
								<Bar dataKey="andamento" name="Em andamento" fill="#f59e0b" />
								<Bar dataKey="resolvidos" name="Resolvidos" fill="#10b981" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
