import { useState, useEffect } from "react";
import { Users, Calendar, ShieldCheck, Stethoscope, Trash2, PlusCircle, LayoutDashboard, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: "", email: "", password: "", specialty: "", experience_years: 5 });

  const API_BASE = "https://clinic-appointment-booking-fglv.onrender.com";

  useEffect(() => {
    const verifyAndLoadData = async () => {
      if (!user?.email) return;
      try {
        const roleRes = await fetch(`${API_BASE}/api/auth/check-role/${user.email}`);
        const roleData = await roleRes.json();
        
        if (roleData.role !== "admin") {
          navigate("/dashboard");
          return;
        }
        setIsAdmin(true);

        const docRes = await fetch(`${API_BASE}/api/doctors`);
        const docData = await docRes.json();
        setDoctors(docData.doctors || []);

        const aptRes = await fetch(`${API_BASE}/api/admin/all-appointments`);
        const aptData = await aptRes.json();
        setAppointments(aptData.appointments || []);

      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) navigate("/auth");
      else verifyAndLoadData();
    }
  }, [user, authLoading, navigate]);

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm("Are you sure you want to remove this doctor?")) return;
    try {
      await fetch(`${API_BASE}/api/admin/doctors/${id}`, { method: "DELETE" });
      setDoctors(doctors.filter(d => d.id !== id));
      toast({ title: "Doctor removed." });
    } catch (err) {
      toast({ title: "Error deleting doctor", variant: "destructive" });
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoc)
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setDoctors([...doctors, data.doctor]);
      setShowAddModal(false);
      setNewDoc({ name: "", email: "", password: "", specialty: "", experience_years: 5 });
      toast({ title: "Doctor securely created!" });
    } catch (err: any) {
      toast({ title: "Failed to create doctor", description: err.message, variant: "destructive" });
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Force cancel this appointment?")) return;
    try {
      await fetch(`${API_BASE}/api/appointments/${id}/cancel`, { method: "PATCH" });
      setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status: "cancelled" } : apt));
      toast({ title: "Appointment forcefully cancelled." });
    } catch (err) {
      toast({ title: "Error cancelling", variant: "destructive" });
    }
  };

  if (isLoading || !isAdmin) return <div className="p-20 text-center animate-pulse">Authenticating Admin Access...</div>;

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50 relative">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-xl"><ShieldCheck className="text-emerald-400" /> MediAdmin</div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab("overview")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === "overview" ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}><LayoutDashboard size={18} /> Overview</button>
          <button onClick={() => setActiveTab("doctors")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === "doctors" ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}><Stethoscope size={18} /> Manage Doctors</button>
          <button onClick={() => setActiveTab("appointments")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === "appointments" ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}><Calendar size={18} /> All Appointments</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>
            <div className="flex gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border w-64">
                <p className="text-sm text-slate-500">Active Doctors</p>
                <h2 className="text-4xl font-bold mt-2">{doctors.length}</h2>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border w-64">
                <p className="text-sm text-slate-500">Total Appointments</p>
                <h2 className="text-4xl font-bold mt-2">{appointments.length}</h2>
              </div>
            </div>
          </div>
        )}

        {activeTab === "doctors" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Doctor Directory</h2>
              <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><PlusCircle size={18} /> Add New Doctor</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b"><tr className="text-slate-500 text-sm"><th className="p-4">Name</th><th className="p-4">Specialty</th><th className="p-4">Email</th><th className="p-4 text-right">Actions</th></tr></thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 font-medium">{doc.name}</td><td className="p-4 text-slate-600">{doc.specialty}</td><td className="p-4 text-slate-600">{doc.email}</td>
                      <td className="p-4 text-right"><button onClick={() => handleDeleteDoctor(doc.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Global Appointment Ledger</h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b"><tr className="text-slate-500 text-sm"><th className="p-4">Date</th><th className="p-4">Patient</th><th className="p-4">Provider</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">{apt.appointment_date} <span className="text-xs text-slate-500 block">{apt.appointment_time}</span></td>
                      <td className="p-4 text-slate-600">{apt.patient_email}</td>
                      <td className="p-4 text-slate-600">{apt.doctors?.name || 'Unknown'}</td>
                      <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{apt.status}</span></td>
                      <td className="p-4 text-right">
                        {apt.status === 'upcoming' && <button onClick={() => handleCancelAppointment(apt.id)} className="text-xs text-red-600 font-bold">Cancel</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Doctor Modal Popup */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add Provider Credentials</h3>
              <button onClick={() => setShowAddModal(false)}><X className="text-slate-400 hover:text-red-500" /></button>
            </div>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Full Name (e.g. Dr. Smith)</label><input required className="w-full border p-2 rounded mt-1" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} /></div>
                <div><label className="text-sm font-medium">Specialty</label><input required className="w-full border p-2 rounded mt-1" value={newDoc.specialty} onChange={e => setNewDoc({...newDoc, specialty: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Login Email</label><input required type="email" className="w-full border p-2 rounded mt-1" value={newDoc.email} onChange={e => setNewDoc({...newDoc, email: e.target.value})} /></div>
                <div><label className="text-sm font-medium">Secure Password</label><input required type="password" minLength={6} className="w-full border p-2 rounded mt-1" value={newDoc.password} onChange={e => setNewDoc({...newDoc, password: e.target.value})} /></div>
              </div>
              <div><label className="text-sm font-medium">Years of Experience</label><input required type="number" className="w-full border p-2 rounded mt-1" value={newDoc.experience_years} onChange={e => setNewDoc({...newDoc, experience_years: parseInt(e.target.value)})} /></div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg mt-4">Create Doctor Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;