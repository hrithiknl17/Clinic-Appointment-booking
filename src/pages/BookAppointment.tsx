import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Check, Calendar as CalIcon, Video, Building2, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { generateTimeSlots } from "@/lib/mockData"; 
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type AppointmentType = "in-person" | "video";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  // State for real doctor data and saving status
  const [doctor, setDoctor] = useState<any>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("in-person");
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  // Fetch real doctor data from Python API
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/doctors/${doctorId}`);
        const data = await response.json();
        if (data.doctor) {
          const doc = data.doctor;
          setDoctor({
            id: doc.id.toString(),
            name: doc.name,
            specialty: doc.specialty,
            image: doc.image_url,
            rating: doc.rating,
            reviewCount: 150,
            location: "Downtown Medical Center",
            bio: doc.bio,
          });
        }
      } catch (error) {
        console.error("Failed to fetch doctor:", error);
      } finally {
        setLoadingDoctor(false);
      }
    };

    if (doctorId) fetchDoctor();
  }, [doctorId]);

  if (loadingDoctor) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground animate-pulse">Loading booking details...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Doctor not found.</p>
        <Button asChild className="mt-4">
          <Link to="/doctors">Browse Doctors</Link>
        </Button>
      </div>
    );
  }

  // Auth guard: redirect to login if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-foreground">Sign In Required</h1>
        <p className="mt-3 text-muted-foreground">
          Please log in to book an appointment with <strong>{doctor.name}</strong>.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => navigate("/auth")} size="lg" className="shadow-hero">
            Sign In to Book
          </Button>
          <Button asChild variant="outline">
            <Link to="/doctors">Back to Doctors</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Save the appointment to the real database
  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      // Format the date properly for the database (YYYY-MM-DD)
      const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
      
      const response = await fetch("http://127.0.0.1:8000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctorId,
          patient_email: user?.email || "guest@medibook.com", 
          appointment_date: formattedDate,
          appointment_time: selectedSlot,
          appointment_type: appointmentType,
        }),
      });

      if (response.ok) {
        setStep("done");
        toast({
          title: "Appointment Confirmed! ✓",
          description: `Your ${appointmentType === "video" ? "video call" : "in-person"} appointment with ${doctor.name} has been booked.`,
        });
      } else {
        toast({ title: "Booking failed", description: "Please try again later.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not connect to server.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (step === "done") {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <Check className="h-10 w-10 text-success" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-foreground">Booking Confirmed!</h1>
        <p className="mt-3 text-muted-foreground">
          Your {appointmentType === "video" ? "video call" : "in-person"} appointment with{" "}
          <strong>{doctor.name}</strong> on{" "}
          {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at{" "}
          {selectedSlot} has been confirmed.
        </p>
        {appointmentType === "video" && (
          <p className="mt-2 text-sm text-primary font-medium">
            📹 A video call link will be available in your dashboard before the appointment.
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">A confirmation email has been sent to your inbox.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/dashboard">View My Appointments</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/doctors">Book Another</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link
          to={`/doctor/${doctorId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* Doctor info sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="h-40 overflow-hidden">
                <img src={doctor.image} alt={doctor.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <h2 className="font-heading text-xl font-bold text-foreground">{doctor.name}</h2>
                <p className="text-sm font-medium text-primary">{doctor.specialty}</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  {doctor.rating} ({doctor.reviewCount} reviews)
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {doctor.location}
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{doctor.bio}</p>
              </div>
            </div>
          </div>

          {/* Booking area */}
          <div className="lg:col-span-2">
            {step === "select" && (
              <div className="animate-fade-in">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">Select Date & Time</h1>
                <p className="mt-1 text-muted-foreground">Choose a convenient time for your visit</p>

                {/* Appointment Type Toggle */}
                <div className="mt-6">
                  <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Appointment Type</h3>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <button
                      onClick={() => setAppointmentType("in-person")}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                        appointmentType === "in-person"
                          ? "border-primary bg-primary/5 shadow-hero"
                          : "border-border bg-card hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        appointmentType === "in-person" ? "bg-primary/10" : "bg-secondary"
                      )}>
                        <Building2 className={cn("h-5 w-5", appointmentType === "in-person" ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">In-Person</div>
                        <div className="text-xs text-muted-foreground">Visit the clinic</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setAppointmentType("video")}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                        appointmentType === "video"
                          ? "border-accent bg-accent/5 shadow-hero"
                          : "border-border bg-card hover:border-accent/30"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        appointmentType === "video" ? "bg-accent/10" : "bg-secondary"
                      )}>
                        <Video className={cn("h-5 w-5", appointmentType === "video" ? "text-accent" : "text-muted-foreground")} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">Video Call</div>
                        <div className="text-xs text-muted-foreground">Meet online</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => {
                        setSelectedDate(d);
                        setSelectedSlot(null);
                      }}
                      disabled={(date) => date < new Date()}
                      className="pointer-events-auto"
                    />
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      Available Times
                    </h3>
                    {selectedDate && (
                      <p className="text-sm text-muted-foreground">
                        {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </p>
                    )}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                            selectedSlot === slot.time
                              ? "border-primary bg-primary text-primary-foreground shadow-hero"
                              : slot.available
                              ? "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary"
                              : "cursor-not-allowed border-border bg-muted text-muted-foreground/40"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    size="lg"
                    disabled={!selectedSlot}
                    onClick={() => setStep("confirm")}
                    className="shadow-hero"
                  >
                    Continue to Confirm
                  </Button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="animate-fade-in">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">Confirm Appointment</h1>
                <p className="mt-1 text-muted-foreground">Review your booking details</p>

                <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Doctor</span>
                      <span className="font-medium text-foreground">{doctor.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Specialty</span>
                      <span className="font-medium text-foreground">{doctor.specialty}</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Type</span>
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        {appointmentType === "video" ? (
                          <><Video className="h-4 w-4 text-accent" /> Video Call</>
                        ) : (
                          <><Building2 className="h-4 w-4 text-primary" /> In-Person</>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-foreground">
                        {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium text-foreground">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {appointmentType === "video" ? "Platform" : "Location"}
                      </span>
                      <span className="font-medium text-foreground">
                        {appointmentType === "video" ? "MediBook Video" : doctor.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button variant="outline" onClick={() => setStep("select")} disabled={isSaving}>
                    Back
                  </Button>
                  <Button onClick={handleConfirm} size="lg" className="shadow-hero" disabled={isSaving}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;