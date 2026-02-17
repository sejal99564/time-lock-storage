import { useState } from "react";
import PageLayout from "../components/PageLayout";
import api from "../services/api";

const Profile = () => {
  // TEMP (later comes from backend)
  const [name, setName] = useState("Test User");
  const [email] = useState("test@example.com");
  const [plan] = useState("Free");
  const [storage] = useState("100 MB");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      showToast("❌ Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // 🔒 Backend ready placeholder
      // await api.patch("/user/update", { name, password });

      showToast("✅ Profile updated successfully");
      setPassword("");
      setConfirmPassword("");
    } catch {
      showToast("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="👤 Profile"
      subtitle="Manage your personal information and security"
    >
      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT: PROFILE FORM */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">
            Personal Information
          </h2>

          <div className="space-y-5">
            {/* NAME */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-slate-100 cursor-not-allowed"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            {/* SAVE */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: PLAN INFO */}
        <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4">
            Subscription
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-slate-500">Current Plan</p>
              <p className="font-medium">{plan}</p>
            </div>

            <div>
              <p className="text-slate-500">Storage Limit</p>
              <p className="font-medium">{storage}</p>
            </div>

            <button
              onClick={() => window.location.href = "/plans"}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition mt-4"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </PageLayout>
  );
};

export default Profile;
