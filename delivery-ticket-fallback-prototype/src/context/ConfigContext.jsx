import { createContext, useContext, useMemo, useState } from 'react';
import { PLANTS, TICKET_MODES } from '../data/demoData';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [companyMode, setCompanyMode] = useState('digital');
  const [hybridAutoPrint, setHybridAutoPrint] = useState(true);
  const [hybridThresholdMin, setHybridThresholdMin] = useState(5);
  const [simulateOutage, setSimulateOutage] = useState(false);
  const [plantOverrides, setPlantOverrides] = useState(() =>
    Object.fromEntries(PLANTS.map((p) => [p.id, p.override])),
  );

  const effectiveModeForPlant = (plantId) => {
    const override = plantOverrides[plantId] ?? 'inherit';
    if (override !== 'inherit') return override;
    if (companyMode === 'hybrid' && simulateOutage && hybridAutoPrint) return 'printed';
    return companyMode === 'hybrid' ? 'digital' : companyMode;
  };

  const value = useMemo(
    () => ({
      companyMode,
      setCompanyMode,
      hybridAutoPrint,
      setHybridAutoPrint,
      hybridThresholdMin,
      setHybridThresholdMin,
      simulateOutage,
      setSimulateOutage,
      plantOverrides,
      setPlantOverride: (plantId, mode) =>
        setPlantOverrides((prev) => ({ ...prev, [plantId]: mode })),
      effectiveModeForPlant,
      modes: TICKET_MODES,
    }),
    [
      companyMode,
      hybridAutoPrint,
      hybridThresholdMin,
      simulateOutage,
      plantOverrides,
    ],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
