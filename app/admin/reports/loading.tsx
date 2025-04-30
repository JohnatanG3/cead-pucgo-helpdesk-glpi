import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-10 border-b bg-cead-blue text-white">
				<div className="container flex h-16 items-center justify-between px-4 md:px-6">
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-6 w-40" />
					</div>
					<div className="flex items-center gap-4">
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
				</div>
			</header>

			<main className="flex-1 p-4 md:p-6">
				<div className="container mx-auto grid gap-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<Skeleton className="h-8 w-40 mb-2" />
							<Skeleton className="h-4 w-60" />
						</div>
						<div className="flex items-center gap-2">
							<Skeleton className="h-10 w-32" />
						</div>
					</div>

					<div className="space-y-4">
						<Skeleton className="h-10 w-full" />

						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<div key={i} className="rounded-lg border p-4">
									<Skeleton className="h-4 w-24 mb-2" />
									<Skeleton className="h-8 w-16" />
								</div>
							))}
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							{Array.from({ length: 2 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<div key={i} className="rounded-lg border p-4">
									<Skeleton className="h-6 w-40 mb-2" />
									<Skeleton className="h-4 w-full mb-2" />
									<div className="space-y-2 mt-4">
										{Array.from({ length: 4 }).map((_, j) => (
											<div
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												key={j}
												className="flex items-center justify-between"
											>
												<Skeleton className="h-4 w-32" />
												<Skeleton className="h-4 w-8" />
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</main>

			<footer className="border-t py-4">
				<div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
					<Skeleton className="h-4 w-80" />
					<div className="flex items-center gap-4">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
			</footer>
		</div>
	);
}
