
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useNotify from "../../../../shared/hooks/useNotify.js";
import { createReport, updateReport } from "../../../../services/reports.service.js";
import MapPicker from "../../../../shared/components/maps/GoongMapPicker.jsx";
import DescriptionTextarea from "../../../../shared/ui/DescriptionTextarea.jsx";
import { Card } from "../../../../shared/ui/Card.jsx";
import ImageUploader from "../../../../shared/ui/ImageUploader.jsx";
import { PATHS } from "../../../../app/routes/paths.js";
import { getWasteCategories } from "../../../../services/reports.service.js";
import WasteItemsTable from "../../../../shared/ui/WasteItemsTable.jsx";
import { formatWasteTypeUnit } from "../../../../shared/constants/wasteTypes.js";

function normalizeWeightInput(value) {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text) return "";
  const direct = Number(text);
  if (Number.isFinite(direct)) return String(direct);
  const match = text.match(/(\d+(\.\d+)?)/);
  return match ? match[1] : "";
}

function normalizeWasteItemsInput(rawItems, categoryOptions) {
  const options = Array.isArray(categoryOptions) ? categoryOptions : [];
  const byId = new Map(options.map((t) => [Number(t.id), t]));
  const byName = new Map(options.map((t) => [String(t.name ?? "").trim().toLowerCase(), t]));

  const input = Array.isArray(rawItems) ? rawItems : [];
  const normalized = input.map((item) => {
    const candidateId = item?.wasteTypeId ?? item?.id ?? null;
    const id = candidateId === null || candidateId === undefined || candidateId === "" ? null : Number(candidateId);
    const name = String(item?.name ?? "").trim();
    const found =
      (Number.isFinite(id) ? byId.get(id) : null) ??
      (name ? byName.get(name.toLowerCase()) : null) ??
      null;

    return {
      wasteTypeId: found ? Number(found.id) : Number.isFinite(id) ? id : null,
      estimatedWeight: normalizeWeightInput(item?.estimatedWeight ?? item?.weight ?? ""),
    };
  });

  return normalized.filter((i) => i.wasteTypeId != null || String(i.estimatedWeight ?? "").trim());
}

