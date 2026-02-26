import React from 'react';
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

export default function CitizenRewards() {
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
        <PointsSummary />

        {/* Redeem Gifts Section */}
        <RedeemSection />

        {/* My Vouchers Section */}
        <MyVouchersSection />
      </div>
    </RoleLayout>
  );
}
