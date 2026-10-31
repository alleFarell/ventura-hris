"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModuleNav } from "@/components/layout/ModuleNav";
import { CompanyTable } from "@/features/setup/components/CompanyTable";
import { CompanyModal } from "@/features/setup/components/CompanyModal";
import { CompanyResponse, getCompanies } from "@/features/setup/api";

export default function CompanySetupPage() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyResponse | null>(null);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to load companies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ModuleNav module="setup" hideHeader />
        <CompanyTable
          companies={companies}
          loading={loading}
          onRefresh={loadCompanies}
          onAddClick={() => {
            setSelectedCompany(null);
            setModalOpen(true);
          }}
          onEdit={(comp) => {
            setSelectedCompany(comp);
            setModalOpen(true);
          }}
        />

        <CompanyModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            loadCompanies();
          }}
          company={selectedCompany}
        />
      </div>
    </AppShell>
  );
}
