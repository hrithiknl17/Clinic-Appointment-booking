import { Search, Calendar, Shield, Clock, ArrowRight, Star, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import DoctorCard from "@/components/DoctorCard";
import { specialties } from "@/lib/mockData"; // Notice we removed 'doctors' from here!
import { useState, useEffect } from "react"; // Added useEffect
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Licensed Doctors", value: "500+" },
  { label: "Appointments Booked", value: "50K+" },
  { label: "Patient Satisfaction", value: "98%" },
];

const features = [
  {
    icon: Calendar,
    title: "Easy Scheduling",
    desc: "Book appointments in seconds with our intuitive calendar. Choose your preferred date, time, and doctor.",
  },
  {
    icon: Clock,
    title: "Real-time Availability",
    desc: "See live doctor availability and get instant confirmations. No more waiting on hold.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your health data is protected with enterprise-grade encryption and HIPAA-compliant infrastructure.",
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const [realDoctors, setRealDoctors] = useState<any[]>([]);
  // NEW: State for real articles
  const [realArticles, setRealArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Doctors
        const docRes = await fetch("http://127.0.0.1:8000/api/doctors");
        const docData = await docRes.json();
        const mappedDoctors = docData.doctors.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          specialty: doc.specialty,
          image: doc.image_url,
          rating: doc.rating,
          reviewCount: 150,
          location: "Main Clinic",
          nextAvailable: "Today",
          bio: doc.bio,
        }));
        setRealDoctors(mappedDoctors);

        // NEW: Fetch Articles from Python
        const artRes = await fetch("http://127.0.0.1:8000/api/articles");
        const artData = await artRes.json();
        setRealArticles(artData.articles || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/doctors${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.04]" />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — text */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
                <Heart className="h-4 w-4 fill-primary text-primary" />
                Trusted by 50,000+ patients
              </div>
              <h1 className="text-4xl font-extrabold leading-tight text-foreground md:text-5xl lg:text-6xl">
                Your Health,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Simplified
                </span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground md:text-xl max-w-lg">
                Find top-rated doctors, book appointments instantly, and manage your healthcare journey — all in one place.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="mt-8 flex max-w-xl gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by doctor, specialty, or condition..."
                    className="h-12 pl-10 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-6 shadow-hero">
                  Search
                </Button>
              </form>

              {/* Specialty pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {specialties.slice(0, 5).map((s) => (
                  <Link
                    key={s}
                    to={`/doctors?q=${encodeURIComponent(s)}`}
                    className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                  >
                    {s}
                  </Link>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-foreground md:text-3xl">{s.value}</div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero image */}
            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden rounded-2xl shadow-card-hover">
                <img
                  src="/images/hero-doctor.jpg"
                  alt="Healthcare professional"
                  className="h-[500px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>
              {/* Floating stats card */}
              <div className="absolute -bottom-4 -left-6 rounded-xl border border-border bg-card p-4 shadow-card-hover">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <Star className="h-5 w-5 fill-warning text-warning" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">4.9/5</div>
                    <div className="text-xs text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </div>
              {/* Floating appointment card */}
              <div className="absolute -right-4 top-8 rounded-xl border border-border bg-card p-4 shadow-card-hover">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">50K+</div>
                    <div className="text-xs text-muted-foreground">Appointments</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
            Why patients choose MediBook
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            A smarter way to manage your healthcare appointments
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Top-Rated Doctors</h2>
              <p className="mt-2 text-muted-foreground">Trusted professionals ready to help</p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link to="/doctors">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* CHANGED THIS LINE to use realDoctors instead of featuredDoctors */}
            {realDoctors.slice(0, 3).map((doc, i) => (
              <DoctorCard key={doc.id} doctor={doc} index={i} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/doctors">View all doctors</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Health Articles */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-primary">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Expert Insights</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Read Top Articles from Health Experts
              </h2>
              <p className="mt-2 text-muted-foreground">
                Stay informed with the latest health advice from our doctors
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {realArticles.length > 0 ? (
              realArticles.map((article, i) => (
                <article
                  key={article.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image_url} /* Changed to image_url from DB */
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                    <Badge className="absolute bottom-3 left-3 bg-primary/90 text-primary-foreground hover:bg-primary">
                      {article.category}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-heading text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {article.excerpt || article.content.substring(0, 100) + "..."}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <div className="text-sm">
                        <span className="font-medium text-foreground">{article.author_name}</span>
                        <span className="ml-2 text-muted-foreground">· {new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{article.read_time}</span>
                    </div>
                    <div className="mt-4">
                      <Button asChild variant="ghost" className="group p-0 hover:bg-transparent">
                        <Link to={`/article/${article.id}`} className="flex items-center text-primary font-medium">
                          Read More 
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-center col-span-3 text-muted-foreground">No articles found in the database.</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/40 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Ready to take control of your health?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Join thousands of patients who trust MediBook for their healthcare needs.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg" className="shadow-hero">
              <Link to="/doctors">Find a Doctor</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 MediBook. All rights reserved. Your health data is secure and encrypted.
        </div>
      </footer>
    </div>
  );
};

export default Index;