import PageLayout from "../components/PageLayout";

const Plans = () => {
  // TEMP: later this will come from backend / user context
  const currentPlan = "Free"; // "Free" | "Pro" | "Enterprise"

  return (
    <PageLayout
      title="💳 Choose Your Plan"
      subtitle="Simple pricing that grows with you"
    >
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {/* ================= FREE ================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col">
          <h3 className="text-xl font-semibold mb-1">Free</h3>
          <p className="text-slate-500 mb-4">
            For trying things out
          </p>

          <p className="text-4xl font-bold mb-6">₹0</p>

          <ul className="space-y-3 text-sm text-slate-600 flex-1">
            <li>✔ 100 MB Storage</li>
            <li>✔ 7 Day Expiry</li>
            <li>✔ Manual Delete</li>
            <li>✖ No Auto Cleanup</li>
            <li>✖ No Priority Support</li>
          </ul>

          <button
            disabled
            className="mt-8 w-full bg-slate-200 text-slate-500 py-2 rounded-lg cursor-not-allowed"
          >
            {currentPlan === "Free" ? "Current Plan" : "Downgrade"}
          </button>
        </div>

        {/* ================= PRO ================= */}
        <div className="relative bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-600 flex flex-col">
          {/* BADGE */}
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
            Most Popular
          </span>

          <h3 className="text-xl font-semibold mb-1">Pro</h3>
          <p className="text-slate-500 mb-4">
            Best for regular users
          </p>

          <p className="text-4xl font-bold mb-6">
            ₹199 <span className="text-sm font-normal">/ month</span>
          </p>

          <ul className="space-y-3 text-sm text-slate-600 flex-1">
            <li>✔ 5 GB Storage</li>
            <li>✔ 30 Day Expiry</li>
            <li>✔ Auto Delete</li>
            <li>✔ Faster Downloads</li>
            <li>✔ Priority Support</li>
          </ul>

          <button
            className={`mt-8 w-full py-2 rounded-lg transition ${
              currentPlan === "Pro"
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            disabled={currentPlan === "Pro"}
          >
            {currentPlan === "Pro" ? "Current Plan" : "Upgrade to Pro"}
          </button>
        </div>

        {/* ================= ENTERPRISE ================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border flex flex-col">
          <h3 className="text-xl font-semibold mb-1">
            Enterprise
          </h3>
          <p className="text-slate-500 mb-4">
            For teams & businesses
          </p>

          <p className="text-4xl font-bold mb-6">Custom</p>

          <ul className="space-y-3 text-sm text-slate-600 flex-1">
            <li>✔ Unlimited Storage</li>
            <li>✔ Custom Expiry Rules</li>
            <li>✔ API Access</li>
            <li>✔ SLA Support</li>
            <li>✔ Dedicated Manager</li>
          </ul>

          <button
            className="mt-8 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Plans;
