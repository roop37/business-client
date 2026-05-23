export type CampaignCsvRowType = {
  email: string;
  name: string;
  phone?: string;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z0-9-.'!$\/\\ ]+$/;
  return nameRegex.test(name.trim());
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phone.trim() === "" || phoneRegex.test(phone.trim());
};

export const validateDob = (dob: string): boolean => {
  if (dob.trim() === "") return true;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(dob.trim()) && !isNaN(new Date(dob.trim()).getTime());
};

export const sanitizeString = (value: string): string => value.trim();

export const sanitizeData = (row: CampaignCsvRowType): CampaignCsvRowType => {
  return {
    email: sanitizeString(row.email),
    name: sanitizeString(row["name"]),
    phone: sanitizeString(row.phone || ""),
  };
};
