import GridLines from "@/components/marketing/ui/Gridlines";
import Hero from "@/components/marketing/home/Hero";
import Walkthrough from "@/components/marketing/home/Walkthrough";
import Introduction from "@/components/marketing/home/Introduction";
import FeaturedProjects from "@/components/marketing/home/FeaturedProjects";
import Services from "@/components/marketing/home/Services";
import Process from "@/components/marketing/home/Process";
import Testimonials from "@/components/marketing/home/Testimonials";
import Team from "@/components/marketing/home/Team";
import CalltoAction from "@/components/marketing/home/CalltoAction";

export const revalidate = 60; // refresh portfolio data every 60s without a redeploy

export default function Home() {
  return (
    <>
      <GridLines />
      <Hero />
      <Introduction />
      <Walkthrough />
      <FeaturedProjects />
      <Services />
      <Process />
      <Testimonials />
      {/* <Team /> */}
      <CalltoAction />
    </>
  );
}
