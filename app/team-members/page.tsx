import BodyPro from "../components/Lumina/BodyPro/BodyPro";
import Sidebar from "../components/Lumina/Sidebar/Sidebar";
import TeamPage from "../components/Lumina/Team/TeamPage";

export default function TeamMembers() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <BodyPro>
        <TeamPage />
      </BodyPro>
    </div>
  );
}
