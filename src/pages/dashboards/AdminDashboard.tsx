import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, Users, CheckCircle, FileText, Building2, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI, careAPI, orphanAPI, ngoAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/DashboardHeader";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const priorityConfig: Record<string, { color: string; icon: string }> = {
  LOW: { color: "text-green-600", icon: "🟢" },
  MEDIUM: { color: "text-yellow-600", icon: "🟡" },
  HIGH: { color: "text-orange-600", icon: "🟠" },
  SEVERE: { color: "text-red-600", icon: "🔴" },
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
  const { user } = useAuth();
  const { toast } = useToast();

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [careRequests, setCareRequests] = useState<any[]>([]);
  const [orphanRequests, setOrphanRequests] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("users");
  const [modal, setModal] = useState<any | null>(null);
  const [assignModal, setAssignModal] = useState<any | null>(null);
  const [selectedNgo, setSelectedNgo] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, careRes, orphanRes, ngoRes] = await Promise.all([
        adminAPI.getPendingUsers(),
        careAPI.all(),
        orphanAPI.all(),
        ngoAPI.getAll(),
      ]);
      setPendingUsers(usersRes.data);
      setCareRequests(careRes.data);
      setOrphanRequests(orphanRes.data);
      setNgos(ngoRes.data);
    } catch (err: any) {
      toast({ title: "Failed to load data", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approveUser = async (id: number) => { await adminAPI.approveUser(id); toast({ title: "User approved" }); load(); };
  const rejectUser  = async (id: number) => { await adminAPI.rejectUser(id);  toast({ title: "User rejected"  }); load(); };
  const approveCare = async (id: number) => { await careAPI.approve(id);      toast({ title: "Care request approved" }); load(); };
  const rejectCare  = async (id: number) => { await careAPI.reject(id);       toast({ title: "Care request rejected"  }); load(); };
  const approveOrphan = async (id: number) => { await orphanAPI.approve(id);  toast({ title: "Orphan request approved" }); load(); };
  const rejectOrphan  = async (id: number) => { await orphanAPI.reject(id);   toast({ title: "Orphan request rejected"  }); load(); };

  const assignNgo = async () => {
    if (!assignModal || !selectedNgo) { toast({ title: "Select an NGO first", variant: "destructive" }); return; }
    setAssigning(true);
    try {
      await orphanAPI.assignNgo(assignModal.id, selectedNgo);
      toast({ title: "NGO assigned successfully!" });
      setAssignModal(null); setSelectedNgo("");
      load();
    } catch (err: any) {
      toast({ title: "Failed to assign NGO", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally { setAssigning(false); }
  };

  const pendingCare   = careRequests.filter(r => r.status === "pending");
  const pendingOrphan = orphanRequests.filter(r => r.status === "pending");
  const highPriority  = careRequests.filter(r => r.status === "approved" && ["HIGH","SEVERE"].includes(r.priority));

  const tabs = [
    { id: "users"    as Tab, label: "Pending Users",   count: pendingUsers.length,  icon: Users },
    { id: "care"     as Tab, label: "Care Requests",   count: pendingCare.length,   icon: Heart },
    { id: "orphan"   as Tab, label: "Orphan Requests", count: pendingOrphan.length, icon: Building2 },
    { id: "priority" as Tab, label: "Priority",        count: highPriority.length,  icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mb-6">Manage users, care requests, and orphan support.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${tab === t.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}>
                <t.icon className={`w-6 h-6 mb-2 ${tab === t.id ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-2xl font-bold font-display text-card-foreground">{t.count}</p>
                <p className="text-sm text-muted-foreground">{t.label}</p>
              </button>
            ))}
          </div>

          {loading && <p className="text-center text-muted-foreground py-8">Loading…</p>}

          {/* Pending Users */}
          {!loading && tab === "users" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">
                Pending User Approvals <span className="ml-2 text-sm font-normal text-muted-foreground">({pendingUsers.length} waiting)</span>
              </h2>
              {pendingUsers.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">All users have been reviewed.</p>
                </div>
              ) : pendingUsers.map((u) => (
                <motion.div key={u.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-card-foreground">{u.name}</h3>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{u.role}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[u.status]}`}>{u.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(u.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setModal({ type: "user", data: u })} className="gap-1"><Info className="w-4 h-4" /> Info</Button>
                      <Button size="sm" variant="hero" onClick={() => approveUser(u.id)}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => rejectUser(u.id)}>Reject</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Care Requests */}
          {!loading && tab === "care" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">Care Requests</h2>
              {careRequests.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No care requests yet.</p>
                </div>
              ) : careRequests.map((r) => (
                <motion.div key={r.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-card-foreground">{r.elder_name} — {r.help_type}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                        {r.priority && <span className={`text-xs font-bold ${priorityConfig[r.priority]?.color}`}>{priorityConfig[r.priority]?.icon} {r.priority}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{r.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.location} · {r.user_name} ({r.user_email})</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => setModal({ type: "care", data: r })}><Info className="w-4 h-4" /></Button>
                      {r.status === "pending" && <><Button size="sm" variant="hero" onClick={() => approveCare(r.id)}>Approve</Button><Button size="sm" variant="destructive" onClick={() => rejectCare(r.id)}>Reject</Button></>}
                      {r.status === "approved" && <Button size="sm" variant="destructive" onClick={() => rejectCare(r.id)}>Reject</Button>}
                      {r.status === "rejected" && <Button size="sm" variant="hero" onClick={() => approveCare(r.id)}>Re-approve</Button>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Orphan Requests */}
          {!loading && tab === "orphan" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">Orphan Support Requests</h2>
              {orphanRequests.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No orphan requests yet.</p>
                </div>
              ) : orphanRequests.map((r) => {
                const supportTypes = Array.isArray(r.support_types) ? r.support_types : JSON.parse(r.support_types || "[]");
                const assignedNgoName = r.assigned_ngo ? (ngos.find((n: any) => n.id === r.assigned_ngo)?.organization || ngos.find((n: any) => n.id === r.assigned_ngo)?.name || `NGO #${r.assigned_ngo}`) : null;
                return (
                  <motion.div key={r.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-card-foreground">{r.child_name}, age {r.age}</h3>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {supportTypes.map((t: string) => (<span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Submitted by: {r.user_name} ({r.user_email})</p>
                        {assignedNgoName && <p className="text-xs text-primary font-medium mt-1">Assigned NGO: {assignedNgoName}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0 flex-col items-end">
                        <Button size="sm" variant="ghost" onClick={() => setModal({ type: "orphan", data: r })}><Info className="w-4 h-4" /></Button>
                        {r.status === "pending" && <><Button size="sm" variant="hero" onClick={() => approveOrphan(r.id)}>Approve</Button><Button size="sm" variant="destructive" onClick={() => rejectOrphan(r.id)}>Reject</Button></>}
                        {(r.status === "approved" || r.status === "assigned") && (
                          <Button size="sm" variant="hero" onClick={() => { setAssignModal(r); setSelectedNgo(""); }} className="gap-1">
                            <Building2 className="w-3.5 h-3.5" /> {r.status === "assigned" ? "Reassign NGO" : "Assign NGO"}
                          </Button>
                        )}
                        {r.status === "approved" && <Button size="sm" variant="destructive" onClick={() => rejectOrphan(r.id)}>Reject</Button>}
                        {r.status === "rejected" && <Button size="sm" variant="hero" onClick={() => approveOrphan(r.id)}>Re-approve</Button>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Priority */}
          {!loading && tab === "priority" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">High Priority Requests</h2>
              {highPriority.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" /><p className="text-muted-foreground">No high-priority requests right now.</p>
                </div>
              ) : highPriority.map((r: any) => {
                const p = priorityConfig[r.priority] || priorityConfig.LOW;
                return (
                  <motion.div key={r.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-card-foreground flex items-center gap-2"><span>{p.icon}</span>{r.elder_name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                        <p className={`text-xs font-bold mt-1 ${p.color}`}>Priority: {r.priority}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setModal({ type: "care", data: r })} className="gap-1"><Info className="w-4 h-4" /> Info</Button>
                    </div>
                  </motion.div>
                );
              })}
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
              <button onClick={() => setModal(null)}><X className="w-5 h-5" /></button>
            </div>
            {modal.type === "user" && <div className="space-y-2 text-sm"><p><b>Name:</b> {modal.data.name}</p><p><b>Email:</b> {modal.data.email}</p><p><b>Role:</b> <span className="capitalize">{modal.data.role}</span></p><p><b>Status:</b> <span className="capitalize">{modal.data.status}</span></p><p><b>Registered:</b> {new Date(modal.data.created_at).toLocaleString()}</p></div>}
            {modal.type === "care" && <div className="space-y-2 text-sm"><p><b>Name:</b> {modal.data.elder_name}</p><p><b>Age:</b> {modal.data.age}</p><p><b>Location:</b> {modal.data.location}</p><p><b>Help Type:</b> {modal.data.help_type}</p><p><b>Priority:</b> {modal.data.priority}</p><p><b>Description:</b> {modal.data.description}</p><p><b>Status:</b> <span className="capitalize">{modal.data.status}</span></p><hr className="my-2" /><p><b>Submitted by:</b> {modal.data.user_name}</p><p><b>Email:</b> {modal.data.user_email}</p></div>}
            {modal.type === "orphan" && <div className="space-y-2 text-sm"><p><b>Child Name:</b> {modal.data.child_name}</p><p><b>Age:</b> {modal.data.age}</p>{modal.data.guardian && <p><b>Guardian:</b> {modal.data.guardian}</p>}<p><b>Support Types:</b> {(Array.isArray(modal.data.support_types) ? modal.data.support_types : JSON.parse(modal.data.support_types || "[]")).join(", ")}</p><p><b>Description:</b> {modal.data.description}</p><p><b>Status:</b> <span className="capitalize">{modal.data.status}</span></p><hr className="my-2" /><p><b>Submitted by:</b> {modal.data.user_name}</p><p><b>Email:</b> {modal.data.user_email}</p></div>}
          </div>
        </div>
      )}

      {/* Assign NGO Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md border shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold font-display text-foreground">Assign NGO</h2>
              <button onClick={() => setAssignModal(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">For: <span className="font-medium text-foreground">{assignModal.child_name}</span></p>
            {ngos.length === 0 ? (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-sm text-warning mb-4">No approved NGOs found. Approve an NGO first from the Users tab.</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {ngos.map((ngo: any) => (
                  <label key={ngo.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedNgo === String(ngo.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <input type="radio" name="assign-ngo" value={ngo.id} checked={selectedNgo === String(ngo.id)} onChange={e => setSelectedNgo(e.target.value)} className="mt-1" />
                    <div>
                      <div className="font-semibold text-sm text-card-foreground">{ngo.organization || ngo.name}</div>
                      <div className="text-xs text-muted-foreground">{ngo.email}</div>
                      {ngo.focus_area && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full mt-1 inline-block">{ngo.focus_area}</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setAssignModal(null)}>Cancel</Button>
              <Button variant="hero" onClick={assignNgo} disabled={!selectedNgo || assigning || ngos.length === 0}>
                {assigning ? "Assigning…" : "Confirm Assignment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
