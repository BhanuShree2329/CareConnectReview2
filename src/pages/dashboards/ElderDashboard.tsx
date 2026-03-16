import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { careAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-info/10 text-info",
  assigned: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

export default function ElderDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await careAPI.mine();
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Failed to load elder requests:", err);
      setRequests([]);
      toast({
        title: "Failed to load requests",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">
                Welcome, {user?.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage your care requests
              </p>
            </div>

            <Link to="/care-request/new">
              <Button variant="hero" size="lg" className="gap-2">
                <Plus className="w-5 h-5" /> New Request
              </Button>
            </Link>
          </div>

          <h2 className="text-lg font-bold font-display mb-4 text-foreground">
            Your Care Requests
          </h2>

          {loading && (
            <p className="text-center text-muted-foreground py-8">Loading…</p>
          )}

          {!loading && requests.length === 0 && (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No care requests yet. Submit your first request.
              </p>
            </div>
          )}

          {!loading && requests.length > 0 && (
            <div className="space-y-3">
              {(Array.isArray(requests) ? requests : []).map((r) => (
                <div
                  key={r.id}
                  className="bg-card rounded-2xl border border-border p-5 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-card-foreground">
                        {r.help_type}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {r.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {r.location} ·{" "}
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString()
                          : "No date"}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        statusColors[r.status] || ""
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}