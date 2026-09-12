import React, { useEffect, useState } from 'react';

const CHANNEL_NAME = 'face_reaction_single_tab_channel';

export const DuplicateTabOverlay: React.FC = () => {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [tabId] = useState(() => Math.random().toString(36).substring(7));

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(CHANNEL_NAME);

    // Announce this tab's presence
    channel.postMessage({ type: 'PING', tabId });

    channel.onmessage = (event) => {
      const { type, senderId } = event.data || {};

      if (type === 'PING' && senderId !== tabId) {
        // We are already here, tell the new tab we exist
        channel.postMessage({ type: 'ALIVE', senderId: tabId });
      } else if (type === 'ALIVE' && senderId !== tabId) {
        // An existing tab responded! This tab is a duplicate!
        setIsDuplicate(true);
      } else if (type === 'TAKEOVER' && senderId !== tabId) {
        // The other tab took over, so this tab becomes duplicate
        setIsDuplicate(true);
      }
    };

    return () => {
      channel.close();
    };
  }, [tabId]);

  const handleClose = () => {
    window.close();
    // If window.close() is blocked by browser security (user didn't open via script)
    alert("Please close this tab (Ctrl + W) and switch to your first tab!");
  };

  const handleTakeover = () => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'TAKEOVER', senderId: tabId });
      channel.close();
    }
    setIsDuplicate(false);
  };

  if (!isDuplicate) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-[#020617]/95 backdrop-blur-md flex items-center justify-center p-6 text-center">
      <div className="bg-[#0f172a] border-2 border-[#ff2fa4] rounded-2xl p-8 max-w-lg shadow-[0_0_50px_rgba(255,47,164,0.4)]">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="font-orbitron text-xl font-black text-[#ff2fa4] tracking-widest uppercase mb-3">
          Duplicate Tab Detected
        </h2>
        <p className="font-rajdhani text-base text-[#94a3b8] font-semibold leading-relaxed mb-6">
          The game is already open in another tab! Running 2 tabs causes camera conflicts and freezes detection.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-xl bg-[#ff2fa4] hover:bg-[#ff007f] text-white font-orbitron text-xs font-black tracking-wider uppercase shadow-[0_0_20px_rgba(255,47,164,0.5)] transition-all cursor-pointer"
          >
            ✖ Close This Extra Tab
          </button>
          <button
            onClick={handleTakeover}
            className="px-6 py-3 rounded-xl bg-[#091838] border border-[#00e5ff] text-[#00e5ff] hover:bg-[#00e5ff]/20 font-orbitron text-xs font-black tracking-wider uppercase transition-all cursor-pointer"
          >
            ⚡ Play In This Tab
          </button>
        </div>
      </div>
    </div>
  );
};
