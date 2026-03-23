"use client";

import { useState } from "react";
import Papa from "papaparse";
import { FileSpreadsheet, UploadCloud } from "lucide-react";

export default function UsersBulkProvisioning() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const cleanData = parsed.data.map((row) => ({
          roll_no: row.roll_no?.trim(),
        }));

        setUploading(true);

        try {
          const res = await fetch("/api/admin/bulk-create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ students: cleanData }),
          });

          const data = await res.json();
          setResults(data.results);
        } catch (err) {
          alert("Bulk provisioning failed");
        }

        setUploading(false);
      },
    });
  };

  return (
    <section className="premium-card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-green-700">Bulk provisioning</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Upload student CSV</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Provision students in batches without touching the existing onboarding logic.
          </p>
        </div>

        <label className="premium-button-secondary inline-flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-semibold">
          <UploadCloud className="h-4 w-4" />
          Choose CSV
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <FileSpreadsheet className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Expected CSV format</p>
            <p className="text-sm text-slate-500">Include a `roll_no` column for each student record.</p>
          </div>
        </div>

        {uploading ? (
          <div className="mt-5 space-y-3">
            <div className="skeleton h-4 w-40 rounded-full" />
            <div className="skeleton h-12 rounded-[1.2rem]" />
            <div className="skeleton h-12 rounded-[1.2rem]" />
          </div>
        ) : null}

        {results ? (
          <div className="mt-5 max-h-72 space-y-2 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={`${result.roll_no}-${index}`}
                className="flex items-center justify-between rounded-[1.2rem] bg-white px-4 py-3 shadow-sm"
              >
                <span className="text-sm font-semibold text-slate-900">{result.roll_no}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] ${
                    result.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {result.status}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
