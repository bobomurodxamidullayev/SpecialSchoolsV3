import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { BookOpen, Target, Lightbulb, History, Users, Globe } from "lucide-react";

export default function About() {
  const { t, tRaw } = useLanguage();

  const philosophyItems = [
    { icon: BookOpen, key: "academicRigor" },
    { icon: Users, key: "collaborative" },
    { icon: Globe, key: "global" },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-sidebar-primary py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary via-[#0F172A] to-[#0A0F24] opacity-90" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-serif mb-6">{t("nav.about")}</h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
              {t("about.heroSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card p-10 rounded-2xl border border-border shadow-lg"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-serif mb-4">{t("about.missionTitle")}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">{t("about.missionDesc")}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card p-10 rounded-2xl border border-border shadow-lg"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <Lightbulb className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-3xl font-bold font-serif mb-4">{t("about.visionTitle")}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">{t("about.visionDesc")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Educational Philosophy */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">{t("about.philosophyLabel")}</h2>
            <h3 className="text-3xl md:text-5xl font-bold font-serif text-foreground">{t("about.philosophyTitle")}</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {philosophyItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-background border border-border shadow-sm flex items-center justify-center mb-6">
                  <item.icon className="h-10 w-10 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">{t(`about.${item.key}.title`)}</h4>
                <p className="text-muted-foreground">{t(`about.${item.key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">{t("about.historyLabel")}</h2>
            <h3 className="text-3xl md:text-5xl font-bold font-serif text-foreground">{t("about.historyTitle")}</h3>
          </div>

          <div className="max-w-4xl mx-auto relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {((tRaw("about.timeline") as Array<{ year: string; title: string; desc: string }>) ?? []).map((item, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <History className="w-4 h-4" />
                </div>
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-card border border-border shadow-sm"
                >
                  <div className="text-primary font-bold text-xl mb-1 font-serif">{item.year}</div>
                  <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
