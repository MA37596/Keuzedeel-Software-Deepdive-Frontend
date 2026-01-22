import { motion } from "framer-motion";
import { Download, UserPlus, Sparkles } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Download,
    title: "Download de App",
    description: "Beschikbaar voor iOS en Android. Helemaal gratis, geen verborgen kosten.",
  },
  {
    step: "02",
    icon: UserPlus,
    title: "Maak op school een profiel",
    description: "Vertel ons een beetje over jezelf zodat we je beter kunnen helpen. ",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Start je Reis",
    description: "Ontdek oefeningen, meditaties en tools die passen bij jouw behoeften.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="hoe-het-werkt" className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Hoe het werkt
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 mb-4">
            Begin in 3 simpele stappen
          </h2>
          <p className="text-muted-foreground text-lg">
            Binnen een paar minuten heb je toegang tot alle tools die je nodig hebt.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              {/* Step number */}
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-muted relative mb-6 group">
                <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-cta flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {step.step}
                </span>
                <step.icon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>

              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
