import { useState } from "react";
import useImagePreviews from "../../../../hooks/useImagePreviews.js";
import { Card } from "../../../../components/ui/Card.jsx";
import PillSelect from "../../../../components/ui/PillSelect.jsx";
import SelectedChips from "../../../../components/ui/SelectedChips.jsx";

const WASTE_TYPES = ["Organic", "Recyclable", "Hazardous", "Other"];

export default function CreateReportForm() {
  const { items: images, active, activeIndex, setActiveIndex, addFiles } = useImagePreviews({ max: 6 });
  const [types, setTypes] = useState([]);
  const [address, setAddress] = useState("");
  const [weight, setWeight] = useState("1 - 5 kg");
  const [notes, setNotes] = useState("");

  const handleAddPhotos = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const toggleType = (type) => {
    setTypes((prev) => (prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type]));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* LEFT COLUMN */}
      <Card as="section" className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-500 uppercase">Visual Evidence</h4>
          <span className="text-sm text-gray-500">
            {images.length} images attached
          </span>
        </div>

        <div className="aspect-[4/3] rounded-xl border border-gray-100 bg-gray-100/60 flex items-center justify-center text-gray-500 text-lg">
          {active ? (
            <img
              alt="preview"
              src={active.url}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <>Main preview</>
          )}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`aspect-square rounded-xl border ${idx === activeIndex ? "border-green-500 ring-2 ring-green-200" : "border-gray-200"} overflow-hidden bg-white`}
            >
              <img
                alt={`thumb-${idx}`}
                src={img.url}
                className="h-full w-full object-cover"
              />
            </button>
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
      </Card>

      {/* RIGHT COLUMN */}
      <Card as="section" className="p-6">
        <h4 className="text-sm font-semibold text-gray-500 uppercase">What Type of Waste?</h4>
        <div className="mt-3">
          <PillSelect options={WASTE_TYPES} selected={types} onToggle={toggleType} />
        </div>
        <SelectedChips items={types} onRemove={(t) => setTypes((prev) => prev.filter((x) => x !== t))} className="mt-4" />

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-500 uppercase">Location</h4>
          <div className="mt-2 flex items-center gap-2">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200"
              placeholder="221B Baker St, London NW1 6XE, UK"
            />
            <button type="button" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.98]">
              Get GPS
            </button>
          </div>
          <div className="mt-3 aspect-[4/3] rounded-xl border border-gray-100 bg-gray-100/60 flex items-center justify-center">
            <span className="text-gray-500">Map preview</span>
          </div>
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
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 resize-y"
            placeholder="Describe the situation or provide extra context..."
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.98]">
            Discard Draft
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-sm">
            Submit Report
          </button>
        </div>
      </Card>
    </div>
  );
}
