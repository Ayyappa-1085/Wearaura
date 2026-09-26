import Sidebar from "../components/Sidebar";

function SidebarSection() {
  return (
    <div className="sidebar-wrapper">
      <Sidebar embedded={true} />
    </div>
  );
}

export default SidebarSection;
