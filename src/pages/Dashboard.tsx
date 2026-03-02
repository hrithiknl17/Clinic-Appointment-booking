import { useState, useEffect } from "react";
import { Calendar, Clock, Activity, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AppointmentCard from "@/components/AppointmentCard";
import { useAuth } from "@/contexts/AuthContext"; // NEW: To get the logged-in user

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // NEW: State for real appointments
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  // NEW: Fetch appointments from Python when the component loads
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.email) return;
      
      try {
        const response = await fetch(`https://clinic-appointment-booking-fglv.onrender.com/api/appointments/${user.email}`);
        const data = await response.json();

        if (data.appointments) {
          const upcomingList: any[] = [];
          const pastList: any[] = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          data.appointments.forEach((apt: any) => {
            // Map the database fields to what your AppointmentCard expects
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

            // Sort logic: If the appointment date is in the past, or status is completed/cancelled
            const aptDate = new Date(apt.appointment_date);
            if (apt.status === 'cancelled' || apt.status === 'completed' || aptDate < today) {
              // Force past appointments to 'completed' status if they were still 'upcoming'
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
        toast({ title: "Error", description: "Failed to load appointments.", variant: "destructive" });
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    if (!authLoading && user) {
      fetchAppointments();
    }
  }, [user, authLoading, toast]);

  // Auth guard
  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-foreground">Sign In Required</h1>
        <p className="mt-3 text-muted-foreground">Please log in to view your dashboard.</p>
        <Button onClick={() => navigate("/auth")} className="mt-6 shadow-hero">Sign In</Button>
      </div>
    );
  }

  // --- Handlers (For now, these just update the UI visually. We can hook them to Python next!) ---
  const handleCancel = async (id: string) => {
    try {
      // 1. Tell Python to update the database
      const response = await fetch(`https://clinic-appointment-booking-fglv.onrender.com/api/appointments/${id}/cancel`, {
        method: "PATCH",
      });

      if (response.ok) {
        // 2. If the database update succeeded, instantly update the UI!
        const apt = upcoming.find((a) => a.id === id);
        if (!apt) return;
        
        // Remove it from 'upcoming' and drop it into 'past' with the new status
        setUpcoming((prev) => prev.filter((a) => a.id !== id));
        setPast((prev) => [{ ...apt, status: "cancelled" }, ...prev]);
        
        toast({ title: "Appointment Cancelled", description: "Your appointment has been successfully cancelled." });
      } else {
        toast({ title: "Error", description: "Failed to cancel the appointment.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({ title: "Error", description: "Could not connect to server.", variant: "destructive" });
    }
  };

  const handleReschedule = (id: string, newDate: string, newTime: string) => {
    setUpcoming((prev) =>
      prev.map((a) => (a.id === id ? { ...a, date: newDate, time: newTime } : a))
    );
    toast({ title: "Appointment Rescheduled", description: "Your new time is confirmed." });
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

  if (authLoading || isLoadingAppointments) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">My Appointments</h1>
            <p className="mt-1 text-muted-foreground">Manage your upcoming and past visits</p>
          </div>
          <Button asChild className="shadow-hero w-fit">
            <Link to="/doctors">
              <Plus className="mr-2 h-4 w-4" /> Book Appointment
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
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

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="mt-8">
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
            {past.length > 0 ? (
              past.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onReview={apt.status === "completed" ? handleReview : undefined}
                  reviewed={reviewedIds.has(apt.id)}
                />
              ))
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">No past appointments.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;