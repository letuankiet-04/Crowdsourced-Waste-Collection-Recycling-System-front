import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from "../../../app/routes/paths.js";
import Sidebar from "./Sidebar";
import Navbar from "./CD_Navbar";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import { RewardsHeader } from "./rewards_comp/RewardsHeader.jsx";
import { PointsSummary } from "./rewards_comp/PointsSummary.jsx";
import { RedeemSection } from "./rewards_comp/RedeemSection.jsx";
import { MyVouchersSection } from "./rewards_comp/MyVouchersSection.jsx";
import { MY_VOUCHERS } from "../../../mock/voucherData.js";
import { getCitizenPoints } from "../../../services/citizen.service.js";
import useNotify from "../../../shared/hooks/useNotify.js";

export default function CitizenRewards() {
  const [myVouchers, setMyVouchers] = useState(MY_VOUCHERS);
  const [pointsData, setPointsData] = useState({ totalPoints: 0, monthlyPoints: 0 });
  const notify = useNotify();

  useEffect(() => {
    async function fetchPoints() {
      try {
        const data = await getCitizenPoints();
        if (data) {
          setPointsData(data);
        }
      } catch (error) {
        console.error("Failed to fetch points:", error);
      }
    }
    fetchPoints();
  }, []);

  const handleRedeem = (voucher) => {
    const cost = parseInt(voucher.pointsRequired.replace(/,/g, ''), 10);
    
    if (pointsData.totalPoints < cost) {
      notify.error("Insufficient Points", `You need ${cost - pointsData.totalPoints} more points to redeem this voucher.`);
      return;
    }

    // Deduct points locally (mock logic since no backend endpoint for redemption)
    setPointsData(prev => ({
      ...prev,
      totalPoints: prev.totalPoints - cost
    }));

    // Generate a unique voucher code
    let uniqueCode;
    let isUnique = false;
    while (!isUnique) {
      const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
      uniqueCode = `VOUCHER-${randomStr}`;
      // Check against current state to ensure uniqueness
      isUnique = !myVouchers.some(v => v.code === uniqueCode);
    }

    // Simulate API call and saving to My Vouchers
    const newVoucher = {
      id: Date.now(), // Generate unique ID
      brandName: voucher.title.split(' ')[0], // Simple extraction
      logoUrl: voucher.logoUrl,
      title: voucher.title,
      value: voucher.value,
      validDate: voucher.validUntil,
      points: cost,
      status: "Active",
      code: uniqueCode // Use the unique code
    };

    setMyVouchers(prev => [newVoucher, ...prev]);
    notify.success("Redemption Successful", `You have successfully redeemed ${voucher.title}!`);
  };

  return (
    <RoleLayout
      sidebar={<Sidebar />}
      navbar={<Navbar />}
      showBackgroundEffects
      footer={
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <br />
          <CD_Footer />
        </div>
      }
    >
      <div className="space-y-10 mt-8">
        {/* Header Section */}
        <RewardsHeader />

        {/* Summary Cards */}
        <PointsSummary pointsData={pointsData} />

        {/* Redeem Gifts Section */}
        <RedeemSection onRedeem={handleRedeem} />

        {/* My Vouchers Section */}
        <MyVouchersSection vouchers={myVouchers} />
      </div>
    </RoleLayout>
  );
}
