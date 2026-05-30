import { ReactSortable } from "react-sortablejs";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import KanbanTaskCard from "./KanbanTaskCard";
import type { KanbanColumnData, KanbanTask } from "./kanbanTypes";

interface KanbanColumnProps {
  column: KanbanColumnData;
  tasks: KanbanTask[];
  setTasks: (tasks: KanbanTask[]) => void;
  canDragTask?: (task: KanbanTask) => boolean;
  onEditTask?: (task: KanbanTask) => void;
  onDeleteTask?: (task: KanbanTask) => void;
}

export default function KanbanColumn({
  column,
  tasks,
  setTasks,
  canDragTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const ColumnIcon = column.icon;

  return (
    <section className="flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#1f1f27]/70 p-4 backdrop-blur-2xl">
      <header className="mb-5 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <ColumnIcon aria-hidden="true" className="text-[#c7c4d7]" size={18} />
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#c7c4d7]">
            {column.title}
          </h2>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white/80">
            {tasks.length}
          </span>
        </div>

        <button
          aria-label={`${column.title} column options`}
          className="grid h-8 w-8 place-items-center rounded-lg text-[#c7c4d7]/60 transition hover:bg-white/5 hover:text-white"
          type="button"
        >
          <HiOutlineDotsHorizontal aria-hidden="true" size={20} />
        </button>
      </header>

      <ReactSortable
        list={tasks}
        setList={setTasks}
        group="project-pulse-board"
        animation={180}
        ghostClass="opacity-40"
        chosenClass="scale-[0.99]"
        className="kanban-scroll flex-1 space-y-4 overflow-y-auto pr-1"
        filter=".kanban-locked"
        preventOnFilter={false}
      >
        {tasks.map((task) => {
          const draggable = canDragTask ? canDragTask(task) : true;
          return (
            <div key={task.id} className={draggable ? "" : "kanban-locked"}>
              <KanbanTaskCard
                task={task}
                isDone={column.id === "done"}
                draggable={draggable}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            </div>
          );
        })}
      </ReactSortable>
    </section>
  );
}
