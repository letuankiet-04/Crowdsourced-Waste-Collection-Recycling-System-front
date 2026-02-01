import { useEffect, useRef, useState } from "react";
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

const WASTE_TYPES = ["Organic", "Recyclable", "Hazardous", "Other"];

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

export default function CreateReportForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const { user } = useStoredUser();
  const editReport = location?.state?.editReport ?? null;
  const isEdit = Boolean(editReport?.id);

  const [types, setTypes] = useState(() => (Array.isArray(editReport?.types) ? editReport.types : []));
  const [address, setAddress] = useState(() => (typeof editReport?.address === "string" ? editReport.address : ""));
  const [weight, setWeight] = useState(() => (typeof editReport?.weight === "string" ? editReport.weight : "1 - 5 kg"));
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
                <img
                  key={`${src}-${idx}`}
                  src={src}
                  alt={`Existing report photo ${idx + 1}`}
                  className="w-full h-28 object-cover rounded-xl border border-gray-100"
                  loading="lazy"
                />
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
          <select
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <option>1 - 5 kg</option>
            <option>5 - 10 kg</option>
            <option>10 - 25 kg</option>
            <option>25+ kg</option>
          </select>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-500 uppercase">Additional Details</h4>
          <DescriptionTextarea value={notes} onChange={setNotes} />
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setTypes([]);
              setAddress("");
              setWeight("1 - 5 kg");
              setNotes("");
              setCoords(null);
              setExistingImages([]);
              setImages([]);
              setImageUploaderKey((x) => x + 1);
              setGeoError("");
              notify.info("Draft cleared", "Your draft has been cleared.");
            }}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60"
          >
            Discard Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={async () => {
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
                const report = isEdit
                  ? {
                      ...editReport,
                      address: address.trim(),
                      types: [...types],
                      weight,
                      notes,
                      coords,
                      images: [...existingImages, ...imageUrls],
                      updatedAt: new Date().toISOString(),
                    }
                  : {
                      id: `RPT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
                      address: address.trim(),
                      types: [...types],
                      weight,
                      notes,
                      coords,
                      images: imageUrls,
                      createdAt: new Date().toISOString(),
                      status: "pending",
                      createdBy,
                    };

                await notify.promise(
                  new Promise((resolve) => setTimeout(resolve, 800)),
                  {
                    loadingTitle: isEdit ? "Updating report..." : "Sending report...",
                    successTitle: isEdit ? "Report updated" : "Report submitted",
                    successMessage: "Thank you for helping keep the city clean.",
                    errorTitle: "Submit failed",
                    errorMessage: (err) => err?.message || "Unable to submit your report.",
                  }
                );
                if (isEdit) {
                  updateMockReport(report);
                  publishReportUpdated(report);
                } else {
                  addMockReport(report);
                  publishReportSubmitted(report);
                }
                setTypes([]);
                setAddress("");
                setWeight("1 - 5 kg");
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
            }}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-sm disabled:opacity-60"
          >
            Submit Report
          </button>
        </div>
      </Card>
    </div>
  );
}
