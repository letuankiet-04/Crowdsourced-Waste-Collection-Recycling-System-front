import { useState } from "react";
import { Car, Eye, EyeOff, Hash, Lock, Mail, Phone, Truck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import EnterpriseLayout from "./layout/EnterpriseLayout.jsx";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import TextField from "../../../components/ui/TextField.jsx";
import LoadingButton from "../../../components/ui/LoadingButton.jsx";
import Button from "../../../components/ui/Button.jsx";
import useNotify from "../../../hooks/useNotify.js";
import usePasswordVisibility from "../../../hooks/usePasswordVisibility.js";
import { PATHS } from "../../../routes/paths.js";
import { createCollector } from "../../../api/enterprise.js";

export default function EnterpriseAdminPanel() {
  const notify = useNotify();
  const passwordVisibility = usePasswordVisibility(false);
  const confirmVisibility = usePasswordVisibility(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    employeeCode: "",
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
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (pending) return;

    const fullName = values.fullName.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const employeeCode = values.employeeCode.trim();
    const vehicleType = values.vehicleType.trim();
    const vehiclePlate = values.vehiclePlate.trim();
    const password = values.password;
    const confirmPassword = values.confirmPassword;

    if (!fullName || !email || !phone || !employeeCode || !vehicleType || !vehiclePlate || !password || !confirmPassword) {
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
      await notify.promise(createCollector({ fullName, email, password, phone, employeeCode, vehicleType, vehiclePlate }), {
        loadingTitle: "Creating collector...",
        loadingMessage: "Sending account details to the server.",
        successTitle: "Collector created",
        successMessage: `${email} can now log in as a collector.`,
        errorTitle: "Create failed",
        errorMessage: (err) => err?.message || "Unable to create collector. Please try again.",
      });
      setValues({
        fullName: "",
        email: "",
        phone: "",
        employeeCode: "",
        vehicleType: "",
        vehiclePlate: "",
        password: "",
        confirmPassword: "",
      });
      passwordVisibility.setVisible(false);
      confirmVisibility.setVisible(false);
      setError("");
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
            <form className="grid gap-4 max-w-2xl" onSubmit={handleSubmit}>
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
              />
              <TextField
                id="collector_phone"
                label="Phone"
                autoComplete="tel"
                value={values.phone}
                onChange={handleChange("phone")}
                placeholder="07xxxxxxxx"
                disabled={pending}
                leftIcon={Phone}
                accent="emerald"
              />
              <TextField
                id="collector_employee_code"
                label="Employee code"
                autoComplete="off"
                value={values.employeeCode}
                onChange={handleChange("employeeCode")}
                placeholder="EMP-0001"
                disabled={pending}
                leftIcon={Hash}
                accent="emerald"
              />
              <TextField
                id="collector_vehicle_type"
                label="Vehicle type"
                autoComplete="off"
                value={values.vehicleType}
                onChange={handleChange("vehicleType")}
                placeholder="Truck / Van / Bike"
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
                placeholder="ABC-1234"
                disabled={pending}
                leftIcon={Car}
                accent="emerald"
              />
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

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {error}
                </div>
              ) : null}

              <div className="pt-2">
                <LoadingButton type="submit" loading={pending} accent="emerald">
                  Create collector
                </LoadingButton>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
