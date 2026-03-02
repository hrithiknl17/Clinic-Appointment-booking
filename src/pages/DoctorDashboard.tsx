import { useState, useEffect } from "react";
import { Calendar, Video, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Bring in your Auth Context!

const DoctorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!user?.email) return;

      try {
        // 1. Check if the logged in user is a doctor
        const docRes = await fetch(`http://127.0.0.1:8000/api/doctors/by-email/${user.email}`);
        const docData = await docRes.json();

        if (docData.error || !docData.doctor) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        setDoctorInfo(docData.doctor);

        // 2. If they are a doctor, fetch their specific schedule
        const schedRes = await fetch(`http://127.0.0.1:8000/api/doctor-dashboard/${docData.doctor.id}`);
        const schedData = await schedRes.json();
        
        if (schedData.appointments) {
          setAppointments(schedData.appointments);
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        navigate("/auth"); // Kick to login if not logged in at all
      } else {
        fetchDoctorData();
      }
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return <div className="p-20 text-center animate-pulse text-muted-foreground">Verifying Provider Credentials...</div>;
  }

  // Security Guard for normal patients trying to access this page
  if (accessDenied) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-3 text-muted-foreground">Your account does not have provider privileges.</p>
        <Button asChild className="mt-6 shadow-hero">
          <Link to="/dashboard">Go to Patient Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Provider Portal</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {doctorInfo?.name}. Here is your schedule.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary">{appointments.filter(a => a.status === 'upcoming').length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Upcoming</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">{appointments.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Upcoming Appointments</h2>
          </div>
          
          <div className="divide-y divide-border">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No appointments scheduled yet.</div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-muted/10">
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {apt.patient_email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{apt.patient_email}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {apt.appointment_date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {apt.appointment_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:ml-auto">
                    <Badge variant="outline" className={
                      apt.status === 'upcoming' ? 'bg-primary/10 text-primary border-primary/20' : 
                      apt.status === 'cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                      'bg-success/10 text-success border-success/20'
                    }>
                      {apt.status}
                    </Badge>
                    
                    {apt.status === 'upcoming' && apt.appointment_type === 'video' && (
                      <Button asChild className="shadow-hero">
                        <Link to={`/video-call/${apt.id}`}>
                          <Video className="mr-2 h-4 w-4" /> Join Room
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;