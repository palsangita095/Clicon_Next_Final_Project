"use client";

import HeroBanner from "@/components/store/home/HeroBanner";
import FeaturesBar from "@/components/store/home/FeaturesBar";
import BestDeals from "@/components/store/home/BestDeals";
import ShopByCategory from "@/components/store/home/ShopByCategory";
import FeaturedProducts from "@/components/store/home/FeaturedProducts";
import PromoBanners from "@/components/store/home/PromoBanners";
import ComputerAccessories from "@/components/store/home/ComputerAccessories";
import MacbookPromo from "@/components/store/home/MacbookPromo";
import FlashSale from "@/components/store/home/FlashSale";
import LatestNews from "@/components/store/home/LatestNews";

const Home = () => {
  return (
    <div className="bg-white">
      <HeroBanner />
      <FeaturesBar />
      <BestDeals />
      <ShopByCategory />
      <FeaturedProducts />
      <PromoBanners />
      <ComputerAccessories />
      <MacbookPromo />
      <FlashSale />
      <LatestNews />
    </div>
  );
};

export default Home;
