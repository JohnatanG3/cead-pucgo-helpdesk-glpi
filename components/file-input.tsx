"use client";

import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";

export interface FileInputProps {
	id: string;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
	accept?: string;
	multiple?: boolean;
	buttonText?: string;
	selectedFiles?: File[];
	onRemove?: (index: number) => void;
}

export function FileInput({
	id,
	onChange,
	disabled = false,
	accept,
	multiple = false,
	buttonText = "Selecionar arquivo",
	selectedFiles = [],
	onRemove,
}: FileInputProps) {
	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => document.getElementById(id)?.click()}
					disabled={disabled}
				>
					<Paperclip className="mr-2 h-4 w-4" />
					{buttonText}
				</Button>
				<input
					type="file"
					id={id}
					onChange={onChange}
					disabled={disabled}
					accept={accept}
					multiple={multiple}
					className="hidden"
				/>
			</div>

			{selectedFiles.length > 0 && (
				<div className="space-y-2 mt-2">
					{selectedFiles.map((file, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={index}
							className="flex items-center justify-between p-2 border rounded-md"
						>
							<div className="flex items-center gap-2 overflow-hidden">
								<Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
								<span className="text-sm truncate">{file.name}</span>
							</div>
							{onRemove && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0"
									onClick={() => onRemove(index)}
								>
									<span className="sr-only">Remover</span>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
