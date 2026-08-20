/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { API_URL } from "@/config";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  History,
  Brain,
  ShieldCheck,
  FileText,
  AlertTriangle,
  PlusCircle,
  X,
  Plus,
  Activity,
  Heart,
  TrendingUp,
  Check,
  ThumbsUp,
  ThumbsDown,
  Upload,
  User,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import SymptomAnalysis from "../patient-dashboard/SymptomAnalysis";
import ActivePatientHeader from "./ActivePatientHeader";
import ProfileManagement from "../patient-dashboard/ProfileManagement";
import SystemPerformance from "./SystemPerformance";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface DoctorDashboardProps {
  user: any;
  activeTab?: string;
  selectedPatient?: Patient | null;
  setSelectedPatient?: (p: Patient | null) => void;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  age: number;
  sex: string;
  phone: string;
  bloodType: string;
  weight: number;
  height: number;
  chronicConditions: string[];
  allergies: string[];
  medications: string[];
  medicalHistory: Array<{
    date: string;
    condition: string;
    notes: string;
    type: string;
    details?: any;
    approvalStatus?: "approved" | "disapproved";
    doctorNotes?: string;
  }>;
}

const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#64748b"];

export default function DoctorDashboard({
  user,
  activeTab = "dashboard",
  selectedPatient = null,
  setSelectedPatient = () => {},
}: DoctorDashboardProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Timeline form
  const [newHistDate, setNewHistDate] = useState("");
  const [newHistType, setNewHistType] = useState("Diagnosis");
  const [newHistCond, setNewHistCond] = useState("");
  const [newHistNotes, setNewHistNotes] = useState("");

  // Advisory Form
  const [healthcareRec, setHealthcareRec] = useState("");
  const [preventiveRec, setPreventiveRec] = useState("");
  const [lifestyleRec, setLifestyleRec] = useState("");
  const [followupRec, setFollowupRec] = useState("");

  // AI Verification Review notes
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});

  // History Timeline Active Filter
  const [timelineFilter, setTimelineFilter] = useState("All Events");

  // Registration form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: "",
    email: "",
    password: "Password123!",
    age: 35,
    sex: "male",
    phone: "",
    bloodType: "O+",
    weight: 75,
    height: 175,
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const storedUserStr = localStorage.getItem("user");
      if (!storedUserStr) return;
      const parsedUser = JSON.parse(storedUserStr);
      const token = parsedUser.token;

      const response = await fetch(`${API_URL}/api/auth/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not fetch patients.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const storedUserStr = localStorage.getItem("user");
      if (!storedUserStr) return;
      const parsedUser = JSON.parse(storedUserStr);
      const token = parsedUser.token;

      const response = await fetch(`${API_URL}/api/auth/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPatientData),
      });

      if (response.ok) {
        const created = await response.json();
        toast.success("Patient registered successfully!");
        setShowAddModal(false);
        setPatients([created, ...patients]);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create patient.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const handleAddTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    if (!newHistDate || !newHistCond) {
      toast.error("Please fill in Date and Event Description.");
      return;
    }

    try {
      const storedUserStr = localStorage.getItem("user");
      if (!storedUserStr) return;
      const parsedUser = JSON.parse(storedUserStr);
      const token = parsedUser.token;

      const newHistoryItem = {
        date: newHistDate,
        type: newHistType,
        condition: newHistCond,
        notes: newHistNotes,
      };

      const updatedHistory = [newHistoryItem, ...(selectedPatient.medicalHistory || [])];

      const response = await fetch(`${API_URL}/api/auth/patients/${selectedPatient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ medicalHistory: updatedHistory }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setSelectedPatient(updatedData);
        setPatients(patients.map((p) => (p._id === updatedData._id ? updatedData : p)));
        toast.success("Event added successfully!");
        setNewHistDate("");
        setNewHistCond("");
        setNewHistNotes("");
      } else {
        toast.error("Failed to add event to medical timeline.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not reach server.");
    }
  };

  const handleRemoveTimeline = async (idxToRemove: number) => {
    if (!selectedPatient) return;
    try {
      const storedUserStr = localStorage.getItem("user");
      if (!storedUserStr) return;
      const parsedUser = JSON.parse(storedUserStr);
      const token = parsedUser.token;

      const updatedHistory = (selectedPatient.medicalHistory || []).filter(
        (_, idx) => idx !== idxToRemove,
      );

      const response = await fetch(`${API_URL}/api/auth/patients/${selectedPatient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ medicalHistory: updatedHistory }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setSelectedPatient(updatedData);
        setPatients(patients.map((p) => (p._id === updatedData._id ? updatedData : p)));
        toast.success("Event removed from medical timeline.");
      } else {
        toast.error("Failed to remove event.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not reach server.");
    }
  };

  const handleSaveRecommendations = async () => {
    if (!selectedPatient) return;
    try {
      const storedUserStr = localStorage.getItem("user");
      if (!storedUserStr) return;
      const parsedUser = JSON.parse(storedUserStr);
      const token = parsedUser.token;

      const newHistoryItem = {
        date: new Date().toISOString().split("T")[0],
        type: "Clinical Advisory",
        condition: "Healthcare Recommendations",
        notes: `Clinical Recommendations added by Dr. ${parsedUser.name}`,
        details: {
          recommendations: {
            healthcare: healthcareRec || "Standard consult review",
            preventive: preventiveRec || "No specific guidelines",
            lifestyle: lifestyleRec || "Healthy diet",
            followUp: followupRec || "As needed",
          },
        },
      };

      const updatedHistory = [newHistoryItem, ...(selectedPatient.medicalHistory || [])];

      const response = await fetch(`${API_URL}/api/auth/patients/${selectedPatient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ medicalHistory: updatedHistory }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setSelectedPatient(updatedData);
        setPatients(patients.map((p) => (p._id === updatedData._id ? updatedData : p)));
        toast.success("Recommendations successfully sent to patient.");
        setHealthcareRec("");
        setPreventiveRec("");
        setLifestyleRec("");
        setFollowupRec("");
      } else {
        toast.error("Failed to add recommendations.");
      }
    } catch (e) {
      toast.error("Server connection lost.");
    }
  };

  const handleReviewAnalysis = async (index: number, approval: "approved" | "disapproved") => {
    if (!selectedPatient) return;
    try {
      const storedUserStr = localStorage.getItem("user");
      if (!storedUserStr) return;
      const parsedUser = JSON.parse(storedUserStr);
      const token = parsedUser.token;

      const updatedHistory = (selectedPatient.medicalHistory || []).map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            approvalStatus: approval,
            doctorNotes: reviewNotes[index] || "Reviewed and verified.",
          };
        }
        return item;
      });

      const response = await fetch(`${API_URL}/api/auth/patients/${selectedPatient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ medicalHistory: updatedHistory }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setSelectedPatient(updatedData);
        setPatients(patients.map((p) => (p._id === updatedData._id ? updatedData : p)));
        toast.success(`Analysis report ${approval}.`);
        setReviewNotes({ ...reviewNotes, [index]: "" });
      } else {
        toast.error("Failed to update report verification status.");
      }
    } catch (e) {
      toast.error("Could not reach backend.");
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Active patient overview header context if selected */}
      {selectedPatient && (
        <ActivePatientHeader
          patient={selectedPatient}
          onChangePatient={() => setSelectedPatient(null)}
        />
      )}

      {/* Render Tab 1: Patient Files */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                title: "Total Patients",
                val: "248",
                trend: "+12 this week",
                theme: "text-blue-600",
              },
              {
                title: "New Patients",
                val: "18",
                trend: "+5 this week",
                theme: "text-emerald-600",
              },
              { title: "Active Cases", val: "56", trend: "In treatment", theme: "text-indigo-600" },
              { title: "Follow Ups", val: "32", trend: "Due this week", theme: "text-amber-600" },
            ].map((stat, i) => (
              <Card
                key={i}
                className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[20px] p-5"
              >
                <p className="text-[10px] uppercase font-bold text-slate-400">{stat.title}</p>
                <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  {stat.val}
                </h4>
                <p className={`text-[10px] font-bold mt-1 ${stat.theme}`}>{stat.trend}</p>
              </Card>
            ))}
          </div>

          {/* Search bar & registry */}
          <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-855 dark:text-white">
                  Recent Patients
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Click a record to select it as the active patient
                </CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 text-xs font-semibold focus:outline-none transition-all"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-slate-855 text-[10px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Age / Gender</th>
                    <th className="px-6 py-4">Last Visit</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-xs text-slate-400 font-semibold"
                      >
                        Loading patients...
                      </td>
                    </tr>
                  ) : filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-xs text-slate-400 italic">
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => {
                      const lastVisit =
                        p.medicalHistory?.length > 0 ? p.medicalHistory[0].date : "10 May 2025";
                      const isSelected = selectedPatient?._id === p._id;
                      const hasHighRisk = p.medicalHistory?.some(
                        (h) => h.details?.riskCat === "High Risk",
                      );
                      const hasModRisk = p.medicalHistory?.some(
                        (h) => h.details?.riskCat === "Moderate Risk",
                      );
                      const statusText = hasHighRisk
                        ? "Active"
                        : hasModRisk
                          ? "Follow up"
                          : "Inactive";
                      const statusClass = hasHighRisk
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20"
                        : hasModRisk
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                          : "bg-slate-50 text-slate-500 dark:bg-slate-850";

                      return (
                        <tr
                          key={p._id}
                          onClick={() => setSelectedPatient(p)}
                          className={`hover:bg-slate-50/70 dark:hover:bg-slate-850/30 cursor-pointer transition-all ${
                            isSelected ? "bg-blue-50/30 dark:bg-blue-950/10" : ""
                          }`}
                        >
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                              {p.name[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-855 dark:text-white">
                                {p.name}
                              </p>
                              <p className="text-[10px] text-slate-400">{p.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {p.age} / {p.sex}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-550 font-mono">
                            {lastVisit}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusClass}`}
                            >
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Bottom Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[20px] p-6 flex flex-row items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  Add New Patient
                </h4>
                <p className="text-xs text-slate-450 mt-1">Register a new patient record</p>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                size="icon"
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </Card>
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[20px] p-6 flex flex-row items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Import Records</h4>
                <p className="text-xs text-slate-450 mt-1">Upload patient files in bulk</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-apple hover:bg-slate-50 text-slate-500 shrink-0 cursor-pointer"
              >
                <Upload className="h-5 w-5" />
              </Button>
            </Card>
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[20px] p-6 flex flex-row items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Patient Search</h4>
                <p className="text-xs text-slate-450 mt-1">Advanced search & filters</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-apple hover:bg-slate-50 text-slate-500 shrink-0 cursor-pointer"
              >
                <Search className="h-5 w-5" />
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Render Tab 2: AI Diagnostics */}
      {activeTab === "ai-diagnostics" && (
        <div className="space-y-6">
          {selectedPatient ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Symptom Picker */}
              <div className="lg:col-span-2">
                <SymptomAnalysis
                  user={{ ...selectedPatient, role: "patient" }}
                  onUpdate={(updatedData: any) => {
                    setSelectedPatient(updatedData);
                    setPatients(patients.map((p) => (p._id === updatedData._id ? updatedData : p)));
                  }}
                />
              </div>

              {/* Right Column: AI Diagnostics history verification */}
              <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden flex flex-col h-[650px]">
                <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6 shrink-0">
                  <CardTitle className="text-base font-bold text-slate-855 dark:text-white">
                    AI Diagnostics History
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Review and verify diagnostic reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto flex-1 space-y-4">
                  {(() => {
                    const analysesWithIndexes = (selectedPatient.medicalHistory || [])
                      .map((item, idx) => ({ item, idx }))
                      .filter(({ item }) => item.details !== undefined);

                    if (analysesWithIndexes.length === 0) {
                      return (
                        <div className="py-8 text-center text-xs text-slate-400 italic">
                          No previous AI diagnostic reports logged.
                        </div>
                      );
                    }

                    return analysesWithIndexes.map(({ item, idx }) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/25">
                              {item.date}
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mt-1.5 truncate">
                              {item.condition}
                            </h4>
                            {item.details?.riskScore !== undefined && (
                              <p className="text-[11px] font-semibold text-slate-500 mt-1">
                                Risk:{" "}
                                <span
                                  className={
                                    item.details.riskCat === "High Risk"
                                      ? "text-rose-500"
                                      : "text-amber-500"
                                  }
                                >
                                  {item.details.riskCat} ({item.details.riskScore}%)
                                </span>
                              </p>
                            )}
                          </div>

                          {/* Status badge */}
                          {item.approvalStatus === "approved" && (
                            <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1 shrink-0">
                              <Check className="h-3 w-3" /> Approved
                            </span>
                          )}
                          {item.approvalStatus === "disapproved" && (
                            <span className="bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-1 shrink-0">
                              <X className="h-3 w-3" /> Disapproved
                            </span>
                          )}
                          {!item.approvalStatus && (
                            <span className="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-amber-100 dark:border-amber-900/30 shrink-0">
                              Pending
                            </span>
                          )}
                        </div>

                        {item.details?.symptoms && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Logged Symptoms
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {item.details.symptoms.map((symptom: string, sIdx: number) => (
                                <span
                                  key={sIdx}
                                  className="bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-slate-200/25"
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.approvalStatus ? (
                          <div className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-700/30 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Clinician Note
                            </span>
                            <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                              "{item.doctorNotes || "No notes."}"
                            </p>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-slate-200/20 dark:border-slate-800/50 space-y-3">
                            <div className="space-y-1">
                              <Label
                                htmlFor={`note-${idx}`}
                                className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                              >
                                Review Note
                              </Label>
                              <Input
                                id={`note-${idx}`}
                                placeholder="Verification feedback..."
                                value={reviewNotes[idx] || ""}
                                onChange={(e) =>
                                  setReviewNotes({ ...reviewNotes, [idx]: e.target.value })
                                }
                                className="h-9 rounded-xl text-xs"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReviewAnalysis(idx, "approved")}
                                className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReviewAnalysis(idx, "disapproved")}
                                variant="outline"
                                className="flex-1 h-9 rounded-xl border-rose-200/50 text-rose-500 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                Disapprove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Default Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    title: "Total Analyses",
                    val: "142",
                    trend: "+18 this week",
                    theme: "text-blue-600",
                  },
                  {
                    title: "High Risk Cases",
                    val: "12",
                    trend: "Needs attention",
                    theme: "text-rose-600",
                  },
                  {
                    title: "AI Accuracy",
                    val: "94%",
                    trend: "This month",
                    theme: "text-emerald-600",
                  },
                  {
                    title: "Avg. Response Time",
                    val: "2.4s",
                    trend: "This month",
                    theme: "text-blue-600",
                  },
                ].map((stat, i) => (
                  <Card
                    key={i}
                    className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[20px] p-5"
                  >
                    <p className="text-[10px] uppercase font-bold text-slate-400">{stat.title}</p>
                    <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                      {stat.val}
                    </h4>
                    <p className={`text-[10px] font-bold mt-1 ${stat.theme}`}>{stat.trend}</p>
                  </Card>
                ))}
              </div>

              {/* Default Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden">
                  <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6">
                    <CardTitle className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                      <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
                      Diagnostics Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { name: "4 May", Analyses: 40, HighRisk: 10 },
                            { name: "5 May", Analyses: 36, HighRisk: 12 },
                            { name: "6 May", Analyses: 48, HighRisk: 8 },
                            { name: "7 May", Analyses: 45, HighRisk: 15 },
                            { name: "8 May", Analyses: 42, HighRisk: 11 },
                            { name: "9 May", Analyses: 50, HighRisk: 13 },
                            { name: "10 May", Analyses: 62, HighRisk: 18 },
                          ]}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="rgba(0,0,0,0.03)"
                          />
                          <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis fontSize={10} tickLine={false} axisLine={false} />
                          <RechartsTooltip />
                          <Line
                            type="monotone"
                            dataKey="Analyses"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="HighRisk"
                            stroke="#ef4444"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden">
                  <CardHeader className="border-b border-slate-50 dark:border-slate-855 p-6">
                    <CardTitle className="text-sm font-bold text-slate-855 dark:text-white">
                      Top Conditions Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex items-center justify-between gap-4">
                    <div className="h-[180px] w-[180px] relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Respiratory", value: 32 },
                              { name: "Cardiovascular", value: 24 },
                              { name: "Neurology", value: 18 },
                              { name: "Endocrine", value: 14 },
                              { name: "Others", value: 12 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-slate-800 dark:text-white">
                          142
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-400">Total</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[
                        { name: "Respiratory", val: "32%", col: "bg-blue-500" },
                        { name: "Cardiovascular", val: "24%", col: "bg-emerald-500" },
                        { name: "Neurology", val: "18%", col: "bg-indigo-500" },
                        { name: "Endocrine", val: "14%", col: "bg-amber-500" },
                        { name: "Others", val: "12%", col: "bg-slate-500" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${item.col}`} />
                            <span className="font-semibold text-slate-655 dark:text-slate-350">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-extrabold text-slate-700 dark:text-white">
                            {item.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* Render Tab 3: Clinical Advisory */}
      {activeTab === "clinical-advisory" && (
        <div className="space-y-6">
          {selectedPatient ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 dark:border-slate-855 p-6 sm:p-8">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    Add Clinical Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="rec-health"
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        Healthcare Advice
                      </Label>
                      <Input
                        id="rec-health"
                        placeholder="e.g. Cardiologist consultation"
                        value={healthcareRec}
                        onChange={(e) => setHealthcareRec(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="rec-prev"
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        Preventive Care
                      </Label>
                      <Input
                        id="rec-prev"
                        placeholder="e.g. Monitor BP twice daily"
                        value={preventiveRec}
                        onChange={(e) =>
                          setNewPatientData({ ...newPatientData, phone: e.target.value })
                        }
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="rec-life"
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        Diet & Lifestyle
                      </Label>
                      <Input
                        id="rec-life"
                        placeholder="e.g. Low sodium nutrition"
                        value={lifestyleRec}
                        onChange={(e) => setLifestyleRec(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="rec-follow"
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        Follow-up Period
                      </Label>
                      <Input
                        id="rec-follow"
                        placeholder="e.g. Checkup in 14 days"
                        value={followupRec}
                        onChange={(e) => setFollowupRec(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveRecommendations}
                    className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold shadow-apple text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    Save Advisory Recommendations
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 dark:border-slate-855 p-6 sm:p-8">
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Active Prescriptions & Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Active Prescriptions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedPatient.medications || []).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">
                          No prescriptions active
                        </span>
                      ) : (
                        selectedPatient.medications.map((med, idx) => (
                          <span
                            key={idx}
                            className="bg-sky-50 text-sky-655 dark:bg-sky-950/20 dark:text-sky-455 text-xs font-semibold px-2.5 py-1 rounded-2xl border border-sky-100 dark:border-sky-900/30"
                          >
                            {med}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Allergies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedPatient.allergies || []).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">
                          No allergies registered
                        </span>
                      ) : (
                        selectedPatient.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            className="bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455 text-xs font-semibold px-2.5 py-1 rounded-2xl border border-rose-100 dark:border-rose-900/30"
                          >
                            {allergy}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Default Clinical Advisory Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Treatment Guidelines", desc: "Evidence-based guidelines" },
                  { title: "Drug Interactions", desc: "Contraindications & risks" },
                  { title: "Clinical Protocols", desc: "Standard clinical steps" },
                  { title: "Alert & Warnings", desc: "Critical safety warnings" },
                ].map((card, i) => (
                  <Card
                    key={i}
                    className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[20px] p-5"
                  >
                    <h4 className="text-xs font-bold text-slate-855 dark:text-white">
                      {card.title}
                    </h4>
                    <p className="text-[10px] text-slate-450 mt-1">{card.desc}</p>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Recommended for Today
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Update on Hypertension Guidelines 2025",
                        desc: "New recommendations for BP management",
                      },
                      {
                        title: "Antibiotic Stewardship",
                        desc: "Best practices for antibiotic prescription",
                      },
                      {
                        title: "Managing Type 2 Diabetes",
                        desc: "Latest clinical approach and targets",
                      },
                    ].map((rec, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 rounded-xl"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-slate-855 dark:text-white">
                            {rec.title}
                          </h5>
                          <p className="text-[10px] text-slate-450 mt-0.5">{rec.desc}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[10px] font-bold text-blue-600 cursor-pointer"
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Clinical Alerts
                  </h4>
                  <div className="space-y-3">
                    {[
                      { text: "High drug interaction risk in 2 patient(s)", type: "error" },
                      { text: "3 critical follow-ups due today", type: "warning" },
                      { text: "New safety update on Drug X", type: "info" },
                    ].map((alert, i) => (
                      <div
                        key={i}
                        className={`p-4 border rounded-2xl flex items-center gap-3 ${
                          alert.type === "error"
                            ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-955/20"
                            : alert.type === "warning"
                              ? "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-955/20"
                              : "bg-sky-50 border-sky-100 text-sky-600 dark:bg-sky-955/20"
                        }`}
                      >
                        <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                        <span className="text-xs font-semibold">{alert.text}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* Render Tab 4: History Timeline */}
      {activeTab === "history-timeline" && (
        <div className="space-y-6">
          {selectedPatient ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Timeline Sidebar Filters */}
              <Card className="lg:col-span-1 border-apple shadow-apple bg-white dark:bg-slate-900 rounded-3xl p-4 flex flex-col gap-2 shrink-0 h-fit">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white px-2 mb-2">
                  Filters
                </h4>
                {["All Events", "Consultation", "Prescription", "Lab Report", "Diagnosis"].map(
                  (filter) => {
                    const isActive = timelineFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setTimelineFilter(filter)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-50/80 text-blue-600 dark:bg-blue-955/20"
                            : "hover:bg-slate-50 text-slate-500"
                        }`}
                      >
                        {filter}s
                      </button>
                    );
                  },
                )}
              </Card>

              {/* Timeline content & event log form */}
              <div className="lg:col-span-3 space-y-6">
                <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 dark:border-slate-855 p-6 sm:p-8">
                    <CardTitle className="text-base font-bold text-slate-855 dark:text-white flex items-center gap-2">
                      <PlusCircle className="h-5 w-5 text-indigo-500" />
                      Add Timeline Event
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8">
                    <form onSubmit={handleAddTimeline} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="add-hdate"
                            className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                          >
                            Date
                          </Label>
                          <Input
                            id="add-hdate"
                            type="date"
                            value={newHistDate}
                            onChange={(e) => setNewHistDate(e.target.value)}
                            className="h-10 rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="add-htype"
                            className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                          >
                            Type
                          </Label>
                          <select
                            id="add-htype"
                            value={newHistType}
                            onChange={(e) => setNewHistType(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-transparent text-xs"
                          >
                            <option value="Diagnosis">Diagnosis</option>
                            <option value="Consultation">Consultation</option>
                            <option value="Prescription">Prescription</option>
                            <option value="Lab Report">Lab Report</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="add-hcond"
                            className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                          >
                            Description
                          </Label>
                          <Input
                            id="add-hcond"
                            placeholder="e.g. Pneumonia"
                            value={newHistCond}
                            onChange={(e) => setNewHistCond(e.target.value)}
                            className="h-10 rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="add-hnotes"
                          className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                        >
                          Details
                        </Label>
                        <Input
                          id="add-hnotes"
                          placeholder="e.g. Complete recovery..."
                          value={newHistNotes}
                          onChange={(e) => setNewHistNotes(e.target.value)}
                          className="h-10 rounded-xl"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs px-5 shadow-apple flex items-center gap-1.5"
                      >
                        <Plus className="h-4.5 w-4.5" /> Add to Timeline
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 dark:border-slate-855 p-6">
                    <CardTitle className="text-base font-bold text-slate-855 dark:text-white">
                      Patient History Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 overflow-y-auto max-h-[500px]">
                    <div className="relative border-l border-slate-100 dark:border-slate-800 ml-4 space-y-6 py-2">
                      {(() => {
                        const list = (selectedPatient.medicalHistory || []).filter(
                          (h) => timelineFilter === "All Events" || h.type === timelineFilter,
                        );

                        if (list.length === 0) {
                          return (
                            <div className="pl-6 text-slate-400 text-xs italic">
                              No entries match this filter.
                            </div>
                          );
                        }

                        return list.map((item, idx) => (
                          <div key={idx} className="relative pl-6 md:pl-8 group">
                            <div className="absolute -left-[7px] top-2 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 shadow-sm" />

                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-550 font-mono bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded-lg">
                                    {item.date}
                                  </span>
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-blue-50 text-blue-600">
                                    {item.type}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-850 dark:text-white">
                                  {item.condition}
                                </h4>
                                {item.notes && (
                                  <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                              <Button
                                onClick={() => handleRemoveTimeline(idx)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-650 cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-[28px] border border-apple shadow-apple text-center">
              <Users className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                No Patient Selected
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select a patient from Patient Files to view records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Render Tab 5: Profile Management */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {selectedPatient ? (
            <ProfileManagement
              user={{ ...selectedPatient, role: "patient" }}
              onUpdate={(updatedPatient: any) => {
                setSelectedPatient(updatedPatient);
                setPatients(
                  patients.map((p) => (p._id === updatedPatient._id ? updatedPatient : p)),
                );
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-[28px] border border-apple shadow-apple text-center">
              <Users className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-black text-slate-800 dark:text-white">
                No Patient Selected
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select a patient from Patient Files to view records.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Render Tab 6: Patient Analytics */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          {selectedPatient ? (
            <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden">
              <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6">
                <CardTitle className="text-sm font-bold text-slate-855 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
                  Patient Health & Risk Score Trend
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Historical tracking of AI diagnostics severity index
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {(() => {
                  const chartData = (selectedPatient.medicalHistory || [])
                    .filter((item: any) => item.details?.riskScore !== undefined)
                    .map((item: any) => ({
                      date: item.date,
                      riskScore: item.details.riskScore,
                    }))
                    .reverse();

                  if (chartData.length === 0) {
                    return (
                      <div className="py-12 text-center text-xs text-slate-400 italic">
                        No risk score progression metrics cataloged.
                      </div>
                    );
                  }

                  return (
                    <div className="h-[260px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="patientLatency" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="rgba(0,0,0,0.03)"
                          />
                          <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={11}
                            fontWeight={600}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            fontWeight={600}
                            tickLine={false}
                            axisLine={false}
                          />
                          <RechartsTooltip />
                          <Area
                            type="monotone"
                            dataKey="riskScore"
                            name="Risk Score (%)"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#patientLatency)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <SystemPerformance />
          )}
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-855 dark:text-white">
                  Register New Patient
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Create new patient profile
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreatePatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Full Name
                    </Label>
                    <Input
                      required
                      value={newPatientData.name}
                      onChange={(e) =>
                        setNewPatientData({ ...newPatientData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Email Address
                    </Label>
                    <Input
                      required
                      type="email"
                      value={newPatientData.email}
                      onChange={(e) =>
                        setNewPatientData({ ...newPatientData, email: e.target.value })
                      }
                      placeholder="john@doe.com"
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Age
                    </Label>
                    <Input
                      required
                      type="number"
                      value={newPatientData.age}
                      onChange={(e) =>
                        setNewPatientData({ ...newPatientData, age: Number(e.target.value) })
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Sex
                    </Label>
                    <select
                      value={newPatientData.sex}
                      onChange={(e) =>
                        setNewPatientData({ ...newPatientData, sex: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-transparent text-xs"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Height (cm)
                    </Label>
                    <Input
                      required
                      type="number"
                      value={newPatientData.height}
                      onChange={(e) =>
                        setNewPatientData({ ...newPatientData, height: Number(e.target.value) })
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Weight (kg)
                    </Label>
                    <Input
                      required
                      type="number"
                      value={newPatientData.weight}
                      onChange={(e) =>
                        setNewPatientData({ ...newPatientData, weight: Number(e.target.value) })
                      }
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold mt-4 cursor-pointer"
                >
                  Register Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
