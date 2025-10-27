export default function Page() {
  return (
    <div style={{ padding: "40px", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "48px", color: "#2563eb", marginBottom: "30px" }}>
        WGU CDP Dashboard
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        <div style={{ background: "white", border: "1px solid #e5e7eb", padding: "20px", borderRadius: "8px" }}>
          <div style={{ color: "#6b7280", marginBottom: "10px" }}>Total Conversions</div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>125,340</div>
        </div>
        <div style={{ background: "white", border: "1px solid #e5e7eb", padding: "20px", borderRadius: "8px" }}>
          <div style={{ color: "#6b7280", marginBottom: "10px" }}>Impressions</div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>2.1M</div>
        </div>
        <div style={{ background: "white", border: "1px solid #e5e7eb", padding: "20px", borderRadius: "8px" }}>
          <div style={{ color: "#6b7280", marginBottom: "10px" }}>Total Spend</div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>$45,230</div>
        </div>
        <div style={{ background: "white", border: "1px solid #e5e7eb", padding: "20px", borderRadius: "8px" }}>
          <div style={{ color: "#6b7280", marginBottom: "10px" }}>Conv. Rate</div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>5.95%</div>
        </div>
      </div>
    </div>
  );
}