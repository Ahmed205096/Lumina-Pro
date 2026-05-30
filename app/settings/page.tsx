import BodyPro from "../components/Lumina/BodyPro/BodyPro";
import SettingsPage from "../components/Lumina/Settings/settings";
import Sidebar from "../components/Lumina/Sidebar/Sidebar";

export default function Settings() {


  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <BodyPro>
          <SettingsPage />
        </BodyPro>
      </div>
    </>
  );
}
