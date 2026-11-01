import { AdminRepositoryImpl } from "@/features/admin/data/admin-repository-impl";
import { CatalogRepositoryImpl } from "@/features/catalog/data/catalog-repository-impl";
import { EnquiryRepositoryImpl } from "@/features/enquiries/data/enquiry-repository-impl";
import { HealthRepositoryImpl } from "@/features/health/data/health-repository-impl";
import { HelloRepositoryImpl } from "@/features/hello/data/hello-repository-impl";

export const helloRepository = new HelloRepositoryImpl();
export const healthRepository = new HealthRepositoryImpl();
export const catalogRepository = new CatalogRepositoryImpl();
export const enquiryRepository = new EnquiryRepositoryImpl();
export const adminRepository = new AdminRepositoryImpl();
