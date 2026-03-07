import { NicheLandingPage, NichePageData } from '@/components/landing/NicheLandingPage'

const solarData: NichePageData = {
  nicheSlug: 'solar',
  nicheLabel: 'FOR SOLAR INSTALLERS',
  headline: 'Your chatbot is making warranty promises you can\u2019t keep.',
  subhead:
    'Solar buyers ask specific questions. Generic AI invents the answers. EasyAsk only speaks from the docs you upload \u2014 so every claim it makes is one you actually stand behind.',
  problems: [
    'Generic chatbots confidently fabricate warranty terms, coverage periods, and exclusions your manufacturer never wrote.',
    'A buyer asks about the federal tax credit. Your chatbot invents a number. The buyer shows up to a consultation quoting something you never said.',
    'Meanwhile, the competitor with accurate answers on their site gets the call \u2014 and you never find out why you lost.',
  ],
  howItWorks: [
    {
      heading: 'Upload your solar docs',
      body: 'Panel specs, warranty docs, incentive guides, financing options. EasyAsk reads them in minutes.',
    },
    {
      heading: 'Paste one embed code',
      body: 'Your AI sales assistant goes live. No dev team, no integrations, no waiting.',
    },
    {
      heading: 'Buyers get instant answers',
      body: 'Accurate responses from your actual documents, 24/7, while you\u2019re on the roof.',
    },
  ],
  chatDemo: {
    badLabel: 'Generic Chatbot',
    badQuestion: 'Is the SunPower 25-year warranty transferable if I sell my house?',
    badAnswer:
      'Yes! SunPower warranties are fully transferable to new homeowners at no cost. Simply contact SunPower with the new owner\u2019s details within 30 days of sale.',
    badFlag: 'Fabricated \u2014 SunPower transfer terms vary by product line',
    goodQuestion: 'Is the SunPower 25-year warranty transferable if I sell my house?',
    goodAnswer:
      'Based on the warranty documents you\u2019ve uploaded, the SunPower Maxeon panel warranty is transferable. I\u2019d recommend confirming the specific transfer process with your installer. Want me to connect you with the team?',
  },
  socialProof: {
    stat: '$25,000',
    context:
      'That\u2019s the average residential solar sale. Buyers spend weeks comparing warranties, incentives, and output guarantees. When a chatbot confidently makes something up, the next call they make is to your competitor.',
  },
  ctaText: 'See EasyAsk Answer a Solar Question',
  heroMicrocopy: 'No credit card required \u00b7 Live on your site in one afternoon',
  finalMicrocopy: 'See how EasyAsk handles a warranty question \u2014 live.',
  faqHeading: 'Questions solar installers ask us.',
  faqItems: [
    {
      question: 'What if a buyer asks something our docs don\u2019t cover?',
      answer:
        'EasyAsk says it doesn\u2019t know \u2014 then captures their email and question so your team can follow up. It doesn\u2019t guess. Your reputation doesn\u2019t get attached to a fabricated answer.',
    },
    {
      question: 'How does it stay current on incentives and tax credits?',
      answer:
        'It answers from whatever you upload. Keep your incentive guide current and the AI stays current. Update the doc once and the widget reflects it immediately.',
    },
    {
      question: 'Our sales reps handle consultations. Do we actually need this?',
      answer:
        'Your reps can\u2019t be everywhere. Most buyers research on nights and weekends \u2014 60% of web traffic is mobile, outside business hours. EasyAsk handles those questions before anyone picks up the phone.',
    },
    {
      question: 'What if it mentions a competitor\u2019s panels?',
      answer:
        'EasyAsk only answers from the documents you provide. It won\u2019t speak to what it doesn\u2019t know, and it won\u2019t wander outside your content.',
    },
    {
      question: 'How long does setup take?',
      answer:
        'One afternoon. Scrape your site, upload your docs, paste one embed code. Most solar companies go live before lunch.',
    },
  ],
}

export default function ForSolarPage() {
  return <NicheLandingPage data={solarData} />
}
