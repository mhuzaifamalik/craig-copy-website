import React, { useContext } from 'react';
import { Row, Col, message } from 'antd';

import { CartContext } from '../context/Cart';

function CardBanner({ products }) {
  const [messageApi, contextHolder] = message.useMessage();
  const { addToCart, removeCartItem, cartProducts } = useContext(CartContext);
  const handleAddToCart = (product) => {
    addToCart({ id: product._id });
    messageApi.open({
      type: 'success',
      content: `(${product.title}) added to cart`,
    });
  };
  const handleRemoveFromCart = (product) => {
    removeCartItem({ id: product._id });
    messageApi.open({
      type: 'success',
      content: `(${product.title}) removed from cart`,
    });
  };
  return (
    <section className="cards-moniter">
      {contextHolder}
      <div className="container" style={{ padding: 0 }}>
        <Row gutter={[50, 50]}>
          {products.map((item, index) => (
            <Col key={index} xs={24} sm={6} md={6} lg={6} xl={6} xxl={6}>
              {/* <Link to={`/product/${item.url}`}> */}
              <div className="looper-1">
                <img src={item.image} alt={item.title} />
                <ul>
                  <li><span>{item.title}</span></li>
                  <li>${item.price.toFixed(2)}</li>
                </ul>
                {cartProducts.some((product) => product.id === item._id) ? (
                  <button onClick={() => handleRemoveFromCart(item)} className='remove-from-cart'>Remove from Cart</button>
                ) : (
                  <button onClick={() => handleAddToCart(item)} className='add-to-cart'>Add to Cart</button>
                )}
              </div>
              {/* </Link> */}
            </Col>
          ))}
        </Row>
        {/* <button className="card-button">Load More</button> */}
      </div>
    </section>
  );
}

export default CardBanner;