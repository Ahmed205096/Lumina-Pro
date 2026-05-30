import BodyPro from "../components/Lumina/BodyPro/BodyPro";
import Sidebar from "../components/Lumina/Sidebar/Sidebar";
import TeamShowcasePage from "../components/Lumina/Team/TeamShowcasePage";

export default function TeamShowcaseRoute() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <BodyPro>
        <TeamShowcasePage />
      </BodyPro>
    </div>
  );
}
