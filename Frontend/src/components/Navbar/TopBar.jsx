function TopBar({ hidden }) {
  return (
    <div className={`top-bar ${hidden ? "top-bar-hidden" : ""}`}>
      <p>Elegance in Every Thread.</p>
    </div>
  );
}

export default TopBar;
