import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Mic, MicOff, VideoIcon, VideoOff, PhoneOff, MessageSquare, Monitor, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  // NEW: State for real data
  const [appointment, setAppointment] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callState, setCallState] = useState<"waiting" | "connected" | "ended">("waiting");
  const videoRef = useRef<HTMLVideoElement>(null);

  // NEW: Fetch real appointment and doctor data
  useEffect(() => {
    const fetchCallDetails = async () => {
      try {
        const response = await fetch(`https://clinic-appointment-booking-fglv.onrender.com/api/appointments/single/${appointmentId}`);
        const data = await response.json();
        
        if (data && data.doctors) {
          setAppointment(data);
          setDoctor({
            id: data.doctors.id,
            name: data.doctors.name,
            specialty: data.doctors.specialty,
            image: data.doctors.image_url,
            avatar: data.doctors.name.charAt(4) // Hacky way to get a letter
          });
        }
      } catch (error) {
        console.error("Failed to fetch call details", error);
      } finally {
        setLoading(false);
      }
    };
    if (appointmentId) fetchCallDetails();
  }, [appointmentId]);


  // Simulate connecting after 3 seconds
  useEffect(() => {
    if (callState === "waiting" && doctor) {
      const timer = setTimeout(() => setCallState("connected"), 3000);
      return () => clearTimeout(timer);
    }
  }, [callState, doctor]);

  // Call duration timer
  useEffect(() => {
    if (callState !== "connected") return;
    const interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  // Try to get camera feed
  useEffect(() => {
    if (isCameraOn && videoRef.current) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => {
          // Camera not available — that's fine for mock
        });
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraOn]);

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleEndCall = () => {
    setCallState("ended");
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
    }
  };

  if (loading) {
     return <div className="p-20 text-center animate-pulse text-muted-foreground">Preparing secure connection...</div>;
  }

  if (!appointment || !doctor) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Appointment not found.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (callState === "ended") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <PhoneOff className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Call Ended</h1>
          <p className="mt-2 text-muted-foreground">
            Your video call with {doctor.name} lasted {formatDuration(callDuration)}.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/book/${doctor.id}`}>Book Follow-up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-foreground/[0.03]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-hero text-xs font-bold text-primary-foreground">
            {doctor.avatar}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{doctor.name}</h2>
            <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {callState === "connected" && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              <span className="text-sm font-mono text-foreground">{formatDuration(callDuration)}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> 2 participants
          </div>
        </div>
      </div>

      {/* Video area */}
      <div className="relative flex flex-1 items-center justify-center p-4">
        {/* Doctor's "video" — simulated */}
        <div className="relative h-full w-full max-h-[500px] max-w-4xl overflow-hidden rounded-2xl bg-foreground/10 shadow-card-hover">
          {callState === "waiting" ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full gradient-hero text-3xl font-bold text-primary-foreground animate-pulse">
                {doctor.avatar}
              </div>
              <p className="text-muted-foreground">Connecting to {doctor.name}...</p>
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="h-32 w-32 rounded-full object-cover border-4 border-card shadow-card"
              />
              <p className="text-sm font-medium text-foreground">{doctor.name}</p>
              <p className="text-xs text-muted-foreground">Connected</p>
            </div>
          )}

          {/* Self view — picture-in-picture */}
          <div className="absolute bottom-4 right-4 h-32 w-44 overflow-hidden rounded-xl border-2 border-card bg-foreground/20 shadow-card">
            {isCameraOn ? (
              <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover -scale-x-100" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <VideoOff className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Camera off</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="border-t border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-md items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full",
              !isMicOn && "bg-destructive/10 border-destructive/20 text-destructive"
            )}
            onClick={() => setIsMicOn(!isMicOn)}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full",
              !isCameraOn && "bg-destructive/10 border-destructive/20 text-destructive"
            )}
            onClick={() => setIsCameraOn(!isCameraOn)}
          >
            {isCameraOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full",
              isScreenSharing && "bg-primary/10 border-primary/20 text-primary"
            )}
            onClick={() => setIsScreenSharing(!isScreenSharing)}
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            className="h-12 w-12 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;