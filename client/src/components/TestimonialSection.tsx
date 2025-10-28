interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

interface TestimonialSectionProps {
  testimonials?: Testimonial[];
}

export default function TestimonialSection({ testimonials }: TestimonialSectionProps) {
  // Default testimonials with emphasized text using <strong> tags
  const defaultTestimonials: Testimonial[] = [
    {
      quote: "Xtock helped us predict demand accurately and quickly. We were able to reduce overordering and cut food costs by 62%.",
      name: "Derk",
      role: "Head Chef"
    },
    {
      quote: "The interface is simple and intuitive. It's been a game-changer for managing our daily inventory needs without the usual stress.",
      name: "Sarah",
      role: "Restaurant Manager"
    },
    {
      quote: "We've been using Xtock for three months, and it's transformed our ordering process. We reduced our food waste by 35% and saved thousands.",
      name: "Michael",
      role: "Operations Director"
    },
    {
      quote: "What I love most is how fast it is. I used to spend hours on orders—now it takes minutes, and the predictions are spot-on.",
      name: "Lisa",
      role: "Kitchen Manager"
    }
  ];

  const displayTestimonials = testimonials || defaultTestimonials;

  // Function to bold key phrases in quotes
  const formatQuote = (quote: string) => {
    const boldPhrases = [
      "fast",
      "by 62%",
      "by 35%",
      "simple and intuitive",
      "reduced our food waste by 35%",
      "reduced overordering and cut food costs by 62%",
      "game-changer",
      "spot-on"
    ];

    let formattedQuote = quote;
    boldPhrases.forEach(phrase => {
      const regex = new RegExp(`(${phrase})`, 'gi');
      formattedQuote = formattedQuote.replace(regex, '<strong>$1</strong>');
    });

    return formattedQuote;
  };

  return (
    <section className="px-4 py-16 max-w-7xl mx-auto">
      {/* Main Header */}
      <div className="text-center mb-4">
        <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-2">
          Real stories.{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Real impact.</span>
            {/* Hand-drawn circle effect using SVG */}
            <svg
              className="absolute -inset-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)]"
              viewBox="0 0 200 60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="100"
                cy="30"
                rx="95"
                ry="25"
                fill="none"
                stroke="#52B788"
                strokeWidth="3"
                className="opacity-70"
                style={{
                  transform: 'rotate(-2deg)',
                  transformOrigin: 'center'
                }}
              />
            </svg>
          </span>
        </h2>
      </div>

      {/* Sub-header */}
      <p className="text-center text-charcoal/70 text-lg mb-12 max-w-3xl mx-auto">
        Trusted by chefs, managers, and operators across the hospitality industry — here's what they have to say.
      </p>

      {/* Testimonial Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {displayTestimonials.map((testimonial, index) => (
          <div
            key={index}
            className="border-l-4 border-growth-green/30 pl-6 py-2"
          >
            {/* Quote */}
            <p
              className="text-charcoal text-lg mb-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatQuote(testimonial.quote) }}
            />

            {/* Attribution */}
            <div className="text-growth-green text-sm font-medium">
              {testimonial.name}, {testimonial.role}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
