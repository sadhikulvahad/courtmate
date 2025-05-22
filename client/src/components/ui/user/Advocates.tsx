import React, { useRef } from "react";
import { advocateData } from "./datas/advocateData";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const Advocates: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 300;

      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="py-16 bg-white px-4 md:px-10 lg:px-28 mx-auto">
      <div className="text-2xl font-poppins font-bold flex justify-center items-center text-gray-800" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.25)' }}>
        <span>TOP RATED ADVOCATES</span>
      </div>

      <div className="mt-10">
        <div className="relative">
          {/* Scroll Controls */}
          {/* <button
            onClick={() => scroll("left")}
            className="absolute left-0 z-10 flex items-center justify-center w-10 h-10 -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 z-10 flex items-center justify-center w-10 h-10 -translate-y-1/2 bg-white rounded-full shadow-md top-1/2 hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button> */}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 pb-4 overflow-x-auto scrollbar-hide snap-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {advocateData.map((advocate, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full max-w-xs snap-start md:max-w-sm"
              >
                <div className="overflow-hidden bg-white rounded-lg shadow-md">
                  <div className="h-48 overflow-hidden bg-gray-200">
                    <img
                      src={advocate.image}
                      alt={advocate.name}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="mb-1 text-xl font-bold">{advocate.name}</h3>
                    <p className="mb-2 text-sm text-gray-600">
                      {advocate.specialty}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{advocate.rating}</span>
                        <span className="text-sm text-gray-500">
                          ({advocate.reviewCount} reviews)
                        </span>
                      </div>

                      <div className="flex items-center px-3 py-1 text-white bg-gray-900 rounded-full">
                        ${advocate.hourlyRate}
                      </div>
                    </div>

                    <button className="w-full py-2 mt-4 text-center text-white transition-colors bg-gray-800 rounded hover:bg-gray-700">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advocates;
