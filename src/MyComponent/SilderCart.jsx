import React from 'react'
import { Row, Col } from 'antd';
import Img1 from '../images/testimonials/1.png'
import Img2 from '../images/testimonials/2.png'
import Img3 from '../images/testimonials/3.png'
import imgIcon from '../images/test-user-icon.jpg'
// Import Slider from 'react-slick'
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


function SilderCart() {
  const testimonials = [
    {
      name: "Sherry W.",
      date: "November 17, 2022",
      comment: "What a wonderful, heartfelt gentleman who has a special talent. His work is spectacular and his customer service is top notch."
    },
    {
      name: "Jacob D.",
      date: "April 29, 2023",
      comment: "Love what we got, putting it up on our wall was the FIRST thing we did when getting home. Definitely will recommend to anyone who will listen"
    },
    {
      name: "Chris W.",
      date: "May 24, 2024",
      comment: "Best ever place for name signs"
    },
    {
      name: "Yvonne W.",
      date: "January 22, 2022",
      comment: "Fantastic photography-bound to enjoy it for years to come!"
    },
    {
      name: "Mike & Kay P.",
      date: "12/22/2022",
      comment: "Wonderful art and shopping experience this past Sat getting ready for Christmas. Ending up spending probably 2 hrs there attempting to find the perfect gift and absolutely love what was decided on l."
    },
    {
      name: "Marina W.",
      date: null,
      comment: "Been buying for years great quality and great products...."
    },
    {
      name: "Shelly B.",
      date: null,
      comment: "The quality of the photographs is amazing. I had a very difficult time choosing which ones I wanted, but with Craig's suggestions I ended up with several pieces that I absolutely love..."
    },
    {
      name: "Carrie K.",
      date: "6/6/2021",
      comment: "...beautiful artwork! We bought a piece that will perfectly fit into our home. Everything was perfect! If I could give it 10 stars I would."
    },
    {
      name: "Stephanie W.",
      date: "5/29/2021",
      comment: "This was the best experience. We will definitely buy more things here."
    },
    {
      name: "Kristy L.",
      date: "5/29/2021",
      comment: "Absolutely beautiful work!! Craig was super friendly!! It's all original work which makes it all better!"
    }
  ];
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    gaps: 20,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 992,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 }
      }
    ]
  };
  return (
    <div>
      <section className="silder-card">
        <div className="container">
          <h2>Testimonials</h2>
          <Slider {...settings}>
            {testimonials.map((testimonial, index) => (
              <div className="item" key={index}>
                <div className="testimonals">
                  <p className='paraphap'>{testimonial.comment}</p>
                  <div className="main-profiles">
                    <img src={imgIcon} alt={testimonial.name} />
                    <ul>
                      <li className='testimonals-yellow'>{testimonial.name}</li>
                      <li className='testimonals-yellow-1'>{testimonial.date}</li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>
    </div>
  )
}

export default SilderCart
