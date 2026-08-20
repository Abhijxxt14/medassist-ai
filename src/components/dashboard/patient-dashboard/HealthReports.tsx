"use client";

import { UserData } from "@/app/dashboard/page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportsProps {
  user: UserData;
}

export default function HealthReports({ user }: ReportsProps) {
  const reports = (user.medicalHistory || []).filter(
    (item) => item.type === "Diagnosis" || item.details !== undefined,
  );

  return (
    <Card className="border-apple shadow-apple bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-slate-50 dark:border-slate-850 p-6 sm:p-8">
        <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-slate-800 dark:text-white">
          <FileText className="h-5 w-5 text-indigo-500" />
          Health Reports & AI Diagnoses
        </CardTitle>
        <CardDescription className="text-slate-400">
          Access diagnostic reports and treatment guidelines
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        {reports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 italic">
            No diagnostic reports logged yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-4 shadow-sm relative flex flex-col justify-between"
              >
                <div className="flex justify-between items-start w-full">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/25">
                        {report.date}
                      </span>
                      {report.details?.riskCat && (
                        <span className="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {report.details.riskCat}
                        </span>
                      )}

                      {/* Clinical Verification Badges */}
                      {report.approvalStatus === "approved" && (
                        <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Clinician Approved
                        </span>
                      )}
                      {report.approvalStatus === "disapproved" && (
                        <span className="bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-rose-100 dark:border-rose-900/30 flex items-center gap-1">
                          <X className="h-3 w-3" /> Clinician Refused
                        </span>
                      )}
                      {!report.approvalStatus && report.details !== undefined && (
                        <span className="bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-100 dark:border-amber-900/30 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pending Review
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                      {report.condition} Report
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                      {report.notes || "Report processed with machine learning classifier."}
                    </p>

                    {/* Clinician notes */}
                    {report.doctorNotes && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-880 text-[11px] text-slate-500 leading-relaxed italic">
                        <span className="font-bold text-slate-700 dark:text-slate-300 not-italic block mb-0.5">
                          Clinician Note:
                        </span>
                        "{report.doctorNotes}"
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 cursor-pointer shrink-0 ml-2"
                  >
                    <Download className="h-4 w-4 text-slate-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
