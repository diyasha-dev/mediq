// Normal ranges for common blood test parameters
// Used to flag HIGH / LOW / NORMAL automatically — no AI needed
const normalRanges = {
  // Blood Count
  "hemoglobin": { min: 12.0, max: 17.5, unit: "g/dL", fullName: "Hemoglobin" },
  "hgb": { min: 12.0, max: 17.5, unit: "g/dL", fullName: "Hemoglobin" },
  "hb": { min: 12.0, max: 17.5, unit: "g/dL", fullName: "Hemoglobin" },
  "rbc": { min: 4.0, max: 5.9, unit: "million/µL", fullName: "Red Blood Cells" },
  "wbc": { min: 4.5, max: 11.0, unit: "thousand/µL", fullName: "White Blood Cells" },
  "platelets": { min: 150, max: 400, unit: "thousand/µL", fullName: "Platelets" },
  "hematocrit": { min: 36, max: 52, unit: "%", fullName: "Hematocrit" },
  "pcv": { min: 36, max: 52, unit: "%", fullName: "Packed Cell Volume" },
  "mcv": { min: 80, max: 100, unit: "fL", fullName: "Mean Corpuscular Volume" },
  "mch": { min: 27, max: 33, unit: "pg", fullName: "Mean Corpuscular Hemoglobin" },
  "mchc": { min: 31.5, max: 36, unit: "g/dL", fullName: "MCHC" },

  // Blood Sugar
  "glucose": { min: 70, max: 100, unit: "mg/dL", fullName: "Blood Glucose (Fasting)" },
  "fasting glucose": { min: 70, max: 100, unit: "mg/dL", fullName: "Fasting Blood Glucose" },
  "hba1c": { min: 4.0, max: 5.6, unit: "%", fullName: "HbA1c (3-month sugar average)" },
  "hb a1c": { min: 4.0, max: 5.6, unit: "%", fullName: "HbA1c" },

  // Kidney Function
  "creatinine": { min: 0.6, max: 1.2, unit: "mg/dL", fullName: "Creatinine" },
  "urea": { min: 7, max: 20, unit: "mg/dL", fullName: "Blood Urea" },
  "bun": { min: 7, max: 20, unit: "mg/dL", fullName: "Blood Urea Nitrogen" },
  "uric acid": { min: 2.4, max: 7.0, unit: "mg/dL", fullName: "Uric Acid" },

  // Liver Function
  "sgpt": { min: 7, max: 56, unit: "U/L", fullName: "SGPT (Liver Enzyme)" },
  "alt": { min: 7, max: 56, unit: "U/L", fullName: "ALT (Liver Enzyme)" },
  "sgot": { min: 10, max: 40, unit: "U/L", fullName: "SGOT (Liver Enzyme)" },
  "ast": { min: 10, max: 40, unit: "U/L", fullName: "AST (Liver Enzyme)" },
  "bilirubin": { min: 0.1, max: 1.2, unit: "mg/dL", fullName: "Total Bilirubin" },
  "total bilirubin": { min: 0.1, max: 1.2, unit: "mg/dL", fullName: "Total Bilirubin" },
  "albumin": { min: 3.4, max: 5.4, unit: "g/dL", fullName: "Albumin" },

  // Thyroid
  "tsh": { min: 0.4, max: 4.0, unit: "mIU/L", fullName: "TSH (Thyroid)" },
  "t3": { min: 80, max: 200, unit: "ng/dL", fullName: "T3 (Thyroid)" },
  "t4": { min: 5.0, max: 12.0, unit: "µg/dL", fullName: "T4 (Thyroid)" },
  "ft4": { min: 0.89, max: 1.76, unit: "ng/dL", fullName: "Free Thyroxine (FT4)" },
  "free thyroxine": { min: 0.89, max: 1.76, unit: "ng/dL", fullName: "Free Thyroxine (FT4)" },
  "thyroxine": { min: 0.89, max: 1.76, unit: "ng/dL", fullName: "Free Thyroxine (FT4)" },
  "ft3": { min: 2.3, max: 4.2, unit: "pg/mL", fullName: "Free T3" },
  "free t3": { min: 2.3, max: 4.2, unit: "pg/mL", fullName: "Free T3" },

  // Lipid Profile
  "total cholesterol": { min: 0, max: 200, unit: "mg/dL", fullName: "Total Cholesterol" },
  "cholesterol": { min: 0, max: 200, unit: "mg/dL", fullName: "Total Cholesterol" },
  "hdl": { min: 40, max: 999, unit: "mg/dL", fullName: "HDL (Good Cholesterol)" },
  "ldl": { min: 0, max: 100, unit: "mg/dL", fullName: "LDL (Bad Cholesterol)" },
  "triglycerides": { min: 0, max: 150, unit: "mg/dL", fullName: "Triglycerides" },

  // Vitamins & Minerals
  "vitamin d": { min: 20, max: 50, unit: "ng/mL", fullName: "Vitamin D" },
  "vitamin b12": { min: 200, max: 900, unit: "pg/mL", fullName: "Vitamin B12" },
  "b12": { min: 200, max: 900, unit: "pg/mL", fullName: "Vitamin B12" },
  "ferritin": { min: 12, max: 300, unit: "ng/mL", fullName: "Ferritin (Iron Store)" },
  "iron": { min: 60, max: 170, unit: "µg/dL", fullName: "Serum Iron" },
  "calcium": { min: 8.5, max: 10.5, unit: "mg/dL", fullName: "Calcium" },
  "sodium": { min: 136, max: 145, unit: "mEq/L", fullName: "Sodium" },
  "potassium": { min: 3.5, max: 5.0, unit: "mEq/L", fullName: "Potassium" },
}

export default normalRanges