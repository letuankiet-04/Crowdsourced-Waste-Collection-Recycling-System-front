import { useState } from "react";
import { Car, Eye, EyeOff, Lock, Mail, Phone, Truck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import EnterpriseLayout from "../layouts/EnterpriseLayout.jsx";
import PageHeader from "../../../shared/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../shared/ui/Card.jsx";
import TextField from "../../../shared/ui/TextField.jsx";
import LoadingButton from "../../../shared/ui/LoadingButton.jsx";
import Button from "../../../shared/ui/Button.jsx";
import useNotify from "../../../shared/hooks/useNotify.js";
import usePasswordVisibility from "../../../shared/hooks/usePasswordVisibility.js";
import { PATHS } from "../../../app/routes/paths.js";
import { createCollector } from "../../../services/enterprise.service.js";

export default function EnterpriseAdminPanel() {
  const notify = useNotify();
  const passwordVisibility = usePasswordVisibility(false);
  const confirmVisibility = usePasswordVisibility(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [successHint, setSuccessHint] = useState("");
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    vehicleType: "",
    vehiclePlate: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(field) {
    return (e) => {
      const next = e.target.value;
      setValues((prev) => ({ ...prev, [field]: next }));
      if (error) setError("");
      if (successHint) setSuccessHint("");
    };
  }

  function handleReset() {
    if (pending) return;
    setValues({
      fullName: "",
      email: "",
      phone: "",
      vehicleType: "",
      vehiclePlate: "",
      password: "",
      confirmPassword: "",
    });
    passwordVisibility.setVisible(false);
    confirmVisibility.setVisible(false);
    setError("");
    setSuccessHint("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (pending) return;

    const fullName = values.fullName.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const vehicleType = values.vehicleType.trim();
    const vehiclePlate = values.vehiclePlate.trim();
    const password = values.password;
    const confirmPassword = values.confirmPassword;

    if (!fullName || !email || !phone || !vehicleType || !vehiclePlate || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      await notify.promise(
        createCollector({
          email,
          password,
          fullName,
          phone,
          vehicleType,
          vehiclePlate,
        }),
        {
        loadingTitle: "Creating collector...",
        loadingMessage: "Sending account details to the server.",
        successTitle: "Collector created",
        successMessage: `${email} can now log in as a collector.`,
        errorTitle: "Create failed",
        errorMessage: (err) => err?.message || "Unable to create collector. Please try again.",
        }
      );
      setValues({
        fullName: "",
        email: "",
        phone: "",
        vehicleType: "",
        vehiclePlate: "",
        password: "",
        confirmPassword: "",
      });
      passwordVisibility.setVisible(false);
      confirmVisibility.setVisible(false);
      setError("");
      setSuccessHint("Collector account created successfully. You can create another one now.");
    } catch (err) {
      setError(err?.message || "Unable to create collector. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <EnterpriseLayout>
      <div className="space-y-8">
        <PageHeader
          title="Admin Panel"
          description="Create and manage collector accounts for your enterprise."
          right={
            <Button as={Link} to={PATHS.enterprise.activeCollector} variant="outline" size="sm" className="rounded-full">
              View active collectors →
            </Button>
          }
        />

        <Card>
          <CardHeader className="py-6 px-8">
            <CardTitle className="text-2xl">Create Collector Account</CardTitle>
          </CardHeader>
          <CardBody className="p-8">
            <form className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="grid gap-6">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <UserRound className="h-4 w-4 text-slate-700" aria-hidden="true" />
                      Identity & Contact
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <TextField
                        id="collector_full_name"
                        label="Full name"
                        autoComplete="name"
                        value={values.fullName}
                        onChange={handleChange("fullName")}
                        placeholder="Collector full name"
                        disabled={pending}
                        leftIcon={UserRound}
                        accent="emerald"
                        className="sm:col-span-2"
                      />
                      <TextField
                        id="collector_email"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={values.email}
                        onChange={handleChange("email")}
                        placeholder="collector@example.com"
                        disabled={pending}
                        leftIcon={Mail}
                        accent="emerald"
                        className="sm:col-span-2"
                      />
                      <TextField
                        id="collector_phone"
                        label="Phone"
                        autoComplete="tel"
                        value={values.phone}
                        onChange={handleChange("phone")}
                        placeholder="09xxxxxxxx"
                        disabled={pending}
                        leftIcon={Phone}
                        accent="emerald"
                        inputClassName="tracking-wide"
                        className="sm:col-span-2"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Truck className="h-4 w-4 text-slate-700" aria-hidden="true" />
                      Vehicle
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <TextField
                        id="collector_vehicle_type"
                        label="Vehicle type"
                        autoComplete="off"
                        value={values.vehicleType}
                        onChange={handleChange("vehicleType")}
                        placeholder="Truck / Van / Car"
                        disabled={pending}
                        leftIcon={Truck}
                        accent="emerald"
                      />
                      <TextField
                        id="collector_vehicle_plate"
                        label="Vehicle plate"
                        autoComplete="off"
                        value={values.vehiclePlate}
                        onChange={handleChange("vehiclePlate")}
                        placeholder="66K3-123.45"
                        disabled={pending}
                        leftIcon={Car}
                        accent="emerald"
                        inputClassName="uppercase tracking-widest"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Lock className="h-4 w-4 text-slate-700" aria-hidden="true" />
                      Credentials
                    </div>
                    <div className="mt-2 text-sm text-slate-600">Minimum password length: 6 characters.</div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <TextField
                        id="collector_password"
                        label="Password"
                        type={passwordVisibility.visible ? "text" : "password"}
                        autoComplete="new-password"
                        value={values.password}
                        onChange={handleChange("password")}
                        placeholder="At least 6 characters"
                        disabled={pending}
                        leftIcon={Lock}
                        accent="emerald"
                        rightSlot={
                          <button
                            type="button"
                            onClick={passwordVisibility.toggle}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200"
                            aria-label={passwordVisibility.visible ? "Hide password" : "Show password"}
                            disabled={pending}
                          >
                            {passwordVisibility.visible ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        }
                      />
                      <TextField
                        id="collector_confirm_password"
                        label="Confirm password"
                        type={confirmVisibility.visible ? "text" : "password"}
                        autoComplete="new-password"
                        value={values.confirmPassword}
                        onChange={handleChange("confirmPassword")}
                        placeholder="Re-enter the password"
                        disabled={pending}
                        leftIcon={Lock}
                        accent="emerald"
                        rightSlot={
                          <button
                            type="button"
                            onClick={confirmVisibility.toggle}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200"
                            aria-label={confirmVisibility.visible ? "Hide password" : "Show password"}
                            disabled={pending}
                          >
                            {confirmVisibility.visible ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        }
                      />
                    </div>
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
                      <div className="font-semibold">Please fix the following</div>
                      <div className="mt-1 text-rose-800">{error}</div>
                    </div>
                  ) : null}

                  {successHint ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-950">
                      <div className="font-semibold">Done</div>
                      <div className="mt-1 text-emerald-900/80">{successHint}</div>
                    </div>
                  ) : null}

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl sm:w-auto"
                      onClick={handleReset}
                      disabled={pending}
                    >
                      Reset
                    </Button>
                    <LoadingButton type="submit" loading={pending} accent="emerald" className="sm:w-auto">
                      Create collector
                    </LoadingButton>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:self-start">
                  <div className="text-sm font-semibold text-slate-900">Summary</div>
                  <div className="mt-2 text-sm text-slate-600">
                    This will create a collector login with the provided email and password.
                  </div>
                  <div className="mt-5 grid gap-3 text-sm">
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900">Required fields</div>
                        <div className="mt-1 text-slate-600">
                          Full name, email, phone, vehicle type, vehicle plate, password.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-slate-900" />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900">Tip</div>
                        <div className="mt-1 text-slate-600">
                          Keep vehicle plate format consistent (for example, 49AE-123.45) for easier searching.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
