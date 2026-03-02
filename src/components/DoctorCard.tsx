import { Star, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Doctor } from "@/lib/mockData";

interface DoctorCardProps {
  doctor: Doctor;
  index?: number;
}

const DoctorCard = ({ doctor, index = 0 }: DoctorCardProps) => {
  return (
    <div
      className="group rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Doctor photo */}
      <Link to={`/doctor/${doctor.id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="text-foreground">{doctor.rating}</span>
            <span className="text-muted-foreground">({doctor.reviewCount})</span>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/doctor/${doctor.id}`}>
          <h3 className="font-heading text-lg font-semibold text-foreground truncate hover:text-primary transition-colors">
            {doctor.name}
          </h3>
        </Link>
        <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {doctor.location}
        </div>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{doctor.bio}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-success">
            <Clock className="h-4 w-4" />
            Next: {doctor.nextAvailable}
          </span>
          <Button asChild size="sm">
            <Link to={`/book/${doctor.id}`}>Book Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
