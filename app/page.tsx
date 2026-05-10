export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Understand Your Medicines 💊
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Search any medicine, check dangerous drug combinations, and decode your blood test reports — all in plain English.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="/search" className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition">
            Search Medicine
          </a>
          <a href="/interactions" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
            Check Interactions
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">
          What can MedIQ do?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a href="/search" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-bold text-gray-800 mb-2">Medicine Search</h3>
            <p className="text-sm text-gray-500">Search any medicine by brand or generic name. Get plain English explanations of uses, dosage, and side effects.</p>
          </a>
          <a href="/interactions" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="font-bold text-gray-800 mb-2">Interaction Checker</h3>
            <p className="text-sm text-gray-500">Enter 2 or more medicines to instantly check if they are dangerous to take together. Color-coded severity.</p>
          </a>
          <a href="/report" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="text-3xl mb-3">🩺</div>
            <h3 className="font-bold text-gray-800 mb-2">Report Explainer</h3>
            <p className="text-sm text-gray-500">Upload your blood test report. Get each value flagged as HIGH, LOW, or NORMAL with simple explanations.</p>
          </a>
          <a href="/vault" className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold text-gray-800 mb-2">Medication Vault</h3>
            <p className="text-sm text-gray-500">Save your personal medicines. Get automatic warnings if any two of your medicines clash with each other.</p>
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 max-w-4xl mx-auto mb-16 text-center">
        <p className="text-yellow-800 text-sm">
          <strong>⚠️ Medical Disclaimer:</strong> MedIQ uses real FDA and NHS data but is not a substitute for professional medical advice. Always consult your doctor or pharmacist before making any medication decisions.
        </p>
      </div>
    </div>
  )
}