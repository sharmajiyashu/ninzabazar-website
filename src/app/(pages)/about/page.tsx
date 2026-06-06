import React from 'react'
import Image from 'next/image'
import circlebg from '../../../../public/circlebg.png'
import aboutImg from '../../../../public/about-page.jpg'
import aboutmap from '../../../../public/about-shipping.png'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const page = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-x-hidden overflow-y-hidden">
      {/* right side bg */}
      <div className="hidden md:block absolute -top-[-50px] -right-45 bg-no-repeat bg-cover md:bg-cover overflow-hidden">
        <Image src={circlebg} alt="bg" height={500} width={500} />
      </div>
      {/* mobile */}
      <div className="block md:hidden absolute -top-20 -right-30 bg-no-repeat bg-cover md:bg-cover overflow-hidden">
        <Image src={circlebg} alt="bg" height={230} width={230} />
      </div>

      {/* main content */}
      <div className="flex flex-col min-h-screen max-w-full my-14 md:my-32 px-4 md:px-12 lg:px-20  gap-10 md:gap-45 overflow-x-hidden overflow-y-hidden">
        <div className="flex flex-col md:flex-row max-w-full gap-y-10 md:gap-x-10 lg:gap-x-70 overflow-x-hidden overflow-y-hidden">
          <div className="w-full md:w-[40rem] flex flex-col gap-4 md:gap-10">
            <h1 className="text-3xl md:text-4xl font-bold">ABOUT US</h1>
            <p className="text-base md:text-xl">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corrupti
              nulla ad dolores. Laudantium quas aperiam recusandae corrupti
              accusantium, doloribus deserunt aspernatur iusto repudiandae
              architecto in autem laboriosam pariatur blanditiis quos. Lorem
              ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
              asperiores nesciunt natus ex dolores quidem, provident sed ullam
              voluptates error consequuntur soluta modi voluptas iure ea
              necessitatibus dolorem quo aut!
            </p>
          </div>
          <Image
            src={aboutImg}
            alt="about-page"
            width={500}
            height={100}
            className="rounded-3xl z-1 w-full md:w-auto"
          />
        </div>
        <div className="flex flex-col md:flex-row max-w-full justify-between gap-y-10 md:gap-y-0">
          <Image
            src={aboutImg}
            alt="about-page"
            width={500}
            height={100}
            className="rounded-3xl z-1 w-full md:w-auto hidden md:block"
          />
          {/* left side circle bg */}
          <div className="absolute -top-[-550px] left-[-200px] bg-no-repeat bg-cover md:bg-cover hidden md:block">
            <Image src={circlebg} alt="bg" width={500} height={500} />
          </div>
          <div className="w-full md:w-[40rem] flex flex-col gap-4 md:gap-10">
            <h1 className="text-2xl md:text-4xl font-bold">HOW WE WORK</h1>
            <p className="text-base md:text-xl">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corrupti
              nulla ad dolores. Laudantium quas aperiam recusandae corrupti
              accusantium, doloribus deserunt aspernatur iusto repudiandae
              architecto in autem laboriosam pariatur blanditiis quos. Lorem
              ipsum dolor sit amet consectetur, adipisicing elit. Adipisci
              asperiores nesciunt natus ex dolores quidem, provident sed ullam
              voluptates error consequuntur soluta modi voluptas iure ea
              necessitatibus dolorem quo aut!
            </p>
          </div>
          <Image
            src={aboutImg}
            alt="about-page"
            width={500}
            height={100}
            className="rounded-3xl z-1 w-full md:w-auto block md:hidden"
          />
        </div>
        <div className="bg-[#007350] h-auto md:h-[40rem] w-full">
          <div className="flex flex-col justify-center items-center h-full gap-10 md:gap-20 py-10 md:py-0">
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              We Ship Worldwide
            </h1>
            <Image
              src={aboutmap}
              alt="map"
              height={800}
              width={800}
              className="w-full md:w-auto"
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 md:gap-10">
          <h1 className="text-2xl md:text-4xl font-bold">
            General Questions and FAQs
          </h1>
          <div className="w-full md:w-[45rem]">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg md:text-xl hover:text-green transition-colors hover:no-underline">
                  Is it accessible?
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-lg font-light">
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg md:text-xl hover:text-green transition-colors hover:no-underline">
                  Is it accessible?
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-lg font-light">
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg md:text-xl hover:text-green transition-colors hover:no-underline">
                  Is it accessible?
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-lg font-light">
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg md:text-xl hover:text-green transition-colors hover:no-underline">
                  Is it accessible?
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-lg font-light">
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg md:text-xl hover:text-green transition-colors hover:no-underline">
                  Is it accessible?
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-lg font-light">
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 md:gap-10">
          <div className="block md:hidden absolute -bottom-20 -left-30 bg-no-repeat bg-cover md:bg-cover overflow-hidden -z-10">
            <Image src={circlebg} alt="bg" height={300} width={300} />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold">Contact Us</h1>
          <div className="flex flex-col md:flex-row gap-4 md:gap-10 w-full justify-center text-white">
            <div className="bg-[#007350] w-full md:w-82 h-auto md:h-40 p-4 px-6 rounded-lg">
              <h1 className="text-xl md:text-3xl font-bold">Jane Doe</h1>
              <div className="mt-4 md:mt-8">
                <p className="text-base md:text-lg">+0 123 456 789</p>
                <p className="text-base md:text-lg">janedoe@example.com</p>
              </div>
            </div>
            <div className="bg-[#007350] w-full md:w-82 h-auto md:h-40 p-4 px-6 rounded-lg">
              <h1 className="text-xl md:text-3xl font-bold">Jane Doe</h1>
              <div className="mt-4 md:mt-8">
                <p className="text-base md:text-lg">+0 123 456 789</p>
                <p className="text-base md:text-lg">janedoe@example.com</p>
              </div>
            </div>
            <div className="bg-[#007350] w-full md:w-82 h-auto md:h-40 p-4 px-6 rounded-lg">
              <h1 className="text-xl md:text-3xl font-bold">Jane Doe</h1>
              <div className="mt-4 md:mt-8">
                <p className="text-base md:text-lg">+0 123 456 789</p>
                <p className="text-base md:text-lg">janedoe@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
