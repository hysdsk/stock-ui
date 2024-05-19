export const colorRate = (v: number) => {
  const r = Math.round(v * 10) / 10;
  if (r > 16) return "text-red9";
  if (r > 14) return "text-red8";
  if (r > 12) return "text-red7";
  if (r > 10) return "text-red6";
  if (r > 8) return "text-red5";
  if (r > 6) return "text-red4";
  if (r > 4) return "text-red3";
  if (r > 2) return "text-red2";
  if (r > 0) return "text-red1";
  if (r < -16) return "text-blue9";
  if (r < -14) return "text-blue8";
  if (r < -12) return "text-blue7";
  if (r < -10) return "text-blue6";
  if (r < -8) return "text-blue5";
  if (r < -6) return "text-blue4";
  if (r < -4) return "text-blue3";
  if (r < -2) return "text-blue2";
  if (r < 0) return "text-blue1";
  return "";
};

export const colorValue = (v: number) => {
  if (v >= 300000000) return "text-red9";
  if (v >= 250000000) return "text-red8";
  if (v >= 200000000) return "text-red7";
  if (v >= 150000000) return "text-red6";
  if (v >= 100000000) return "text-red5";
  if (v >= 90000000) return "text-red4";
  if (v >= 70000000) return "text-red3";
  if (v >= 50000000) return "text-red2";
  if (v >= 30000000) return "text-red1";
  if (v >= 25000000) return "text-blue1";
  if (v >= 20000000) return "text-blue2";
  if (v >= 15000000) return "text-blue3";
  if (v >= 10000000) return "text-blue4";
  if (v >= 8000000) return "text-blue5";
  if (v >= 6000000) return "text-blue6";
  if (v >= 4000000) return "text-blue7";
  if (v >= 2000000) return "text-blue8";
  return "text-blue9";
};

export const progressColors = [
  { color: "#1e88e5", percentage: 25 },
  { color: "#42a5f5", percentage: 30 },
  { color: "#64b5f6", percentage: 35 },
  { color: "#90caf9", percentage: 40 },
  { color: "#bbdefb", percentage: 45 },
  { color: "#e3f2fd", percentage: 49 },
  { color: "#ffebee", percentage: 50 },
  { color: "#ffcdd2", percentage: 55 },
  { color: "#ef9a9a", percentage: 60 },
  { color: "#e57373", percentage: 65 },
  { color: "#ef5350", percentage: 70 },
  { color: "#f44336", percentage: 75 },
];

export const backgroundStrengthRatioV2 = (num: number, ratio: number) => {
  if (num) {
    return `background: linear-gradient(to left, #f44336 ${ratio}%, #2196f3 ${ratio}%)`;
  }
  return "";
};

export const backgroundStrengthRatio = (value: number, baseValue: number) => {
  const ratio = (value / baseValue) * 100;
  return `background: linear-gradient(to left, #f44336 ${ratio}%, #2196f3 ${ratio}%)`;
};

export const backgroundBearRatio = (value: number, baseValue: number) => {
  const ratio = (value / baseValue) * 100;
  return `background: linear-gradient(to left, #2196f3 ${ratio}%, transparent ${ratio}%)`;
};

export const backgroundBullRatio = (value: number, baseValue: number) => {
  const ratio = (value / baseValue) * 100;
  return `background: linear-gradient(to right, #f44336 ${ratio}%, transparent ${ratio}%)`;
}

export const backgroundStyleVolume = (value: number, baseValue: number) => {
  const ratio = (value / baseValue) * 100;
  return `background: linear-gradient(to right, rgba(255, 235, 59, 0.5) ${ratio}%, transparent ${ratio}%)`;
};

export const colorFirstSign = (bidSign: string, askSign: string) => {
  if (bidSign == "0118") return "text-blue5";
  if (askSign == "0118") return "text-red5";
  if (bidSign == "0102" || askSign == "0102") return "text-yellow";
  return "";
};
export const colorSecondSign = (bidSign: string, askSign: string) => {
  if (bidSign == "0118" || bidSign == "0102") return "text-blue5";
  if (askSign == "0118" || askSign == "0102") return "text-red5";
  return "";
};

export default {};
