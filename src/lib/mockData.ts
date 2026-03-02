export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  image: string;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  location: string;
  bio: string;
  education: string[];
  experience: string;
  languages: string[];
  consultationFee: string;
  phone: string;
  email: string;
  services: string[];
  reviews: { name: string; rating: number; comment: string; date: string }[];
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  location: string;
  type: "in-person" | "video";
}

export const specialties = [
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "Ophthalmology",
  "Dentistry",
];

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    specialty: "Cardiology",
    avatar: "SC",
    image: "/images/doctor-1.jpg",
    rating: 4.9,
    reviewCount: 234,
    nextAvailable: "Today",
    location: "Downtown Medical Center",
    bio: "Board-certified cardiologist with 15+ years of experience in interventional cardiology and heart failure management. Passionate about preventive cardiac care and patient education.",
    education: ["MD, Harvard Medical School", "Residency, Johns Hopkins Hospital", "Fellowship in Interventional Cardiology, Mayo Clinic"],
    experience: "15+ years",
    languages: ["English", "Mandarin"],
    consultationFee: "$250",
    phone: "(555) 123-4567",
    email: "s.chen@medibook.com",
    services: ["Echocardiography", "Stress Testing", "Heart Failure Management", "Cardiac Catheterization", "Preventive Cardiology"],
    reviews: [
      { name: "John M.", rating: 5, comment: "Dr. Chen is incredibly thorough and caring. She explained everything clearly.", date: "2026-02-20" },
      { name: "Linda P.", rating: 5, comment: "Best cardiologist I've ever visited. Highly recommend!", date: "2026-02-14" },
      { name: "Robert K.", rating: 4, comment: "Very knowledgeable doctor. Wait time was a bit long.", date: "2026-01-28" },
    ],
  },
  {
    id: "2",
    name: "Dr. James Wilson",
    specialty: "General Practice",
    avatar: "JW",
    image: "/images/doctor-2.jpg",
    rating: 4.8,
    reviewCount: 412,
    nextAvailable: "Today",
    location: "Westside Family Clinic",
    bio: "Dedicated family physician focused on preventive care and chronic disease management. Believes in building long-term relationships with patients and their families.",
    education: ["MD, Stanford University", "Residency, UCSF Medical Center"],
    experience: "12 years",
    languages: ["English", "Spanish"],
    consultationFee: "$150",
    phone: "(555) 234-5678",
    email: "j.wilson@medibook.com",
    services: ["Annual Physicals", "Chronic Disease Management", "Vaccinations", "Minor Procedures", "Health Screenings"],
    reviews: [
      { name: "Sarah T.", rating: 5, comment: "Dr. Wilson is the best family doctor. My whole family sees him.", date: "2026-02-18" },
      { name: "Mike R.", rating: 5, comment: "Always takes time to listen and never rushes appointments.", date: "2026-02-05" },
    ],
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatology",
    avatar: "ER",
    image: "/images/doctor-3.jpg",
    rating: 4.7,
    reviewCount: 189,
    nextAvailable: "Tomorrow",
    location: "Skin Health Institute",
    bio: "Specializing in medical and cosmetic dermatology with expertise in skin cancer screening. Committed to helping patients achieve healthy, confident skin.",
    education: ["MD, Yale School of Medicine", "Residency, NYU Langone", "Fellowship in Dermatologic Surgery, UCSF"],
    experience: "10 years",
    languages: ["English", "Portuguese"],
    consultationFee: "$200",
    phone: "(555) 345-6789",
    email: "e.rodriguez@medibook.com",
    services: ["Skin Cancer Screening", "Acne Treatment", "Cosmetic Procedures", "Mole Removal", "Laser Therapy"],
    reviews: [
      { name: "Anna L.", rating: 5, comment: "Finally cleared my acne after years of struggling. Thank you!", date: "2026-02-12" },
      { name: "David W.", rating: 4, comment: "Great doctor, very professional office environment.", date: "2026-01-30" },
    ],
  },
  {
    id: "4",
    name: "Dr. Michael Park",
    specialty: "Pediatrics",
    avatar: "MP",
    image: "/images/doctor-4.jpg",
    rating: 4.9,
    reviewCount: 567,
    nextAvailable: "Today",
    location: "Children's Wellness Center",
    bio: "Compassionate pediatrician committed to providing comprehensive care for infants through adolescents. Special interest in developmental milestones and childhood nutrition.",
    education: ["MD, Columbia University", "Residency, Children's Hospital of Philadelphia"],
    experience: "18 years",
    languages: ["English", "Korean"],
    consultationFee: "$175",
    phone: "(555) 456-7890",
    email: "m.park@medibook.com",
    services: ["Well-Child Visits", "Vaccinations", "Developmental Screening", "Newborn Care", "Adolescent Medicine"],
    reviews: [
      { name: "Jessica H.", rating: 5, comment: "My kids love Dr. Park! He's so patient and gentle with them.", date: "2026-02-22" },
      { name: "Tom B.", rating: 5, comment: "Incredible pediatrician. Always goes above and beyond.", date: "2026-02-10" },
      { name: "Karen S.", rating: 5, comment: "Best pediatrician in the city, hands down.", date: "2026-01-25" },
    ],
  },
  {
    id: "5",
    name: "Dr. Lisa Thompson",
    specialty: "Orthopedics",
    avatar: "LT",
    image: "/images/doctor-5.jpg",
    rating: 4.6,
    reviewCount: 145,
    nextAvailable: "Mar 3",
    location: "Sports Medicine & Ortho Clinic",
    bio: "Sports medicine specialist focusing on minimally invasive orthopedic surgery and rehabilitation. Works with professional athletes and weekend warriors alike.",
    education: ["MD, Duke University", "Residency, Hospital for Special Surgery", "Fellowship in Sports Medicine, Andrews Institute"],
    experience: "8 years",
    languages: ["English"],
    consultationFee: "$275",
    phone: "(555) 567-8901",
    email: "l.thompson@medibook.com",
    services: ["ACL Reconstruction", "Joint Replacement", "Sports Injury Treatment", "Physical Therapy Referrals", "Fracture Care"],
    reviews: [
      { name: "Chris D.", rating: 5, comment: "Got me back on the field in record time. Amazing surgeon.", date: "2026-02-08" },
      { name: "Pat M.", rating: 4, comment: "Very skilled but hard to get an appointment quickly.", date: "2026-01-20" },
    ],
  },
  {
    id: "6",
    name: "Dr. David Kim",
    specialty: "Neurology",
    avatar: "DK",
    image: "/images/doctor-6.jpg",
    rating: 4.8,
    reviewCount: 298,
    nextAvailable: "Tomorrow",
    location: "Brain & Spine Center",
    bio: "Neurologist specializing in headache disorders, epilepsy, and neurodegenerative diseases. Pioneer in integrating AI diagnostics into neurological assessments.",
    education: ["MD, MIT/Harvard HST Program", "Residency, Massachusetts General Hospital", "Fellowship in Epilepsy, Cleveland Clinic"],
    experience: "14 years",
    languages: ["English", "Korean", "Japanese"],
    consultationFee: "$300",
    phone: "(555) 678-9012",
    email: "d.kim@medibook.com",
    services: ["EEG Testing", "Migraine Management", "Epilepsy Treatment", "Memory Disorders", "Nerve Conduction Studies"],
    reviews: [
      { name: "Helen G.", rating: 5, comment: "Dr. Kim finally diagnosed my condition after years of uncertainty.", date: "2026-02-15" },
      { name: "Steve N.", rating: 5, comment: "Brilliant doctor. Explains complex conditions in simple terms.", date: "2026-02-01" },
    ],
  },
];

