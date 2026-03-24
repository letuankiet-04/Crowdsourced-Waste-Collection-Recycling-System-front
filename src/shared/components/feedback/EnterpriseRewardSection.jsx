import { useMemo } from "react";
import TextField from "../../ui/TextField.jsx";
import { Card, CardBody, CardHeader, CardTitle } from "../../ui/Card.jsx";

function estimatedAwardPointsFromCollector(_collector, bonusPoints) {
  const rateNum = typeof bonusPoints === "number" ? bonusPoints : Number(bonusPoints);

  return Number.isFinite(rateNum) && rateNum > 0 ? rateNum : 0;
}

export default function EnterpriseRewardSection({
  collector,
  rateInput,
  onRateChange,
  onRateBlur,
  disabled = false,
}) {
  const rateNum = Number(rateInput);
  const rateSafe = Number.isFinite(rateNum) ? Math.max(0, Math.min(100, Math.round(rateNum))) : null;
  const estimatedAwardPoints = useMemo(() => {
    if (rateSafe == null) return null;
    return estimatedAwardPointsFromCollector(collector, rateSafe);
  }, [collector, rateSafe]);

  return (
    <Card>
      <CardHeader className="py-6 px-8">
        <CardTitle className="text-2xl">Update Points</CardTitle>
      </CardHeader>
      <CardBody className="p-8">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Please enter the bonus points."
              type="number"
              value={rateInput}
              onChange={(e) => onRateChange?.(e.target.value)}
              onBlur={onRateBlur}
              placeholder="0 - 100"
              disabled={disabled}
              inputClassName="text-gray-900"
            />
          </div>
          {estimatedAwardPoints != null ? (
            <div className="text-sm text-gray-600">
              Estimated points to award:{" "}
              <span className="font-semibold text-gray-900">{estimatedAwardPoints}</span>
            </div>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
