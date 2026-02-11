import { getHomepage } from "@/lib/api";
import HeroBanner from "@/components/HeroBanner";
import CategoryRow from "@/components/CategoryRow";

import HistorySection from "@/components/HistorySection";

export default async function HomePage() {
  let bannerItems: import("@/lib/api").BannerItem[] = [];
  let categories: { title: string; subjects: import("@/lib/api").Subject[] }[] = [];

  try {
    const homepage = await getHomepage();
    if (homepage.success && homepage.data?.operatingList) {
      for (const op of homepage.data.operatingList) {
        if (op.type === "BANNER" && op.banner?.items?.length) {
          bannerItems = op.banner.items;
        }
        if (
          (op.type === "SUBJECTS_MOVIE" || op.type === "SUBJECTS_TV") &&
          op.subjects?.length > 0
        ) {
          categories.push({ title: op.title, subjects: op.subjects });
        }
      }
    }
  } catch (err) {
    console.error("Homepage fetch error:", err);
  }

  return (
    <>
      {bannerItems.length > 0 && <HeroBanner items={bannerItems} />}
      <div className="categories-section">
        <HistorySection />
        {categories.map((cat, i) => (
          <CategoryRow key={`${cat.title}-${i}`} title={cat.title} subjects={cat.subjects} />
        ))}
      </div>
    </>
  );
}
