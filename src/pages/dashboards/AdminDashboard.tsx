import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  CheckCircle,
  FileText,
  Building2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminAPI, careAPI, orphanAPI, ngoAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  assigned: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

type Tab = "users" | "care" | "orphan" | "priority";

export default function AdminDashboard() {
  const { toast } = useToast();

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingCareRequests, setPendingCareRequests] = useState<any[]>([]);
  const [pendingOrphanRequests, setPendingOrphanRequests] = useState<any[]>([]);
  const [approvedCareRequests, setApprovedCareRequests] = useState<any[]>([]);
  const [approvedOrphanRequests, setApprovedOrphanRequests] = useState<any[]>([]);
  const [careRequests, setCareRequests] = useState<any[]>([]);
  const [orphanRequests, setOrphanRequests] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("users");
  const [modal, setModal] = useState<any | null>(null);
  const [assignModal, setAssignModal] = useState<any | null>(null);
  const [selectedNgo, setSelectedNgo] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [
        usersRes,
        carePendingRes,
        orphanPendingRes,
        careApprovedRes,
        orphanApprovedRes,
        careAllRes,
        orphanAllRes,
        ngoRes,
      ] = await Promise.all([
        adminAPI.getPendingUsers(),
        careAPI.pending(),
        orphanAPI.pending(),
        careAPI.approved(),
        orphanAPI.approved(),
        careAPI.all(),
        orphanAPI.all(),
        ngoAPI.getAll(),
      ]);

      setPendingUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setPendingCareRequests(Array.isArray(carePendingRes.data) ? carePendingRes.data : []);
      setPendingOrphanRequests(Array.isArray(orphanPendingRes.data) ? orphanPendingRes.data : []);
      setApprovedCareRequests(Array.isArray(careApprovedRes.data) ? careApprovedRes.data : []);
      setApprovedOrphanRequests(Array.isArray(orphanApprovedRes.data) ? orphanApprovedRes.data : []);
      setCareRequests(Array.isArray(careAllRes.data) ? careAllRes.data : []);
      setOrphanRequests(Array.isArray(orphanAllRes.data) ? orphanAllRes.data : []);
      setNgos(Array.isArray(ngoRes.data) ? ngoRes.data : []);
    } catch (err: any) {
      console.error("Failed to load admin dashboard:", err);
      toast({
        title: "Failed to load admin data",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const approveUser = async (id: number) => {
    try {
      await adminAPI.approveUser(id);
      toast({ title: "User approved" });
      loadDashboard();
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  const rejectUser = async (id: number) => {
    try {
      await adminAPI.rejectUser(id);
      toast({ title: "User rejected" });
      loadDashboard();
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  const handleApproveCareRequest = async (id: number) => {
    try {
      await careAPI.approve(id);
      toast({ title: "Approved", description: "Care request approved." });
      loadDashboard();
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectCareRequest = async (id: number) => {
    try {
      await careAPI.reject(id);
      toast({ title: "Rejected", description: "Care request rejected." });
      loadDashboard();
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  const handleApproveOrphanRequest = async (id: number) => {
    try {
      await orphanAPI.approve(id);
      toast({ title: "Approved", description: "Orphan request approved." });
      loadDashboard();
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectOrphanRequest = async (id: number) => {
    try {
      await orphanAPI.reject(id);
      toast({ title: "Rejected", description: "Orphan request rejected." });
      loadDashboard();
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  const assignNgo = async () => {
  if (!assignModal || !selectedNgo) {
    toast({
      title: "Select an NGO first",
      variant: "destructive",
    });
    return;
  }

  setAssigning(true);
  try {
    if (assignModal.requestType === "care") {
      await careAPI.assignNgo(assignModal.id, selectedNgo);
      toast({ title: "NGO linked to care request successfully!" });
    } else {
      await orphanAPI.assignNgo(assignModal.id, selectedNgo);
      toast({ title: "NGO linked to orphan request successfully!" });
    }

    setAssignModal(null);
    setSelectedNgo("");
    loadDashboard();
  } catch (err: any) {
    toast({
      title: "Failed to assign NGO",
      description: err.response?.data?.message || err.message,
      variant: "destructive",
    });
  } finally {
    setAssigning(false);
  }
};

  const safeSupportTypes = (value: any) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return value.split(",").map((v) => v.trim()).filter(Boolean);
      }
    }

    return [];
  };

  const pendingQueueCount =
    pendingUsers.length + pendingCareRequests.length + pendingOrphanRequests.length;

  const priorityCount =
    approvedCareRequests.length + approvedOrphanRequests.length;

  const tabs = [
    {
      id: "users" as Tab,
      label: "Pending Users",
      count: pendingQueueCount,
      icon: Users,
    },
    {
      id: "care" as Tab,
      label: "Care Requests",
      count: careRequests.length,
      icon: Heart,
    },
    {
      id: "orphan" as Tab,
      label: "Orphan Requests",
      count: orphanRequests.length,
      icon: Building2,
    },
    {
      id: "priority" as Tab,
      label: "Priority",
      count: priorityCount,
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-muted/30">
        <DashboardHeader />
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold font-display text-foreground mb-1">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Manage users, care requests, and orphan support.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    tab === t.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <t.icon
                    className={`w-6 h-6 mb-2 ${
                      tab === t.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <p className="text-2xl font-bold font-display text-card-foreground">
                    {t.count}
                  </p>
                  <p className="text-sm text-muted-foreground">{t.label}</p>
                </button>
              ))}
            </div>

            {loading && (
              <p className="text-center text-muted-foreground py-8">Loading…</p>
            )}

            {/* Pending Review Queue */}
            {!loading && tab === "users" && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                <h2 className="text-lg font-bold font-display text-foreground">
                  Pending User Approvals{" "}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({pendingQueueCount} waiting)
                  </span>
                </h2>

                {/* Pending users */}
                <div>
                  <h3 className="text-base font-semibold mb-3 text-foreground">
                    Pending User Registrations
                  </h3>

                  {pendingUsers.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-6 text-center">
                      <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No pending user registrations.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingUsers.map((u) => (
                        <motion.div
                          key={`user-${u.id}`}
                          variants={item}
                          className="bg-card rounded-2xl border border-border p-5 shadow-card"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-card-foreground">
                                {u.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {u.email}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                                  {u.role}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    statusColors[u.status] || ""
                                  }`}
                                >
                                  {u.status}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {u.created_at
                                  ? new Date(u.created_at).toLocaleDateString()
                                  : "No date"}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setModal({ type: "user", data: u })}
                                className="gap-1"
                              >
                                <Info className="w-4 h-4" /> Info
                              </Button>
                              <Button
                                size="sm"
                                variant="hero"
                                onClick={() => approveUser(u.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectUser(u.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending care requests */}
                <div>
                  <h3 className="text-base font-semibold mb-3 text-foreground">
                    Pending Care Requests
                  </h3>

                  {pendingCareRequests.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-6 text-center">
                      <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No pending care requests.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingCareRequests.map((r) => (
                        <motion.div
                          key={`care-pending-${r.id}`}
                          variants={item}
                          className="bg-card rounded-2xl border border-border p-5 shadow-card"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-card-foreground">
                                  {r.help_type}
                                </h3>
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                    statusColors[r.status] || ""
                                  }`}
                                >
                                  {r.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {r.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {r.location}
                                {r.age ? ` · Age ${r.age}` : ""}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {r.created_at
                                  ? new Date(r.created_at).toLocaleDateString()
                                  : "No date"}
                              </p>
                            </div>

                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setModal({ type: "care", data: r })}
                              >
                                <Info className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="hero"
                                onClick={() => handleApproveCareRequest(r.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectCareRequest(r.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending orphan requests */}
                <div>
                  <h3 className="text-base font-semibold mb-3 text-foreground">
                    Pending Orphan Requests
                  </h3>

                  {pendingOrphanRequests.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-6 text-center">
                      <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No pending orphan requests.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingOrphanRequests.map((r) => (
                        <motion.div
                          key={`orphan-pending-${r.id}`}
                          variants={item}
                          className="bg-card rounded-2xl border border-border p-5 shadow-card"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-card-foreground">
                                  {r.child_name}
                                </h3>
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                    statusColors[r.status] || ""
                                  }`}
                                >
                                  {r.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {r.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Age {r.age}
                                {r.guardian ? ` · Guardian: ${r.guardian}` : ""}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {safeSupportTypes(r.support_types).map((t: string) => (
                                  <span
                                    key={t}
                                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setModal({ type: "orphan", data: r })}
                              >
                                <Info className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="hero"
                                onClick={() => handleApproveOrphanRequest(r.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectOrphanRequest(r.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Care Requests */}
            {!loading && tab === "care" && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                <h2 className="text-lg font-bold font-display mb-4 text-foreground">
                  Care Requests
                </h2>

                {careRequests.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No care requests yet.</p>
                  </div>
                ) : (
                  careRequests.map((r) => (
                    <motion.div
                      key={r.id}
                      variants={item}
                      className="bg-card rounded-2xl border border-border p-5 shadow-card"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-card-foreground">
                              {r.help_type}
                            </h3>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                statusColors[r.status] || ""
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {r.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {r.location}
                            {r.age ? ` · Age ${r.age}` : ""}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setModal({ type: "care", data: r })}
                          >
                            <Info className="w-4 h-4" />
                          </Button>

                          {r.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="hero"
                                onClick={() => handleApproveCareRequest(r.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectCareRequest(r.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {r.status === "approved" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectCareRequest(r.id)}
                            >
                              Reject
                            </Button>
                          )}

                          {r.status === "rejected" && (
                            <Button
                              size="sm"
                              variant="hero"
                              onClick={() => handleApproveCareRequest(r.id)}
                            >
                              Re-approve
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Orphan Requests */}
            {!loading && tab === "orphan" && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                <h2 className="text-lg font-bold font-display mb-4 text-foreground">
                  Orphan Support Requests
                </h2>

                {orphanRequests.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orphan requests yet.</p>
                  </div>
                ) : (
                  orphanRequests.map((r) => {
                    const supportTypes = safeSupportTypes(r.support_types);
                    const assignedNgoName = r.assigned_ngo_id
                      ? ngos.find((n: any) => String(n.id) === String(r.assigned_ngo_id))
                          ?.organization ||
                        ngos.find((n: any) => String(n.id) === String(r.assigned_ngo_id))
                          ?.name ||
                        `NGO #${r.assigned_ngo_id}`
                      : null;

                    return (
                      <motion.div
                        key={r.id}
                        variants={item}
                        className="bg-card rounded-2xl border border-border p-5 shadow-card"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-card-foreground">
                                {r.child_name}, age {r.age}
                              </h3>
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                  statusColors[r.status] || ""
                                }`}
                              >
                                {r.status}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-1">
                              {supportTypes.map((t: string) => (
                                <span
                                  key={t}
                                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>

                            <p className="text-sm text-muted-foreground mt-2">
                              {r.description}
                            </p>

                            {r.guardian && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Guardian: {r.guardian}
                              </p>
                            )}

                            {assignedNgoName && (
                              <p className="text-xs text-primary font-medium mt-1">
                                Assigned NGO: {assignedNgoName}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 flex-shrink-0 flex-col items-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setModal({ type: "orphan", data: r })}
                            >
                              <Info className="w-4 h-4" />
                            </Button>

                            {r.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="hero"
                                  onClick={() => handleApproveOrphanRequest(r.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectOrphanRequest(r.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {(r.status === "approved" || r.status === "assigned") && (
                              <Button
                                size="sm"
                                variant="hero"
                                onClick={() => {
                                  setAssignModal(r);
                                  setSelectedNgo("");
                                }}
                                className="gap-1"
                              >
                                <Building2 className="w-3.5 h-3.5" />
                                {r.status === "assigned" ? "Reassign NGO" : "Assign NGO"}
                              </Button>
                            )}

                            {r.status === "approved" && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectOrphanRequest(r.id)}
                              >
                                Reject
                              </Button>
                            )}

                            {r.status === "rejected" && (
                              <Button
                                size="sm"
                                variant="hero"
                                onClick={() => handleApproveOrphanRequest(r.id)}
                              >
                                Re-approve
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* Priority */}
            {!loading && tab === "priority" && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <h2 className="text-lg font-bold font-display mb-4 text-foreground">
                  Priority
                </h2>

                {approvedCareRequests.length === 0 && approvedOrphanRequests.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                    <p className="text-muted-foreground">No approved requests yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedCareRequests.map((r) => (
  <motion.div
    key={`priority-care-${r.id}`}
    variants={item}
    className="bg-card rounded-2xl border border-border p-5 shadow-card"
  >
    <div className="flex justify-between items-start gap-4">
      <div>
        <h3 className="font-bold text-card-foreground">
          Care Request
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {r.help_type}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {r.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {r.location}
          {r.age ? ` · Age ${r.age}` : ""}
        </p>
        <p className="text-sm font-semibold text-green-600 mt-2">
  Priority: {r.priority || "LOW"}
</p>

{r.assigned_ngo_id && (
  <p className="text-xs text-primary font-medium mt-1">
    Linked NGO: {
      ngos.find((n: any) => String(n.id) === String(r.assigned_ngo_id))?.organization ||
      ngos.find((n: any) => String(n.id) === String(r.assigned_ngo_id))?.name ||
      `NGO #${r.assigned_ngo_id}`
    }
  </p>
)}
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setModal({ type: "care", data: r })}
          className="gap-1"
        >
          <Info className="w-4 h-4" /> Info
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setAssignModal({ ...r, requestType: "care" });
            setSelectedNgo("");
          }}
        >
          Link NGO
        </Button>
      </div>
    </div>
  </motion.div>
))}

                    {approvedOrphanRequests.map((r) => (
  <motion.div
    key={`priority-orphan-${r.id}`}
    variants={item}
    className="bg-card rounded-2xl border border-border p-5 shadow-card"
  >
    <div className="flex justify-between items-start gap-4">
      <div>
        <h3 className="font-bold text-card-foreground">
          Orphan Request
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {r.child_name}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {r.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Age {r.age}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {safeSupportTypes(r.support_types).map((t: string) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="text-sm font-semibold text-green-600 mt-2">
          Priority: {r.priority || "LOW"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setModal({ type: "orphan", data: r })}
          className="gap-1"
        >
          <Info className="w-4 h-4" /> Info
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setAssignModal({ ...r, requestType: "orphan" });
            setSelectedNgo("");
          }}
        >
          Link NGO
        </Button>
      </div>
    </div>
  </motion.div>
))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Detail Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 w-full max-w-md border shadow-lg max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Details</h2>
                <button onClick={() => setModal(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modal.type === "user" && (
                <div className="space-y-2 text-sm">
                  <p><b>Name:</b> {modal.data.name}</p>
                  <p><b>Email:</b> {modal.data.email}</p>
                  <p><b>Role:</b> <span className="capitalize">{modal.data.role}</span></p>
                  <p><b>Status:</b> <span className="capitalize">{modal.data.status}</span></p>
                  <p><b>Registered:</b> {modal.data.created_at ? new Date(modal.data.created_at).toLocaleString() : "N/A"}</p>
                </div>
              )}

              {modal.type === "care" && (
                <div className="space-y-2 text-sm">
                  <p><b>Help Type:</b> {modal.data.help_type}</p>
                  <p><b>Age:</b> {modal.data.age}</p>
                  <p><b>Location:</b> {modal.data.location}</p>
                  <p><b>Description:</b> {modal.data.description}</p>
                  <p><b>Priority:</b> {modal.data.priority || "Not assigned yet"}</p>
                  <p><b>Status:</b> <span className="capitalize">{modal.data.status}</span></p>
                  <p><b>Created:</b> {modal.data.created_at ? new Date(modal.data.created_at).toLocaleString() : "N/A"}</p>
                </div>
              )}

              {modal.type === "orphan" && (
                <div className="space-y-2 text-sm">
                  <p><b>Child Name:</b> {modal.data.child_name}</p>
                  <p><b>Age:</b> {modal.data.age}</p>
                  {modal.data.guardian && <p><b>Guardian:</b> {modal.data.guardian}</p>}
                  <p><b>Support Types:</b> {safeSupportTypes(modal.data.support_types).join(", ")}</p>
                  <p><b>Description:</b> {modal.data.description}</p>
                  <p><b>Priority:</b> {modal.data.priority || "Not assigned yet"}</p>
                  <p><b>Status:</b> <span className="capitalize">{modal.data.status}</span></p>
                  <p><b>Created:</b> {modal.data.created_at ? new Date(modal.data.created_at).toLocaleString() : "N/A"}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assign NGO Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md border shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold font-display text-foreground">Assign NGO</h2>
              <button onClick={() => setAssignModal(null)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              For:{" "}
<span className="font-medium text-foreground">
  {assignModal.child_name || assignModal.help_type || "Request"}
</span>
            </p>

            {ngos.length === 0 ? (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-sm text-warning mb-4">
                No approved NGOs found. Approve an NGO first from the Users tab.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {ngos.map((ngo: any) => (
                  <label
                    key={ngo.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedNgo === String(ngo.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="assign-ngo"
                      value={ngo.id}
                      checked={selectedNgo === String(ngo.id)}
                      onChange={(e) => setSelectedNgo(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-sm text-card-foreground">
                        {ngo.organization || ngo.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{ngo.email}</div>
                      {ngo.focus_area && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full mt-1 inline-block">
                          {ngo.focus_area}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setAssignModal(null)}>
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={assignNgo}
                disabled={!selectedNgo || assigning || ngos.length === 0}
              >
                {assigning ? "Assigning…" : "Confirm Assignment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}