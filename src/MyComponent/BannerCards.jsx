import React from 'react';
import { Row, Col } from 'antd';

import Img1 from '../images/readywords/1.png';
import Img2 from '../images/readywords/2.png';
import Img3 from '../images/readywords/3.png';
import Img4 from '../images/readywords/4.png';
import Img5 from '../images/readywords/5.png';
import Img6 from '../images/readywords/6.png';
import Img7 from '../images/readywords/7.png';
import Img8 from '../images/readywords/8.png';
import Img9 from '../images/readywords/9.png';
import Img10 from '../images/readywords/10.png';
import Img11 from '../images/readywords/11.png';
import Img12 from '../images/readywords/12.png';

// 📦 Create an array of card data
const cards = [
  { img: Img1, title: 'Blessed 1', price: '$20.00' },
  { img: Img2, title: 'Blessed 2', price: '$22.00' },
  { img: Img3, title: 'Blessed 3', price: '$24.00' },
  { img: Img4, title: 'Blessed 4', price: '$21.00' },
  { img: Img5, title: 'Blessed 5', price: '$23.00' },
  { img: Img6, title: 'Blessed 6', price: '$25.00' },
  { img: Img7, title: 'Blessed 7', price: '$26.00' },
  { img: Img8, title: 'Blessed 8', price: '$19.00' },
  { img: Img9, title: 'Blessed 9', price: '$20.00' },
  { img: Img10, title: 'Blessed 10', price: '$28.00' },
  { img: Img11, title: 'Blessed 11', price: '$22.00' },
  { img: Img12, title: 'Blessed 12', price: '$29.00' },
];

function BannerCards() {
  return (
    <div>
      <section className='cards-moniter'>
        <div className="container" style={{ padding: 0 }}>
          <Row gutter={[50, 50]}>
            {cards.map((card, index) => (
              <Col key={index} xs={24} sm={8} md={8} lg={8} xl={8} xxl={8}>
                <a href="/">
                  <div className="looper-1">
                    <img src={card.img} alt={card.title} />
                    <ul>
                      <li><span>{card.title}</span></li>
                      <li>{card.price}</li>
                    </ul>
                  </div>
                </a>
              </Col>
            ))}
          </Row>

          <button className='card-button'>Load More</button>
        </div>
      </section>
    </div>
  );
}

export default BannerCards;
