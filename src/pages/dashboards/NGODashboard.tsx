import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { orphanAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-info/10 text-info",
  assigned: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
};

export default function NGODashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orphanAPI.ngoRequests();
      setRequests(res.data);
    } catch (err: any) {
      toast({ title: "Failed to load requests", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (id: number) => {
    try {
      await orphanAPI.accept(id);
      toast({ title: "Support request accepted" });
      load();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const isPending = user?.status === "pending";

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display text-foreground mb-1">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground text-sm mb-8">
            {isPending ? "⏳ Your NGO registration is pending admin verification." : "View and accept orphan support requests."}
          </p>

          {isPending ? (
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-8 text-center">
              <ClipboardList className="w-12 h-12 text-warning mx-auto mb-4" />
              <p className="text-warning font-medium">Your NGO account is awaiting admin approval.</p>
              <p className="text-sm text-muted-foreground mt-2">Once approved, you'll see orphan support requests here.</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">Orphan Support Requests</h2>
              {loading && <p className="text-center text-muted-foreground py-8">Loading…</p>}
              {!loading && requests.length === 0 && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orphan support requests available right now.</p>
                </div>
              )}
              {!loading && (
                <div className="space-y-3">
                  {requests.map((r) => {
                    const supportTypes = Array.isArray(r.support_types)
                      ? r.support_types
                      : JSON.parse(r.support_types || "[]");
                    return (
                      <div key={r.id} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-card-foreground">{r.child_name}, age {r.age}</h3>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[r.status] || ""}`}>{r.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {supportTypes.map((t: string) => (
                                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
                            {r.guardian && <p className="text-xs text-muted-foreground mt-1">Guardian: {r.guardian}</p>}
                          </div>
                          {r.status === "approved" && (
                            <Button size="sm" variant="hero" onClick={() => handleAccept(r.id)}>Accept</Button>
                          )}
                          {r.status === "assigned" && r.assigned_ngo === user?.id && (
                            <span className="text-xs text-success font-medium">Assigned to you ✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
