import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineLightningBolt } from "react-icons/hi";
import type { KanbanColumnData } from "./kanbanTypes";

export const kanbanColumns: KanbanColumnData[] = [
  {
    id: "todo",
    title: "To Do",
    icon: HiOutlineClock,
  },
  {
    id: "in-progress",
    title: "In Progress",
    icon: HiOutlineLightningBolt,
  },
  {
    id: "done",
    title: "Done",
    icon: HiOutlineCheckCircle,
  },
];
