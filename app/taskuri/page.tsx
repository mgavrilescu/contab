import { getTaskRows } from "@/actions/tasks";
import TasksTable from "@/components/tasks/tasks-table";

export default async function TaskuriPage() {
  const rows = await getTaskRows();
  return <TasksTable rows={rows} />;
}
