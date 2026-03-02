import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft,
  Clock, Activity, Plus, Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import AppointmentCard from "@/components/AppointmentCard";
import {
  upcomingAppointments as initialUpcoming,
  pastAppointments as initialPast,
  Appointment,
} from "@/lib/mockData";

interface ProfileData {
  display_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    display_name: "",
    phone: "",
    date_of_birth: "",
    address: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Appointments state
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  // Update your useEffect to fetch both profile AND appointments
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchProfile();
      fetchAppointments(); // Added this call
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, phone, date_of_birth, address, avatar_url")
      .eq("user_id", user!.id)
      .single();

    if (data) {
      setProfile({
        display_name: data.display_name || "",
        phone: data.phone || "",
        date_of_birth: data.date_of_birth || "",
        address: data.address || "",
        avatar_url: data.avatar_url || "",
      });
    }
    setLoading(false);
  };

  // NEW: Add this function below your fetchProfile function
  const fetchAppointments = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/appointments/${user.email}`);
      const data = await response.json();

      if (data.appointments) {
        const upcomingList: any[] = [];
        const pastList: any[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        data.appointments.forEach((apt: any) => {
          const mappedApt = {
            id: apt.id,
            doctorName: apt.doctors?.name || "Unknown Doctor",
            specialty: apt.doctors?.specialty || "General",
            image: apt.doctors?.image_url,
            date: new Date(apt.appointment_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            time: apt.appointment_time,
            type: apt.appointment_type,
            status: apt.status
          };

          const aptDate = new Date(apt.appointment_date);
          if (apt.status === 'cancelled' || apt.status === 'completed' || aptDate < today) {
            if (mappedApt.status === 'upcoming' && aptDate < today) mappedApt.status = 'completed';
            pastList.push(mappedApt);
          } else {
            upcomingList.push(mappedApt);
          }
        });

        setUpcoming(upcomingList);
        setPast(pastList);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name || null,
        phone: profile.phone || null,
        date_of_birth: profile.date_of_birth || null,
        address: profile.address || null,
      })
      .eq("user_id", user!.id);

    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  // Appointment handlers
  const handleCancel = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/appointments/${id}/cancel`, {
        method: "PATCH",
      });

      if (response.ok) {
        const apt = upcoming.find((a) => a.id === id);
        if (!apt) return;
        setUpcoming((prev) => prev.filter((a) => a.id !== id));
        setPast((prev) => [{ ...apt, status: "cancelled" }, ...prev]);
        toast({ title: "Appointment Cancelled" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel", variant: "destructive" });
    }
  };

  const handleReschedule = (id: string, newDate: string, newTime: string) => {
    setUpcoming((prev) =>
      prev.map((a) => (a.id === id ? { ...a, date: newDate, time: newTime } : a))
    );
  };

  const handleReview = (id: string, rating: number, comment: string) => {
    setReviewedIds((prev) => new Set(prev).add(id));
    const apt = past.find((a) => a.id === id);
    toast({
      title: `Review Submitted ⭐`,
      description: `You rated ${apt?.doctorName} ${rating}/5. Thank you for your feedback!`,
    });
  };

  const completedCount = past.filter((a) => a.status === "completed").length;
  const cancelledCount = past.filter((a) => a.status === "cancelled").length;

  const statCards = [
    { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "text-primary" },
    { label: "Completed", value: completedCount, icon: Activity, color: "text-success" },
    { label: "Cancelled", value: cancelledCount, icon: Clock, color: "text-destructive" },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-hero text-2xl font-bold text-primary-foreground">
            {(profile.display_name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{profile.display_name || "User"}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> {user?.email}
            </p>
          </div>
        </div>

        {/* Main tabs: Profile + Appointments */}
        <Tabs defaultValue="appointments" className="mt-8">
          <TabsList>
            <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            <TabsTrigger value="profile">Personal Info</TabsTrigger>
          </TabsList>

          {/* Appointments tab */}
          <TabsContent value="appointments" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">Manage your upcoming and past visits</p>
              <Button asChild className="shadow-hero" size="sm">
                <Link to="/doctors">
                  <Plus className="mr-1 h-4 w-4" /> Book Appointment
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{s.value}</div>
                      <div className="text-sm text-muted-foreground">{s.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sub-tabs for upcoming / past */}
            <Tabs defaultValue="upcoming">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-4 space-y-4">
                {upcoming.length > 0 ? (
                  upcoming.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} onCancel={handleCancel} onReschedule={handleReschedule} />
                  ))
                ) : (
                  <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <p className="text-muted-foreground">No upcoming appointments.</p>
                    <Button asChild className="mt-4">
                      <Link to="/doctors">Book your first appointment</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="past" className="mt-4 space-y-4">
                {past.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onReview={apt.status === "completed" ? handleReview : undefined}
                    reviewed={reviewedIds.has(apt.id)}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Profile tab */}
          <TabsContent value="profile" className="mt-6">
            <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" /> Display Name
                </Label>
                <Input
                  id="name"
                  value={profile.display_name || ""}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={profile.date_of_birth || ""}
                  onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> Address
                </Label>
                <Input
                  id="address"
                  value={profile.address || ""}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="123 Main St, City, State"
                />
              </div>

              <Button type="submit" className="shadow-hero" size="lg" disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
