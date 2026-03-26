import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/navigation/Sidebar";
import CD_Navbar from "../components/navigation/CD_Navbar";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import { Card, CardBody } from "../../../shared/ui/Card.jsx";
import { getWasteCategories } from "../../../services/reports.service.js";
import { formatWasteTypeUnit } from "../../../shared/constants/wasteTypes.js";
import { getIconForCategory } from "../../../shared/lib/wasteIcons.js";

export default function Citizen_Terms() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

 

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
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<CD_Navbar brandTitle="" />}
      showBackgroundEffects
      footer={
        <div className="mt-10">
          <CD_Footer />
        </div>
      }
    >
      <PageHeader
        title="Review our policies"
        description="Please review the terms for using the Citizen Portal to ensure a sustainable community."
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardBody>
              <div className="text-lg font-semibold text-gray-900">Terms and Conditions</div>
              <div className="mt-2 text-gray-700 leading-7 space-y-5">
                <div>
                  <div className="font-semibold text-gray-900">1. Acceptance of Terms</div>
                  <p>
                    By accessing or using the Citizen Portal, you acknowledge that you have read, understood, and agree to be
                    bound by these Terms and Conditions and any policies referenced herein. If you do not agree, you must not
                    use the Portal.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">2. Eligible Use</div>
                  <p>
                    The Portal is provided to facilitate lawful waste reporting and community recycling. You must provide accurate,
                    complete, and non-misleading information and comply with all applicable laws and regulations.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">3. Reporting and Content Standards</div>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Do not submit offensive, illegal, defamatory, or fraudulent content.</li>
                    <li>Images must depict the reported waste clearly and truthfully.</li>
                    <li>You represent that you own or have rights to upload any images or content submitted.</li>
                    <li>Content may be reviewed and shared with authorized entities for processing and service delivery.</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">4. Location and Photographic Data</div>
                  <p>
                    Location and photographic data are processed to enable accurate pickup coordination and service improvement.
                    You should ensure that location services are enabled when submitting reports for faster and more accurate
                    processing.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">5. Reward Points</div>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Points are awarded for valid, approved reports and are based on the applicable category and quantity.</li>
                    <li>Points may be adjusted or revoked in cases of misuse, fraud, or misclassification.</li>
                    <li>Point calculation is subject to change; any revisions will apply prospectively.</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">6. Data Protection</div>
                  <p>
                    We process personal data to operate, secure, and improve the Portal. Data is handled in accordance with our
                    privacy practices. You may request account deletion as permitted by applicable policies and laws.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">7. Prohibited Conduct</div>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Submitting fabricated reports or images.</li>
                    <li>Interfering with system integrity or attempting unauthorized access.</li>
                    <li>Harassing staff, collectors, or other users.</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">8. Suspension and Termination</div>
                  <p>
                    We may suspend or terminate access for violations of these Terms, suspected abuse, or applicable legal
                    requirements. Certain obligations survive termination, including content standards and legal compliance.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">9. Changes to Terms</div>
                  <p>
                    These Terms may be updated periodically. Continued use of the Portal following an update constitutes
                    acceptance of the revised Terms.
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  This summary is provided for convenience. Refer to the full policy documents for comprehensive terms and
                  privacy practices.
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-lg font-semibold text-gray-900">Supported Waste Categories</div>
                  <p className="text-sm text-gray-600">Search and browse materials eligible for reward points.</p>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full md:w-64 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Search categories..."
                />
              </div>

              {loading ? (
                <div className="mt-6 text-sm text-gray-500">Loading categories…</div>
              ) : (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 xl:gap-8">
                  {filtered.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {(() => {
                          const { Icon, cls } = getIconForCategory(c.name);
                          return (
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${cls}`}>
                              {Icon ? <Icon className="h-6 w-6" aria-hidden="true" /> : null}
                            </div>
                          );
                        })()}
                        <div>
                          <div className="font-semibold text-gray-900">{c.name}</div>
                          <div className="text-xs text-gray-500">Unit: {formatWasteTypeUnit(c.unit)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 border border-emerald-100 text-xs font-semibold">
                          {Number.isFinite(Number(c.pointPerUnit)) ? `${c.pointPerUnit} pts` : "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && filtered.length === 0 ? (
                <div className="mt-6 text-sm text-gray-500">No categories match your search.</div>
              ) : null}
            </CardBody>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          <div className="rounded-2xl p-6 bg-emerald-600 text-white shadow-lg">
            <div className="font-semibold text-lg">Rules Summary</div>
            <ul className="mt-4 space-y-3 text-sm">
              <li>• Always upload clear photos of waste material for verification.</li>
              <li>• Points are credited within 24–48 hours after report approval.</li>
              <li>• Ensure location services are enabled for accurate pickup location.</li>
              <li>• Fraudulent reports will result in account suspension.</li>
            </ul>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}

