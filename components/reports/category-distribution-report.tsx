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
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
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

export function CategoryDistributionReport() {
	const [period, setPeriod] = useState("month");
	const [viewType, setViewType] = useState("pie");
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
					categoriesData: [
						{ name: "Matrícula", value: 35, color: "#8b5cf6" },
						{ name: "Acesso ao Sistema", value: 25, color: "#ec4899" },
						{ name: "Suporte Técnico", value: 18, color: "#14b8a6" },
						{ name: "Financeiro", value: 12, color: "#f97316" },
						{ name: "Outros", value: 10, color: "#6b7280" },
					],
					subcategoriesData: [
						{ name: "Matrícula > Nova", value: 20, color: "#8b5cf6" },
						{ name: "Matrícula > Renovação", value: 15, color: "#a78bfa" },
						{ name: "Acesso > Login", value: 15, color: "#ec4899" },
						{ name: "Acesso > Senha", value: 10, color: "#f472b6" },
						{ name: "Suporte > Software", value: 10, color: "#14b8a6" },
						{ name: "Suporte > Hardware", value: 8, color: "#2dd4bf" },
						{ name: "Financeiro > Boleto", value: 7, color: "#f97316" },
						{ name: "Financeiro > Desconto", value: 5, color: "#fb923c" },
						{ name: "Outros", value: 10, color: "#6b7280" },
					],
					categoryTrends: [
						{
							name: "Jan",
							Matrícula: 10,
							Acesso: 8,
							Suporte: 5,
							Financeiro: 3,
							Outros: 2,
						},
						{
							name: "Fev",
							Matrícula: 12,
							Acesso: 9,
							Suporte: 6,
							Financeiro: 4,
							Outros: 3,
						},
						{
							name: "Mar",
							Matrícula: 15,
							Acesso: 10,
							Suporte: 7,
							Financeiro: 5,
							Outros: 3,
						},
						{
							name: "Abr",
							Matrícula: 20,
							Acesso: 12,
							Suporte: 8,
							Financeiro: 6,
							Outros: 4,
						},
						{
							name: "Mai",
							Matrícula: 25,
							Acesso: 15,
							Suporte: 10,
							Financeiro: 7,
							Outros: 5,
						},
						{
							name: "Jun",
							Matrícula: 30,
							Acesso: 18,
							Suporte: 12,
							Financeiro: 8,
							Outros: 6,
						},
					],
					mostCommonCategory: "Matrícula",
					fastestResolvedCategory: "Acesso ao Sistema",
					lowestSatisfactionCategory: "Financeiro",
				};

				setData(simulatedData);
				setIsLoading(false);
			}, 1500);
		};

		fetchData();
	}, [period, viewType, date]);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Distribuição por Categorias</CardTitle>
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

					<Select value={viewType} onValueChange={setViewType}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Tipo de visualização" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="pie">Gráfico de Pizza</SelectItem>
							<SelectItem value="bar">Gráfico de Barras</SelectItem>
							<SelectItem value="subcategories">Subcategorias</SelectItem>
							<SelectItem value="trends">Tendências</SelectItem>
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
							Categoria Mais Comum
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{data.mostCommonCategory}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{data.categoriesData[0].value} chamados (
							{Math.round(
								(data.categoriesData[0].value /
									data.categoriesData.reduce(
										// biome-ignore lint/suspicious/noExplicitAny: <explanation>
										(acc: number, curr: any) => acc + curr.value,
										0,
									)) *
									100,
							)}
							%)
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
							{data.fastestResolvedCategory}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							1.5 dias em média
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Menor Satisfação
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{data.lowestSatisfactionCategory}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							3.2/5 de avaliação média
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						{viewType === "pie" && "Distribuição de Chamados por Categoria"}
						{viewType === "bar" && "Chamados por Categoria"}
						{viewType === "subcategories" && "Distribuição por Subcategorias"}
						{viewType === "trends" &&
							"Tendências de Categorias ao Longo do Tempo"}
					</CardTitle>
					<CardDescription>
						{viewType === "pie" && "Porcentagem de chamados em cada categoria"}
						{viewType === "bar" && "Número de chamados em cada categoria"}
						{viewType === "subcategories" && "Detalhamento por subcategorias"}
						{viewType === "trends" &&
							"Evolução mensal de chamados por categoria"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							{viewType === "pie" ? (
								<PieChart>
									<Pie
										data={data.categoriesData}
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
{data.categoriesData.map((entry: any, index: number) => (
											<Cell key={`cell-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							) : viewType === "bar" ? (
								<BarChart data={data.categoriesData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar
										dataKey="value"
										name="Número de chamados"
										fill="#3b82f6"
									/>
								</BarChart>
							) : viewType === "subcategories" ? (
								<PieChart>
									<Pie
										data={data.subcategoriesData}
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
{data.subcategoriesData.map((entry: any, index: number) => (
											<Cell key={`cell-${// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							) : (
								<BarChart data={data.categoryTrends}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar dataKey="Matrícula" fill="#8b5cf6" />
									<Bar dataKey="Acesso" fill="#ec4899" />
									<Bar dataKey="Suporte" fill="#14b8a6" />
									<Bar dataKey="Financeiro" fill="#f97316" />
									<Bar dataKey="Outros" fill="#6b7280" />
								</BarChart>
							)}
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
