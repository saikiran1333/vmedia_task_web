import { listCategories } from "@/features/catalog/application/get-catalog";
import { SiteFooter, SiteHeader } from "@/features/site/presentation/site-chrome";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const categories = await listCategories();
  const items = categories.status === "ready" ? categories.data : [];
  return (
    <div className="tg-site">
      <a className="tg-skip" href="#content">
        Skip to content
      </a>
      <SiteHeader categories={items} />
      <main id="content">{children}</main>
      <SiteFooter categories={items} />
    </div>
  );
}
