import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Phone, Mail, GraduationCap, Globe, DollarSign, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react"; // Added hooks

const DoctorDetail = () => {
  const { doctorId } = useParams();
  
  // NEW: State for our real doctor data and a loading screen
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // NEW: Fetch the specific doctor from Python using the ID in the URL
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/doctors/${doctorId}`);
        const data = await response.json();

        if (data.doctor) {
          const doc = data.doctor;
          // Map real DB fields and fill the rest with safe placeholders for the UI
          setDoctor({
            id: doc.id.toString(),
            name: doc.name,
            specialty: doc.specialty,
            image: doc.image_url,
            rating: doc.rating,
            reviewCount: 150,
            location: "Downtown Medical Center",
            nextAvailable: "Today",
            consultationFee: "$150",
            experience: `${doc.experience_years} years`,
            languages: ["English", "Spanish"],
            phone: "(555) 123-4567",
            email: "contact@medibook.com",
            bio: doc.bio,
            education: ["MD, Top Tier Medical School", "Residency, National Hospital"],
            services: ["General Consultation", "Follow-up", "Preventive Care"],
            reviews: [
              { name: "Patient A", rating: 5, comment: "Excellent care and bedside manner.", date: "2026-03-01" },
              { name: "Patient B", rating: 4, comment: "Very thorough and professional.", date: "2026-02-15" }
            ]
          });
        }
      } catch (error) {
        console.error("Failed to fetch doctor:", error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  // Show a loading state while fetching
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-muted-foreground animate-pulse">Loading doctor details...</p>
      </div>
    );
  }

  // If fetching finished but no doctor was found
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

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to doctors
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* Left column — profile card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img src={doctor.image} alt={doctor.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-6 text-center">
              <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">{doctor.name}</h1>
              <Badge variant="outline" className="mt-1 bg-primary/10 text-primary border-primary/20">
                {doctor.specialty}
              </Badge>
              <div className="mt-3 flex items-center justify-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-semibold text-foreground">{doctor.rating}</span>
                <span className="text-muted-foreground">({doctor.reviewCount} reviews)</span>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3 text-sm text-left">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  {doctor.location}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0 text-success" />
                  Next available: <span className="font-medium text-success">{doctor.nextAvailable}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <DollarSign className="h-4 w-4 shrink-0 text-primary" />
                  Consultation: <span className="font-semibold text-foreground">{doctor.consultationFee}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Stethoscope className="h-4 w-4 shrink-0 text-primary" />
                  Experience: {doctor.experience}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Globe className="h-4 w-4 shrink-0 text-primary" />
                  {doctor.languages.join(", ")}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  {doctor.phone}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  {doctor.email}
                </div>
              </div>
              <Button asChild className="mt-6 w-full shadow-hero">
                <Link to={`/book/${doctor.id}`}>Book Appointment</Link>
              </Button>
              </div>
            </div>
          </div>

          {/* Right column — details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-heading text-xl font-bold text-foreground">About</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{doctor.bio}</p>
            </div>

            {/* Education */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" /> Education & Training
              </h2>
              <ul className="mt-3 space-y-2">
                {doctor.education.map((edu: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    {edu}
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-heading text-xl font-bold text-foreground">Services Offered</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {doctor.services.map((service: string) => (
                  <Badge key={service} variant="secondary" className="text-sm py-1 px-3">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-heading text-xl font-bold text-foreground">
                Patient Reviews ({doctor.reviews.length})
              </h2>
              <div className="mt-4 space-y-4">
                {doctor.reviews.map((review: any, i: number) => (
                  <div key={i} className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-sm">{review.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3.5 w-3.5 ${idx < review.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;