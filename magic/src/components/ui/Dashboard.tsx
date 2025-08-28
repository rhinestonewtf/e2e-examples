import React from "react";
import WalletMethods from "../magic/cards/WalletMethodsCard";
import SendTransaction from "../magic/cards/SendTransactionCard";
import Spacer from "@/components/ui/Spacer";
import { LoginProps } from "@/utils/types";
import UserInfo from "@/components/magic/cards/UserInfoCard";
import DevLinks from "./DevLinks";
import Header from "./Header";
import SmartContract from "../magic/cards/SmartContract";
import { isTestnet } from "@/utils/smartContract";
import { Button } from "@/components/ui/button";

export default function Dashboard({ token, setToken }: LoginProps) {
  const handleSwitchToRhinestone = () => {
    window.location.href = "/?demo=rhinestone";
  };

  return (
    <div className="home-page">
      <Header />
      <div className="flex justify-center mb-4 mt-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl">
          <h3 className="font-semibold text-blue-900 mb-2">
            Go to Rhinestone Demo
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Experience cross-chain transactions with Rhinestone&apos;s Global
            Wallet. Send tokens from any chain to any chain with a single
            transaction!
          </p>
          <Button
            onClick={handleSwitchToRhinestone}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View Rhinestone Demo
          </Button>
        </div>
      </div>
      {/* cards two columns */}
      <div className="cards-container mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
        <UserInfo token={token} setToken={setToken} />
        <SendTransaction />
        <WalletMethods token={token} setToken={setToken} />
        {isTestnet() && <SmartContract />}
      </div>
      <DevLinks primary />
    </div>
  );
}
