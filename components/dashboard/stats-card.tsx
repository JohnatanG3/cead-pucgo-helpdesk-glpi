import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

const statVariants = cva("", {
	variants: {
		trend: {
			up: "text-green-500",
			down: "text-red-500",
			neutral: "text-muted-foreground",
		},
	},
	defaultVariants: {
		trend: "neutral",
	},
});

interface StatsCardProps extends VariantProps<typeof statVariants> {
	title: string;
	value: string | number;
	description?: string;
	icon?: React.ReactNode;
	change?: string;
	trend?: "up" | "down" | "neutral";
	className?: string;
}

export function StatsCard({
	title,
	value,
	description,
	icon,
	change,
	trend = "neutral",
	className,
}: StatsCardProps) {
	return (
		<Card
			className={cn(
				"overflow-hidden transition-all duration-200 hover:shadow-md",
				className,
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{(description || change) && (
					<div className="mt-1 flex items-center text-xs">
						{trend && trend !== "neutral" && (
							<span className={cn("mr-1", statVariants({ trend }))}>
								{trend === "up" ? (
									<ArrowUpIcon className="h-3 w-3" />
								) : (
									<ArrowDownIcon className="h-3 w-3" />
								)}
							</span>
						)}
						<p className={cn("text-xs", statVariants({ trend }))}>
							{description || change}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
