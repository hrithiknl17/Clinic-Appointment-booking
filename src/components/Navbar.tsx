import { Link, useLocation } from "react-router-dom";
import { Calendar, Search, User, Menu, X, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/doctors", label: "Find Doctors" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">MediBook</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="flex items-center gap-1">
                  <User className="h-4 w-4" /> Profile
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {user ? (
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-1" /> Sign out
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>Log in</Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>Sign up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
