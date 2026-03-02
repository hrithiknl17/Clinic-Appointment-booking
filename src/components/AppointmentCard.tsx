import { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Star } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { generateTimeSlots, type Appointment } from "@/lib/mockData";

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string, newDate: string, newTime: string) => void;
  onReview?: (id: string, rating: number, comment: string) => void;
  reviewed?: boolean;
}

const statusStyles: Record<string, string> = {
  upcoming: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const AppointmentCard = ({ appointment, onCancel, onReschedule, onReview, reviewed }: AppointmentCardProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(appointment.date));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const formattedDate = new Date(appointment.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const handleReschedule = () => {
    if (!selectedDate || !selectedSlot || !onReschedule) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    onReschedule(appointment.id, dateStr, selectedSlot);
    setDialogOpen(false);
    setSelectedSlot(null);
  };

  const handleSubmitReview = () => {
    if (!onReview || rating === 0) return;
    onReview(appointment.id, rating, comment);
    setReviewDialogOpen(false);
    setRating(0);
    setComment("");
  };

  const isVideo = appointment.type === "video";

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading font-semibold text-foreground">{appointment.doctorName}</h3>
          <p className="text-sm text-primary font-medium">{appointment.specialty}</p>
        </div>
        <div className="flex items-center gap-2">
          {isVideo && (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              <Video className="h-3 w-3 mr-1" /> Video
            </Badge>
          )}
          <Badge variant="outline" className={statusStyles[appointment.status]}>
            {appointment.status}
          </Badge>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="h-4 w-4" />
          {formattedDate}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {appointment.time}
        </span>
        <span className="flex items-center gap-1.5">
          {isVideo ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
          {isVideo ? "MediBook Video" : appointment.location}
        </span>
      </div>

      {/* Completed — Leave Review */}
      {appointment.status === "completed" && onReview && !reviewed && (
        <div className="mt-4">
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-warning hover:bg-warning/10 border-warning/30">
                <Star className="mr-1 h-3.5 w-3.5" /> Leave a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Rate {appointment.doctorName}</DialogTitle>
                <DialogDescription>
                  How was your experience? Your feedback helps other patients.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Star rating */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "h-8 w-8 transition-colors",
                            (hoverRating || rating) >= star
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </p>
                  )}
                </div>
                {/* Comment */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Comment (optional)</p>
                  <Textarea
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button disabled={rating === 0} onClick={handleSubmitReview}>
                  Submit Review
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Completed — Already reviewed */}
      {appointment.status === "completed" && reviewed && (
        <div className="mt-3">
          <Badge variant="secondary" className="text-xs">
            <Star className="h-3 w-3 mr-1 fill-warning text-warning" /> Reviewed
          </Badge>
        </div>
      )}

      {/* Upcoming actions */}
      {appointment.status === "upcoming" && onCancel && (
        <div className="mt-4 flex gap-2">
          {isVideo && (
            <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to={`/video-call/${appointment.id}`}>
                <Video className="mr-1 h-3.5 w-3.5" /> Join Call
              </Link>
            </Button>
          )}

          {/* Reschedule Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Reschedule</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Reschedule Appointment</DialogTitle>
                <DialogDescription>
                  Pick a new date and time for your appointment with {appointment.doctorName}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setSelectedSlot(null);
                  }}
                  disabled={(date) => date < new Date()}
                  className={cn("p-3 pointer-events-auto rounded-xl border border-border")}
                />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                          selectedSlot === slot.time
                            ? "border-primary bg-primary text-primary-foreground"
                            : slot.available
                            ? "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary"
                            : "cursor-not-allowed border-border bg-muted text-muted-foreground/40"
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button disabled={!selectedSlot} onClick={handleReschedule}>
                  Confirm Reschedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Cancel Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel your appointment with {appointment.doctorName} on {formattedDate} at {appointment.time}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onCancel(appointment.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
