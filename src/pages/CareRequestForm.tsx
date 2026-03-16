import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form-elements";
import { useAuth } from "@/contexts/AuthContext";
import { careAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const helpTypes = [
  "Medical Assistance",
  "Daily Living Support",
  "Companionship",
  "Transportation",
  "Meal Preparation",
  "Physical Therapy",
];

export default function CareRequestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [helpType, setHelpType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !age || !location || !helpType || !description) {
      toast({
        title: "Missing fields",
        description: "Please fill all fields.",
        variant: "destructive",
      });
      return;
    }

    const numericAge = parseInt(age, 10);

    if (isNaN(numericAge) || numericAge < 40 || numericAge > 120) {
      toast({
        title: "Invalid age",
        description: "Age must be between 40 and 120.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await careAPI.submit({
        elderName: name,
        age: numericAge,
        location,
        helpType,
        description,
      });

      toast({
        title: "Request submitted",
        description: "Your care request is pending admin approval.",
      });

      navigate("/dashboard/elder");
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Link
          to="/dashboard/elder"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold font-display mb-2 text-foreground">
          Submit Care Request
        </h1>
        <p className="text-muted-foreground mb-8">
          Tell us what kind of care you need.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-foreground">Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Age</Label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="65"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Type of Help Needed</Label>
            <Select value={helpType} onValueChange={setHelpType}>
              <SelectTrigger>
                <SelectValue placeholder="Select help type" />
              </SelectTrigger>
              <SelectContent>
                {helpTypes.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your situation and needs..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link to="/dashboard/elder" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="flex-1 gap-2"
              disabled={loading}
            >
              <Heart className="w-4 h-4" />
              {loading ? "Submitting…" : "Submit Request"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}