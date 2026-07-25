'use client';

import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function Hero() {
  const slides = [
    {
      title: "Fund Your Innovative Ideas",
      description: "Turn creative visions into reality with the support of a global community. Discover groundbreaking projects today.",
      gradient: "from-blue-700 via-indigo-700 to-purple-800",
      tag: "INNOVATION & CREATIVITY",
      badgeIcon: "🚀",
    },
    {
      title: "Join a Community of Creators",
      description: "Connect directly with passionate supporters. Share your story, raise credits, and launch your next big venture.",
      gradient: "from-emerald-700 via-teal-700 to-cyan-800",
      tag: "GLOBAL COMMUNITY",
      badgeIcon: "🌟",
    },
    {
      title: "Help Projects Come to Life",
      description: "Every credit backed brings a dream closer to reality. Explore top-rated campaigns and empower creators worldwide.",
      gradient: "from-purple-700 via-pink-700 to-rose-800",
      tag: "BACK REAL IMPACT",
      badgeIcon: "💡",
    },
  ];

  return (
    <section className="w-full relative overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        className="w-full min-h-[480px] sm:min-h-[540px] md:min-h-[600px]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className={`w-full min-h-[480px] sm:min-h-[540px] md:min-h-[600px] bg-gradient-to-r ${slide.gradient} text-white flex items-center justify-center px-6 py-16 sm:px-12 relative`}>
              <div className="max-w-4xl text-center z-10 space-y-6">
                <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs sm:text-sm font-semibold tracking-wider uppercase border border-white/20">
                  <span>{slide.badgeIcon}</span>
                  <span>{slide.tag}</span>
                </span>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                  {slide.title}
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  {slide.description}
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="#top-campaigns"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
                  >
                    Explore Campaigns
                  </Link>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-transparent border-2 border-white/80 text-white font-bold hover:bg-white/10 transition text-center"
                  >
                    Start a Campaign
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
