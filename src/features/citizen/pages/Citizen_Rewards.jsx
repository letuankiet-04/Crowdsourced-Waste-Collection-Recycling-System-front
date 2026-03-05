import React, { useState, useEffect } from 'react';
import Sidebar from "../components/navigation/Sidebar";
import Navbar from "../components/navigation/CD_Navbar";
import CD_Footer from "../../../shared/layout/CD_Footer.jsx";
import RoleLayout from "../../../shared/layout/RoleLayout.jsx";
import { RewardsHeader } from "../components/rewards/RewardsHeader.jsx";
import { PointsSummary } from "../components/rewards/PointsSummary.jsx";
import { RedeemSection } from "../components/rewards/RedeemSection.jsx";
import { MyVouchersSection } from "../components/rewards/MyVouchersSection.jsx";
import { getCitizenPoints } from "../../../services/citizen.service.js";
import { getMyVouchers, getRedeemableVouchers, redeemVoucher } from "../../../services/voucher.service.js";
import useNotify from "../../../shared/hooks/useNotify.js";

export default function CitizenRewards() {
  const [myVouchers, setMyVouchers] = useState([]);
  const [redeemableVouchers, setRedeemableVouchers] = useState([]);
  const [pointsData, setPointsData] = useState({ totalPoints: 0, monthlyPoints: 0 });
  const notify = useNotify();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCitizenPoints();
        if (data) {
          setPointsData(data);
        }
        const [my, redeemable] = await Promise.all([getMyVouchers(), getRedeemableVouchers()]);
        setMyVouchers(my || []);
        setRedeemableVouchers(redeemable || []);
      } catch (error) {
        console.error("Failed to fetch points:", error);
      }
    }
    fetchData();
  }, []);

  const handleRedeem = async (voucher) => {
    try {
      await redeemVoucher(voucher);
      const [points, my] = await Promise.all([getCitizenPoints(), getMyVouchers()]);
      if (points) setPointsData(points);
      setMyVouchers(my || []);
      notify.success("Redemption Successful", `You have successfully redeemed ${voucher.title}!`);
    } catch (error) {
      notify.error("Redemption Failed", error?.message || "Failed to redeem voucher.");
    }
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
        <RedeemSection onRedeem={handleRedeem} vouchers={redeemableVouchers} />

        {/* My Vouchers Section */}
        <MyVouchersSection vouchers={myVouchers} />
      </div>
    </RoleLayout>
  );
}
