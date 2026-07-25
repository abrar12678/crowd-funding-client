'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Supporter",
      photo: "https://picsum.photos/seed/sarah/150/150",
      quote: "This platform made it so easy to support causes I care about! The credit system feels smooth and rewarding.",
    },
    {
      name: "David Kim",
      role: "Creator",
      photo: "https://picsum.photos/seed/david/150/150",
      quote: "We raised our seed goal in just 10 days. The community feedback and supporter engagement exceeded all expectations!",
    },
    {
      name: "Amara Oke",
      role: "Supporter & Backer",
      photo: "https://picsum.photos/seed/amara/150/150",
      quote: "Watching projects evolve from ideas into real products has been amazing. Highly recommended for all tech enthusiasts.",
    },
  ];

  return (
    <section className="py-16 bg-gray-100 dark:bg-gray-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            What Our Users Say
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hear directly from creators and supporters who bring ideas to life on FundVerse.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="pb-12"
          >
            {testimonials.map((testimonial, idx) => (
              <SwiperSlide key={idx}>
                <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 text-center flex flex-col items-center space-y-6">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500 shadow-md"
                  />
                  <blockquote className="text-lg sm:text-xl italic text-gray-700 dark:text-gray-300 max-w-2xl">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {testimonial.role}
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
