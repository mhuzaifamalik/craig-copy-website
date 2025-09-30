import React, { useState } from 'react'
import { Row, Col, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'

const Banner = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [word, setWord] = useState('');
  const onChange = (e) => {
    setWord(e.target.value);
  }
  const validate = (e) => {
    e.preventDefault();
    if (word === '') {
      messageApi.open({
        type: 'error',
        content: 'Write some words to proceed!',
      });
    } else if (word.length > 12) {
      messageApi.open({
        type: 'error',
        content: 'Contact us for more than 12 letters',
      });
      setTimeout(() => {
        navigate('/contact');
      }, 2000);
    } else {
      navigate(`/creationwords/${e.target.action.split('/').pop()}?word=${encodeURIComponent(word)}`, {
        state: { word }
      });
    }
  }
  return (
    <div>
      {contextHolder}
      <section>

        <div className="banner-sec">
          <div className="container">
            <Row>
              <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
                <div className="input-12">
                  <p><strong>Disclaimer:</strong> Type Asterik * for the word “The” as in “theSmith” </p>
                  <p>Type hashtag # for the word ‘Est’ as in “Est2025” </p>
                  <input type="text" value={word} onChange={onChange} placeholder='Type your word here ...' />
                  <ul>
                    <li>
                      <form onSubmit={validate} action="/creationwords/sepia" method="get">
                        <input type="hidden" name="word" value={word} />
                        <button type='submit' className='theme0btn' >Create Word In Sepia</button>
                      </form>
                    </li>
                    <li>
                      <form onSubmit={validate} action="/creationwords/color" method="get">
                        <input type="hidden" name="word" value={word} />
                        <button type='submit' className='color-theme-btn'>Create Word Color</button>
                      </form>
                    </li>
                    <li>
                      <button onClick={() => Swal.fire({
                        title: 'Coming Soon!',
                        text: 'This feature will be available soon.',
                        icon: 'info',
                        confirmButtonText: 'Close'
                      })} className='theme0btn'>create with special alphabets</button>
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Banner
