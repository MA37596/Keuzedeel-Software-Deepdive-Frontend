import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6">
            Klaar om je welzijn voorop te zetten?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Download ma-fit vandaag nog en ontdek hoeveel beter je je kunt voelen. 
            100% gratis, 100% veilig, 100% voor jou.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero-outline" size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-none">
              <Download className="w-5 h-5" />
              Download voor iOS
            </Button>
            <Button variant="hero-outline" size="lg">
              <Download className="w-5 h-5" />
              Download voor Android
            </Button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-primary-foreground/60 text-sm"
          >
            Geen registratie nodig om te beginnen • Alle functies gratis
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
