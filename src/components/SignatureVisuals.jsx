import React from 'react';
import { ShieldCheck, UserCheck, FileCheck, Clock, AlertCircle } from 'lucide-react';

/**
 * Validity Ramp Component: <ExpiryChip days={n}/>
 * Palette:
 * - Jade (> 90 days remaining)
 * - Turmeric (31 - 90 days remaining)
 * - Vermilion (1 - 30 days remaining)
 * - Ink Black (<= 0 days: Matured / Due for release or rollover)
 */
export function ExpiryChip({ days, showLabel = true }) {
  if (days <= 0) {
    return (
      <span className="ramp-chip ramp-black" title="Instrument has completed mandatory lock-in period">
        <span className="ramp-dot" />
        <span>Matured</span>
      </span>
    );
  }

  if (days <= 30) {
    return (
      <span className="ramp-chip ramp-vermilion" title="Critical: Replacement guarantee or renewal due in <30 days">
        <span className="ramp-dot" />
        <span>{days}d left</span>
      </span>
    );
  }

  if (days <= 90) {
    return (
      <span className="ramp-chip ramp-turmeric" title="Notice window: Advance advisory sent to Trust">
        <span className="ramp-dot" />
        <span>{days}d left</span>
      </span>
    );
  }

  return (
    <span className="ramp-chip ramp-jade" title="Valid & compliant under APH lock-in">
      <span className="ramp-dot" />
      <span>{days}d ({Math.round(days / 365)}y)</span>
    </span>
  );
}

/**
 * Trust Stamp Component: <TrustStamp level="declared|officer|bank"/>
 * Clearly shows who verified and stands behind the data point.
 */
export function TrustStamp({ level = 'declared', size = 'md' }) {
  if (level === 'bank') {
    return (
      <span className={`trust-stamp stamp-bank stamp-${size}`} title="Independently confirmed by Bank Core Banking / SFMS 798 message">
        <ShieldCheck size={size === 'sm' ? 11 : 13} />
        <span>Bank verified</span>
      </span>
    );
  }

  if (level === 'officer') {
    return (
      <span className={`trust-stamp stamp-officer stamp-${size}`} title="Scrutiny officer verified with regulatory clearance">
        <UserCheck size={size === 'sm' ? 11 : 13} />
        <span>Officer verified</span>
      </span>
    );
  }

  // declared (self-reported by college)
  return (
    <span className={`trust-stamp stamp-declared stamp-${size}`} title="Institution self-declared. Pending independent bank/officer verification">
      <FileCheck size={size === 'sm' ? 11 : 13} />
      <span>Self-declared</span>
    </span>
  );
}
