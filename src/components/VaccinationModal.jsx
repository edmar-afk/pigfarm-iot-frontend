/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Syringe,
  X,
  CalendarDays,
  PiggyBank,
  FileText,
  UserRound,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const EMPTY_FORM = {
  date: getTodayString(),
  vaccineName: "",
  pigCount: "",
  pen: "",
  administeredBy: "",
  notes: "",
};

function VaccinationModal({
  isOpen,
  initialData = null,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({
        date: initialData.date || getTodayString(),
        vaccineName: initialData.vaccineName || "",
        pigCount: String(initialData.pigCount ?? ""),
        pen: initialData.pen || "",
        administeredBy: initialData.administeredBy || "",
        notes: initialData.notes || "",
      });
    } else {
      setForm({ ...EMPTY_FORM, date: getTodayString() });
    }

    setErrors({});
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.date) {
      nextErrors.date = "Please select a vaccination date.";
    } else {
      const selectedDate = new Date(`${form.date}T00:00:00`);
      const today = new Date(`${getTodayString()}T00:00:00`);

      if (Number.isNaN(selectedDate.getTime())) {
        nextErrors.date = "Please enter a valid date.";
      } else if (selectedDate > today) {
        nextErrors.date = "The vaccination date cannot be in the future.";
      }
    }

    if (!form.vaccineName.trim()) {
      nextErrors.vaccineName = "Vaccine name is required.";
    } else if (form.vaccineName.trim().length > 100) {
      nextErrors.vaccineName = "Vaccine name must be 100 characters or fewer.";
    }

    const count = Number(form.pigCount);

    if (
      form.pigCount === "" ||
      !Number.isSafeInteger(count) ||
      count < 1
    ) {
      nextErrors.pigCount = "Enter a whole number of at least 1 pig.";
    }

    if (form.pen.trim().length > 100) {
      nextErrors.pen = "Pen or pig group must be 100 characters or fewer.";
    }

    if (form.administeredBy.trim().length > 100) {
      nextErrors.administeredBy =
        "Name must be 100 characters or fewer.";
    }

    if (form.notes.length > 1000) {
      nextErrors.notes = "Notes must be 1,000 characters or fewer.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    onSubmit({
      date: form.date,
      vaccineName: form.vaccineName.trim(),
      pigCount: Number(form.pigCount),
      pen: form.pen.trim(),
      administeredBy: form.administeredBy.trim(),
      notes: form.notes.trim(),
    });
  };

  const inputClass = (field) =>
    `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
      errors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
    }`;

  const labelClass =
    "text-sm font-semibold text-slate-700";

  const fieldIconClass =
    "pointer-events-none absolute left-3.5 top-[42px] text-slate-400";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="vaccination-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vaccination-modal-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >
            {/* Modal header */}
            <div className="relative overflow-hidden bg-[#173B2F] px-6 py-6 text-white sm:px-8">
              <div className="pointer-events-none absolute -right-8 -top-16 h-44 w-44 rounded-full bg-emerald-400/10" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                    <Syringe size={24} />
                  </div>

                  <div>
                    <h2
                      id="vaccination-modal-title"
                      className="text-xl font-semibold tracking-tight"
                    >
                      {initialData
                        ? "Edit vaccination record"
                        : "Record vaccination"}
                    </h2>

                    <p className="mt-1.5 text-sm leading-5 text-emerald-100/70">
                      {initialData
                        ? "Update the saved details for this farm activity."
                        : "Enter the vaccination details to add them to your ledger."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close vaccination form"
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="relative mt-5 flex items-center gap-2 text-xs text-emerald-100/70">
                <CheckCircle2 size={15} />
                Saved in this browser only
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="max-h-[65vh] space-y-6 overflow-y-auto p-6 sm:p-8">
                {/* Date and vaccine */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarDays size={18} className="text-emerald-700" />

                    <h3 className="text-sm font-semibold text-slate-900">
                      Vaccination information
                    </h3>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="vaccination-date" className={labelClass}>
                        Vaccination date
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <input
                        id="vaccination-date"
                        type="date"
                        name="date"
                        value={form.date}
                        max={getTodayString()}
                        onChange={updateField}
                        className={inputClass("date")}
                        required
                      />

                      {errors.date && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {errors.date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="vaccination-vaccine"
                        className={labelClass}
                      >
                        Vaccine name
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <Syringe size={17} className={fieldIconClass} />

                        <input
                          id="vaccination-vaccine"
                          type="text"
                          name="vaccineName"
                          value={form.vaccineName}
                          onChange={updateField}
                          placeholder="e.g. Classical swine fever"
                          maxLength={100}
                          className={`${inputClass("vaccineName")} pl-10`}
                          required
                        />
                      </div>

                      {errors.vaccineName && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {errors.vaccineName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Number and group */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <PiggyBank size={18} className="text-emerald-700" />

                    <h3 className="text-sm font-semibold text-slate-900">
                      Pigs and farm group
                    </h3>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="vaccination-pig-count"
                        className={labelClass}
                      >
                        Number of pigs vaccinated
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <PiggyBank size={17} className={fieldIconClass} />

                        <input
                          id="vaccination-pig-count"
                          type="number"
                          name="pigCount"
                          value={form.pigCount}
                          onChange={updateField}
                          placeholder="e.g. 25"
                          min="1"
                          step="1"
                          max="9007199254740991"
                          className={`${inputClass("pigCount")} pl-10`}
                          required
                        />
                      </div>

                      {errors.pigCount && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {errors.pigCount}
                        </p>
                      )}

                      <p className="mt-1.5 text-xs text-slate-400">
                        Enter the number actually vaccinated in this activity.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="vaccination-pen"
                        className={labelClass}
                      >
                        Pen / pig group
                      </label>

                      <div className="relative">
                        <MapPin size={17} className={fieldIconClass} />

                        <input
                          id="vaccination-pen"
                          type="text"
                          name="pen"
                          value={form.pen}
                          onChange={updateField}
                          placeholder="e.g. Pen A or Growers"
                          maxLength={100}
                          className={`${inputClass("pen")} pl-10`}
                        />
                      </div>

                      {errors.pen && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {errors.pen}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Administrator */}
                <div>
                  <label
                    htmlFor="vaccination-administered-by"
                    className={labelClass}
                  >
                    Administered by
                  </label>

                  <div className="relative">
                    <UserRound size={17} className={fieldIconClass} />

                    <input
                      id="vaccination-administered-by"
                      type="text"
                      name="administeredBy"
                      value={form.administeredBy}
                      onChange={updateField}
                      placeholder="e.g. Farm owner or veterinarian"
                      maxLength={100}
                      className={`${inputClass("administeredBy")} pl-10`}
                    />
                  </div>

                  {errors.administeredBy && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.administeredBy}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="vaccination-notes"
                    className={labelClass}
                  >
                    Additional notes
                  </label>

                  <div className="relative">
                    <FileText
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-4 text-slate-400"
                    />

                    <textarea
                      id="vaccination-notes"
                      name="notes"
                      value={form.notes}
                      onChange={updateField}
                      placeholder="Optional: batch number, dosage, follow-up details, or observations..."
                      rows={4}
                      maxLength={1000}
                      className={`${inputClass("notes")} resize-y pl-10`}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    {errors.notes ? (
                      <p className="text-xs text-red-600">{errors.notes}</p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Optional information for future reference.
                      </p>
                    )}

                    <span className="shrink-0 text-xs text-slate-400">
                      {form.notes.length}/1000
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <p className="text-xs leading-5 text-amber-900/80">
                    Check the vaccination date and pig count before saving.
                    This record will be stored in your browser's local storage,
                    not in the Django database.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173B2F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#245642] focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                >
                  <CheckCircle2 size={17} />
                  {initialData ? "Save changes" : "Save vaccination"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VaccinationModal;