"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useI18n } from "./i18n/context"
import { Card } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Home() {
  const { t } = useI18n()

  interface FAQ {
    q: string;
    a: string;
  }

  const faqs = (t('home.faq.items') as unknown) as FAQ[]

  const testimonials = [
    {
      name: t('home.testimonials.host.name'),
      role: t('home.testimonials.host.role'),
      avatar: "/avatars/host.png",
      content: t('home.testimonials.host.content')
    },
    {
      name: t('home.testimonials.professor.name'),
      role: t('home.testimonials.professor.role'),
      avatar: "/avatars/professor.png",
      content: t('home.testimonials.professor.content')
    },
    {
      name: t('home.testimonials.creator.name'),
      role: t('home.testimonials.creator.role'),
      avatar: "/avatars/creator.png",
      content: t('home.testimonials.creator.content')
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t('home.title')}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          {t('home.description')}
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg" variant="default">
            <Link href="/prompter">{t('home.getStarted')}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/history">{t('home.openRecent')}</Link>
          </Button>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-semibold text-center mb-12">
          {t('home.features.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title={t('home.features.easyEditing')} 
            description={t('home.features.smooth')} 
          />
          <FeatureCard 
            title={t('home.features.fullControl')} 
            description={t('home.features.speed')} 
          />
          <FeatureCard 
            title={t('home.features.mirror')} 
            description={t('home.features.remote')} 
          />
          <FeatureCard 
            title={t('home.features.fontSize')} 
            description={t('home.features.smooth')} 
          />
          <FeatureCard 
            title={t('home.features.history')} 
            description={t('home.features.speed')} 
          />
          <FeatureCard 
            title={t('home.features.crossDevice')} 
            description={t('home.features.remote')} 
          />
        </div>
      </div>

      {/* FAQ部分 */}
      <div className="mt-24">
        <h2 className="text-3xl font-semibold text-center mb-12">
          {t('home.faq.title')}
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq: FAQ, index: number) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* 用户评价部分 */}
      <div className="mt-24 mb-16">
        <h2 className="text-3xl font-semibold text-center mb-12">
          {t('home.testimonials.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-muted-foreground">{testimonial.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-medium mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  )
}

