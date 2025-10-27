"use client";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-blue-600 mb-4">WGU CDP Dashboard</h1>
        <p className="text-xl text-gray-700 mb-8">✅ Dashboard is now live!</p>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">Conversions</h3>
            <p className="text-3xl font-bold">125,340</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">Impressions</h3>
            <p className="text-3xl font-bold">2.1M</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">Spend</h3>
            <p className="text-3xl font-bold">$45,230</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 mb-2">Conv Rate</h3>
            <p className="text-3xl font-bold">5.95%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
