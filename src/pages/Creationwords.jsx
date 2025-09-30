import React, { useContext, useEffect, useState } from 'react'
import { Row, Col, Image, Skeleton, message, Button } from 'antd';
import Cards from '../MyComponent/Card'
import Seller from '../MyComponent/Sellers'
import Makingunique from '../MyComponent/Makingunique'
import Img1 from '../images/words/1.png'
import Img2 from '../images/words/2.png'
import Img6 from '../images/words/6.png'
import Img4 from '../images/words/4.png'
import Img5 from '../images/words/5.png'
import Rock1 from '../images/createdwords/1.png'
import Rock2 from '../images/createdwords/2.png'
import Rock3 from '../images/createdwords/3.png'
import Rock4 from '../images/createdwords/4.png'
import Rock5 from '../images/createdwords/5.png'
import Rock6 from '../images/createdwords/6.png'
import Rock from '../images/createdwords/7.png'
import Rock7 from '../images/createdwords/8.png'
import Rock8 from '../images/createdwords/9.png'
import Rock9 from '../images/createdwords/10.png'
import Rock10 from '../images/createdwords/11.png'
import Rock11 from '../images/createdwords/12.png'
import Rock12 from '../images/createdwords/13.png'
import Rock13 from '../images/createdwords/14.png'
import Rock14 from '../images/createdwords/15.png'
import Rock15 from '../images/createdwords/17.png'
import Rock16 from '../images/createdwords/18.png'
import Rock17 from '../images/createdwords/19.png'
import Rock18 from '../images/createdwords/20.png'
import Rock19 from '../images/createdwords/21.png'
import Rock20 from '../images/createdwords/22.png'
import Rock21 from '../images/createdwords/23.png'
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/Cart';

function Creationwords() {
  const [messageApi, contextHolder] = message.useMessage();
  const { addToCart } = useContext(CartContext)
  const navigate = useNavigate()
  const { type } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  let word = [];
  debugger
  const input = queryParams.get('word')?.toLowerCase().replaceAll('*', ' the ').replaceAll('#', ' est ') || '';

  const keywords = ['the', 'heart', 'est'];
  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi'); // Match 'the' or 'hearts' (whole words, case-insensitive)

  let lastIndex = 0;

  for (const match of input.matchAll(regex)) {
    const start = match.index;
    const end = start + match[0].length;

    // Push characters before the match
    for (let i = lastIndex; i < start; i++) {
      word.push(input[i]);
    }

    // Push matched keyword
    word.push(match[0]);

    lastIndex = end;
  }

  // Push any remaining characters after the last match
  for (let i = lastIndex; i < input.length; i++) {
    word.push(input[i]);
  }

  // Optional: Convert everything to uppercase
  word = word.map(ch => ch.toUpperCase());

  console.log(word);
  const [loading, setLoading] = useState(true)
  // const [letters, setLetters] = useState([])
  const [generatedImages, setGeneratedImages] = useState([])
  const [activeLetter, setActiveLetter] = useState([])

  const identifySymbol = (char) => {
    const code = char.charCodeAt(0);
    // If it's a symbol or punctuation (based on character code ranges)
    if (
      (code >= 33 && code <= 47) ||  // ! " # $ % & ' ( ) * + , - . /
      (code >= 58 && code <= 64) ||  // : ; < = > ? @
      (code >= 91 && code <= 96) ||  // [ \ ] ^ _ `
      (code >= 123 && code <= 126)   // { | } ~
    ) {
      return true;
    }
    return false;
  }

  const fetchLetter = async () => {
    if (!word.length) {
      navigate('/');
      return;
    }

    try {
      const response = await fetch('/api/letter/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ letter: word, type })
      });

      const data = await response.json();

      if (data.success) {
        const tempGenerated = word
          .filter(char => char !== ' ')
          .map((char) => {
            let matchedObject;

            if (char === '*') {
              matchedObject = data.data.find(item => item.letter === 'THE'); // Only if you're using '*' to represent 'the'
            } else if (identifySymbol(char)) {
              matchedObject = data.data.find(item => item.letter === 'Punctuation');
            } else {
              matchedObject = data.data.find(item => item.letter.toLowerCase() === char.toLowerCase());
            }

            return {
              imageIndex: 0,
              object: matchedObject
            };
          });

        setActiveLetter({ object: tempGenerated[0]?.object, ind: 0 });
        setGeneratedImages(tempGenerated);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }

    setLoading(false);
  };
  useEffect(() => {
    fetchLetter()
  }, [])

  const handleAddToCart = (obj) => {
    addToCart(obj);
    messageApi.open({
      type: 'success',
      content: `Your Creation is added to cart`,
    });
  };

  const handleActiveSelection = (index, charInd) => {
    setGeneratedImages(prevState => {
      const updatedState = [...prevState];
      updatedState[charInd] = {
        ...updatedState[charInd],
        imageIndex: index
      };
      return updatedState;
    });
  };

  const triggerEscKey = () => {
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27, // deprecated but still used in older browsers
      which: 27,
      bubbles: true,
    });

    window.dispatchEvent(escEvent);
  };

  return (
    <div>
      {contextHolder}
      <section className='creation-words'>
        <div className="container">
          {loading ? <></> : <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
              <div className="main-words-creation">
                <ul>
                  {generatedImages.map(({ object, imageIndex }, ind) => <li className={!object ? 'blank' : ''} key={ind}>
                    <button
                      onClick={() => setActiveLetter({ object, ind })}>
                      <img src={object?.images && object?.images[imageIndex]} alt="" />
                    </button>
                  </li>)}
                </ul>
              </div>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
              <p style={{
                color: '#FFA00A', fontSize: '16px', textAlign: 'center', margin: '10px auto', fontFamily: 'MyCustomFont', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', width: 'fit-content', borderRadius: '8px'
              }}><strong>Disclaimer: </strong> The finished product does not have a watermark</p>
              <div className="main-btn-e">
                <button onClick={() => {
                  handleAddToCart({ quantity: 1, id: generatedImages.map(item => item.object._id), items: generatedImages.map(({ imageIndex }) => (imageIndex)), type: 'letter' })
                }}>Add To Cart</button>
              </div>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
              <div className="main-images-selection">
                {/* PreviewGroup */}
                <ul>
                  {activeLetter?.object?.images?.map((item, ind) => <li key={item}>
                    <button>
                      <Image
                        width={200}
                        preview={{
                          imageRender: () => (
                            <img
                              src={item}
                              alt=""
                              style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                            />
                          ),
                          toolbarRender: () => <>
                            <Button color="primary" variant="solid" onClick={() => {
                              handleActiveSelection(ind, activeLetter.ind)
                              triggerEscKey()
                            }}>Select</Button>
                          </>
                        }}
                        src={item}
                        placeholder={
                          <Skeleton.Image active={true} />
                        }
                      />
                    </button>
                  </li>)}
                </ul>
              </div>
            </Col>
          </Row>}

        </div>
      </section>
      <Cards />
      <Seller />
      <Makingunique />
    </div>
  )
}

export default Creationwords
