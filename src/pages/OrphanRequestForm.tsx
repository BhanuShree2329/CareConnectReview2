import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form-elements";
import { useAuth } from "@/contexts/AuthContext";
import { orphanAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const supportOptions = ["Education", "Medical", "Shelter", "Financial", "Counseling", "Legal Aid"];

export default function OrphanRequestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState("");
  const [guardian, setGuardian] = useState("");
  const [supportTypes, setSupportTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSupport = (s: string) => {
    setSupportTypes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || supportTypes.length === 0 || !description) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await orphanAPI.submit({
        childName: name,
        age: parseInt(age),
        guardian: guardian || undefined,
        supportTypes,
        description,
      });
      toast({ title: "Request submitted", description: "Your support request is pending admin approval." });
      navigate("/dashboard/orphan");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Link
          to="/dashboard/orphan"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold font-display mb-2 text-foreground">Support Request</h1>
        <p className="text-muted-foreground mb-8">Tell us what support you need.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-foreground">Full Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Age *</Label>
              <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" min="0" max="18" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Guardian (optional)</Label>
              <Input value={guardian} onChange={(e) => setGuardian(e.target.value)} placeholder="Guardian name" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Required Support *</Label>
            <div className="flex flex-wrap gap-2">
              {supportOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSupport(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                    supportTypes.includes(s)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {supportTypes.length === 0 && (
              <p className="text-xs text-muted-foreground">Select at least one support type.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your situation and needs in detail..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link to="/dashboard/orphan" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">Cancel</Button>
            </Link>
            <Button variant="hero" size="lg" className="flex-1" type="submit" disabled={loading}>
              {loading ? "Submitting…" : "Submit Request"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
