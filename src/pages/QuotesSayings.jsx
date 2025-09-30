import React, { useEffect, useState } from 'react'
import { Row, Col } from 'antd';
import Cardbanner from '../MyComponent/CardBanner'
import { useParams } from 'react-router-dom';

function QuotesSayings() {
  const { url } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])

  const fetchCategory = async () => {
    const response = await fetch('/api/category/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filter: { url } })
    })
    const data = await response.json()
    if (data.success) {
      setCategory(data.categories[0])
    } else {
      console.error('Error fetching products:', data.error)
    }
  }
  const fetchProducts = async () => {
    const response = await fetch('/api/product/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filter: { categories: category._id } })
    })
    const data = await response.json()
    if (data.success) {
      setProducts(data.products)
    } else {
      console.error('Error fetching products:', data.error)
    }
  }

  useEffect(() => {
    fetchCategory();
  }, [url]);
  useEffect(() => {
    if (category) fetchProducts();
  }, [category]);

  const background = {
    // backgroundImage: `url(${require('../images/readybanner1.jpg')})`,
    backgroundImage: category && `url(${category?.banner})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh', // optional: full screen height
    width: '100%',
    // padding: '60px 20px', // optional spacing
    color: '#fff', // optional text color
  };
  return (
    <div>
      <section className='Ready-made-Words' style={background}>
        <div className="container">
          <Row
            justify="center"
            align="middle"
          >

            <Col xs={24} sm={20} md={20} lg={20} xl={20} xxl={20}>
              <div className="banner-ready">
                {/* <h2>{category?.description}</h2>
                <div className="yellow-ready">
                  <h3>{category?.title}</h3>
                </div> */}
              </div>
            </Col>
          </Row>
        </div>
      </section>
      <Cardbanner products={products} />
    </div>
  )
}

export default QuotesSayings
