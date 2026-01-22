import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Emma, 16 jaar",
    school: "AV3C",
    content: "Ik had zoveel last van toetsstress dat ik niet meer kon slapen. De app hielp me met rustig worden en meer slaap behalen.",
    rating: 5,
  },
  {
    name: "Thomas, 17 jaar",
    school: "SD4B",
    content: "Het is fijn dat je anoniem kunt praten. Soms wil je gewoon even kwijt hoe je je voelt zonder dat iedereen het weet.",
    rating: 5,
  },
  {
    name: "Sophie, 17 jaar",
    school: "MV4A",
    content: "De dagelijkse check-ins helpen me om beter te begrijpen wanneer ik me goed voel en wanneer niet. Heel waardevol!",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="ervaringen" className="py-20 md:py-28 bg-muted relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Ervaringen
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-3 mb-4">
            Wat scholieren zeggen
          </h2>
          <p className="text-muted-foreground text-lg">
            Ontdek hoe Ma-fit andere scholieren heeft geholpen.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 md:p-8 shadow-card relative"
            >
              {/* Quote icon */}
              <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent" />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.school}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
