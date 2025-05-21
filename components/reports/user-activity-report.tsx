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
	Legend,
	LineChart,
	Line,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { DateRange } from "react-day-picker";

export function UserActivityReport() {
	const [period, setPeriod] = useState("month");
	const [viewType, setViewType] = useState("activity");
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
					userActivity: [
						{
							name: "Maria Oliveira",
							tickets: 45,
							resolved: 38,
							satisfaction: 4.5,
						},
						{
							name: "João Silva",
							tickets: 32,
							resolved: 28,
							satisfaction: 4.2,
						},
						{
							name: "Ana Santos",
							tickets: 28,
							resolved: 25,
							satisfaction: 4.7,
						},
						{
							name: "Carlos Ferreira",
							tickets: 25,
							resolved: 20,
							satisfaction: 3.9,
						},
						{
							name: "Lúcia Pereira",
							tickets: 20,
							resolved: 18,
							satisfaction: 4.3,
						},
					],
					activityByDay: [
						{ name: "Seg", tickets: 25, resolved: 20 },
						{ name: "Ter", tickets: 30, resolved: 25 },
						{ name: "Qua", tickets: 35, resolved: 28 },
						{ name: "Qui", tickets: 32, resolved: 26 },
						{ name: "Sex", tickets: 28, resolved: 24 },
						{ name: "Sáb", tickets: 15, resolved: 12 },
						{ name: "Dom", tickets: 8, resolved: 5 },
					],
					activityByHour: [
						{ name: "8h", tickets: 10 },
						{ name: "9h", tickets: 15 },
						{ name: "10h", tickets: 20 },
						{ name: "11h", tickets: 18 },
						{ name: "12h", tickets: 12 },
						{ name: "13h", tickets: 8 },
						{ name: "14h", tickets: 15 },
						{ name: "15h", tickets: 22 },
						{ name: "16h", tickets: 25 },
						{ name: "17h", tickets: 20 },
						{ name: "18h", tickets: 15 },
						{ name: "19h", tickets: 10 },
					],
					mostActiveUser: "Maria Oliveira",
					highestSatisfactionUser: "Ana Santos",
					fastestResolutionUser: "João Silva",
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
					<CardTitle>Atividade de Usuários</CardTitle>
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
							<SelectItem value="activity">Atividade por Usuário</SelectItem>
							<SelectItem value="day">Atividade por Dia</SelectItem>
							<SelectItem value="hour">Atividade por Hora</SelectItem>
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
							Usuário Mais Ativo
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Avatar>
								<AvatarFallback>
									{data.mostActiveUser
										.split(" ")
										.map((n: string) => n[0])
										.join("")
										.substring(0, 2)}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="text-lg font-bold">{data.mostActiveUser}</div>
								<p className="text-xs text-muted-foreground">
									{data.userActivity[0].tickets} chamados atendidos
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Maior Satisfação
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Avatar>
								<AvatarFallback>
									{data.highestSatisfactionUser
										.split(" ")
										.map((n: string) => n[0])
										.join("")
										.substring(0, 2)}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="text-lg font-bold">
									{data.highestSatisfactionUser}
								</div>
								<div className="flex mt-1">
									{Array.from({ length: 5 }).map((_, i) => (
										<span
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={i}
											className={`text-sm ${i < Math.floor(4.7) ? "text-yellow-500" : "text-gray-300"}`}
										>
											★
										</span>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Resolução Mais Rápida
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<Avatar>
								<AvatarFallback>
									{data.fastestResolutionUser
										.split(" ")
										.map((n: string) => n[0])
										.join("")
										.substring(0, 2)}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="text-lg font-bold">
									{data.fastestResolutionUser}
								</div>
								<p className="text-xs text-muted-foreground">
									1.2 dias em média
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>
						{viewType === "activity" && "Atividade por Usuário"}
						{viewType === "day" && "Atividade por Dia da Semana"}
						{viewType === "hour" && "Atividade por Hora do Dia"}
					</CardTitle>
					<CardDescription>
						{viewType === "activity" &&
							"Número de chamados atendidos e resolvidos por usuário"}
						{viewType === "day" && "Distribuição de chamados por dia da semana"}
						{viewType === "hour" && "Distribuição de chamados por hora do dia"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{viewType === "activity" && (
						<div className="space-y-6">
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={data.userActivity}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="name" />
										<YAxis />
										<Tooltip />
										<Legend />
										<Bar
											dataKey="tickets"
											name="Chamados atendidos"
											fill="#3b82f6"
										/>
										<Bar
											dataKey="resolved"
											name="Chamados resolvidos"
											fill="#10b981"
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>

							<div className="border rounded-md">
								<div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
									<div>Usuário</div>
									<div className="text-center">Chamados</div>
									<div className="text-center">Resolvidos</div>
									<div className="text-center">Satisfação</div>
								</div>
								<div className="divide-y">
									{/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
{data.userActivity.map((user: any, index: number) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={index}
											className="grid grid-cols-4 gap-4 p-4 items-center"
										>
											<div className="flex items-center gap-2">
												<Avatar className="h-8 w-8">
													<AvatarFallback className="text-xs">
														{user.name
															.split(" ")
															.map((n: string) => n[0])
															.join("")
															.substring(0, 2)}
													</AvatarFallback>
												</Avatar>
												<span className="text-sm">{user.name}</span>
											</div>
											<div className="text-center">{user.tickets}</div>
											<div className="text-center">
												{user.resolved}
												<span className="text-xs text-muted-foreground ml-1">
													({Math.round((user.resolved / user.tickets) * 100)}%)
												</span>
											</div>
											<div className="text-center">
												<Badge
													variant={
														user.satisfaction >= 4.5
															? "success"
															: user.satisfaction >= 4
																? "default"
																: "secondary"
													}
												>
													{user.satisfaction.toFixed(1)}/5
												</Badge>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{viewType === "day" && (
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={data.activityByDay}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar
										dataKey="tickets"
										name="Chamados abertos"
										fill="#3b82f6"
									/>
									<Bar
										dataKey="resolved"
										name="Chamados resolvidos"
										fill="#10b981"
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					)}

					{viewType === "hour" && (
						<div className="h-80">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={data.activityByHour}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Line
										type="monotone"
										dataKey="tickets"
										name="Chamados abertos"
										stroke="#3b82f6"
										activeDot={{ r: 8 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
