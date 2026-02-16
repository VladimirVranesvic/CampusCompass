const faqs = [
  {
    question: "How do I apply via UAC?",
    answer:
      "Start by creating your UAC account, then choose your courses and submit your application before the deadline. Double-check required documents and keep track of important dates.",
  },
  {
    question: "What support can I access as a new student?",
    answer:
      "Most unis offer orientation, peer mentors, and support services. You'll also find help with finances, mental health, and academics to help you settle in.",
  },
  {
    question: "How can I plan my trip to campus?",
    answer:
      "Use our planner to compare travel times, costs, and transport options. Many students use Opal cards for discounts, and some campuses offer shuttles or parking.",
  },
  {
    question: "Is there help for rent or living costs?",
    answer:
      "You might qualify for Youth Allowance, ABSTUDY, or rent assistance. Check your eligibility and explore shared housing to manage expenses. Our tools can help you budget.",
  },
  {
    question: "How do I stay on top of deadlines?",
    answer:
      "Set reminders for UAC offers, scholarships, and enrolment. Our checklist helps you keep track so you never miss a key date.",
  },
  {
    question: "Where can I find scholarships or grants?",
    answer:
      "Search for scholarships by your background, interests, or study area. Apply early and to as many as you can—there's more out there than you think.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="bg-sage py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            FAQs for your
            <br />
            uni journey
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Get straightforward answers to your top questions about applying, settling in, and
            thriving at uni. We're here to make your transition smoother and less stressful.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {faqs.map((faq) => (
            <div key={faq.question} className="border-l-2 border-border pl-6">
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
