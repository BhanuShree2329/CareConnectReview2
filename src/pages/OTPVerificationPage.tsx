import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-elements";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const roleRoutes: Record<string, string> = {
  admin: "/dashboard/admin",
  elder: "/dashboard/elder",
  caretaker: "/dashboard/caretaker",
  ngo: "/dashboard/ngo",
  orphan: "/dashboard/orphan",
};

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyOTP, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const email = localStorage.getItem("otp_email") || user?.email || "";

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast({ title: "Enter the 6-digit OTP", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");

      verifyOTP();
      toast({ title: "Email verified!", description: "Redirecting to your dashboard." });

      // Determine redirect — use user from context or from localStorage
      const storedUser = localStorage.getItem("careconnect_user");
      const currentUser = storedUser ? JSON.parse(storedUser) : user;
      const route = currentUser ? (roleRoutes[currentUser.role] ?? "/login") : "/login";
      navigate(route);
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast({ title: "No email found", description: "Please log in again.", variant: "destructive" });
      return;
    }
    setResending(true);
    try {
      const res = await fetch("http://localhost:5000/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend");
      toast({ title: "OTP resent", description: "Check your inbox." });
    } catch (err: any) {
      toast({ title: "Failed to resend OTP", description: err.message, variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-3xl font-bold font-display text-center mb-2 text-foreground">
          Verify Your Email
        </h1>
        <p className="text-muted-foreground text-center mb-2">
          We sent a 6-digit code to
        </p>
        <p className="font-semibold text-foreground text-center mb-8 break-all">
          {email || "your email address"}
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">OTP Code</Label>
            <Input
              placeholder="• • • • • •"
              className="text-center text-2xl tracking-[0.5em] font-mono"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
          >
            {loading ? "Verifying…" : "Verify OTP"}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            {resending ? "Resending…" : "Resend OTP"}
          </button>
        </div>

        {/* Dev helper note */}
        <p className="mt-8 text-center text-xs text-muted-foreground/60">
          Check your server console if email delivery fails — the OTP is printed there for local testing.
        </p>
      </motion.div>
    </div>
  );
}
