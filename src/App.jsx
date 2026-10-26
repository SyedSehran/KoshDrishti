import React, { useState } from 'react';
import HeaderGIGW from './components/HeaderGIGW';
import KPIRowExactPS from './components/KPIRowExactPS';
import HeroRunwayAndMap from './components/HeroRunwayAndMap';
import TableWithDrawer from './components/TableWithDrawer';
import Instrument360Drawer from './components/Instrument360Drawer';
import DiscrepancyInspectorModal from './components/DiscrepancyInspectorModal';
import ReleaseWorkflowModal from './components/ReleaseWorkflowModal';
import CryptoLedgerModal from './components/CryptoLedgerModal';
import JudgeDemoGuideModal from './components/JudgeDemoGuideModal';
import CollegeDeskView from './components/roles/CollegeDeskView';
import BankDeskView from './components/roles/BankDeskView';
import DirectorDeskView from './components/roles/DirectorDeskView';
import { SEED_DATASET_200 } from './data/seedData';
import { INITIAL_LEDGER_CHAIN } from './data/mockData';
import { generateBlockHash } from './utils/cryptoLedger';
import { Award, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState(SEED_DATASET_200);
  const [ledgerChain, setLedgerChain] = useState(INITIAL_LEDGER_CHAIN);
  const [currentRole, setCurrentRole] = useState('bureau_officer');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [textSize, setTextSize] = useState('md');

  // Modals & Drawers
  const [activeDrawerInstrument, setActiveDrawerInstrument] = useState(null);
  const [inspectingDiscrepancyFDR, setInspectingDiscrepancyFDR] = useState(null);
  const [releasingFDR, setReleasingFDR] = useState(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isDemoScriptsOpen, setIsDemoScriptsOpen] = useState(false);

  // Micro toast
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch real persisted instruments from SQLite DB on mount
  React.useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/instruments')
      .then(r => r.json())
      .then(data => {
        if (data.instruments && data.instruments.length > 0) {
          setRecords(data.instruments);
        }
      })
      .catch(err => {
        console.warn("Backend API not reachable, using local benchmark seed data:", err);
      });
  }, []);

  // Helper to append to cryptographic ledger
  const appendLedgerBlock = (action, actor, fdrId, details) => {
    const prevBlock = ledgerChain[ledgerChain.length - 1];
    const newIndex = prevBlock.blockIndex + 1;
    const timestamp = new Date().toISOString();
    const newHash = generateBlockHash(newIndex, prevBlock.blockHash, timestamp, action, actor, details);

    const newBlock = {
      blockIndex: newIndex,
      timestamp,
      action,
      actor,
      fdrId,
      previousHash: prevBlock.blockHash,
      blockHash: newHash,
      details
    };

    setLedgerChain(prev => [...prev, newBlock]);
  };

  // Handler for discrepancy resolution
  const handleResolveDiscrepancy = async (fdrId) => {
    // 1. Update local UI
    setRecords(prev => prev.map(item => {
      if (item.id === fdrId) {
        return {
          ...item,
          status: 'Active',
          lienMarked: true,
          bankConfirmed: true,
          trustLevel: 'bank',
          hasDiscrepancies: false,
          discrepancies: [],
          ocrMatchPct: 99.2,
          jointHolderName: "Member Secretary, AICTE & Trust Secretary",
          legacyStatus: "Lien confirmed"
        };
      }
      return item;
    }));

    // 2. Persist to real backend SQLite DB & append to Merkle ledger
    try {
      const token = localStorage.getItem('kosh_jwt_token') || '';
      await fetch(`http://127.0.0.1:8000/api/v1/instruments/${fdrId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: currentRole === 'bank_validator' ? undefined : 'Active',
          bankConfirmed: true,
          lienMarked: true,
          hasDiscrepancies: currentRole === 'bank_validator' ? undefined : false,
          resolutionNote: 'Statutory verification complete: CBS lien endorsed and APH Table 1.4 compliance confirmed.',
          legacyStatus: 'Lien confirmed in CBS',
          actor: currentRole === 'bank_validator' ? 'BANK_BRANCH_VALIDATION_DESK' : 'REGULATION_BUREAU'
        })
      });
    } catch (e) {
      console.warn("Backend update error:", e);
    }

    appendLedgerBlock(
      'DISCREPANCY_RECTIFIED',
      'BANK_BRANCH_VALIDATION_DESK',
      fdrId,
      'Bank branch updated Core Banking title to include Member Secretary, AICTE and aligned tenure with APH Table 1.4.'
    );

    showToast(`Discrepancy resolved and lien endorsed by bank for ${fdrId}`);
  };

  // Handler for notice issuance
  const handleIssueRectificationNotice = (record, remark) => {
    appendLedgerBlock(
      'RECTIFICATION_NOTICE_ISSUED',
      'SCRUTINY_OFFICER_REGULATION_BUREAU',
      record.id,
      `Statutory Notice issued: ${remark}`
    );
    showToast(`Statutory Rectification Notice dispatched to Trust & Bank`);
  };

  // Handler for two-officer approval
  const handleApproveRelease = async (fdrId, notes) => {
    // 1. Update local UI
    setRecords(prev => prev.map(item => {
      if (item.id === fdrId) {
        return {
          ...item,
          status: 'Released',
          lienMarked: false,
          legacyStatus: "Discharged (NOC issued)",
          releaseDetails: {
            ...item.releaseDetails,
            workflowStep: 3,
            releasedOn: new Date().toISOString().slice(0, 10),
            officerNotes: notes,
            digitalSignatureSigner: 'Prof. Rajive Kumar, Member Secretary AICTE'
          }
        };
      }
      return item;
    }));

    // 2. Persist to real backend SQLite DB
    try {
      const token = localStorage.getItem('kosh_jwt_token') || '';
      await fetch(`http://127.0.0.1:8000/api/v1/instruments/${fdrId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'Released',
          legacyStatus: 'Discharged (NOC issued post 10-Yr Lock-in)',
          actor: 'MEMBER_SECRETARY_AICTE_DSC'
        })
      });
    } catch (e) {
      console.warn("Backend update error:", e);
    }

    appendLedgerBlock(
      'TWO_OFFICER_RELEASE_SANCTIONED',
      'MEMBER_SECRETARY_AICTE_DSC',
      fdrId,
      'Full unconditional lien discharge sanctioned post 10-year lock-in fulfillment under APH Table 1.4.'
    );

    showToast(`Official AICTE FDR Discharge Order generated & digitally signed`);
  };

  // Trigger demo flows
  const handleTriggerFlow = (flowId) => {
    if (flowId === 'flow_discrepancy') {
      const flagged = records.find(r => r.hasDiscrepancies || r.status === 'Discrepancy');
      if (flagged) setInspectingDiscrepancyFDR(flagged);
    } else if (flowId === 'flow_maturity') {
      const expiring = records.find(r => r.daysRemaining <= 30 && r.daysRemaining > 0);
      if (expiring) setActiveDrawerInstrument(expiring);
      setStatusFilter('Expiring');
    } else if (flowId === 'flow_release') {
      const rel = records.find(r => r.status === 'Release');
      if (rel) setReleasingFDR(rel);
    }
  };

  // Filter records by month if selected from runway
  const displayRecords = monthFilter
    ? records.filter(r => r.maturityDate && r.maturityDate.startsWith(monthFilter))
    : records;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontSize: textSize === 'sm' ? 14 : textSize === 'lg' ? 17 : 15.5
    }}>
      {/* 1. GIGW Compliant Header */}
      <HeaderGIGW
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onOpenAuditLog={() => setIsLedgerOpen(true)}
        onOpenDemoTours={() => setIsDemoScriptsOpen(true)}
        onSelectInstrument={(item) => setActiveDrawerInstrument(item)}
        records={records}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        language={language}
        setLanguage={setLanguage}
        textSize={textSize}
        setTextSize={setTextSize}
      />

      {/* Main Canvas Container - Balanced Stature & Proportion */}
      <main style={{ flex: 1, padding: '24px 28px', maxWidth: 1720, margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 }}>


        {/* ROLE 1: Approving Authority / Director View */}
        {currentRole === 'director' && (
          <DirectorDeskView
            records={records}
            onOpenCaseFile={(inst) => setActiveDrawerInstrument(inst)}
            onOpenTwoOfficerApproval={(inst) => setReleasingFDR(inst)}
            onOpenAuditLog={() => setIsLedgerOpen(true)}
          />
        )}

        {/* ROLE 2: Technical Institution Nodal Desk (College View) */}
        {currentRole === 'institution' && (
          <CollegeDeskView
            records={records}
            onAddNewFDR={(newFdr) => {
              setRecords(prev => [newFdr, ...prev]);
              showToast(`FDR ${newFdr.fdrNumber} submitted & queued for AICTE Scrutiny`);
            }}
            onOpenCaseFile={(inst) => setActiveDrawerInstrument(inst)}
            onOpenReleaseWorkflow={(inst) => setReleasingFDR(inst)}
          />
        )}

        {/* ROLE 3: Bank Branch Verification Desk (Core Banking Gateway) */}
        {currentRole === 'bank_validator' && (
          <BankDeskView
            records={records}
            onResolveDiscrepancy={handleResolveDiscrepancy}
            onOpenCaseFile={(inst) => setActiveDrawerInstrument(inst)}
            onOpenCompareSources={(inst) => setInspectingDiscrepancyFDR(inst)}
          />
        )}

        {/* ROLE 4: Bureau Scrutiny Officer (Full Master Register & Horizon) */}
        {currentRole === 'bureau_officer' && (
          <>
            {/* 2. KPI Row Matching Exact Problem Statement */}
            <KPIRowExactPS
              records={records}
              activeStatusFilter={statusFilter}
              onSelectStatusFilter={(status) => setStatusFilter(status)}
            />

            {/* 3. Signature Hero Tiles: Maturity Runway & Regional Map */}
            <HeroRunwayAndMap
              records={records}
              selectedRegion={regionFilter}
              setSelectedRegion={setRegionFilter}
              onSelectMonthFilter={setMonthFilter}
              activeMonthFilter={monthFilter}
            />

            {/* 4. Upgraded Master Register Table with Slide-Over Drawer */}
            <TableWithDrawer
              records={displayRecords}
              onSelectInstrument={(item) => setActiveDrawerInstrument(item)}
              onOpenCompareSources={(item) => setInspectingDiscrepancyFDR(item)}
              onOpenTwoOfficerApproval={(item) => setReleasingFDR(item)}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              regionFilter={regionFilter}
              setRegionFilter={setRegionFilter}
            />
          </>
        )}
      </main>

      {/* Floating Rehearsal Button for Evaluator Scripts */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 90 }}>
        <button
          onClick={() => setIsDemoScriptsOpen(true)}
          className="btn btn-ink-primary"
          style={{
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
            padding: '10px 16px',
            fontSize: 12.5,
            borderRadius: 'var(--radius-full)'
          }}
          title="Open evaluator demo scripts and 3 flows"
        >
          <Award size={15} />
          <span>Demo Scripts (3 Flows)</span>
        </button>
      </div>

      {/* Modals & Slide-Over Drawers */}
      {activeDrawerInstrument && (
        <Instrument360Drawer
          instrument={activeDrawerInstrument}
          onClose={() => setActiveDrawerInstrument(null)}
          onOpenCompareSources={(item) => setInspectingDiscrepancyFDR(item)}
          onOpenTwoOfficerApproval={(item) => setReleasingFDR(item)}
          onOpenAuditLog={() => setIsLedgerOpen(true)}
          authToken={localStorage.getItem('kosh_jwt_token') || ''}
        />
      )}

      {inspectingDiscrepancyFDR && (
        <DiscrepancyInspectorModal
          fdrRecord={inspectingDiscrepancyFDR}
          onClose={() => setInspectingDiscrepancyFDR(null)}
          onResolveDiscrepancy={handleResolveDiscrepancy}
          onIssueRectificationNotice={handleIssueRectificationNotice}
        />
      )}

      {releasingFDR && (
        <ReleaseWorkflowModal
          fdrRecord={releasingFDR}
          onClose={() => setReleasingFDR(null)}
          onApproveRelease={handleApproveRelease}
        />
      )}

      {isLedgerOpen && (
        <CryptoLedgerModal
          ledgerChain={ledgerChain}
          onClose={() => setIsLedgerOpen(false)}
        />
      )}

      {isDemoScriptsOpen && (
        <JudgeDemoGuideModal
          onClose={() => setIsDemoScriptsOpen(false)}
          onTriggerFlow={handleTriggerFlow}
        />
      )}

      {/* Micro Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--ink-primary)',
          color: '#ffffff',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 18px',
          boxShadow: 'var(--shadow-modal)',
          fontSize: 12.5,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={15} color="var(--ramp-jade-border)" />
          <span>{toast}</span>
        </div>
      )}

      {/* GIGW Official Footer */}
      <footer style={{
        background: '#f1ede5',
        borderTop: '1px solid var(--border-medium)',
        padding: '16px 24px',
        fontSize: 11.5,
        color: 'var(--ink-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <span>AICTE Regulation Bureau • Security Deposit & Fixed Deposit Receipt (FDR) Portal</span>
          <span style={{ margin: '0 8px' }}>|</span>
          <span>Website Content Managed by All India Council for Technical Education</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span>GIGW Compliant</span>
          <span>•</span>
          <button
            onClick={() => setIsLedgerOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--ink-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 11.5 }}
          >
            Audit log #1408
          </button>
          <span>•</span>
          <span>Handicap & Screen Reader Accessible</span>
        </div>
      </footer>
    </div>
  );
}
