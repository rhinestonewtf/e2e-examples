import React from 'react';
import { LoginProps } from '@/utils/types';
import { RhinestoneWalletSidebar } from '@/components/magic/RhinestoneWalletSidebar';
import { RhinestoneCrossChainDemo } from '@/components/magic/RhinestoneCrossChainDemo';
import Header from './Header';
import DevLinks from './DevLinks';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RhinestoneDashboard({ token, setToken }: LoginProps) {
  const handleBackToOriginal = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Navigation Bar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={handleBackToOriginal}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Original Magic Demo
          </Button>
          <div className="text-sm text-slate-600">
            <span className="font-medium">Rhinestone SDK Integration</span> - Cross-chain transactions powered by Magic
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-sm border-r">
          <RhinestoneWalletSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <RhinestoneCrossChainDemo />
        </div>
      </div>
      
      <div className="border-t bg-white">
        <div className="max-w-7xl mx-auto">
          <DevLinks primary />
        </div>
      </div>
    </div>
  );
}
