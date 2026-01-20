import Hero from "@/components/Hero";
import Identity from "@/components/Identity";
import Menu from "@/components/Menu";
import Footer from "@/components/Footer";
import CartButton from "@/components/CartButton";
import Header from "@/components/Header";
import Contact from "@/components/Contact";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col bg-coal text-white selection:bg-gold selection:text-coal">
            <Header />
            <Hero />
            <Identity />
            <Menu />
            <Contact />
            <Footer />
            <CartButton />
        </main>
    );
}
