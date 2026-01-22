import { motion } from "framer-motion";
import { Brain, Heart, Calendar, MessageCircle, Target, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Stressmanagement",
    description: "Leer omgaan met toetsstress, deadlines en prestatiedruk met bewezen technieken.",
  },
  {
    icon: Heart,
    title: "Emotieregulatie",
    description: "Ontdek je gevoelens en leer hoe je ermee om kunt gaan op een gezonde manier.",
  },
  {
    icon: Calendar,
    title: "Dagelijkse Check-ins",
    description: "Volg je stemming en energieniveau. Begrijp patronen in hoe je je voelt.",
  },
  {
    icon: MessageCircle,
    title: "Anonieme Ondersteuning",
    description: "Chat met getrainde vrijwilligers wanneer je behoefte hebt aan een luisterend oor.",
  },
  {
    icon: Target,
    title: "Doelen Stellen",
    description: "Zet kleine, haalbare doelen en vier je successen, groot en klein.",
  },
  {
    icon: Shield,
    title: "Veilig & Privé",
    description: "Jouw gegevens zijn vertrouwelijk. Niemand anders kan zien wat jij deelt.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="functies" className="py-20 md:py-28 bg-card relative">
      <div className="absolute inset-0 bg-gradient-card" />
      
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
            Functies
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 mb-4">
            Alles wat je nodig hebt voor jouw welzijn
          </h2>
          <p className="text-muted-foreground text-lg">
            ma-fit biedt praktische tools en ondersteuning, speciaal ontworpen voor de uitdagingen die jij als scholier tegenkomt.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 md:p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-cta flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