export default function CreateReportForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const editReport = location?.state?.editReport ?? null;
  const isEdit = Boolean(editReport?.id);

  const [wasteItems, setWasteItems] = useState([]);
  const [wasteItemsTouched, setWasteItemsTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [address, setAddress] = useState(() => (typeof editReport?.address === "string" ? editReport.address : ""));
  const [notes, setNotes] = useState(() => (typeof editReport?.notes === "string" ? editReport.notes : ""));
  const [coords, setCoords] = useState(() => (editReport?.coords ?? null));
  const [existingImages, setExistingImages] = useState(() => (Array.isArray(editReport?.images) ? editReport.images : []));
  const [images, setImages] = useState([]);
  const [imageUploaderKey, setImageUploaderKey] = useState(0);
  const [addrLoading, setAddrLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(false)

  const sourceRef = useRef(null);

  useEffect(() => {
    let cancelled = false
    setCategoryLoading(true)
    getWasteCategories()
      .then((rows) => {
        if (cancelled) return
        const list = Array.isArray(rows) ? rows : []
        setCategoryOptions(
          list.map((c) => ({
            id: Number(c.id),
            name: String(c.name ?? '').trim(),
            unit: c.unit ?? null,
            pointPerUnit: c.pointPerUnit ?? null,
          }))
        )
      })
      .catch((err) => notify.error('Load categories failed', err?.message || 'Unable to load waste categories.'))
      .finally(() => {
        if (cancelled) return
        setCategoryLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [notify])

  useEffect(() => {
    if (!isEdit || !editReport) return
    if (!Array.isArray(categoryOptions) || categoryOptions.length === 0) return
    const normalizedFromItems = normalizeWasteItemsInput(editReport?.wasteItems, categoryOptions)
    if (normalizedFromItems.length) {
      setWasteItems(normalizedFromItems)
      return
    }
    const legacyWeight = normalizeWeightInput(editReport?.weight)
    if (!legacyWeight) return
    setWasteItems([{ wasteTypeId: null, estimatedWeight: legacyWeight }])
  }, [isEdit, editReport, categoryOptions])

  const handleWasteItemsChange = (next) => {
    setWasteItems(next);
    if (!wasteItemsTouched) setWasteItemsTouched(true);
  };

  const pointsBreakdown = useMemo(() => {
    const types = Array.isArray(categoryOptions) ? categoryOptions : [];
    const byId = new Map(types.map((t) => [Number(t.id), t]));
    const list = (Array.isArray(wasteItems) ? wasteItems : []).map((item) => {
      const id = item?.wasteTypeId === "" || item?.wasteTypeId === null || item?.wasteTypeId === undefined ? NaN : Number(item.wasteTypeId);
      const found = Number.isFinite(id) ? byId.get(id) : null;
      const rawQty = String(item?.estimatedWeight ?? "").trim();
      const qty = rawQty ? Number(rawQty) : NaN;
      const ppu = found ? Number(found.pointPerUnit) : NaN;
      if (!found || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(ppu)) return null;
      return {
        id: Number(found.id),
        name: String(found.name),
        unit: found.unit ?? null,
        qty,
        points: ppu * qty,
      };
    });
    return list.filter(Boolean);
  }, [wasteItems, categoryOptions]);

  const totalEstimatedPoints = useMemo(() => {
    return (Array.isArray(pointsBreakdown) ? pointsBreakdown : []).reduce((acc, r) => acc + (Number.isFinite(r?.points) ? r.points : 0), 0);
  }, [pointsBreakdown]);

  const formatPoints = (n) => {
    if (!Number.isFinite(n)) return "0";
    const rounded = Math.round(n);
    if (Math.abs(n - rounded) < 1e-9) return String(rounded);
    return n.toFixed(2);
  };

  const handleDiscard = () => {
    setWasteItems([]);
    setWasteItemsTouched(false);
    setSubmitAttempted(false);
    setAddress("");
    setNotes("");
    setCoords(null);
    setAddrLoading(false);
    setGpsLoading(false);
    setGeoError("");
    setImages([]);
    sourceRef.current = null;
    navigate(isEdit && editReport?.id ? `${PATHS.citizen.reports}/${editReport.id}` : PATHS.citizen.dashboard);
  };

  const totalEstimatedWeight = useMemo(() => {
    const sum = (Array.isArray(wasteItems) ? wasteItems : []).reduce((acc, item) => {
      const id = item?.wasteTypeId;
      if (id === null || id === undefined || id === "") return acc;
      const raw = String(item?.estimatedWeight ?? "").trim();
      if (!raw) return acc;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) return acc;
      return acc + n;
    }, 0);

    return sum;
  }, [wasteItems]);

  const weightError = useMemo(() => {
    if (totalEstimatedWeight >= 10) return "Weight must be less than 10 kg.";
    return "";
  }, [totalEstimatedWeight]);

  const wasteItemsError = useMemo(() => {
    const list = Array.isArray(wasteItems) ? wasteItems : [];
    if (!list.length) return "Please add at least one waste item.";

    const seen = new Set();
    for (let i = 0; i < list.length; i += 1) {
      const item = list[i] || {};
      const typeId = item.wasteTypeId === "" || item.wasteTypeId === null || item.wasteTypeId === undefined ? null : Number(item.wasteTypeId);
      if (typeId == null || !Number.isFinite(typeId)) return `Please select a waste type for row ${i + 1}.`;
      if (seen.has(typeId)) return "Please do not select the same waste type twice.";
      seen.add(typeId);

      const rawWeight = String(item.estimatedWeight ?? "").trim();
      const n = rawWeight ? Number(rawWeight) : NaN;
      if (!Number.isFinite(n) || n <= 0) return `Please enter a valid estimated weight for row ${i + 1}.`;
    }

    return "";
  }, [wasteItems]);

  const showWasteErrors = submitAttempted || wasteItemsTouched;

  const canSubmit = useMemo(() => {
    const hasItems = !wasteItemsError;
    const hasImages = images.length > 0 || existingImages.length > 0;
    const hasLocation = coords != null && address.trim().length >= 3 && !geoError;
    const hasValidWeight = !weightError;
    const hasCategories = !categoryLoading && categoryOptions.length > 0;
    return hasItems && hasImages && hasLocation && hasValidWeight && hasCategories;
  }, [wasteItemsError, images, existingImages, coords, address, geoError, weightError, categoryLoading, categoryOptions]);

  const handleClearDraft = () => {
    setWasteItems([]);
    setWasteItemsTouched(false);
    setSubmitAttempted(false);
    setAddress("");
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
    if (!submitAttempted) setSubmitAttempted(true);
    if (!wasteItemsTouched) setWasteItemsTouched(true);
    if (!images.length && !existingImages.length) {
      notify.error("Missing photo", "Please add at least one photo.");
      return;
    }
    if (wasteItemsError) {
      notify.error("Waste items", wasteItemsError);
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
    if (isEdit && editReport && editReport.status && String(editReport.status).trim().toLowerCase() !== "pending") {
      notify.error("Cannot update", "Only pending reports can be updated.");
      return;
    }

    setSubmitting(true);
    try {
      const byId = new Map((Array.isArray(categoryOptions) ? categoryOptions : []).map((t) => [Number(t.id), t]));
      const cleanedItems = (Array.isArray(wasteItems) ? wasteItems : [])
        .map((item) => {
          const typeId = item?.wasteTypeId === "" || item?.wasteTypeId === null || item?.wasteTypeId === undefined ? NaN : Number(item.wasteTypeId);
          const found = Number.isFinite(typeId) ? byId.get(typeId) : null;
          const raw = String(item?.estimatedWeight ?? "").trim();
          const w = raw ? Number(raw) : NaN;
          return found && Number.isFinite(w) ? { wasteTypeId: Number(found.id), name: String(found.name), unit: found.unit ?? null, estimatedWeight: w } : null;
        })
        .filter(Boolean);
      const payload = {
        images: images.length ? images : undefined,
        latude: coords?.lat,
        longitude: coords?.lng,
        address: address.trim(),
        description: String(notes ?? "").trim(),
        categoryIds: cleanedItems.map((i) => String(i.wasteTypeId)),
        quantities: cleanedItems.map((i) => String(i.estimatedWeight)),
      };

      const saved = await notify.promise(isEdit ? updateReport(editReport.id, payload) : createReport(payload), {
        loadingTitle: isEdit ? "Updating report..." : "Sending report...",
        loadingMessage: "Submitting your report to the server.",
        successTitle: isEdit ? "Report updated" : "Report submitted",
        successMessage: "Thank you for helping keep the city clean.",
        errorTitle: "Submit failed",
        errorMessage: (err) => err?.message || "Unable to submit your report.",
      });

      setWasteItems([]);
      setWasteItemsTouched(false);
      setSubmitAttempted(false);
      setAddress("");
      setNotes("");
      setCoords(null);
      setExistingImages([]);
      setImages([]);
      setImageUploaderKey((x) => x + 1);
      setGeoError("");
      navigate(`${PATHS.citizen.reports}/${saved?.id ?? editReport?.id ?? ""}`);
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
        <WasteItemsTable items={wasteItems} wasteTypes={categoryOptions} onChange={handleWasteItemsChange} />
        {categoryLoading ? <div className="mt-2 text-sm text-gray-500">Loading waste categories...</div> : null}
        {showWasteErrors && wasteItemsError ? <div className="mt-2 text-sm text-red-600">{wasteItemsError}</div> : null}
        {showWasteErrors && !wasteItemsError && weightError ? <div className="mt-3 text-sm text-red-600">{weightError}</div> : null}

        {pointsBreakdown.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span>🎁</span>
              </div>
              <div className="font-semibold text-emerald-800">Estimated Reward</div>
            </div>
            <div className="mt-4 space-y-2">
              {pointsBreakdown.map((r) => {
                const unitLabel = r.unit ? formatWasteTypeUnit(r.unit) : "";
                return (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <div className="text-gray-700">
                      {r.name} ({r.qty} {unitLabel})
                    </div>
                    <div className="font-semibold text-emerald-700">+{formatPoints(r.points)} pts</div>
                  </div>
                );
              })}
            </div>
            <div className="my-4 border-t border-emerald-100" />
            <div className="flex items-end justify-between">
              <div className="text-xs font-semibold tracking-wider text-gray-500">TOTAL</div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-emerald-600">{formatPoints(totalEstimatedPoints)}</div>
                <div className="text-emerald-700 font-semibold">pts</div>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-white/80 text-emerald-800 border border-emerald-100 p-3 text-xs">
              Points are officially credited after staff verification.
            </div>
          </div>
        ) : null}

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
