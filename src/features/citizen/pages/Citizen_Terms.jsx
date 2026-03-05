import { useEffect, useMemo, useState } from "react";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import { getWasteCategories } from "../../../services/reports.service.js";
import {
  Info,
  CheckCircle2,
  HelpCircle,
  Search as SearchIcon,
  FileText,
  Newspaper,
  Leaf,
  Battery,
  Cpu,
  Magnet,
  Recycle,
  FlaskConical,
  Wine,
  Package,
} from "lucide-react";

export default function CitizenTerms() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getWasteCategories()
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        setCategories(
          list.map((c) => ({
            id: Number(c.id),
            name: String(c.name ?? "").trim(),
            unit: c.unit ?? null,
            pointPerUnit: c.pointPerUnit ?? null,
          }))
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Unable to load waste categories.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    const list = Array.isArray(categories) ? categories : [];
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  const listToShow = showAll ? filtered : filtered.slice(0, 8);

  const getIconForCategory = (rawName) => {
    const name = String(rawName || "").toLowerCase();
    if (name.includes("paper") || name.includes("giấy")) return { Icon: FileText, cls: "bg-blue-50 text-blue-700 border-blue-100" };
    if (name.includes("newspaper") || name.includes("báo")) return { Icon: Newspaper, cls: "bg-sky-50 text-sky-700 border-sky-100" };
    if (name.includes("organic") || name.includes("hữu cơ")) return { Icon: Leaf, cls: "bg-green-50 text-green-700 border-green-100" };
    if (name.includes("battery") || name.includes("pin")) return { Icon: Battery, cls: "bg-yellow-50 text-yellow-700 border-yellow-100" };
    if (name.includes("e-waste") || name.includes("electronics") || name.includes("điện tử")) return { Icon: Cpu, cls: "bg-purple-50 text-purple-700 border-purple-100" };
    if (name.includes("iron") || name.includes("steel") || name.includes("sắt") || name.includes("copper") || name.includes("đồng") || name.includes("aluminum") || name.includes("nhôm") || name.includes("metal")) {
      return { Icon: Magnet, cls: "bg-orange-50 text-orange-700 border-orange-100" };
    }
    if (name.includes("glass") || name.includes("thủy tinh")) return { Icon: Wine, cls: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    if (name.includes("hazard") || name.includes("nguy hại") || name.includes("chemical")) return { Icon: FlaskConical, cls: "bg-red-50 text-red-700 border-red-100" };
    if (name.includes("plastic") || name.includes("nhựa") || name.includes("can") || name.includes("lon")) return { Icon: Package, cls: "bg-cyan-50 text-cyan-700 border-cyan-100" };
    return { Icon: Recycle, cls: "bg-gray-50 text-gray-700 border-gray-100" };
  };

  return (
    <RoleLayout sidebar={<Sidebar />} navbar={<Navbar />} showBackgroundEffects footer={<CD_Footer />}>
      <div className="space-y-8">
        <PageHeader title="Terms & Conditions" description="Please review the terms for using the Citizen Portal." />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card as="section">
              <CardBody className="flex items-start gap-4">
                <div className="shrink-0">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700 border border-green-100">
                    <Info className="h-6 w-6" />
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-lg font-bold text-gray-900">Review our policies</div>
                    <div className="text-gray-600">
                      Please review the terms for using the Citizen Portal to ensure a sustainable community.
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-500 tracking-wide">USAGE TERMS</div>
                  <div className="text-gray-700 leading-7">
                    <p>
                      By using this portal, you agree to provide accurate information when submitting waste reports. Do not
                      upload offensive, illegal, or misleading content. Reports may be reviewed and shared with authorized
                      parties for processing.
                    </p>
                    <p className="mt-3">
                      Location and photos you provide help facilitate collection. You are responsible for ensuring you have
                      the right to upload any images and that they comply with the file policies.
                    </p>
                    <p className="mt-3">
                      Reward points are granted based on valid reports and may be adjusted for misuse or incorrect
                      classification. The system may update these terms at any time.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card as="section">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Supported Waste Categories</CardTitle>
                <div className="relative w-full max-w-xs">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </CardHeader>
              <CardBody>
                {loading ? <div className="text-sm text-gray-500">Loading categories…</div> : null}
                {error ? <div className="text-sm text-red-600">{error}</div> : null}
                {!loading && !error ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listToShow.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const { Icon, cls } = getIconForCategory(c.name);
                              return (
                                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${cls}`}>
                                  <Icon className="h-5 w-5" />
                                </span>
                              );
                            })()}
                            <div>
                              <div className="font-medium text-gray-900">{c.name}</div>
                            </div>
                          </div>
                          <div className="ml-4">
                            {(() => {
                              const hasPts = c.pointPerUnit != null;
                              const hasUnit = Boolean(c.unit);
                              if (!hasPts && !hasUnit) return null;
                              const unitText = hasUnit ? String(c.unit).toUpperCase() : "UNIT";
                              const ptsText = hasPts ? `${c.pointPerUnit} pts/${unitText}` : `0 pts/${unitText}`;
                              return (
                                <span className="inline-flex items-center rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 whitespace-nowrap">
                                  {ptsText}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!showAll && filtered.length > 8 ? (
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setShowAll(true)}
                          className="text-green-600 font-bold hover:underline"
                        >
                          View All {filtered.length} Categories
                        </button>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </CardBody>
            </Card>
          </div>

          <div className="space-y-8">
            <Card as="section" className="bg-gradient-to-b from-green-600 to-green-500 text-white border-0">
              <CardBody>
                <div className="text-lg font-bold mb-4">Rules Summary</div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 mt-0.5" />
                    <span>Always upload clear photos of waste material for verification.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 mt-0.5" />
                    <span>Points are credited within 24–48 hours after report approval.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 mt-0.5" />
                    <span>Ensure location accuracy to enable precise pickup.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 mt-0.5" />
                    <span>Fraudulent reports may result in account suspension.</span>
                  </li>
                </ul>
              </CardBody>
            </Card>

            <Card as="section">
              <CardBody>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-700 border border-gray-100">
                    <HelpCircle className="h-5 w-5" />
                  </span>
                  <div className="space-y-2">
                    <div className="font-bold text-gray-900">Need Help?</div>
                    <div className="text-sm text-gray-600">
                      If you have questions about specific categories or terms, our support team is ready to assist.
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition"
                      >
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
