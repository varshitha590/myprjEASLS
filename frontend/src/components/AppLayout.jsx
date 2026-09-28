import TopBar from "./TopBar";

export default function AppLayout({ children }) {
  return (
    <>
      <TopBar />
      <div style={{ paddingTop: "60px" }}>
        {children}
      </div>
    </>
  );
}
