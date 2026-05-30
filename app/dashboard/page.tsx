import BodyPro from "../components/Lumina/BodyPro/BodyPro";
import DashboardPage from "../components/Lumina/Dashboard/DashboardPage";
import Sidebar from "../components/Lumina/Sidebar/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <BodyPro>
        <DashboardPage />
      </BodyPro>
    </div>
  );
}
