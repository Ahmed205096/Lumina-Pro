import BodyPro from "../components/Lumina/BodyPro/BodyPro";
import EasyKanban from "../components/Lumina/DragDrop/EasyKanban";
import Sidebar from "../components/Lumina/Sidebar/Sidebar";

export default function WorkBoard() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <BodyPro>
        <EasyKanban />
      </BodyPro>
    </div>
  );
}
