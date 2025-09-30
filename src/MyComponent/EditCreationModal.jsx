import React, { useContext, useEffect, useState } from 'react'
import { Button, Image, Modal, Skeleton } from 'antd'
import { CartContext } from '../context/Cart';

const EditCreationModal = ({ open, closeModal, data }) => {
    const { editCreationItem, fetchCartItems } = useContext(CartContext);
    const [generatedImages, setGeneratedImages] = useState([])
    const [activeLetter, setActiveLetter] = useState({ object: data?.obj[0], ind: 0 || null });
    useEffect(() => {
        if (data?.obj?.length) {
            const initialImages = data.obj.map((item, index) => ({
                object: item,
                imageIndex: item.imageIndex,
                image: item.image,
                ind: index
            }));
            setGeneratedImages(initialImages);
        } else {
            closeModal()
        }
    }, [data])

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

    const handleActiveSelection = (index, charInd) => {
        setGeneratedImages(prevState => {
            const updatedState = [...prevState];
            const updatedObject = {
                ...updatedState[charInd].object,
                imageIndex: index
            };

            updatedState[charInd] = {
                ...updatedState[charInd],
                object: updatedObject,
                imageIndex: index,
                image: updatedObject.images[index]
            };

            return updatedState;
        });

        // Update the active letter as well to reflect the new image selection
        setActiveLetter(prev => {
            const updatedObject = {
                ...prev.object,
                imageIndex: index
            };
            return {
                ...prev,
                object: updatedObject
            };
        });
    };

    return (
        <Modal
            title="Edit Your Creation"
            centered
            open={open}
            onOk={() => {
                debugger
                const items = generatedImages.map(({ imageIndex }) => imageIndex);
                editCreationItem({
                    identifier: data.identifier, quantity: 1, items
                });
                closeModal();
                fetchCartItems()
            }}
            onCancel={closeModal}
            okText='Save Changes'
            width={1000}
            className='edit-creation-modal'
        >
            <ul className='creation-letters'>
                {generatedImages?.map(({ object }, ind) => <li
                    //   className={!object ? 'blank' : ''}
                    key={ind}>
                    <button
                        onClick={() => setActiveLetter({ object, ind })}
                    ><img src={object.images[object.imageIndex]} alt="" /></button>
                </li>)}
            </ul>
            <h4>Change Letter Image</h4>
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
                                        {/* <button onClick={() => handleActiveSelection(ind, activeLetter.ind)}>Select</button> */}
                                        <Button color="default" variant="solid" onClick={() => {
                                            handleActiveSelection(ind, activeLetter.ind)
                                            triggerEscKey()
                                        }}>Select</Button>
                                    </>,
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
        </Modal>
    )
}

export default EditCreationModal