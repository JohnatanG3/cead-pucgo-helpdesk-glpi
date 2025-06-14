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
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
	BarChart,
	Bar,
} from "recharts";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";

export function ResolutionTimeReport() {
	const [period, setPeriod] = useState("month");
	const [groupBy, setGroupBy] = useState("category");
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
					resolutionTimeByCategory: [
						{ name: "Matrícula", value: 3.2 },
						{ name: "Acesso ao Sistema", value: 1.5 },
						{ name: "Suporte Técnico", value: 2.8 },
						{ name: "Financeiro", value: 4.5 },
						{ name: "Outros", value: 2.1 },
					],
					resolutionTimeByPriority: [
						{ name: "Baixa", value: 4.2 },
						{ name: "Média", value: 2.8 },
						{ name: "Alta", value: 1.5 },
						{ name: "Urgente", value: 0.8 },
					],
					resolutionTimeByMonth: [
						{ name: "Jan", value: 3.2 },
						{ name: "Fev", value: 3.0 },
						{ name: "Mar", value: 2.8 },
						{ name: "Abr", value: 2.5 },
						{ name: "Mai", value: 2.3 },
						{ name: "Jun", value: 2.0 },
						{ name: "Jul", value: 2.2 },
						{ name: "Ago", value: 2.5 },
						{ name: "Set", value: 2.7 },
						{ name: "Out", value: 2.4 },
						{ name: "Nov", value: 2.2 },
						{ name: "Dez", value: 2.0 },
					],
					averageResolutionTime: 2.5, // em dias
					fastestResolution: 0.2, // em dias
					slowestResolution: 12.5, // em dias
				};

				setData(simulatedData);
				setIsLoading(false);
			}, 1500);
		};

		fetchData();
	}, [period, groupBy, date]);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Tempo de Resolução</CardTitle>
					<CardDescription>Carregando dados...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
							<p className="mt-4 text-muted-foreground">
								Carregando relatório...
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

					<Select value={groupBy} onValueChange={setGroupBy}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Agrupar por" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="category">Categoria</SelectItem>
							<SelectItem value="priority">Prioridade</SelectItem>
							<SelectItem value="month">Mês</SelectItem>
						</SelectContent>
					</Select>

					{period === "custom" && (
						<DatePickerWithRange date={date} setDate={setDate} />
					)}
				</div>

				<div className="flex gap-2">
					<Button variant="outline" size="sm" className="gap-1">
						<Filter className="h-4 w-4" />
						Filtros
					</Button>
					<Button variant="outline" size="sm" className="gap-1">
						<Download className="h-4 w-4" />
						Exportar
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
							Resolução Mais Rápida
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.fastestResolution} dias
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{Math.round(data.fastestResolution * 24)} horas
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Resolução Mais Lenta
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.slowestResolution} dias
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{Math.round(data.slowestResolution * 24)} horas
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						Tempo Médio de Resolução por{" "}
						{groupBy === "category"
							? "Categoria"
							: groupBy === "priority"
								? "Prioridade"
								: "Mês"}
					</CardTitle>
					<CardDescription>
						Tempo médio (em dias) para resolver chamados agrupados por{" "}
						{groupBy === "category"
							? "categoria"
							: groupBy === "priority"
								? "prioridade"
								: "mês"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							{groupBy === "month" ? (
								<LineChart data={data.resolutionTimeByMonth}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip
										formatter={(value: number) => [
											`${value} dias`,
											"Tempo médio",
										]}
									/>
									<Legend />
									<Line
										type="monotone"
										dataKey="value"
										name="Tempo médio (dias)"
										stroke="#3b82f6"
										activeDot={{ r: 8 }}
									/>
								</LineChart>
							) : (
								<BarChart
									data={
										groupBy === "category"
											? data.resolutionTimeByCategory
											: data.resolutionTimeByPriority
									}
									layout="vertical"
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis type="number" />
									<YAxis dataKey="name" type="category" width={100} />
									<Tooltip
										formatter={(value: number) => [
											`${value} dias`,
											"Tempo médio",
										]}
									/>
									<Legend />
									<Bar
										dataKey="value"
										name="Tempo médio (dias)"
										fill="#3b82f6"
									/>
								</BarChart>
							)}
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
