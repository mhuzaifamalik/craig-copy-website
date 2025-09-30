import { Table, Row, Col, Button, InputNumber, Avatar, Tooltip, Skeleton, Image } from "antd";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/Cart";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";

import { MdEdit } from "react-icons/md";
import EditCreationModal from "../MyComponent/EditCreationModal";

const Cart = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalData, setModalData] = useState(null);

    const [products, setProducts] = useState([]);
    const { fetchCartItems, editCartItem, removeCartItem, cartProducts } = useContext(CartContext);
    const dataSource = products.length > 0 ? [
        ...products.map((product) => ({
            type: product.type,
            id: product._id ? product._id : product.id,
            key: product._id ? product._id : product.id,
            image: product.image,
            title: product.title,
            quantity: product.quantity,
            rate: product.price,
            price: product.price * product.quantity,
            obj: product.obj,
            identifier: product.identifier
        })),
        {
            key: 'total',
            title: 'Total',
            rate: products.reduce((acc, item) => acc + item.price, 0),
            price: products.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        },
    ] : [];
    const background = {
        backgroundImage: `url(${require('../images/maxresdefault.jpg')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '50vh', // optional: full screen height
        height: 'auto',
        width: '100%',
        // padding: '60px 20px', // optional spacing
        color: '#fff', // optional text color
    };
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const products = await fetchCartItems();
            setProducts(products);
            setLoading(false);
        };
        fetchProducts();
    }, [cartProducts])

    const columns = [
        {
            // title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (_,
                { image, type, obj }
                // item
            ) =>
                type === 'creation' ?
                    <ul style={{
                        display: 'flex',
                        flexDirection: 'column',
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        gap: '10px',

                    }}>
                        {obj.map((item, index) => {
                            const imageName = item.images[item.imageIndex] || item.image;
                            return (
                                <li key={item.image}>
                                    <Image style={{ width: 40 }} src={imageName} alt="" />
                                    <br />
                                    <span>{decodeURIComponent(imageName.split('/').pop().split('.')[0])}</span>
                                </li>
                            )
                        })}
                    </ul>
                    // <Avatar.Group
                    //     max={{
                    //         // count: 3,
                    //         style: { color: '#f56a00', backgroundColor: '#fde3cf' },
                    //     }}
                    // >
                    //     {obj.map((item, index) => (
                    //         <Avatar key={index} src={item.image} />
                    //     ))}
                    // </Avatar.Group>
                    : <img style={{ width: 150 }} src={`${image}`} alt="" />
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (_, { title, type }) => type === 'creation' ? 'Your Creation' : title
        },
        {
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
            render: (text, record) => (
                <span>${record.rate?.toFixed(2)}</span>
            ),
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text, record) => (
                (record.id || record.type) && <InputNumber min={1} max={30} defaultValue={record.quantity} onChange={(value) => {
                    editCartItem({ id: record.key, quantity: value })
                }} />
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (text, record) => (
                <span>${record.price?.toFixed(2)}</span>
            ),
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => record.id && (
                <>
                    {record.type === 'creation' && (<Button style={{ marginRight: 5 }} shape="circle" icon={<MdEdit size={20} />} onClick={() => {
                        setModalData(record)
                        setModalOpen(true)
                        // removeCartItem({ id: record.key })
                    }} />)}
                    <Button danger shape="circle" icon={<MdDelete size={20} />} onClick={() => {
                        removeCartItem({ id: record.key })
                    }} />
                </>
            ),
        },
    ];

    return (
        <>



            <section className='Ready-made-Words' style={background}>
                <div className="container">
                    <Row
                        justify="center"
                        align="middle"
                    >

                        <Col xs={24} sm={20} md={20} lg={20} xl={20} xxl={20}>
                            <div className="banner-ready">
                                <h3 style={{ color: '#000', fontSize: '85px', whiteSpace: 'nowrap' }}>
                                    Cart
                                </h3>

                            </div>
                        </Col>
                    </Row>
                </div>
            </section>
            <section className="cart-section">
                <div className="container">
                    {loading ? <Skeleton active paragraph={{ rows: 4 }} /> : <Row justify={"center"} align="middle">
                        <Col lg={18}>
                            <Table dataSource={dataSource} columns={columns}
                            // footer={() => 'Footer'}
                            />
                            
                            <p><strong>Disclaimer: </strong> The finished product does not have a watermark</p>
                            { products.length > 0 && <Link className="proceed-checkout" to="/checkout">Proceed to Checkout</Link>}
                        </Col>
                    </Row>}
                </div>
            </section>
            <EditCreationModal open={modalOpen} closeModal={() => setModalOpen(false)} data={modalData} />
        </>
    )
}

export default Cart
