import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="disclaimer-banner">
      <ShieldCheck size={16} />
      <span>
        <strong>Wellness Companion Only:</strong> CycleCare provides general lifestyle and nutritional ideas and is not intended to diagnose, treat, or prevent medical conditions.
      </span>
    </div>
  );
}