export const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hours = [9, 9.5, 10, 10.5, 11, 11.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5];
  hours.forEach((h, i) => {
    const hour = Math.floor(h);
    const min = h % 1 === 0.5 ? "30" : "00";
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    slots.push({
      id: `slot-${i}`,
      time: `${displayHour}:${min} ${ampm}`,
      available: Math.random() > 0.3,
    });
  });
  return slots;
};

export const upcomingAppointments: Appointment[] = [
  {
    id: "apt-1",
    doctorId: "1",
    doctorName: "Dr. Sarah Chen",
    specialty: "Cardiology",
    date: "2026-03-02",
    time: "10:00 AM",
    status: "upcoming",
    location: "Downtown Medical Center",
    type: "in-person",
  },
  {
    id: "apt-2",
    doctorId: "4",
    doctorName: "Dr. Michael Park",
    specialty: "Pediatrics",
    date: "2026-03-05",
    time: "2:30 PM",
    status: "upcoming",
    location: "Children's Wellness Center",
    type: "video",
  },
];

export const pastAppointments: Appointment[] = [
  {
    id: "apt-3",
    doctorId: "2",
    doctorName: "Dr. James Wilson",
    specialty: "General Practice",
    date: "2026-02-15",
    time: "11:00 AM",
    status: "completed",
    location: "Westside Family Clinic",
    type: "in-person",
  },
  {
    id: "apt-4",
    doctorId: "3",
    doctorName: "Dr. Emily Rodriguez",
    specialty: "Dermatology",
    date: "2026-02-10",
    time: "3:00 PM",
    status: "cancelled",
    location: "Skin Health Institute",
    type: "video",
  },
];
