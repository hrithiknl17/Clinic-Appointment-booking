import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DoctorCard from "@/components/DoctorCard";
import { specialties } from "@/lib/mockData"; // Removed 'doctors' from here!
import { useState, useMemo, useEffect } from "react"; // Added useEffect
import { useSearchParams } from "react-router-dom";

type SortOption = "default" | "rating-high" | "rating-low" | "reviews";

const sortLabels: Record<SortOption, string> = {
  default: "Default",
  "rating-high": "Highest Rated",
  "rating-low": "Lowest Rated",
  reviews: "Most Reviews",
};

const Doctors = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [search, setSearch] = useState(initialQuery);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // NEW: State to hold our real doctors from the database
  const [realDoctors, setRealDoctors] = useState<any[]>([]);

  // NEW: Fetch doctors from Python backend when the page loads
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("https://clinic-appointment-booking-fglv.onrender.com/api/doctors");
        const data = await response.json();
        
        // Map the database fields to what DoctorCard expects
        const mappedDoctors = data.doctors.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          specialty: doc.specialty,
          image: doc.image_url,       // DB uses image_url, UI expects image
          rating: doc.rating,
          reviewCount: 150,           // Placeholder since we don't have reviews yet
          location: "Main Clinic",    // Placeholder
          nextAvailable: "Today",     // Placeholder
          bio: doc.bio,
        }));
        
        setRealDoctors(mappedDoctors);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const filtered = useMemo(() => {
    // CHANGED: We now filter 'realDoctors' instead of the fake 'doctors'
    let results = realDoctors.filter((d) => {
      const matchesSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase());
      const matchesSpecialty = !selectedSpecialty || d.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });

    switch (sortBy) {
      case "rating-high":
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      case "rating-low":
        results = [...results].sort((a, b) => a.rating - b.rating);
        break;
      case "reviews":
        results = [...results].sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return results;
  }, [search, selectedSpecialty, sortBy, realDoctors]); // ADDED realDoctors as a dependency

  const cycleSortOption = () => {
    const options: SortOption[] = ["default", "rating-high", "rating-low", "reviews"];
    const currentIndex = options.indexOf(sortBy);
    setSortBy(options[(currentIndex + 1) % options.length]);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Find a Doctor</h1>
        <p className="mt-2 text-muted-foreground">Browse our network of trusted healthcare professionals</p>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search doctors..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={cycleSortOption}
            className="w-fit gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort: {sortLabels[sortBy]}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpecialty(null)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              !selectedSpecialty
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            All
          </button>
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(selectedSpecialty === s ? null : s)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedSpecialty === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc, i) => (
            <DoctorCard key={doc.id} doctor={doc} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground">No doctors found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;