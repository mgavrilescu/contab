"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type TaskFormValues = {
	id?: number;
	title: string;
	date?: string;
	done: boolean;
	notes?: string;
	blocked?: string;
	objective?: string;
	userId: number;
	clientId: number;
};

type Option = { id: number; label: string };

type Props = {
	initial?: Partial<TaskFormValues>;
	options: { users: Option[]; clients: Option[] };
	onSubmit: (fd: FormData) => Promise<{ id: number } | (TaskFormValues & { id: number })>;
	submitLabel?: string;
};

export default function TaskForm({ initial, options, onSubmit, submitLabel = "Salveaza" }: Props) {
	const router = useRouter();
	const [busy, setBusy] = useState(false);
	const [title, setTitle] = useState(initial?.title ?? "");
	const [date, setDate] = useState(initial?.date ?? "");
	const [done, setDone] = useState<boolean>(initial?.done ?? false);
	const [notes, setNotes] = useState(initial?.notes ?? "");
	const [blocked, setBlocked] = useState(initial?.blocked ?? "");
	const [objective, setObjective] = useState(initial?.objective ?? "");
	const [userId, setUserId] = useState<number>(initial?.userId ?? (options.users[0]?.id || 0));
	const [clientId, setClientId] = useState<number>(initial?.clientId ?? (options.clients[0]?.id || 0));

	useEffect(() => {
		setTitle(initial?.title ?? "");
		setDate(initial?.date ?? "");
		setDone(initial?.done ?? false);
		setNotes(initial?.notes ?? "");
		setBlocked(initial?.blocked ?? "");
		setObjective(initial?.objective ?? "");
		if (initial?.userId) setUserId(initial.userId);
		if (initial?.clientId) setClientId(initial.clientId);
	}, [initial]);

	async function handleAction(fd: FormData) {
		setBusy(true);
		try {
			const res = await onSubmit(fd);
			if ("id" in res) {
				if (initial?.id) {
					toast.success("Task salvat");
				} else {
					router.push(`/taskuri/edit/${res.id}`);
					toast.success("Task creat");
				}
			}
		} catch (e: unknown) {
			toast.error(e instanceof Error ? e.message : "Eroare la salvare");
		} finally {
			setBusy(false);
		}
	}

	return (
		<form
			action={(fd: FormData) => {
				// Overwrite with controlled state
				fd.set("title", title);
				if (date) fd.set("date", date);
				fd.set("done", done ? "true" : "false");
				fd.set("notes", notes);
				fd.set("blocked", blocked);
				fd.set("objective", objective);
				fd.set("userId", String(userId));
				fd.set("clientId", String(clientId));
				return handleAction(fd);
			}}
			className="grid grid-cols-1 md:grid-cols-2 gap-4"
		>
			<div className="md:col-span-2">
				<label className="mb-2 block text-indigo-800">Titlu</label>
				<Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
			</div>
			<div>
				<label className="mb-2 block text-indigo-800">Data</label>
				<Input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} required />
			</div>
			<div>
				<label className="mb-2 block text-indigo-800">User</label>
				<Select value={String(userId)} onValueChange={(v) => setUserId(Number(v))}>
					<SelectTrigger><SelectValue placeholder="Selecteaza user" /></SelectTrigger>
					<SelectContent>
						{options.users.map((u) => (
							<SelectItem key={u.id} value={String(u.id)}>{u.label}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div>
				<label className="mb-2 block text-indigo-800">Client</label>
				<Select value={String(clientId)} onValueChange={(v) => setClientId(Number(v))}>
					<SelectTrigger><SelectValue placeholder="Selecteaza client" /></SelectTrigger>
					<SelectContent>
						{options.clients.map((c) => (
							<SelectItem key={c.id} value={String(c.id)}>{c.label}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="md:col-span-2">
				<label className="mb-2 block text-indigo-800">Obiectiv</label>
				<Input name="objective" value={objective} onChange={(e) => setObjective(e.target.value)} />
			</div>
			<div className="md:col-span-2">
				<label className="mb-2 block text-indigo-800">Blocata</label>
				<Input name="blocked" value={blocked} onChange={(e) => setBlocked(e.target.value)} />
			</div>
			<div className="md:col-span-2">
				<label className="mb-2 block text-indigo-800">Note</label>
				<Input name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
			</div>
			<div className="md:col-span-2 mt-2">
				<input type="hidden" name="done" value={done ? "true" : "false"} />
				<label className="inline-flex items-center gap-2">
					<Checkbox checked={done} onCheckedChange={(v) => setDone(Boolean(v))} />
					<span>Finalizat</span>
				</label>
			</div>
			<div className="md:col-span-2 flex justify-end mt-4">
				<Button type="submit" disabled={busy} className="bg-indigo-800 text-white hover:bg-indigo-700">{submitLabel}</Button>
			</div>
		</form>
	);
}
