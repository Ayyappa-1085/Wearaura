import { NavLink } from "react-router-dom";

function AdminSidebar({ closeSidebar }) {
  const handleClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <aside className="admin-sidebar">
      <h2 className="admin-logo">WearAura Admin</h2>

      <nav>
        <NavLink to="/admin/dashboard" onClick={handleClick}>
          Dashboard
        </NavLink>

        <NavLink to="/admin/products" onClick={handleClick}>
          Products
        </NavLink>

        <NavLink to="/admin/orders" onClick={handleClick}>
          Orders
        </NavLink>

        <NavLink to="/admin/revenue" onClick={handleClick}>
          Revenue
        </NavLink>

        <NavLink to="/admin/stock" onClick={handleClick}>
          Stock
        </NavLink>

        <NavLink to="/admin/cancelled" onClick={handleClick}>
          Cancelled
        </NavLink>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
