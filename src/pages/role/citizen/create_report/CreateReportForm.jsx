
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useNotify from "../../../../hooks/useNotify.js";
import useStoredUser from "../../../../hooks/useStoredUser.js";
import { publishReportSubmitted, publishReportUpdated } from "../../../../events/reportEvents.js";
import { addMockReport, updateMockReport } from "../../../../mock/reportStore.js";
import MapPicker from "../../../../components/MapPicker.jsx";
import DescriptionTextarea from "../../../../components/ui/DescriptionTextarea.jsx";
import { Card } from "../../../../components/ui/Card.jsx";
import PillSelect from "../../../../components/ui/PillSelect.jsx";
import ImageUploader from "../../../../components/ui/ImageUploader.jsx";
import { PATHS } from "../../../../routes/paths.js";

const WASTE_TYPES = ["Organic", "Recyclable", "Hazardous"];

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    if (typeof FileReader === "undefined") return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function normalizeWeightInput(value) {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text) return "";
  const direct = Number(text);
  if (Number.isFinite(direct)) return String(direct);
  const match = text.match(/(\d+(\.\d+)?)/);
  return match ? match[1] : "";
}

export default function CreateReportForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const { user } = useStoredUser();
  const editReport = location?.state?.editReport ?? null;
  const isEdit = Boolean(editReport?.id);

  const [types, setTypes] = useState(() => (Array.isArray(editReport?.types) ? editReport.types : []));
  const [address, setAddress] = useState(() => (typeof editReport?.address === "string" ? editReport.address : ""));
  const [weight, setWeight] = useState(() => normalizeWeightInput(editReport?.weight));
  const [weightTouched, setWeightTouched] = useState(false);
  const [notes, setNotes] = useState(() => (typeof editReport?.notes === "string" ? editReport.notes : ""));
  const [coords, setCoords] = useState(() => (editReport?.coords ?? null));
  const [existingImages, setExistingImages] = useState(() => (Array.isArray(editReport?.images) ? editReport.images : []));
  const [images, setImages] = useState([]);
  const [imageUploaderKey, setImageUploaderKey] = useState(0);
  const [addrLoading, setAddrLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sourceRef = useRef(null);

  const handleDiscard = () => {
    setTypes([]);
    setAddress("");
    setWeight("");
    setWeightTouched(false);
    setNotes("");
    setCoords(null);
    setAddrLoading(false);
    setGpsLoading(false);
    setGeoError("");
    setImages([]);
    sourceRef.current = null;
    navigate(isEdit && editReport?.id ? `${PATHS.citizen.reports}/${editReport.id}` : PATHS.citizen.dashboard);
  };

  const weightError = useMemo(() => {
    const trimmed = String(weight ?? "").trim();
    if (!trimmed) return "Please enter the estimated weight.";
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return "Weight must be a valid number.";
    if (n <= 0) return "Weight must be greater than 0 kg.";
    if (n >= 10) return "Weight must be less than 10 kg.";
    return "";
  }, [weight]);

  const canSubmit = useMemo(() => {
    const hasTypes = types.length > 0;
    const hasImages = images.length > 0 || existingImages.length > 0;
    const hasLocation = coords != null && address.trim().length >= 3 && !geoError;
    const hasValidWeight = !weightError;
    return hasTypes && hasImages && hasLocation && hasValidWeight;
  }, [types, images, existingImages, coords, address, geoError, weightError]);

  const handleClearDraft = () => {
    setTypes([]);
    setAddress("");
    setWeight("");
    setWeightTouched(false);
    setNotes("");
    setCoords(null);
    setExistingImages([]);
    setImages([]);
    setImageUploaderKey((x) => x + 1);
    setGeoError("");
    notify.info("Draft cleared", "Your draft has been cleared.");
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!images.length && !existingImages.length) {
      notify.error("Missing photo", "Please add at least one photo.");
      return;
    }
    if (!types.length) {
      notify.error("Missing waste type", "Please select at least one waste type.");
      return;
    }
    if (!coords) {
      notify.error("Missing location", "Please choose a location using GPS, map, or address.");
      return;
    }
    if (weightError) {
      notify.error("Invalid weight", weightError);
      return;
    }
    if (geoError) {
      notify.warning("Fix location error", geoError);
      return;
    }
    if (isEdit && editReport && editReport.status && editReport.status !== "pending") {
      notify.error("Cannot update", "Only pending reports can be updated.");
      return;
    }

    setSubmitting(true);
    try {
      const createdBy = user?.email ?? null;
      if (!createdBy) {
        notify.error("Not logged in", "Please log in again and retry submitting your report.");
        return;
      }

      const imageUrls = (await Promise.all(images.map(fileToDataUrl))).filter(Boolean);
      const weightValue = String(Number(String(weight).trim()));
      const report = isEdit
        ? {
          ...editReport,
          address: address.trim(),
          types: [...types],
          weight: weightValue,
          notes,
          coords,
          images: [...existingImages, ...imageUrls],
          updatedAt: new Date().toISOString(),
        }
        : {
          id: `RPT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          address: address.trim(),
          types: [...types],
          weight: weightValue,
          notes,
          coords,
          images: imageUrls,
          createdAt: new Date().toISOString(),
          status: "pending",
          createdBy,
        };

      await notify.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
        loadingTitle: isEdit ? "Updating report..." : "Sending report...",
        successTitle: isEdit ? "Report updated" : "Report submitted",
        successMessage: "Thank you for helping keep the city clean.",
        errorTitle: "Submit failed",
        errorMessage: (err) => err?.message || "Unable to submit your report.",
      });

      if (isEdit) {
        updateMockReport(report);
        publishReportUpdated(report);
      } else {
        addMockReport(report);
        publishReportSubmitted(report);
      }

      setTypes([]);
      setAddress("");
      setWeight("");
      setWeightTouched(false);
      setNotes("");
      setCoords(null);
      setExistingImages([]);
      setImages([]);
      setImageUploaderKey((x) => x + 1);
      setGeoError("");
      navigate(isEdit ? `${PATHS.citizen.reports}/${report.id}` : PATHS.citizen.dashboard);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (sourceRef.current !== "address") return;
    if (!address || address.trim().length < 3) return;
    setAddrLoading(true);
    setGeoError("");
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}`);
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data) && data.length) {
            const first = data[0];
            setCoords({ lat: parseFloat(first.lat), lng: parseFloat(first.lon) });
          } else {
            setGeoError("Address not found");
          }
        } else {
          setGeoError("Address lookup failed");
        }
      } catch {
        setGeoError("Network error during address lookup");
      } finally {
        setAddrLoading(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [address]);

  const toggleType = (type) => {
    setTypes((prev) => (prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type]));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN */}

      <Card as="section" className="p-6">
        <ImageUploader
          key={imageUploaderKey}
          title="Visual Evidence"
          max={6}
          multiple
          addLabel="+ Add Photo"
          onFilesChange={setImages}
        />


        {existingImages.length ? (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">Existing Photos</h4>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingImages.map((src, idx) => (
                <div key={`${src}-${idx}`} className="relative group">
                  <img
                    src={src}
                    alt={`Existing report photo ${idx + 1}`}
                    className="w-full h-28 object-cover rounded-xl border border-gray-100"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/90 text-gray-700 border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove image"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

          </div>
        ) : null}

        <div className="mt-4 rounded-xl bg-green-50 text-green-800 border border-green-100 p-4 text-sm">
          Photos help authorities identify the waste type and equipment needed
          for collection more quickly.
        </div>
      </Card>

      {/* RIGHT COLUMN */}
      <Card as="section" className="p-6">
        <h4 className="text-sm font-semibold text-gray-500 uppercase">What Type of Waste?</h4>
        <div className="mt-3">
          <PillSelect options={WASTE_TYPES} selected={types} onToggle={toggleType} />
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-500 uppercase">Location</h4>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={address}
              onChange={(e) => {
                sourceRef.current = "address";
                setAddress(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="221B Baker St, London NW1 6XE, UK"
            />
            <button
              type="button"
              disabled={gpsLoading}
              onClick={async () => {
                setGeoError("");
                setGpsLoading(true);
                sourceRef.current = "gps";
                try {
                  const pos = await new Promise((resolve, reject) =>
                    navigator.geolocation
                      ? navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
                      : reject(new Error("Geolocation not supported"))
                  );
                  const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                  setCoords(next);
                  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${next.lat}&lon=${next.lng}`);
                  if (r.ok) {
                    const data = await r.json();
                    sourceRef.current = "system";
                    setAddress(data.display_name || "");
                  }
                } catch {
                  setGeoError("Unable to get current location");
                } finally {
                  setGpsLoading(false);
                }
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition border ${gpsLoading ? "border-gray-200 text-gray-400" : "border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.98]"}`}
            >
              {gpsLoading ? "Locating..." : "Use current location"}
            </button>
          </div>
          {addrLoading && <div className="mt-2 text-sm text-gray-500">Finding location...</div>}
          {geoError && <div className="mt-2 text-sm text-red-600">{geoError}</div>}
          <div className="mt-3">
            <MapPicker
              value={coords}
              onChange={async (c) => {
                setGeoError("");
                sourceRef.current = "map";
                setCoords(c);
                try {
                  const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${c.lat}&lon=${c.lng}`);
                  if (r.ok) {
                    const data = await r.json();
                    sourceRef.current = "system";
                    setAddress(data.display_name || "");
                  }
                } catch {
                  setGeoError("Unable to resolve address for the selected location");
                }
              }}
            />
          </div>
          {coords && (
            <div className="mt-2 text-sm text-gray-600">
              Coordinates saved: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </div>
          )}
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-500 uppercase">Estimate Weight</h4>
          <input
            type="number"
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value);
              setWeightTouched(true);
            }}
            onBlur={() => setWeightTouched(true)}
            min="0"
            max="9.99"
            step="0.1"
            placeholder="kg"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200"
          />
          {weightTouched && weightError ? (
            <div className="mt-2 text-sm text-red-600">{weightError}</div>
          ) : (
            <div className="mt-2 text-sm text-gray-500">Required. Must be less than 10 kg.</div>
          )}
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-500 uppercase">Additional Details</h4>
          <DescriptionTextarea value={notes} onChange={setNotes} />
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            disabled={submitting}
            onClick={handleDiscard}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleClearDraft}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60"
          >
            Clear Draft
          </button>

          <button
            type="button"
            disabled={submitting || !canSubmit}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-sm disabled:opacity-60"
          >
            {isEdit ? "Update Report" : "Submit Report"}
          </button>
        </div>
      </Card>
    </div>
  );
}
