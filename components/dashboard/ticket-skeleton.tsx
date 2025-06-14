import { Skeleton } from "@/components/ui/skeleton";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";

export function TicketSkeleton() {
	return (
		<Card>
			<CardHeader className="pb-2">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="mt-2 h-4 w-1/2" />
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<div key={i} className="flex flex-col space-y-2">
							<Skeleton className="h-[60px] w-full rounded-md" />
						</div>
					))}
				</div>
			</CardContent>
			<CardFooter>
				<Skeleton className="h-9 w-full" />
			</CardFooter>
		</Card>
	);
}
