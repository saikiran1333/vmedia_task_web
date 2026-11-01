export type EnquiryReceipt = {
  id: string;
  enquiryNumber: string;
  status: string;
  source: string;
  units: number;
  createdAt: string;
};

export type EnquiryListItem = {
  id: string;
  enquiryNumber: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  companyName: string | null;
  units: number;
  occasion: string;
  occasionName: string | null;
  budget: string;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
};

export type EnquiryItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number | null;
};

export type EnquiryDetail = EnquiryListItem & {
  deliveryDate: string | null;
  message: string;
  customisationRequirements: string | null;
  customisationOptions: string[];
  items: EnquiryItem[];
  statusEvents: { fromStatus: string | null; toStatus: string; createdAt: string }[];
};

export type EnquiryListPage = {
  items: EnquiryListItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type AdminProfile = {
  id: string;
  email: string;
  name: string;
};

export type StatusCounts = {
  total: number;
  NEW: number;
  CONTACTED: number;
  CONVERTED: number;
  LOST: number;
};
