import Hero from "@/components/ui/user/Hero";
import NavBar from "../components/ui/NavBar";
import Services from "@/components/ui/user/Services";
import Advocates from "@/components/ui/user/Advocates";
import AdvocateRegistration from "@/components/ui/user/AdvocateRegistration";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="">
      <NavBar />
      <Hero />
      <Services />
      <Advocates />
      <AdvocateRegistration />
      <Footer />
    </div>
  );
};

export default Home;
