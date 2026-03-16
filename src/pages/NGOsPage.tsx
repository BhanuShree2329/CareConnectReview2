import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Building2, ArrowLeft, Search, Globe, Phone,
  MapPin, Heart, ExternalLink, Users
} from "lucide-react";
import { ngoAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function NGOsPage() {
  const [ngos, setNgos] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await ngoAPI.getAll();
        setNgos(res.data);
        setFiltered(res.data);
      } catch (err: any) {
        toast({ title: "Failed to load NGOs", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      ngos.filter(
        (n) =>
          n.name?.toLowerCase().includes(q) ||
          n.organization?.toLowerCase().includes(q) ||
          n.focus_area?.toLowerCase().includes(q) ||
          n.address?.toLowerCase().includes(q)
      )
    );
  }, [search, ngos]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
              <img src="/mylogo.png" alt="CareConnect Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">CareConnect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</span>
            </Link>
            <Link to="/register">
              <span className="text-sm font-medium text-primary hover:underline">Register</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-28 pb-16 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl gradient-hero flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-foreground">Partner NGOs</h1>
              <p className="text-muted-foreground text-sm">
                Verified organizations providing care and support services
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 mb-8 p-4 bg-card rounded-2xl border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span><b className="text-foreground">{ngos.length}</b> verified NGOs</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-destructive" />
              <span>All admin-approved</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, focus area, or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary/40" />
            <p>Loading NGOs…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">
              {search ? `No NGOs found for "${search}"` : "No verified NGOs yet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* NGO Cards */}
        {!loading && filtered.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {filtered.map((ngo) => (
              <motion.div
                key={ngo.id}
                variants={item}
                className="bg-card rounded-2xl border border-border p-6 shadow-card hover:border-primary/30 transition-all group"
              >
                {/* Top */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-card-foreground text-lg leading-tight truncate">
                      {ngo.organization || ngo.name}
                    </h3>
                    {ngo.organization && ngo.name !== ngo.organization && (
                      <p className="text-sm text-muted-foreground truncate">{ngo.name}</p>
                    )}
                    {ngo.focus_area && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        <Heart className="w-3 h-3" />
                        {ngo.focus_area}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {ngo.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground/60" />
                      <span>{ngo.address}</span>
                    </div>
                  )}
                  {ngo.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0 text-muted-foreground/60" />
                      <span>{ngo.phone}</span>
                    </div>
                  )}
                  {ngo.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-4 h-4 flex-shrink-0 text-center text-muted-foreground/60 text-xs">@</span>
                      <a href={`mailto:${ngo.email}`} className="hover:text-primary transition-colors">
                        {ngo.email}
                      </a>
                    </div>
                  )}
                  {ngo.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 flex-shrink-0 text-muted-foreground/60" />
                      <a
                        href={ngo.website.startsWith("http") ? ngo.website : `https://${ngo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 truncate"
                      >
                        {ngo.website.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Member since {new Date(ngo.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
                    ✓ Verified
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center bg-card rounded-2xl border border-border p-8"
          >
            <Building2 className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold font-display text-foreground mb-2">Is your NGO not listed?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Register as an NGO and get verified by our admin team to appear here.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-hero text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Register your NGO <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
