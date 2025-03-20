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
import { Presentation, Video, GraduationCap, Languages, Mic2, Radio, MessageSquare } from "lucide-react"
import Image from "next/image"
import { Comments } from "./components/comments/comments"

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
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=host",
      content: t('home.testimonials.host.content')
    },
    {
      name: t('home.testimonials.professor.name'),
      role: t('home.testimonials.professor.role'),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=professor",
      content: t('home.testimonials.professor.content')
    },
    {
      name: t('home.testimonials.creator.name'),
      role: t('home.testimonials.creator.role'),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creator",
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

      {/* 使用场景部分 */}
      <div className="mt-20">
        <h2 className="text-3xl font-semibold text-center mb-12">
          {t('home.useCases.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UseCaseCard 
            icon={<Presentation className="h-16 w-16 text-primary" />}
            title={t('home.useCases.speech.title')} 
            description={t('home.useCases.speech.description')}
          />
          <UseCaseCard 
            icon={<Video className="h-16 w-16 text-primary" />}
            title={t('home.useCases.video.title')} 
            description={t('home.useCases.video.description')}
          />
          <UseCaseCard 
            icon={<GraduationCap className="h-16 w-16 text-primary" />}
            title={t('home.useCases.education.title')} 
            description={t('home.useCases.education.description')}
          />
          <UseCaseCard 
            icon={<Languages className="h-16 w-16 text-primary" />}
            title={t('home.useCases.language.title')} 
            description={t('home.useCases.language.description')}
          />
          <UseCaseCard 
            icon={<Radio className="h-16 w-16 text-primary" />}
            title={t('home.useCases.live.title')} 
            description={t('home.useCases.live.description')}
          />
          <UseCaseCard 
            icon={<Mic2 className="h-16 w-16 text-primary" />}
            title={t('home.useCases.interview.title')} 
            description={t('home.useCases.interview.description')}
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
      <div className="mt-24">
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

      {/* 用户评论区 */}
      <div className="mt-24 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold">
            {t('home.comments.title')}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t('home.comments.description')}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-medium">{t('home.comments.latestComments')}</h3>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/comments">{t('home.comments.viewAll')}</Link>
              </Button>
            </div>
            <Comments />
          </Card>
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

function UseCaseCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all border-t-4 border-primary/10 group">
      <div className="pt-8 px-6 flex items-center justify-center">
        <div className="rounded-full bg-primary/10 p-6 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
          {icon}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-medium mb-3 text-center">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </Card>
  )
}

