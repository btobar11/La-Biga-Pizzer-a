import ReservationSection from "@/components/ReservationSection";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col bg-coal text-white selection:bg-gold selection:text-coal">
            <Header />
            <Hero />
            <Identity />
            <Menu />
            <Contact />
            <ReservationSection />
            <Footer />
            <CartButton />
        </main>
    );
}
