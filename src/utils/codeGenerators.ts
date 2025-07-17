// Utility functions for generating automatic codes

export const generateReceptionCode = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate random 6-digit number
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  
  return `${dateStr}-${randomNum}`;
};

export const generateExpeditionCode = async (): Promise<string> => {
  // This function should be called from a component that has access to supabase
  // For now, return a placeholder that will be replaced with proper sequence logic
  const today = new Date();
  const year = today.getFullYear();
  const randomNum = Math.floor(1 + Math.random() * 999);
  
  return `EXP-${year}-${String(randomNum).padStart(3, '0')}`;
};

export const generateConsolidationCode = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const randomNum = Math.floor(100 + Math.random() * 900);
  
  return `CONS-${year}${month}${day}-${randomNum}`;
};