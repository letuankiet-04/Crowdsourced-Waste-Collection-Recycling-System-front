import { useEffect, useRef, useState } from "react";
import MapPicker from "../../../../components/MapPicker.jsx";
import DescriptionTextarea from "../../../../components/ui/DescriptionTextarea.jsx";

export default function CreateReportForm() {
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [types, setTypes] = useState([]);
  const [address, setAddress] = useState("");
  const [weight, setWeight] = useState("1 - 5 kg");
  const [notes, setNotes] = useState("");
  const [coords, setCoords] = useState(null);
  const [addrLoading, setAddrLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
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

  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    setImages((prev) => [...prev, ...previews].slice(0, 6));
    if (activeIndex === -1 && previews.length > 0) setActiveIndex(0);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      const nextLen = next.length;
      setActiveIndex((prevActive) => {
        if (nextLen <= 0) return -1;
        if (index < prevActive) return prevActive - 1;
        if (index === prevActive) return Math.min(prevActive, nextLen - 1);
        return prevActive;
      });
      return next;
    });
  };

  const PILLS = ["Organic", "Recyclable", "Hazardous", "Other"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-500 uppercase">Visual Evidence</h4>
          <span className="text-sm text-gray-500">
            {images.length} images attached
          </span>
        </div>

        <div className="aspect-[4/3] rounded-xl border border-gray-100 bg-gray-100/60 flex items-center justify-center text-gray-500 text-lg">
          {images.length ? (
            <img
              alt="preview"
              src={images[activeIndex]?.url}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <>Main preview</>
          )}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <button
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`aspect-square rounded-xl border ${idx === activeIndex ? "border-green-500 ring-2 ring-green-200" : "border-gray-200"} overflow-hidden bg-white transition hover:scale-[1.02] active:scale-[0.98]`}
              >
                <img
                  alt={`thumb-${idx}`}
                  src={img.url}
                  className="h-full w-full object-cover"
                />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(idx);
                }}
                className="absolute top-1.5 right-1.5 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/90 text-gray-700 border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Remove image"
                title="Remove image"
              >
                ×
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAddPhotos}
            />
            + Add Photo
          </label>
        </div>

        <div className="mt-4 rounded-xl bg-green-50 text-green-800 border border-green-100 p-4 text-sm">
          Photos help authorities identify the waste type and equipment needed
          for collection more quickly.
        </div>
      </section>

      {/* RIGHT COLUMN */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg">
        <h4 className="text-sm font-semibold text-gray-500 uppercase">What Type of Waste?</h4>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {PILLS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={types.includes(p)}
              className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 border transition ${
                types.includes(p)
                  ? "bg-green-50 text-green-700 border-green-200 ring-2 ring-green-200"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() =>
                setTypes((prev) =>
                  prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
                )
              }
            >
              <span className="inline-block">{p}</span>
              {types.includes(p) && (
                <span className="ml-auto inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
        {types.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {types.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 text-sm"
              >
                {t}
                <button
                  type="button"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/70 text-green-700 hover:bg-white"
                  onClick={() =>
                    setTypes((prev) => prev.filter((x) => x !== t))
                  }
                  aria-label={`Remove ${t}`}
                  title={`Remove ${t}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

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
          <button type="button" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.98]">
            Discard Draft
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-sm">
            Submit Report
          </button>
        </div>
      </section>
    </div>
  );
}
