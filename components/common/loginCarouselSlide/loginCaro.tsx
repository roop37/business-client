import { useEffect, useState } from "react";

const CarouselSlide = ({
  image,
  title,
  description,
  isActive,
}: {
  image: string;
  title: string;
  description: string;
  isActive: boolean;
}) => (
  <div
    className={`absolute w-full h-full transition-opacity duration-500 ${
      isActive ? "opacity-100" : "opacity-0"
    }`}
  >
    <div className="flex flex-col items-center justify-center h-full px-3 bg-gray-900 text-white">
      <div className="w-full  flex flex-col items-center gap-6">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover rounded-xl mb-2"
        />
        <div className="w-full max-w-lg">
          <h2 className="text-2xl font-medium mb-3">{title}</h2>
          <p className="text-md text-neutral-300">{description}</p>
        </div>
      </div>
    </div>
  </div>
);

const LoginCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "HOIZR",
      description:
        "Hoizr helps hosts, venues, and event teams manage onboarding, operations, payments, and growth.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Sales Insights",
      description:
        "Track your host's performance with detailed analytics and insights to make data-driven decisions.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Menu Management",
      description:
        "Easily manage your menu items, prices, and availability all in one place.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Customer Experience",
      description:
        "Enhance your customer experience with our integrated feedback and loyalty programs.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-blackBg">
      {slides.map((slide, index) => (
        <CarouselSlide
          key={index}
          {...slide}
          isActive={currentSlide === index}
        />
      ))}

      <div className="absolute bottom-8 left-1/2 -translate-x flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginCarousel;
