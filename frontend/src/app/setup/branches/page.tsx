"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { BranchTable } from "@/features/setup/components/BranchTable";
import { BranchModal } from "@/features/setup/components/BranchModal";
import { BranchResponse, CompanyResponse, getBranches, getCompanies } from "@/features/setup/api";

export default function BranchesSetupPage() {
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchResponse | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, cData] = await Promise.all([getBranches(), getCompanies()]);
      setBranches(bData);
      setCompanies(cData);
    } catch (err) {
      console.error("Failed to load branches and companies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="setup" hideHeader />
        <BranchTable
          branches={branches}
          companies={companies}
          loading={loading}
          onRefresh={loadData}
          onAddClick={() => {
            setSelectedBranch(null);
            setModalOpen(true);
          }}
          onEdit={(branch) => {
            setSelectedBranch(branch);
            setModalOpen(true);
          }}
        />

        <BranchModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            loadData();
          }}
          branch={selectedBranch}
          companies={companies}
        />
      </div>
    </AppShell>
  );
}
